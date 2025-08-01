/**
 * Vangariwala UI Management Module
 * Handles all user interface operations
 */

const UI = {
  currentLanguage: CONFIG.LANGUAGES.DEFAULT,
  elements: {},

  /**
   * Initialize UI components
   */
  init() {
    this.cacheElements();
    this.initLanguageToggle();
    this.initParticles();
    this.initModals();
    this.updateLanguage();
  },

  /**
   * Cache frequently used DOM elements
   */
  cacheElements() {
    this.elements = {
      // Loading screen
      loadingScreen: document.getElementById('loading-screen'),
      
      // Language toggle
      languageToggle: document.getElementById('language-toggle'),
      langBtn: document.getElementById('lang-btn'),
      
      // Auth containers
      authContainer: document.getElementById('auth-container'),
      loginPage: document.getElementById('login-page'),
      signupPage: document.getElementById('signup-page'),
      
      // Main app
      mainApp: document.getElementById('main-app'),
      
      // Navigation
      navItems: document.querySelectorAll('.nav-item'),
      tabContents: document.querySelectorAll('.tab-content'),
      
      // Modals
      callModal: document.getElementById('call-modal'),
      scheduleModal: document.getElementById('schedule-modal'),
      modalCloses: document.querySelectorAll('.modal-close, .modal-overlay'),
      
      // Toast container
      toastContainer: document.getElementById('toast-container'),
      
      // Particles
      particlesContainer: document.getElementById('particles-container')
    };
  },

  /**
   * Show loading screen
   */
  showLoading() {
    this.elements.loadingScreen?.classList.remove('hidden');
  },

  /**
   * Hide loading screen
   */
  hideLoading() {
    setTimeout(() => {
      this.elements.loadingScreen?.classList.add('hidden');
      this.elements.languageToggle?.classList.remove('hidden');
      this.elements.authContainer?.classList.remove('hidden');
    }, CONFIG.ANIMATIONS.SPLASH_DURATION);
  },

  /**
   * Initialize language toggle functionality
   */
  initLanguageToggle() {
    if (!this.elements.langBtn) return;

    this.elements.langBtn.addEventListener('click', () => {
      this.toggleLanguage();
    });

    // Load saved language preference
    const savedLang = Utils.storage.get(CONFIG.STORAGE_KEYS.LANGUAGE);
    if (savedLang && CONFIG.LANGUAGES.SUPPORTED.includes(savedLang)) {
      this.currentLanguage = savedLang;
    }
  },

  /**
   * Toggle between languages
   */
  toggleLanguage() {
    this.currentLanguage = this.currentLanguage === 'en' ? 'bn' : 'en';
    this.updateLanguage();
    Utils.storage.set(CONFIG.STORAGE_KEYS.LANGUAGE, this.currentLanguage);
  },

  /**
   * Update UI language
   */
  updateLanguage() {
    // Update language button
    const langText = this.elements.langBtn?.querySelector('.lang-text');
    if (langText) {
      langText.textContent = this.currentLanguage === 'en' ? 'বাং' : 'ENG';
    }
    
    if (this.elements.langBtn) {
      this.elements.langBtn.setAttribute('data-lang', this.currentLanguage);
    }

    // Update all translatable elements
    document.querySelectorAll('[data-en]').forEach(element => {
      const text = element.getAttribute(`data-${this.currentLanguage}`);
      if (text) {
        if (element.tagName === 'INPUT' && element.hasAttribute('placeholder')) {
          element.placeholder = text;
        } else if (element.tagName === 'OPTION') {
          element.textContent = text;
        } else if (!['INPUT', 'TEXTAREA'].includes(element.tagName)) {
          element.textContent = text;
        }
      }
    });

    // Update document language attribute
    document.documentElement.lang = this.currentLanguage;

    // Update body class for font switching
    document.body.classList.toggle('lang-bengali', this.currentLanguage === 'bn');
  },

  /**
   * Get translated text
   * @param {string} key - Translation key
   * @param {object} fallbacks - Fallback texts
   * @returns {string} Translated text
   */
  getText(key, fallbacks = {}) {
    return fallbacks[this.currentLanguage] || fallbacks[CONFIG.LANGUAGES.FALLBACK] || key;
  },

  /**
   * Initialize particle background
   */
  initParticles() {
    if (!this.elements.particlesContainer) return;

    const particleCount = Utils.isMobile() ? 25 : 50;

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      
      const size = Math.random() * 6 + 2;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.top = `${Math.random() * 100}%`;
      particle.style.animationDelay = `${Math.random() * 6}s`;
      particle.style.animationDuration = `${6 + Math.random() * 4}s`;
      
      this.elements.particlesContainer.appendChild(particle);
    }
  },

  /**
   * Initialize modal functionality
   */
  initModals() {
    this.elements.modalCloses.forEach(element => {
      element.addEventListener('click', (e) => {
        if (e.target === element) {
          this.closeAllModals();
        }
      });
    });

    // Close modals on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeAllModals();
      }
    });
  },

  /**
   * Show authentication pages
   */
  showAuth() {
    this.hideElement(this.elements.mainApp);
    this.showElement(this.elements.authContainer);
    this.showElement(this.elements.languageToggle);
  },

  /**
   * Show main application
   */
  showMainApp() {
    this.hideElement(this.elements.authContainer);
    this.hideElement(this.elements.languageToggle);
    this.showElement(this.elements.mainApp);
  },

  /**
   * Switch between login and signup pages
   * @param {string} page - 'login' or 'signup'
   */
  switchAuthPage(page) {
    console.log(`🔄 UI.switchAuthPage called with: ${page}`);
    
    const loginPage = document.getElementById('login-page');
    const signupPage = document.getElementById('signup-page');
    
    console.log('📄 Page elements:', {
      loginPage: !!loginPage,
      signupPage: !!signupPage
    });
    
    if (page === 'login') {
      console.log('👉 Showing login page');
      this.showElement(loginPage);
      this.hideElement(signupPage);
    } else if (page === 'signup') {
      console.log('👉 Showing signup page');
      this.hideElement(loginPage);
      this.showElement(signupPage);
    } else {
      console.warn(`⚠️ Unknown page: ${page}`);
    }
  },

  /**
   * Switch between tabs
   * @param {string} tabName - Tab to switch to
   */
  switchTab(tabName) {
    // Update navigation
    this.elements.navItems.forEach(item => {
      const isActive = item.dataset.tab === tabName;
      item.classList.toggle('active', isActive);
      item.setAttribute('aria-selected', isActive);
    });

    // Update content
    this.elements.tabContents.forEach(content => {
      const isActive = content.id === `${tabName}-tab`;
      content.classList.toggle('active', isActive);
    });

    // Scroll to top when switching tabs
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  /**
   * Show element
   * @param {HTMLElement} element - Element to show
   */
  showElement(element) {
    if (element) {
      element.classList.remove('hidden');
    }
  },

  /**
   * Hide element
   * @param {HTMLElement} element - Element to hide
   */
  hideElement(element) {
    if (element) {
      element.classList.add('hidden');
    }
  },

  /**
   * Toggle element visibility
   * @param {HTMLElement} element - Element to toggle
   */
  toggleElement(element) {
    if (element) {
      element.classList.toggle('hidden');
    }
  },

  /**
   * Show modal
   * @param {string} modalId - ID of modal to show
   */
  showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('hidden');
      modal.setAttribute('aria-hidden', 'false');
      
      // Focus first focusable element
      const focusable = modal.querySelector('input, button, textarea, select');
      if (focusable) {
        setTimeout(() => focusable.focus(), 100);
      }
      
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    }
  },

  /**
   * Hide modal
   * @param {string} modalId - ID of modal to hide
   */
  hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('hidden');
      modal.setAttribute('aria-hidden', 'true');
      
      // Restore body scroll
      document.body.style.overflow = '';
    }
  },

  /**
   * Close all modals
   */
  closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
      modal.classList.add('hidden');
      modal.setAttribute('aria-hidden', 'true');
    });
    
    // Restore body scroll
    document.body.style.overflow = '';
  },

  /**
   * Show call modal with animation
   */
  showCallModal() {
    this.showModal('call-modal');
    
    // Auto-close after animation
    setTimeout(() => {
      this.hideModal('call-modal');
      this.showToast(CONFIG.SUCCESS.REQUEST_ACCEPTED, 'success');
    }, CONFIG.ANIMATIONS.MODAL_CALL_DURATION);
  },

  /**
   * Show schedule pickup modal
   */
  showScheduleModal() {
    this.showModal('schedule-modal');
    
    // Set minimum date to today
    const dateInput = document.getElementById('pickup-date');
    if (dateInput) {
      const today = new Date().toISOString().split('T')[0];
      dateInput.setAttribute('min', today);
    }
  },

  /**
   * Show toast notification
   * @param {string} message - Message to display
   * @param {string} type - Type of toast (success, error, warning, info)
   * @param {number} duration - Duration in milliseconds
   */
  showToast(message, type = 'info', duration = CONFIG.ANIMATIONS.TOAST_DURATION) {
    if (!this.elements.toastContainer) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = Utils.sanitizeInput(message);
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'polite');
    
    this.elements.toastContainer.appendChild(toast);
    
    // Remove toast after duration
    setTimeout(() => {
      if (toast.parentNode) {
        toast.remove();
      }
    }, duration);
  },

  /**
   * Show loading state on button
   * @param {HTMLElement} button - Button element
   * @param {boolean} loading - Loading state
   */
  setButtonLoading(button, loading) {
    if (!button) return;

    const loadingEl = button.querySelector('.btn-loading');
    const textEl = button.querySelector('span');

    if (loading) {
      button.disabled = true;
      button.classList.add('loading');
      if (loadingEl) loadingEl.classList.remove('hidden');
      if (textEl) textEl.style.opacity = '0.7';
    } else {
      button.disabled = false;
      button.classList.remove('loading');
      if (loadingEl) loadingEl.classList.add('hidden');
      if (textEl) textEl.style.opacity = '1';
    }
  },

  /**
   * Show form validation errors
   * @param {object} errors - Object with field names as keys and error messages as values
   */
  showFormErrors(errors) {
    // Clear existing errors
    document.querySelectorAll('.form-error').forEach(error => {
      error.textContent = '';
      error.classList.add('hidden');
    });

    // Remove error styling from inputs
    document.querySelectorAll('.form-control.error').forEach(input => {
      input.classList.remove('error');
    });

    // Show new errors
    Object.keys(errors).forEach(fieldName => {
      const errorElement = document.getElementById(`${fieldName}-error`);
      const inputElement = document.getElementById(fieldName);
      
      if (errorElement && errors[fieldName]) {
        errorElement.textContent = errors[fieldName];
        errorElement.classList.remove('hidden');
      }
      
      if (inputElement) {
        inputElement.classList.add('error');
      }
    });
  },

  /**
   * Clear form validation errors
   */
  clearFormErrors() {
    document.querySelectorAll('.form-error').forEach(error => {
      error.textContent = '';
      error.classList.add('hidden');
    });

    document.querySelectorAll('.form-control.error').forEach(input => {
      input.classList.remove('error');
    });
  },

  /**
   * Reset form
   * @param {string} formId - ID of form to reset
   */
  resetForm(formId) {
    const form = document.getElementById(formId);
    if (form) {
      form.reset();
      this.clearFormErrors();
    }
  },

  /**
   * Update notification badge
   * @param {number} count - Number of notifications
   */
  updateNotificationBadge(count) {
    const badge = document.getElementById('notification-badge');
    if (badge) {
      if (count > 0) {
        badge.textContent = count > 99 ? '99+' : count.toString();
        badge.classList.remove('hidden');
        badge.setAttribute('aria-label', `${count} unread notifications`);
      } else {
        badge.classList.add('hidden');
      }
    }
  },

  /**
   * Smooth scroll to element
   * @param {string} elementId - ID of element to scroll to
   * @param {number} offset - Offset from top
   */
  scrollToElement(elementId, offset = 0) {
    const element = document.getElementById(elementId);
    if (element) {
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  },

  /**
   * Update page title
   * @param {string} title - New page title
   */
  updatePageTitle(title) {
    document.title = title ? `${title} - ${CONFIG.APP_NAME}` : CONFIG.APP_NAME;
  },

  /**
   * Create loading skeleton
   * @param {number} count - Number of skeleton items
   * @returns {string} HTML string for skeleton
   */
  createSkeleton(count = 3) {
    let skeleton = '';
    for (let i = 0; i < count; i++) {
      skeleton += `
        <div class="skeleton-item">
          <div class="skeleton-avatar"></div>
          <div class="skeleton-content">
            <div class="skeleton-line"></div>
            <div class="skeleton-line short"></div>
          </div>
        </div>
      `;
    }
    return skeleton;
  },

  /**
   * Handle responsive behavior
   */
  handleResize() {
    const isMobile = Utils.isMobile();
    document.body.classList.toggle('mobile', isMobile);
    
    // Adjust particle count for performance
    if (this.elements.particlesContainer) {
      const particles = this.elements.particlesContainer.querySelectorAll('.particle');
      const targetCount = isMobile ? 25 : 50;
      
      if (particles.length !== targetCount) {
        // Recreate particles with appropriate count
        this.elements.particlesContainer.innerHTML = '';
        this.initParticles();
      }
    }
  },

  /**
   * Initialize resize handler
   */
  initResize() {
    window.addEventListener('resize', Utils.throttle(() => {
      this.handleResize();
    }, 250));
    
    // Initial call
    this.handleResize();
  },

  /**
   * Format currency
   * @param {number} amount - Amount to format
   * @param {string} currency - Currency symbol
   * @returns {string} Formatted currency
   */
  formatCurrency(amount, currency = '৳') {
    return `${currency}${Utils.formatNumber(amount)}`;
  },

  /**
   * Animate number counter
   * @param {HTMLElement} element - Element to animate
   * @param {number} target - Target number
   * @param {number} duration - Animation duration in ms
   */
  animateCounter(element, target, duration = 1000) {
    if (!element) return;

    const start = 0;
    const startTime = performance.now();
    
    const updateCounter = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(start + (target - start) * easeOut);
      
      element.textContent = Utils.formatNumber(current);
      
      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        element.textContent = Utils.formatNumber(target);
      }
    };
    
    requestAnimationFrame(updateCounter);
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = UI;
} else if (typeof window !== 'undefined') {
  window.UI = UI;
} 