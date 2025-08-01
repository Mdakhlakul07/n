/**
 * Vangariwala Main Application
 * Initializes and coordinates all application modules
 */

class VangariwalApp {
  constructor() {
    this.initialized = false;
    this.modules = {};
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.init());
    } else {
      this.init();
    }
  }

  /**
   * Initialize the application
   */
  async init() {
    try {
      console.log('🚀 Initializing Vangariwala App...');
      
      // Show loading screen
      UI.showLoading();
      
      // Initialize modules in sequence
      await this.initializeModules();
      
      // Setup global event handlers
      this.setupGlobalEventHandlers();
      
      // Setup service worker
      this.registerServiceWorker();
      
      // Hide loading screen
      UI.hideLoading();
      
      this.initialized = true;
      console.log('✅ Vangariwala App initialized successfully');
      
    } catch (error) {
      Utils.handleError(error, 'VangariwalApp.init');
      this.handleInitializationError(error);
    }
  }

  /**
   * Initialize all application modules
   */
  async initializeModules() {
    const initSequence = [
      { name: 'UI', module: UI, required: true },
      { name: 'Auth', module: Auth, required: true },
      { name: 'Dashboard', module: Dashboard, required: true },
      { name: 'Waste', module: Waste, required: true }
    ];

    for (const { name, module, required } of initSequence) {
      try {
        console.log(`Initializing ${name} module...`);
        
        if (module && typeof module.init === 'function') {
          await module.init();
          this.modules[name] = module;
          console.log(`✅ ${name} module initialized`);
        } else if (required) {
          throw new Error(`Required module ${name} is not available`);
        }
        
      } catch (error) {
        console.error(`❌ Failed to initialize ${name} module:`, error);
        
        if (required) {
          throw new Error(`Critical module ${name} failed to initialize: ${error.message}`);
        }
      }
    }
  }

  /**
   * Setup global event handlers
   */
  setupGlobalEventHandlers() {
    // Global error handling
    window.addEventListener('error', (event) => {
      Utils.handleError(event.error, 'Global Error Handler');
      console.error('Global error:', event.error);
    });

    window.addEventListener('unhandledrejection', (event) => {
      Utils.handleError(event.reason, 'Unhandled Promise Rejection');
      console.error('Unhandled promise rejection:', event.reason);
      event.preventDefault();
    });

    // Resize handler
    UI.initResize();

    // Keyboard shortcuts
    this.setupKeyboardShortcuts();

    // Network status monitoring
    this.setupNetworkMonitoring();

    // Schedule form handling
    this.setupScheduleForm();
  }

  /**
   * Setup keyboard shortcuts
   */
  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (event) => {
      // Only handle shortcuts when not typing in input fields
      if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
        return;
      }

      switch (event.key) {
        case 'Escape':
          UI.closeAllModals();
          break;
        
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
          if (Auth.isAuthenticated()) {
            const tabs = ['dashboard', 'submit', 'history', 'notifications', 'profile'];
            const tabIndex = parseInt(event.key) - 1;
            if (tabs[tabIndex]) {
              UI.switchTab(tabs[tabIndex]);
              event.preventDefault();
            }
          }
          break;

        case 'l':
          if (event.ctrlKey || event.metaKey) {
            if (Auth.isAuthenticated()) {
              Auth.logout();
            }
            event.preventDefault();
          }
          break;
      }
    });
  }

  /**
   * Setup network status monitoring
   */
  setupNetworkMonitoring() {
    const updateNetworkStatus = () => {
      if (navigator.onLine) {
        document.body.classList.remove('offline');
        console.log('📶 Network: Online');
      } else {
        document.body.classList.add('offline');
        UI.showToast('You are currently offline. Some features may not be available.', 'warning', 5000);
        console.log('📴 Network: Offline');
      }
    };

    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);
    
    // Initial check
    updateNetworkStatus();
  }

  /**
   * Setup schedule form handling
   */
  setupScheduleForm() {
    const scheduleForm = document.getElementById('schedule-form');
    if (scheduleForm) {
      scheduleForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        await this.handleScheduleSubmission(event);
      });
    }
  }

  /**
   * Handle schedule form submission
   * @param {Event} event - Form submit event
   */
  async handleScheduleSubmission(event) {
    const form = event.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    
    try {
      UI.setButtonLoading(submitBtn, true);
      UI.clearFormErrors();

      const formData = new FormData(form);
      const scheduleData = {
        date: formData.get('date'),
        time: formData.get('time'),
        instructions: formData.get('instructions')
      };

      // Validate data
      const validation = this.validateScheduleData(scheduleData);
      if (!validation.isValid) {
        UI.showFormErrors(validation.errors);
        return;
      }

      // Create schedule record
      const schedule = {
        id: Utils.generateId(),
        user_id: Auth.getCurrentUser()?.id,
        date: scheduleData.date,
        time_slot: scheduleData.time,
        instructions: scheduleData.instructions,
        status: 'scheduled',
        created_at: new Date().toISOString()
      };

      // Save to storage
      const schedules = Utils.storage.get(CONFIG.STORAGE_KEYS.SCHEDULES, []);
      schedules.push(schedule);
      Utils.storage.set(CONFIG.STORAGE_KEYS.SCHEDULES, schedules);

      UI.hideModal('schedule-modal');
      UI.showToast(CONFIG.SUCCESS.PICKUP_SCHEDULED, 'success');
      UI.resetForm('schedule-form');

    } catch (error) {
      Utils.handleError(error, 'VangariwalApp.handleScheduleSubmission');
      UI.showToast('Failed to schedule pickup. Please try again.', 'error');
    } finally {
      UI.setButtonLoading(submitBtn, false);
    }
  }

  /**
   * Validate schedule data
   * @param {object} data - Schedule data to validate
   * @returns {object} Validation result
   */
  validateScheduleData(data) {
    const errors = {};
    let isValid = true;

    if (!data.date) {
      errors['pickup-date'] = 'Please select a date';
      isValid = false;
    } else {
      const selectedDate = new Date(data.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        errors['pickup-date'] = 'Please select a future date';
        isValid = false;
      }
    }

    if (!data.time) {
      errors['pickup-time'] = 'Please select a time slot';
      isValid = false;
    }

    return { isValid, errors };
  }

  /**
   * Register service worker for PWA functionality
   */
  async registerServiceWorker() {
    if (!Utils.isSupported('serviceWorker')) {
      console.log('Service Worker not supported');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.register('./sw.js');
      console.log('✅ Service Worker registered:', registration);

      // Listen for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New update available
            UI.showToast(
              'New version available! Refresh to update.',
              'info',
              10000
            );
          }
        });
      });

    } catch (error) {
      console.error('❌ Service Worker registration failed:', error);
    }
  }

  /**
   * Handle initialization errors
   * @param {Error} error - Initialization error
   */
  handleInitializationError(error) {
    console.error('❌ App initialization failed:', error);
    
    // Hide loading screen
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
      loadingScreen.classList.add('hidden');
    }

    // Show error message
    document.body.innerHTML = `
      <div class="error-container">
        <div class="error-content">
          <h1>⚠️ Application Error</h1>
          <p>Failed to initialize the application. Please refresh the page and try again.</p>
          <p><small>Error: ${Utils.sanitizeInput(error.message)}</small></p>
          <button onclick="window.location.reload()" class="btn btn--primary">
            Refresh Page
          </button>
        </div>
      </div>
      <style>
        .error-container {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          padding: 2rem;
          background: linear-gradient(135deg, #FF8C00 0%, #FFA500 100%);
          font-family: 'Inter', sans-serif;
        }
        .error-content {
          background: white;
          padding: 3rem;
          border-radius: 1rem;
          text-align: center;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
          max-width: 500px;
        }
        .error-content h1 {
          color: #FF8C00;
          margin-bottom: 1rem;
        }
        .error-content p {
          margin-bottom: 1rem;
          color: #666;
        }
        .btn {
          background: #FF8C00;
          color: white;
          border: none;
          padding: 1rem 2rem;
          border-radius: 0.5rem;
          cursor: pointer;
          font-size: 1rem;
          font-weight: 600;
        }
        .btn:hover {
          background: #FFA500;
        }
      </style>
    `;
  }

  /**
   * Get application status
   * @returns {object} Application status
   */
  getStatus() {
    return {
      initialized: this.initialized,
      modules: Object.keys(this.modules),
      user: Auth.getCurrentUser(),
      online: navigator.onLine,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Restart the application
   */
  async restart() {
    try {
      console.log('🔄 Restarting application...');
      
      // Clear any existing state
      this.initialized = false;
      this.modules = {};
      
      // Re-initialize
      await this.init();
      
      console.log('✅ Application restarted successfully');
      
    } catch (error) {
      Utils.handleError(error, 'VangariwalApp.restart');
      this.handleInitializationError(error);
    }
  }

  /**
   * Handle app visibility changes (for battery optimization)
   */
  setupVisibilityHandling() {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        // App is backgrounded - reduce activity
        console.log('📱 App backgrounded');
      } else {
        // App is foregrounded - resume activity
        console.log('📱 App foregrounded');
        
        // Check for updates when app becomes visible
        if (Auth.isAuthenticated()) {
          Dashboard.updateDashboardData();
        }
      }
    });
  }

  /**
   * Export application data for debugging
   * @returns {object} Application debug data
   */
  exportDebugData() {
    return {
      config: CONFIG,
      status: this.getStatus(),
      localStorage: {
        session: Utils.storage.get(CONFIG.STORAGE_KEYS.SESSION),
        users: Utils.storage.get(CONFIG.STORAGE_KEYS.USERS),
        schedules: Utils.storage.get(CONFIG.STORAGE_KEYS.SCHEDULES),
        language: Utils.storage.get(CONFIG.STORAGE_KEYS.LANGUAGE)
      },
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      features: {
        serviceWorker: Utils.isSupported('serviceWorker'),
        localStorage: Utils.isSupported('localStorage'),
        geolocation: Utils.isSupported('geolocation'),
        notifications: Utils.isSupported('notifications')
      }
    };
  }
}

// Initialize the application
const app = new VangariwalApp();

// Make app available globally for debugging
if (typeof window !== 'undefined') {
  window.app = app;
  
  // Debug helpers in development
  if (process.env.NODE_ENV === 'development') {
    window.debug = {
      exportData: () => app.exportDebugData(),
      clearStorage: () => {
        localStorage.clear();
        console.log('🗑️ Storage cleared');
      },
      restart: () => app.restart(),
      status: () => app.getStatus()
    };
  }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = VangariwalApp;
} 