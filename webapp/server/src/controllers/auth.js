import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.NODE_ENV === 'test' ? 'test-secret' : process.env.JWT_SECRET;

export const signup = async (req, res) => {
  try {
    const { email, password, plan = 'free' } = req.body;
    
    // Create new user
    const user = await User.create({ email, password, plan });
    
    // Generate token
    const token = jwt.sign(
      { userId: user._id },
      JWT_SECRET
    );

    // Return response
    return res.status(201).json({
      success: true,
      user: user.toJSON(),
      token
    });
  } catch (error) {
    return res.status(error.status || 400).json({
      success: false,
      error: error.message
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = await User.findOne({ email });
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
      { userId: user._id },
      JWT_SECRET
    );

    // Return response
    return res.status(200).json({
      success: true,
      user: user.toJSON(),
      token
    });
  } catch (error) {
    return res.status(error.status || 400).json({
      success: false,
      error: error.message
    });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Return response
    const userJson = user.toJSON();
    return res.status(200).json({
      ...userJson
    });
  } catch (error) {
    return res.status(error.status || 400).json({
      success: false,
      error: error.message
    });
  }
};