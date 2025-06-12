/**
 * Shared validation utilities
 */

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  return {
    isValid: password.length >= 8,
    errors: password.length < 8 ? ['Password must be at least 8 characters'] : []
  };
};

export const validateCustomRule = (value, label, existingRules = []) => {
  const errors = [];
  
  if (!value?.trim()) {
    errors.push('Value is required');
  }
  
  if (!label?.trim()) {
    errors.push('Label is required');
  }
  
  if (label && !/^[a-zA-Z0-9_-]+$/.test(label)) {
    errors.push('Label can only contain letters, numbers, hyphens, and underscores');
  }
  
  if (existingRules.some(r => 
    r.label.toLowerCase() === label?.toLowerCase() || 
    r.value.toLowerCase() === value?.toLowerCase()
  )) {
    errors.push('A rule with this label or value already exists');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};