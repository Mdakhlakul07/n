/**
 * Vangariwala Dashboard Module
 * Handles dashboard functionality for both household and collector users
 */

const Dashboard = {
  currentUser: null,
  dashboardElements: {},

  /**
   * Initialize dashboard module
   */
  init() {
    this.cacheElements();
    this.setupEventListeners();
    
    // Listen for auth events
    Auth.addEventListener('login', (user) => {
      this.currentUser = user;
      this.loadDashboard();
    });

    Auth.addEventListener('logout', () => {
      this.currentUser = null;
      this.clearDashboard();
    });

    Auth.addEventListener('userUpdated', (user) => {
      this.currentUser = user;
      this.updateDashboardData();
    });
  },

  /**
   * Cache dashboard elements
   */
  cacheElements() {
    this.dashboardElements = {
      // Household dashboard
      householdDashboard: document.getElementById('household-dashboard'),
      userPoints: document.getElementById('user-points'),
      userCO2: document.getElementById('user-co2'),
      
      // Collector dashboard
      collectorDashboard: document.getElementById('collector-dashboard'),
      collectorEarnings: document.getElementById('collector-earnings'),
      collectorJobs: document.getElementById('collector-jobs'),
      
      // Action buttons
      callBtn: document.getElementById('call-vangariwala'),
      scheduleBtn: document.getElementById('schedule-pickup'),
      
      // User greeting
      userGreeting: document.getElementById('user-greeting'),
      headerAvatar: document.getElementById('header-avatar'),
      
      // New dashboard elements
      treesSaved: document.getElementById('trees-saved'),
      treesProgress: document.getElementById('trees-progress'),
      energySaved: document.getElementById('energy-saved'),
      energyProgress: document.getElementById('energy-progress'),
      activityFeed: document.getElementById('activity-feed')
    };
  },

  /**
   * Setup dashboard event listeners
   */
  setupEventListeners() {
    // Action button handlers
    this.dashboardElements.callBtn?.addEventListener('click', () => {
      this.handleCallVangariwala();
    });

    this.dashboardElements.scheduleBtn?.addEventListener('click', () => {
      this.handleSchedulePickup();
    });

    // Header profile button
    const headerProfileBtn = document.getElementById('header-profile-btn');
    headerProfileBtn?.addEventListener('click', () => {
      UI.switchTab('profile');
    });

    // Navigation handlers
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', () => {
        const tab = item.dataset.tab;
        this.handleTabSwitch(tab);
      });
    });
  },

  /**
   * Load appropriate dashboard based on user type
   */
  loadDashboard() {
    if (!this.currentUser) return;

    this.updateUserGreeting();
    this.updateHeaderAvatar();
    this.updateNavigationLabels();

    if (this.currentUser.user_type === 'collector') {
      this.loadCollectorDashboard();
    } else {
      this.loadHouseholdDashboard();
    }
  },

  /**
   * Load household dashboard
   */
  loadHouseholdDashboard() {
    if (!this.dashboardElements.householdDashboard) return;

    UI.showElement(this.dashboardElements.householdDashboard);
    UI.hideElement(this.dashboardElements.collectorDashboard);

    this.updateHouseholdStats();
    this.loadEnhancedDashboard(); // Load new enhanced features
  },

  /**
   * Load collector dashboard
   */
  loadCollectorDashboard() {
    if (!this.dashboardElements.collectorDashboard) return;

    UI.hideElement(this.dashboardElements.householdDashboard);
    UI.showElement(this.dashboardElements.collectorDashboard);

    this.updateCollectorStats();
  },

  /**
   * Update household statistics
   */
  updateHouseholdStats() {
    const points = this.currentUser?.points || 0;
    const co2Saved = this.currentUser?.co2_saved || 0;

    if (this.dashboardElements.userPoints) {
      UI.animateCounter(this.dashboardElements.userPoints, points);
    }

    if (this.dashboardElements.userCO2) {
      setTimeout(() => {
        this.dashboardElements.userCO2.textContent = `${co2Saved} kg`;
      }, 500);
    }
  },

  /**
   * Update collector statistics
   */
  updateCollectorStats() {
    const earnings = this.currentUser?.earnings || 0;
    const jobsToday = this.currentUser?.jobs_today || 0;

    if (this.dashboardElements.collectorEarnings) {
      UI.animateCounter(this.dashboardElements.collectorEarnings, earnings);
      setTimeout(() => {
        this.dashboardElements.collectorEarnings.textContent = UI.formatCurrency(earnings);
      }, 1000);
    }

    if (this.dashboardElements.collectorJobs) {
      UI.animateCounter(this.dashboardElements.collectorJobs, jobsToday);
    }
  },

  /**
   * Update user greeting
   */
  updateUserGreeting() {
    if (!this.dashboardElements.userGreeting || !this.currentUser) return;

    const welcomeText = UI.getText('welcome', {
      en: 'Welcome',
      bn: 'স্বাগতম'
    });

    this.dashboardElements.userGreeting.textContent = `${welcomeText}, ${this.currentUser.name}!`;
  },

  /**
   * Update header avatar
   */
  updateHeaderAvatar() {
    if (!this.dashboardElements.headerAvatar || !this.currentUser) return;

    if (this.currentUser.avatar) {
      this.dashboardElements.headerAvatar.src = this.currentUser.avatar;
    } else {
      this.dashboardElements.headerAvatar.src = CONFIG.ASSETS.DEFAULT_AVATAR;
    }
  },

  /**
   * Update navigation labels based on user type
   */
  updateNavigationLabels() {
    const submitNavItem = document.querySelector('[data-tab="submit"] .nav-label');
    if (submitNavItem && this.currentUser) {
      if (this.currentUser.user_type === 'collector') {
        const requestsText = UI.getText('requests', {
          en: 'Requests',
          bn: 'অনুরোধ'
        });
        submitNavItem.textContent = requestsText;
      } else {
        const submitText = UI.getText('submit', {
          en: 'Submit',
          bn: 'জমা দিন'
        });
        submitNavItem.textContent = submitText;
      }
    }
  },

  /**
   * Handle call vangariwala button click
   */
  handleCallVangariwala() {
    try {
      UI.showCallModal();
      
      // Track analytics if enabled
      if (CONFIG.FEATURES.ENABLE_ANALYTICS) {
        this.trackEvent('call_vangariwala_clicked', {
          user_type: this.currentUser?.user_type,
          user_id: this.currentUser?.id
        });
      }
    } catch (error) {
      Utils.handleError(error, 'Dashboard.handleCallVangariwala');
      UI.showToast('Failed to connect. Please try again.', 'error');
    }
  },

  /**
   * Handle schedule pickup button click
   */
  handleSchedulePickup() {
    try {
      UI.showScheduleModal();
      
      // Track analytics if enabled
      if (CONFIG.FEATURES.ENABLE_ANALYTICS) {
        this.trackEvent('schedule_pickup_clicked', {
          user_type: this.currentUser?.user_type,
          user_id: this.currentUser?.id
        });
      }
    } catch (error) {
      Utils.handleError(error, 'Dashboard.handleSchedulePickup');
      UI.showToast('Failed to open schedule form. Please try again.', 'error');
    }
  },

  /**
   * Handle tab switch
   * @param {string} tabName - Name of tab to switch to
   */
  handleTabSwitch(tabName) {
    try {
      UI.switchTab(tabName);

      // Load tab-specific content
      switch (tabName) {
        case 'dashboard':
          this.loadDashboard();
          break;
        case 'submit':
          this.loadSubmitTab();
          break;
        case 'history':
          this.loadHistoryTab();
          break;
        case 'notifications':
          this.loadNotificationsTab();
          break;
        case 'profile':
          this.loadProfileTab();
          break;
      }

      // Update page title
      const tabTitle = UI.getText(`tab_${tabName}`, {
        en: tabName.charAt(0).toUpperCase() + tabName.slice(1),
        bn: tabName
      });
      UI.updatePageTitle(tabTitle);

    } catch (error) {
      Utils.handleError(error, 'Dashboard.handleTabSwitch');
    }
  },

  /**
   * Load submit tab content
   */
  loadSubmitTab() {
    if (this.currentUser?.user_type === 'collector') {
      UI.showElement(document.getElementById('requests-list'));
      UI.hideElement(document.getElementById('submit-waste'));
      
      // Load requests if Waste module is available
      if (typeof Waste !== 'undefined') {
        Waste.loadPickupRequests();
      }
    } else {
      UI.hideElement(document.getElementById('requests-list'));
      UI.showElement(document.getElementById('submit-waste'));
    }
  },

  /**
   * Load history tab content
   */
  loadHistoryTab() {
    const historyContent = document.getElementById('history-content');
    if (!historyContent) return;

    try {
      const historyItems = this.getHistoryItems();
      historyContent.innerHTML = historyItems;
    } catch (error) {
      Utils.handleError(error, 'Dashboard.loadHistoryTab');
      historyContent.innerHTML = '<p>Failed to load history. Please refresh.</p>';
    }
  },

  /**
   * Get history items based on user type
   * @returns {string} HTML string for history items
   */
  getHistoryItems() {
    if (!this.currentUser) return '<p>No history available.</p>';

    const demoHistory = this.getDemoHistoryData();
    
    if (demoHistory.length === 0) {
      const noHistoryText = UI.getText('no_history', {
        en: 'No history available yet.',
        bn: 'এখনো কোন ইতিহাস উপলব্ধ নেই।'
      });
      return `<p>${noHistoryText}</p>`;
    }

    return demoHistory.map(item => `
      <div class="history-item" role="listitem">
        <h4>${Utils.sanitizeInput(item.title)}</h4>
        <p>${Utils.sanitizeInput(item.description)}</p>
        <small>${Utils.getRelativeTime(item.date)}</small>
      </div>
    `).join('');
  },

  /**
   * Get demo history data
   * @returns {Array} Array of history items
   */
  getDemoHistoryData() {
    if (this.currentUser?.user_type === 'collector') {
      return [
        {
          title: 'Pickup Completed - Dhanmondi',
          description: 'Collected 5kg plastic waste • Earned ৳150',
          date: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
        },
        {
          title: 'Pickup Completed - Gulshan',
          description: 'Collected 3kg paper waste • Earned ৳90',
          date: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
        },
        {
          title: 'Pickup Completed - Banani',
          description: 'Collected 8kg organic waste • Earned ৳120',
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
        }
      ];
    } else {
      // Household history from localStorage or demo data
      const submissions = Utils.storage.get('user_submissions', []);
      if (submissions.length > 0) {
        return submissions.map(sub => ({
          title: `Waste Submitted - ${sub.type.charAt(0).toUpperCase() + sub.type.slice(1)}`,
          description: `${sub.weight}kg • ${sub.points} points • ${sub.co2_saved}kg CO2 saved`,
          date: new Date(sub.date)
        }));
      }

      return [
        {
          title: 'Waste Submitted - Plastic',
          description: '2.5kg • 25 points • 3.0kg CO2 saved',
          date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
        },
        {
          title: 'Waste Submitted - Paper',
          description: '1.8kg • 18 points • 0.72kg CO2 saved',
          date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        },
        {
          title: 'Waste Submitted - Organic',
          description: '3.2kg • 32 points • 1.92kg CO2 saved',
          date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
        }
      ];
    }
  },

  /**
   * Load notifications tab content
   */
  loadNotificationsTab() {
    const notificationsContent = document.getElementById('notifications-content');
    if (!notificationsContent) return;

    try {
      const notifications = this.getDemoNotifications();
      
      notificationsContent.innerHTML = notifications.map(notification => `
        <div class="notification-item ${notification.unread ? 'unread' : ''}" role="listitem">
          <h4>${Utils.sanitizeInput(notification.title)}</h4>
          <p>${Utils.sanitizeInput(notification.message)}</p>
          <small>${Utils.getRelativeTime(notification.date)}</small>
        </div>
      `).join('');

      // Mark all as read after viewing
      setTimeout(() => {
        document.querySelectorAll('.notification-item.unread').forEach(item => {
          item.classList.remove('unread');
        });
        UI.updateNotificationBadge(0);
      }, 2000);

    } catch (error) {
      Utils.handleError(error, 'Dashboard.loadNotificationsTab');
      notificationsContent.innerHTML = '<p>Failed to load notifications. Please refresh.</p>';
    }
  },

  /**
   * Get demo notifications
   * @returns {Array} Array of notification objects
   */
  getDemoNotifications() {
    return [
      {
        title: 'Pickup Scheduled',
        message: 'Your waste pickup is scheduled for tomorrow at 10 AM',
        date: new Date(Date.now() - 2 * 60 * 60 * 1000),
        unread: true
      },
      {
        title: 'Points Earned',
        message: 'You earned 25 points for your plastic waste submission',
        date: new Date(Date.now() - 24 * 60 * 60 * 1000),
        unread: true
      },
      {
        title: 'New Request',
        message: 'New pickup request available in your area',
        date: new Date(Date.now() - 3 * 60 * 60 * 1000),
        unread: true
      }
    ];
  },

  /**
   * Load profile tab content
   */
  loadProfileTab() {
    if (!this.currentUser) return;

    try {
      this.updateProfileDisplay();
      this.setupProfileEventListeners();
    } catch (error) {
      Utils.handleError(error, 'Dashboard.loadProfileTab');
    }
  },

  /**
   * Update profile display
   */
  updateProfileDisplay() {
    const profileFields = {
      'profile-name': this.currentUser.name || 'N/A',
      'profile-email': this.currentUser.email || 'N/A',
      'profile-phone': this.currentUser.phone || 'N/A',
      'profile-address': this.currentUser.address || 'N/A',
      'profile-points': this.currentUser.points || 0,
      'profile-co2': `${this.currentUser.co2_saved || 0} kg`
    };

    Object.entries(profileFields).forEach(([id, value]) => {
      const element = document.getElementById(id);
      if (element) {
        element.textContent = value;
      }
    });

    // Update user type
    const userTypeEl = document.getElementById('profile-usertype');
    if (userTypeEl) {
      const userTypeText = this.currentUser.user_type === 'household' 
        ? UI.getText('household_owner', { en: 'Household Owner', bn: 'বাড়ির মালিক' })
        : UI.getText('scrap_collector', { en: 'Scrap Collector', bn: 'স্ক্র্যাপ সংগ্রাহক' });
      userTypeEl.textContent = userTypeText;
    }

    // Update profile avatar
    const profileAvatar = document.getElementById('profile-avatar');
    if (profileAvatar) {
      profileAvatar.src = this.currentUser.avatar || CONFIG.ASSETS.DEFAULT_AVATAR;
    }
  },

  /**
   * Setup profile event listeners
   */
  setupProfileEventListeners() {
    // Edit profile button
    const editBtn = document.getElementById('edit-profile-btn');
    const cancelBtn = document.getElementById('cancel-edit-btn');
    const saveBtn = document.getElementById('save-profile-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const changeAvatarBtn = document.getElementById('change-avatar-btn');
    const avatarUpload = document.getElementById('avatar-upload');

    editBtn?.addEventListener('click', () => this.toggleProfileEdit(true));
    cancelBtn?.addEventListener('click', () => this.toggleProfileEdit(false));
    saveBtn?.addEventListener('click', () => this.saveProfile());
    logoutBtn?.addEventListener('click', () => Auth.logout());
    
    changeAvatarBtn?.addEventListener('click', () => avatarUpload?.click());
    avatarUpload?.addEventListener('change', (e) => this.handleAvatarUpload(e));
  },

  /**
   * Toggle profile edit mode
   * @param {boolean} editMode - Whether to enter edit mode
   */
  toggleProfileEdit(editMode) {
    const viewSection = document.getElementById('profile-view');
    const editSection = document.getElementById('profile-edit-form');
    const viewActions = document.getElementById('profile-view-actions');
    const editActions = document.getElementById('profile-edit-actions');

    if (editMode) {
      // Populate edit form
      document.getElementById('edit-name').value = this.currentUser.name || '';
      document.getElementById('edit-phone').value = this.currentUser.phone || '';
      document.getElementById('edit-address').value = this.currentUser.address || '';

      UI.hideElement(viewSection);
      UI.showElement(editSection);
      UI.hideElement(viewActions);
      UI.showElement(editActions);
    } else {
      UI.showElement(viewSection);
      UI.hideElement(editSection);
      UI.showElement(viewActions);
      UI.hideElement(editActions);
      UI.clearFormErrors();
    }
  },

  /**
   * Save profile changes
   */
  async saveProfile() {
    try {
      const name = document.getElementById('edit-name').value.trim();
      const phone = document.getElementById('edit-phone').value.trim();
      const address = document.getElementById('edit-address').value.trim();

      // Validate inputs
      const errors = {};
      if (!name || name.length < 2) {
        errors['edit-name'] = 'Name must be at least 2 characters';
      }
      if (phone && !Utils.validatePhone(phone)) {
        errors['edit-phone'] = 'Please enter a valid phone number';
      }

      if (Object.keys(errors).length > 0) {
        UI.showFormErrors(errors);
        return;
      }

      // Update user data
      const success = Auth.updateUser({ name, phone, address });
      
      if (success) {
        this.updateProfileDisplay();
        this.toggleProfileEdit(false);
        UI.showToast(CONFIG.SUCCESS.PROFILE_UPDATED, 'success');
      } else {
        throw new Error('Failed to update profile');
      }

    } catch (error) {
      Utils.handleError(error, 'Dashboard.saveProfile');
      UI.showToast('Failed to save profile', 'error');
    }
  },

  /**
   * Handle avatar upload
   * @param {Event} event - File input change event
   */
  async handleAvatarUpload(event) {
    try {
      const file = event.target.files[0];
      if (!file) return;

      const success = await Auth.updateAvatar(file);
      if (success) {
        this.updateProfileDisplay();
        this.updateHeaderAvatar();
      }

      // Clear the file input
      event.target.value = '';

    } catch (error) {
      Utils.handleError(error, 'Dashboard.handleAvatarUpload');
    }
  },

  /**
   * Update dashboard data (called when user data changes)
   */
  updateDashboardData() {
    if (this.currentUser?.user_type === 'collector') {
      this.updateCollectorStats();
    } else {
      this.updateHouseholdStats();
    }
    
    this.updateUserGreeting();
    this.updateHeaderAvatar();
  },

  /**
   * Clear dashboard data (called on logout)
   */
  clearDashboard() {
    // Reset all displayed values
    if (this.dashboardElements.userPoints) {
      this.dashboardElements.userPoints.textContent = '0';
    }
    if (this.dashboardElements.userCO2) {
      this.dashboardElements.userCO2.textContent = '0 kg';
    }
    if (this.dashboardElements.collectorEarnings) {
      this.dashboardElements.collectorEarnings.textContent = '৳0';
    }
    if (this.dashboardElements.collectorJobs) {
      this.dashboardElements.collectorJobs.textContent = '0';
    }
    if (this.dashboardElements.userGreeting) {
      this.dashboardElements.userGreeting.textContent = 'Welcome!';
    }
    if (this.dashboardElements.headerAvatar) {
      this.dashboardElements.headerAvatar.src = CONFIG.ASSETS.DEFAULT_AVATAR;
    }
  },

  /**
   * Track analytics event
   * @param {string} eventName - Event name
   * @param {object} properties - Event properties
   */
  trackEvent(eventName, properties = {}) {
    if (CONFIG.FEATURES.ENABLE_ANALYTICS) {
      console.log('Analytics Event:', eventName, properties);
      // In production, send to analytics service
    }
  },

  /**
   * Update environmental impact display
   */
  updateEnvironmentalImpact() {
    if (!this.currentUser) return;

    const co2Saved = this.currentUser.co2_saved || 0;
    const treesEquivalent = Math.floor(co2Saved / 22); // 1 tree absorbs ~22kg CO2/year
    const energyEquivalent = Math.floor(co2Saved * 1.2); // Rough energy conversion

    // Update trees saved
    if (this.dashboardElements.treesSaved) {
      this.animateCounter(this.dashboardElements.treesSaved, treesEquivalent);
    }

    // Update energy saved
    if (this.dashboardElements.energySaved) {
      this.animateCounter(this.dashboardElements.energySaved, energyEquivalent, ' kWh');
    }

    // Update progress bars
    this.updateProgressBar('trees-progress', treesEquivalent, 100);
    this.updateProgressBar('energy-progress', energyEquivalent, 500);
  },

  /**
   * Animate counter with smooth counting effect
   * @param {HTMLElement} element - Target element
   * @param {number} target - Target number
   * @param {string} suffix - Optional suffix
   */
  animateCounter(element, target, suffix = '') {
    const start = parseInt(element.textContent) || 0;
    const duration = 1000;
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth animation
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(start + (target - start) * easeOut);
      
      element.textContent = current + suffix;
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  },

  /**
   * Update progress bar with animation
   * @param {string} elementId - Progress bar element ID
   * @param {number} current - Current value
   * @param {number} max - Maximum value
   */
  updateProgressBar(elementId, current, max) {
    const element = document.getElementById(elementId);
    if (!element) return;

    const percentage = Math.min((current / max) * 100, 100);
    
    setTimeout(() => {
      element.style.width = `${percentage}%`;
    }, 500); // Delay for staggered animation
  },

  /**
   * Add activity to the activity feed
   * @param {string} icon - Activity icon
   * @param {string} text - Activity text
   * @param {string} time - Activity time
   */
  addActivity(icon, text, time = 'Just now') {
    if (!this.dashboardElements.activityFeed) return;

    const activityItem = document.createElement('div');
    activityItem.className = 'activity-item';
    activityItem.style.opacity = '0';
    activityItem.style.transform = 'translateY(20px)';

    activityItem.innerHTML = `
      <div class="activity-icon">${icon}</div>
      <div class="activity-content">
        <div class="activity-text">${text}</div>
        <div class="activity-time">${time}</div>
      </div>
    `;

    // Insert at the beginning
    this.dashboardElements.activityFeed.insertBefore(
      activityItem, 
      this.dashboardElements.activityFeed.firstChild
    );

    // Animate in
    requestAnimationFrame(() => {
      activityItem.style.transition = 'all 0.3s ease-out';
      activityItem.style.opacity = '1';
      activityItem.style.transform = 'translateY(0)';
    });

    // Remove old activities (keep max 5)
    const activities = this.dashboardElements.activityFeed.children;
    while (activities.length > 5) {
      activities[activities.length - 1].remove();
    }
  },

  /**
   * Update achievement badges based on user progress
   */
  updateAchievements() {
    if (!this.currentUser) return;

    const achievements = document.querySelectorAll('.achievement-badge');
    
    achievements.forEach(badge => {
      const achievement = badge.dataset.achievement;
      let unlocked = false;

      switch (achievement) {
        case 'first-submission':
          unlocked = (this.currentUser.points || 0) > 0;
          break;
        case 'eco-warrior':
          unlocked = (this.currentUser.co2_saved || 0) >= 10;
          break;
        case 'recycling-hero':
          // Assuming we track total weight somewhere
          unlocked = (this.currentUser.points || 0) >= 500; // 500 points ≈ 50kg
          break;
      }

      if (unlocked) {
        badge.classList.add('unlocked');
      }
    });
  },

  /**
   * Initialize tips carousel
   */
  initTipsCarousel() {
    const indicators = document.querySelectorAll('.tip-indicator');
    const tips = document.querySelectorAll('.tip-card');
    let currentTip = 0;

    // Auto-rotate tips every 5 seconds
    setInterval(() => {
      this.showTip((currentTip + 1) % tips.length);
      currentTip = (currentTip + 1) % tips.length;
    }, 5000);

    // Manual tip switching
    indicators.forEach((indicator, index) => {
      indicator.addEventListener('click', () => {
        this.showTip(index);
        currentTip = index;
      });
    });
  },

  /**
   * Show specific tip in carousel
   * @param {number} index - Tip index to show
   */
  showTip(index) {
    const tips = document.querySelectorAll('.tip-card');
    const indicators = document.querySelectorAll('.tip-indicator');

    tips.forEach((tip, i) => {
      tip.classList.toggle('active', i === index);
    });

    indicators.forEach((indicator, i) => {
      indicator.classList.toggle('active', i === index);
    });
  },

  /**
   * Enhanced dashboard loading with new features
   */
  loadEnhancedDashboard() {
    this.updateEnvironmentalImpact();
    this.updateAchievements();
    this.initTipsCarousel();
    
    // Add welcome activity if new user
    if (this.currentUser && this.currentUser.points === 0) {
      this.addActivity(
        '🎉', 
        'Welcome to Vangariwala! Start your eco-journey today.',
        'Just now'
      );
    }
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Dashboard;
} else if (typeof window !== 'undefined') {
  window.Dashboard = Dashboard;
} 