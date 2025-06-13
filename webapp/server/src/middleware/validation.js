import { body, param } from 'express-validator';

export const validateAddPattern = [
  body('pattern')
    .notEmpty()
    .withMessage('Pattern is required')
    .isString()
    .withMessage('Pattern must be a string')
    .isLength({ min: 1, max: 500 })
    .withMessage('Pattern must be between 1 and 500 characters'),
  
  body('label')
    .notEmpty()
    .withMessage('Label is required')
    .isString()
    .withMessage('Label must be a string')
    .isLength({ min: 1, max: 50 })
    .withMessage('Label must be between 1 and 50 characters'),
  
  body('description')
    .optional()
    .isString()
    .withMessage('Description must be a string')
    .isLength({ max: 200 })
    .withMessage('Description must not exceed 200 characters'),
];

export const validatePattern = (pattern) => {
  try {
    // Test if pattern is a valid regex
    new RegExp(pattern);
    
    // Additional validation rules
    if (pattern.length > 500) return false;
    if (pattern.includes('(?<!') || pattern.includes('(?=')) return false; // No lookbehinds/lookaheads
    
    return true;
  } catch (e) {
    return false;
  }
};
