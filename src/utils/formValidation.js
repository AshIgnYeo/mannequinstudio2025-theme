/**
 * Validate email format
 * @param {string} email - Email address to validate
 * @returns {boolean} - True if valid
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number (basic validation)
 * @param {string} phone - Phone number to validate
 * @returns {boolean} - True if valid
 */
export const validatePhone = (phone) => {
  // Allow various formats: +65 1234 5678, (123) 456-7890, etc.
  const phoneRegex = /^[\d\s\+\-\(\)]+$/;
  return phone.length >= 8 && phoneRegex.test(phone);
};

/**
 * Validate file upload
 * @param {File} file - File to validate
 * @param {number} maxSize - Maximum file size in KB (default 5120 for 5MB)
 * @returns {Object} - { valid: boolean, error: string }
 */
export const validateFile = (file, maxSize = 5120) => {
  if (!file) {
    return { valid: false, error: 'File is required' };
  }

  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/gif'];
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Only JPG, JPEG, and GIF files are allowed' };
  }

  const fileSizeKB = file.size / 1024;
  const fileSizeMB = file.size / 1024 / 1024;
  if (fileSizeKB > maxSize) {
    return {
      valid: false,
      error: `File size must be under ${maxSize / 1024}MB (current: ${fileSizeMB.toFixed(2)}MB)`
    };
  }

  return { valid: true, error: null };
};

/**
 * Validate required field
 * @param {string} value - Value to validate
 * @param {string} fieldName - Name of field for error message
 * @returns {Object} - { valid: boolean, error: string }
 */
export const validateRequired = (value, fieldName) => {
  if (!value || value.trim() === '') {
    return { valid: false, error: `${fieldName} is required` };
  }
  return { valid: true, error: null };
};
