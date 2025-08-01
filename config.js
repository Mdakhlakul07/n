/**
 * Vangariwala App Configuration
 * Centralized configuration to avoid hardcoded values
 */

const CONFIG = {
  // Application Info
  APP_NAME: 'Vangariwala',
  APP_VERSION: '2.0.0',
  APP_DESCRIPTION: 'Smart Waste Management System',
  
  // API Configuration
  SUPABASE: {
    URL: 'https://rtoivwuhwgxaxbdhybad.supabase.co',
    ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ0b2l2d3Vod2d4YXhiZGh5YmFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4Nzk4NTEsImV4cCI6MjA2OTQ1NTg1MX0.3F5Q5bBBwYjHuJNjCN-6fD-SeM1nImb5Pwfjtgnt8uM'
  },
  
  // Demo User Accounts
  DEMO_USERS: {
    HOUSEHOLD: {
      email: 'test@example.com',
      password: 'demo123',
      name: 'Rahul Ahmed',
      phone: '01712345678',
      address: 'Dhanmondi 27, Dhaka',
      user_type: 'household',
      points: 150,
      co2_saved: 25.5
    },
    COLLECTOR: {
      email: 'collector@example.com',
      password: 'demo123',
      name: 'Karim Mia',
      phone: '01798765432',
      address: 'Uttara, Dhaka',
      user_type: 'collector',
      earnings: 2500,
      jobs_today: 3
    }
  },
  
  // Waste Types Configuration
  WASTE_TYPES: [
    {
      type: 'organic',
      co2_factor: 0.6,
      points_factor: 10,
      price_per_kg: 3, // Taka per kg
      label_en: 'Organic',
      label_bn: 'জৈব বর্জ্য',
      icon: '🥬',
      color: '#4CAF50',
      gradient: 'linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%)'
    },
    {
      type: 'plastic',
      co2_factor: 1.2,
      points_factor: 10,
      price_per_kg: 12, // Taka per kg
      label_en: 'Plastic',
      label_bn: 'প্লাস্টিক বর্জ্য',
      icon: '♻️',
      color: '#2196F3',
      gradient: 'linear-gradient(135deg, #2196F3 0%, #42A5F5 100%)'
    },
    {
      type: 'paper',
      co2_factor: 0.4,
      points_factor: 10,
      price_per_kg: 8, // Taka per kg
      label_en: 'Paper',
      label_bn: 'কাগজ বর্জ্য',
      icon: '📄',
      color: '#FF9800',
      gradient: 'linear-gradient(135deg, #FF9800 0%, #FFB74D 100%)'
    },
    {
      type: 'metal',
      co2_factor: 0.1,
      points_factor: 15,
      price_per_kg: 45, // Taka per kg
      label_en: 'Metal',
      label_bn: 'ধাতব বর্জ্য',
      icon: '🔧',
      color: '#607D8B',
      gradient: 'linear-gradient(135deg, #607D8B 0%, #78909C 100%)'
    },
    {
      type: 'glass',
      co2_factor: 0.1,
      points_factor: 12,
      price_per_kg: 6, // Taka per kg
      label_en: 'Glass',
      label_bn: 'কাঁচ বর্জ্য',
      icon: '🍶',
      color: '#00BCD4',
      gradient: 'linear-gradient(135deg, #00BCD4 0%, #26C6DA 100%)'
    },
    {
      type: 'electronic',
      co2_factor: 0.8,
      points_factor: 20,
      price_per_kg: 85, // Taka per kg
      label_en: 'Electronic',
      label_bn: 'ইলেকট্রনিক বর্জ্য',
      icon: '📱',
      color: '#9C27B0',
      gradient: 'linear-gradient(135deg, #9C27B0 0%, #BA68C8 100%)'
    }
  ],
  
  // Map Configuration
  MAP: {
    DEFAULT_CENTER: [23.8103, 90.4125], // Dhaka, Bangladesh
    DEFAULT_ZOOM: 11,
    MIN_ZOOM: 6,
    MAX_ZOOM: 18,
    TILE_URL: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    ATTRIBUTION: '© OpenStreetMap contributors'
  },
  
  // Bangladesh Locations for Demo
  BANGLADESH_LOCATIONS: [
    {
      name: 'ধানমন্ডি ২৭, ঢাকা',
      name_en: 'Dhanmondi 27, Dhaka',
      lat: 23.7465,
      lng: 90.3775
    },
    {
      name: 'উত্তরা সেক্টর ৭',
      name_en: 'Uttara Sector 7',
      lat: 23.8759,
      lng: 90.3795
    },
    {
      name: 'বসুন্ধরা আ/এ ব্লক সি',
      name_en: 'Bashundhara R/A Block C',
      lat: 23.8103,
      lng: 90.4125
    },
    {
      name: 'গুলশান ২',
      name_en: 'Gulshan 2',
      lat: 23.7925,
      lng: 90.4078
    },
    {
      name: 'বনানী',
      name_en: 'Banani',
      lat: 23.7936,
      lng: 90.4053
    }
  ],
  
  // Animation and Timing
  ANIMATIONS: {
    SPLASH_DURATION: 3000,
    FADE_DURATION: 300,
    SLIDE_DURATION: 500,
    TOAST_DURATION: 3000,
    MODAL_CALL_DURATION: 3000
  },
  
  // Validation Rules
  VALIDATION: {
    MIN_PASSWORD_LENGTH: 6,
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    PHONE_PATTERN: /^(\+8801|01)[3-9]\d{8}$/,
    EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  
  // Local Storage Keys
  STORAGE_KEYS: {
    SESSION: 'vangariwala_session',
    USERS: 'vangariwala_users',
    SCHEDULES: 'vangariwala_schedules',
    LANGUAGE: 'vangariwala_language',
    THEME: 'vangariwala_theme'
  },
  
  // Language Configuration
  LANGUAGES: {
    DEFAULT: 'en',
    SUPPORTED: ['en', 'bn'],
    FALLBACK: 'en'
  },
  
  // Error Messages
  ERRORS: {
    NETWORK: 'Network error. Please check your connection.',
    AUTH_FAILED: 'Authentication failed. Please try again.',
    VALIDATION_FAILED: 'Please check your input and try again.',
    FILE_TOO_LARGE: 'File size too large. Maximum 5MB allowed.',
    INVALID_FILE_TYPE: 'Invalid file type. Only images allowed.',
    GENERIC: 'Something went wrong. Please try again.'
  },
  
  // Success Messages
  SUCCESS: {
    LOGIN: 'Login successful!',
    SIGNUP: 'Account created successfully!',
    LOGOUT: 'Logged out successfully',
    PROFILE_UPDATED: 'Profile updated successfully!',
    WASTE_SUBMITTED: 'Waste submitted successfully!',
    PICKUP_SCHEDULED: 'Pickup scheduled successfully!',
    REQUEST_ACCEPTED: 'Request accepted! Contact details sent to your phone.'
  },
  
  // Feature Flags
  FEATURES: {
    ENABLE_PUSH_NOTIFICATIONS: false,
    ENABLE_GEOLOCATION: true,
    ENABLE_CAMERA: true,
    ENABLE_OFFLINE_MODE: false,
    ENABLE_ANALYTICS: false
  },
  
  // Asset Paths
  ASSETS: {
    LOGO: 'assets/logo.png',
    FAVICON: 'assets/favicon.png',
    APPLE_TOUCH_ICON: 'assets/apple-touch-icon.png',
    DEFAULT_AVATAR: 'assets/default-avatar.svg'
  },
  
  // PWA Configuration
  PWA: {
    THEME_COLOR: '#FF8C00',
    BACKGROUND_COLOR: '#FFF8E1',
    DISPLAY: 'standalone',
    ORIENTATION: 'portrait'
  }
};

// Freeze the configuration to prevent accidental modifications
if (typeof Object.freeze === 'function') {
  Object.freeze(CONFIG);
  Object.freeze(CONFIG.DEMO_USERS);
  Object.freeze(CONFIG.WASTE_TYPES);
  Object.freeze(CONFIG.BANGLADESH_LOCATIONS);
  Object.freeze(CONFIG.ANIMATIONS);
  Object.freeze(CONFIG.VALIDATION);
  Object.freeze(CONFIG.STORAGE_KEYS);
  Object.freeze(CONFIG.LANGUAGES);
  Object.freeze(CONFIG.ERRORS);
  Object.freeze(CONFIG.SUCCESS);
  Object.freeze(CONFIG.FEATURES);
  Object.freeze(CONFIG.ASSETS);
  Object.freeze(CONFIG.PWA);
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
} else if (typeof window !== 'undefined') {
  window.CONFIG = CONFIG;
} 