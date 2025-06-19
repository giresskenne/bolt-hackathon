import jwt from 'jsonwebtoken';
import { getJwtSecret } from '../config/constants.js';
import UserModel from '../models/UserModel.js';

const validatePassword = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*]/.test(password);

  return (
    password.length >= minLength &&
    hasUpperCase &&
    hasLowerCase &&
    hasNumber &&
    hasSpecialChar
  );
};

export const signup = async (req, res) => {
  try {
    console.log('Signup request received:', { 
      body: req.body,
      headers: req.headers 
    });
    
    const { email, password, plan = 'free' } = req.body;
    
    if (!email || !password) {
      console.log('Missing email or password');
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    if (!validatePassword(password)) {
      console.log('Password validation failed');
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 8 characters and contain uppercase, lowercase, number and special characters'
      });
    }
    
    console.log('Creating new user with:', { email, plan });
    const { data: user, error: createError } = await UserModel.create({
      email, 
      password,
      plan
    });

    if (createError) {
      console.error('Error creating user:', createError);
      return res.status(createError.status || 500).json({
        success: false,
        error: createError.message === 'Email already exists' ? 'Email already exists' : (createError.message || 'Failed to create user')
      });
    }

    if (!user) {
      console.error('No user returned from create operation');
      return res.status(500).json({
        success: false,
        error: 'Failed to create user - no data returned'
      });
    }
    
    // Generate token
    const token = jwt.sign(
      { userId: user.id },
      getJwtSecret()
    );

    console.log('User created successfully:', { userId: user.id });

    // Return response using UserModel's toJSON method
    return res.status(201).json({
      success: true,
      user: user.toJSON(),
      token
    });
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(error.status || 500).json({
      success: false,
      error: error.message || 'Signup failed'
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }
    
    // Find user by email
    const { data: user, error: findError } = await UserModel.findOne({ email });
    
    if (findError) {
      console.error('Error finding user:', findError);
      return res.status(findError.status || 500).json({
        success: false,
        error: findError.message || 'Error finding user'
      });
    }
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }
    
    // Check password
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }
    
    // Generate token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      getJwtSecret()
    );

    // Return response
    return res.status(200).json({
      success: true,
      user: user.toJSON(),
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(error.status || 500).json({
      success: false,
      error: error.message || 'Login failed'
    });
  }
};

export const getMe = async (req, res) => {
  try {
    console.log('Getting user data for:', req.user);

    const { data: user, error } = await UserModel.findById(req.user.userId);
    
    if (error) {
      console.error('Error fetching user:', error);
      return res.status(error.status || 500).json({
        success: false,
        error: error.message || 'Error fetching user data'
      });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    return res.status(200).json({
      success: true,
      user: user.toJSON()
    });
  } catch (error) {
    console.error('GetMe error:', error);
    return res.status(error.status || 500).json({
      success: false,
      error: error.message || 'Failed to get user info'
    });
  }
};