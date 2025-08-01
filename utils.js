/**
 * Vangariwala Utility Functions
 * Reusable helper functions for the application
 */

const Utils = {
  
  /**
   * Generate a unique ID
   * @returns {string} Unique identifier
   */
  generateId() {
    return 'id_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  },

  /**
   * Validate email address
   * @param {string} email - Email to validate
   * @returns {boolean} True if valid
   */
  validateEmail(email) {
    return CONFIG.VALIDATION.EMAIL_PATTERN.test(email);
  },

  /**
   * Validate phone number (Bangladesh format)
   * @param {string} phone - Phone number to validate
   * @returns {boolean} True if valid
   */
  validatePhone(phone) {
    return CONFIG.VALIDATION.PHONE_PATTERN.test(phone);
  },

  /**
   * Validate password strength
   * @param {string} password - Password to validate
   * @returns {object} Validation result with isValid and errors
   */
  validatePassword(password) {
    const errors = [];
    let isValid = true;

    if (!password) {
      errors.push('Password is required');
      isValid = false;
    } else {
      if (password.length < CONFIG.VALIDATION.MIN_PASSWORD_LENGTH) {
        errors.push(`Password must be at least ${CONFIG.VALIDATION.MIN_PASSWORD_LENGTH} characters`);
        isValid = false;
      }
      if (!/[A-Za-z]/.test(password)) {
        errors.push('Password must contain at least one letter');
        isValid = false;
      }
      if (!/[0-9]/.test(password)) {
        errors.push('Password must contain at least one number');
        isValid = false;
      }
    }

    return { isValid, errors };
  },

  /**
   * Validate file upload
   * @param {File} file - File to validate
   * @returns {object} Validation result
   */
  validateFile(file) {
    const errors = [];
    let isValid = true;

    if (!file) {
      errors.push('No file selected');
      return { isValid: false, errors };
    }

    if (file.size > CONFIG.VALIDATION.MAX_FILE_SIZE) {
      errors.push(CONFIG.ERRORS.FILE_TOO_LARGE);
      isValid = false;
    }

    if (!CONFIG.VALIDATION.ALLOWED_IMAGE_TYPES.includes(file.type)) {
      errors.push(CONFIG.ERRORS.INVALID_FILE_TYPE);
      isValid = false;
    }

    return { isValid, errors };
  },

  /**
   * Sanitize user input to prevent XSS
   * @param {string} input - Input to sanitize
   * @returns {string} Sanitized input
   */
  sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  },

  /**
   * Format date for display
   * @param {string|Date} date - Date to format
   * @param {string} locale - Locale for formatting
   * @returns {string} Formatted date
   */
  formatDate(date, locale = 'en-US') {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) {
      return 'Invalid Date';
    }

    return dateObj.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  },

  /**
   * Format time for display
   * @param {string|Date} date - Date to format
   * @param {string} locale - Locale for formatting
   * @returns {string} Formatted time
   */
  formatTime(date, locale = 'en-US') {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) {
      return 'Invalid Time';
    }

    return dateObj.toLocaleTimeString(locale, {
      hour: '2-digit',
      minute: '2-digit'
    });
  },

  /**
   * Get relative time (e.g., "2 hours ago")
   * @param {string|Date} date - Date to compare
   * @returns {string} Relative time string
   */
  getRelativeTime(date) {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffInSeconds = Math.floor((now - dateObj) / 1000);

    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 2592000) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else {
      return this.formatDate(dateObj);
    }
  },

  /**
   * Debounce function calls
   * @param {Function} func - Function to debounce
   * @param {number} wait - Wait time in milliseconds
   * @returns {Function} Debounced function
   */
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  /**
   * Throttle function calls
   * @param {Function} func - Function to throttle
   * @param {number} limit - Time limit in milliseconds
   * @returns {Function} Throttled function
   */
  throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  /**
   * Deep clone an object
   * @param {any} obj - Object to clone
   * @returns {any} Cloned object
   */
  deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime());
    if (obj instanceof Array) return obj.map(item => this.deepClone(item));
    if (typeof obj === 'object') {
      const clonedObj = {};
      for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
          clonedObj[key] = this.deepClone(obj[key]);
        }
      }
      return clonedObj;
    }
    return obj;
  },

  /**
   * Check if device is mobile
   * @returns {boolean} True if mobile device
   */
  isMobile() {
    return window.innerWidth <= 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  },

  /**
   * Check if device supports touch
   * @returns {boolean} True if touch is supported
   */
  isTouchDevice() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  },

  /**
   * Check if browser supports a feature
   * @param {string} feature - Feature to check
   * @returns {boolean} True if supported
   */
  isSupported(feature) {
    switch (feature) {
      case 'serviceWorker':
        return 'serviceWorker' in navigator;
      case 'localStorage':
        try {
          localStorage.setItem('test', 'test');
          localStorage.removeItem('test');
          return true;
        } catch (e) {
          return false;
        }
      case 'geolocation':
        return 'geolocation' in navigator;
      case 'camera':
        return 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices;
      case 'notifications':
        return 'Notification' in window;
      default:
        return false;
    }
  },

  /**
   * Request notification permission
   * @returns {Promise<string>} Permission result
   */
  async requestNotificationPermission() {
    if (!this.isSupported('notifications')) {
      return 'not-supported';
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    }

    if (Notification.permission === 'denied') {
      return 'denied';
    }

    const permission = await Notification.requestPermission();
    return permission;
  },

  /**
   * Show browser notification
   * @param {string} title - Notification title
   * @param {object} options - Notification options
   */
  showNotification(title, options = {}) {
    if (Notification.permission === 'granted') {
      new Notification(title, {
        icon: CONFIG.ASSETS.FAVICON,
        badge: CONFIG.ASSETS.FAVICON,
        ...options
      });
    }
  },

  /**
   * Get user's geolocation
   * @returns {Promise<object>} Location coordinates
   */
  getCurrentLocation() {
    return new Promise((resolve, reject) => {
      if (!this.isSupported('geolocation')) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        position => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        },
        error => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        }
      );
    });
  },

  /**
   * Calculate distance between two points (Haversine formula)
   * @param {number} lat1 - First latitude
   * @param {number} lon1 - First longitude
   * @param {number} lat2 - Second latitude
   * @param {number} lon2 - Second longitude
   * @returns {number} Distance in kilometers
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return Math.round(distance * 100) / 100; // Round to 2 decimal places
  },

  /**
   * Convert degrees to radians
   * @param {number} degrees - Degrees to convert
   * @returns {number} Radians
   */
  toRadians(degrees) {
    return degrees * (Math.PI / 180);
  },

  /**
   * Format number with thousand separators
   * @param {number} num - Number to format
   * @returns {string} Formatted number
   */
  formatNumber(num) {
    return new Intl.NumberFormat().format(num);
  },

  /**
   * Calculate waste points
   * @param {string} wasteType - Type of waste
   * @param {number} weight - Weight in kg
   * @returns {number} Points earned
   */
  calculateWastePoints(wasteType, weight) {
    const waste = CONFIG.WASTE_TYPES.find(w => w.type === wasteType);
    return waste ? Math.round(weight * waste.points_factor) : 0;
  },

  /**
   * Calculate CO2 saved
   * @param {string} wasteType - Type of waste
   * @param {number} weight - Weight in kg
   * @returns {number} CO2 saved in kg
   */
  calculateCO2Saved(wasteType, weight) {
    const waste = CONFIG.WASTE_TYPES.find(w => w.type === wasteType);
    return waste ? Math.round((weight * waste.co2_factor) * 100) / 100 : 0;
  },

  /**
   * Calculate Taka earnings
   * @param {string} wasteType - Type of waste
   * @param {number} weight - Weight in kg
   * @returns {number} Taka earned
   */
  calculateTakaEarnings(wasteType, weight) {
    const waste = CONFIG.WASTE_TYPES.find(w => w.type === wasteType);
    return waste ? Math.round((weight * waste.price_per_kg) * 100) / 100 : 0;
  },

  /**
   * Get waste type information
   * @param {string} wasteType - Type of waste
   * @returns {object|null} Waste type configuration
   */
  getWasteTypeInfo(wasteType) {
    return CONFIG.WASTE_TYPES.find(w => w.type === wasteType) || null;
  },

  /**
   * Local storage helpers
   */
  storage: {
    /**
     * Set item in localStorage with error handling
     * @param {string} key - Storage key
     * @param {any} value - Value to store
     * @returns {boolean} Success status
     */
    set(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch (error) {
        console.error('localStorage.setItem failed:', error);
        return false;
      }
    },

    /**
     * Get item from localStorage with error handling
     * @param {string} key - Storage key
     * @param {any} defaultValue - Default value if key doesn't exist
     * @returns {any} Stored value or default
     */
    get(key, defaultValue = null) {
      try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
      } catch (error) {
        console.error('localStorage.getItem failed:', error);
        return defaultValue;
      }
    },

    /**
     * Remove item from localStorage
     * @param {string} key - Storage key
     * @returns {boolean} Success status
     */
    remove(key) {
      try {
        localStorage.removeItem(key);
        return true;
      } catch (error) {
        console.error('localStorage.removeItem failed:', error);
        return false;
      }
    },

    /**
     * Clear all localStorage data
     * @returns {boolean} Success status
     */
    clear() {
      try {
        localStorage.clear();
        return true;
      } catch (error) {
        console.error('localStorage.clear failed:', error);
        return false;
      }
    }
  },

  /**
   * Error handling helper
   * @param {Error} error - Error object
   * @param {string} context - Context where error occurred
   */
  handleError(error, context = 'Unknown') {
    console.error(`Error in ${context}:`, error);
    
    // Log to external service in production
    if (CONFIG.FEATURES.ENABLE_ANALYTICS && process.env.NODE_ENV === 'production') {
      // Send to analytics service
      console.log('Would send error to analytics:', { error, context });
    }
  },

  /**
   * Convert file to base64
   * @param {File} file - File to convert
   * @returns {Promise<string>} Base64 string
   */
  fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  },

  /**
   * Download data as file
   * @param {string} data - Data to download
   * @param {string} filename - Name of file
   * @param {string} type - MIME type
   */
  downloadFile(data, filename, type = 'text/plain') {
    const blob = new Blob([data], { type });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Utils;
} else if (typeof window !== 'undefined') {
  window.Utils = Utils;
} 