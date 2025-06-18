import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/constants.js';
import UserModel from '../models/UserModel.js';

export const signup = async (req, res) => {
  try {
    console.log('Signup request received:', { 
      body: req.body,
      headers: req.headers 
    });
    
    const { email, password, plan = 'free' } = req.body;
    
    // Check if user already exists
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User already exists'
      });
    }
    
    // Create new user
    console.log('Creating new user with:', { email, plan });
    const user = await UserModel.create({
      email, 
      password,
      plan
    });
    
    // Generate token
    const token = jwt.sign(
      { userId: user.id },
      JWT_SECRET
    );

    console.log('User created successfully:', { userId: user.id });

    // Return response
    return res.status(201).json({
      success: true,
      user: {
        email: user.email,
        subscription: user.subscription
      },
      token
    });
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(error.status || 400).json({
      success: false,
      error: error.message || 'Signup failed'
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Verify password
    const isValid = await user.comparePassword(password);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user.id },
      JWT_SECRET
    );

    // Return response
    return res.status(200).json({
      success: true,
      user: {
        email: user.email,
        subscription: user.subscription
      },
      token
    });
  } catch (error) {
    return res.status(error.status || 400).json({
      success: false,
      error: error.message || 'Login failed'
    });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await UserModel.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    return res.status(200).json({
      success: true,
      user: {
        email: user.email,
        subscription: user.subscription
      }
    });
  } catch (error) {
    return res.status(error.status || 400).json({
      success: false,
      error: error.message || 'Failed to get user info'
    });
  }
};