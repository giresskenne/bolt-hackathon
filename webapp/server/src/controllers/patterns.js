import User from '../models/User.js';
import { validatePattern } from '../utils/validation.js';

export const getUserPatterns = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ patterns: user.customPatterns || [] });
  } catch (error) {
    console.error('Get patterns error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const addCustomPattern = async (req, res) => {
  try {
    const { pattern, label, description } = req.body;

    // Validate the pattern
    const isValid = validatePattern(pattern);
    if (!isValid) {
      return res.status(400).json({ error: 'Invalid pattern format' });
    }

    const user = await User.findById(req.user.id);
    
    // Check pattern limit based on subscription
    const patternLimit = user.subscription.status === 'active' ? 50 : 5;
    if (user.customPatterns?.length >= patternLimit) {
      return res.status(403).json({ error: 'Pattern limit reached for your subscription tier' });
    }

    // Add new pattern
    const newPattern = {
      id: Date.now().toString(),
      pattern,
      label,
      description,
      createdAt: new Date()
    };

    if (!user.customPatterns) {
      user.customPatterns = [];
    }
    
    user.customPatterns.push(newPattern);
    await user.save();

    res.status(201).json({ pattern: newPattern });
  } catch (error) {
    console.error('Add pattern error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const deleteCustomPattern = async (req, res) => {
  try {
    const { patternId } = req.params;
    const user = await User.findById(req.user.id);

    if (!user.customPatterns) {
      return res.status(404).json({ error: 'Pattern not found' });
    }

    const patternIndex = user.customPatterns.findIndex(p => p.id === patternId);
    if (patternIndex === -1) {
      return res.status(404).json({ error: 'Pattern not found' });
    }

    user.customPatterns.splice(patternIndex, 1);
    await user.save();

    res.json({ message: 'Pattern deleted successfully' });
  } catch (error) {
    console.error('Delete pattern error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
