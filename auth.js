/**
 * Vangariwala Authentication Module
 * Handles user authentication, registration, and session management
 */

const Auth = {
  currentUser: null,
  supabase: null,
  isInitialized: false,

  /**
   * Initialize authentication module
   */
  async init() {
    try {
      console.log('🔑 Initializing Supabase Authentication...');
      
      // Initialize Supabase client
      if (typeof window.supabase !== 'undefined') {
        this.supabase = window.supabase.createClient(
          CONFIG.SUPABASE.URL,
          CONFIG.SUPABASE.ANON_KEY
        );
        console.log('✅ Supabase client initialized');
      } else {
        console.warn('⚠️ Supabase client not available, falling back to demo mode');
      }

      this.setupEventListeners();
      this.setupAuthStateListener();
      await this.checkExistingSession();
      this.handleUrlParams();
      
      this.isInitialized = true;
      console.log('✅ Auth module initialized');
    } catch (error) {
      Utils.handleError(error, 'Auth.init');
      UI.showToast('Failed to initialize authentication', 'error');
    }
  },

  /**
   * Setup Supabase auth state listener
   */
  setupAuthStateListener() {
    if (!this.supabase) return;

    this.supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth state changed:', event, session?.user?.email);
      
      switch (event) {
        case 'SIGNED_IN':
          await this.handleSupabaseSignIn(session);
          break;
        case 'SIGNED_OUT':
          await this.handleSupabaseSignOut();
          break;
        case 'TOKEN_REFRESHED':
          console.log('🔄 Token refreshed');
          break;
        case 'USER_UPDATED':
          await this.handleUserUpdate(session);
          break;
      }
    });
  },

  /**
   * Setup authentication event listeners
   */
  setupEventListeners() {
    console.log('🔧 Setting up authentication event listeners...');
    
    // Auth form switching
    const showSignupBtn = document.getElementById('show-signup');
    const showLoginBtn = document.getElementById('show-login');
    const forgotPasswordBtn = document.getElementById('forgot-password');
    
    console.log('📝 Found elements:', {
      showSignupBtn: !!showSignupBtn,
      showLoginBtn: !!showLoginBtn,
      forgotPasswordBtn: !!forgotPasswordBtn
    });
    
    if (showSignupBtn) {
      showSignupBtn.addEventListener('click', (e) => {
        e.preventDefault();
        console.log('🔄 Switching to signup page');
        UI.switchAuthPage('signup');
      });
      console.log('✅ Signup button listener attached');
    } else {
      console.warn('⚠️ Signup button not found');
    }

    if (showLoginBtn) {
      showLoginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        console.log('🔄 Switching to login page');
        UI.switchAuthPage('login');
      });
      console.log('✅ Login button listener attached');
    } else {
      console.warn('⚠️ Login button not found');
    }

    if (forgotPasswordBtn) {
      forgotPasswordBtn.addEventListener('click', (e) => {
        e.preventDefault();
        console.log('🔄 Opening password reset modal');
        UI.showModal('password-reset-modal');
      });
      console.log('✅ Forgot password button listener attached');
    } else {
      console.warn('⚠️ Forgot password button not found');
    }

    // Form submissions
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const passwordResetForm = document.getElementById('password-reset-form');
    
    loginForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleLogin(e);
    });

    signupForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSignup(e);
    });

    passwordResetForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handlePasswordReset(e);
    });

    // Real-time validation
    this.setupValidation();
  },

  /**
   * Handle password reset form submission
   * @param {Event} event - Form submission event
   */
  async handlePasswordReset(event) {
    const form = event.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    
    try {
      UI.setButtonLoading(submitBtn, true);
      UI.clearFormErrors();

      const formData = new FormData(form);
      const email = formData.get('email')?.trim();

      if (!email) {
        UI.showFormErrors({ 'reset-email': 'Email address is required' });
        return;
      }

      await this.resetPassword(email);
      UI.hideModal('password-reset-modal');
      UI.resetForm('password-reset-form');

    } catch (error) {
      Utils.handleError(error, 'Auth.handlePasswordReset');
    } finally {
      UI.setButtonLoading(submitBtn, false);
    }
  },

  /**
   * Setup real-time form validation
   */
  setupValidation() {
    // Email validation
    const emailInputs = document.querySelectorAll('input[type="email"]');
    emailInputs.forEach(input => {
      input.addEventListener('blur', () => {
        this.validateField(input, 'email');
      });
    });

    // Password validation
    const passwordInputs = document.querySelectorAll('input[type="password"]');
    passwordInputs.forEach(input => {
      input.addEventListener('blur', () => {
        this.validateField(input, 'password');
      });
    });

    // Phone validation
    const phoneInputs = document.querySelectorAll('input[type="tel"]');
    phoneInputs.forEach(input => {
      input.addEventListener('blur', () => {
        this.validateField(input, 'phone');
      });
    });
  },

  /**
   * Validate individual form field
   * @param {HTMLElement} input - Input element to validate
   * @param {string} type - Type of validation
   */
  validateField(input, type) {
    const value = input.value.trim();
    const errorElement = document.getElementById(`${input.id}-error`);
    let isValid = true;
    let errorMessage = '';

    switch (type) {
      case 'email':
        if (value && !Utils.validateEmail(value)) {
          isValid = false;
          errorMessage = 'Please enter a valid email address';
        }
        break;
      
      case 'password':
        if (value) {
          const validation = Utils.validatePassword(value);
          if (!validation.isValid) {
            isValid = false;
            errorMessage = validation.errors[0];
          }
        }
        break;
      
      case 'phone':
        if (value && !Utils.validatePhone(value)) {
          isValid = false;
          errorMessage = 'Please enter a valid Bangladesh phone number';
        }
        break;
    }

    // Update UI
    input.classList.toggle('error', !isValid);
    if (errorElement) {
      errorElement.textContent = errorMessage;
      errorElement.classList.toggle('hidden', isValid);
    }

    return isValid;
  },

  /**
   * Handle login form submission
   * @param {Event} event - Form submission event
   */
  async handleLogin(event) {
    const form = event.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    
    try {
      UI.setButtonLoading(submitBtn, true);
      UI.clearFormErrors();

      const formData = new FormData(form);
      const identifier = formData.get('identifier')?.trim();
      const password = formData.get('password');

      // Validate inputs
      const validation = this.validateLoginData({ identifier, password });
      if (!validation.isValid) {
        UI.showFormErrors(validation.errors);
        return;
      }

      // Use Supabase authentication if available
      if (this.supabase && identifier.includes('@')) {
        const { data, error } = await this.supabase.auth.signInWithPassword({
          email: identifier,
          password: password
        });
        
        if (error) {
          if (error.message.includes('Email not confirmed')) {
            UI.showToast('Please verify your email before signing in. Check your inbox for the verification link.', 'warning', 8000);
            this.showResendVerificationOption(identifier);
          } else if (error.message.includes('Invalid login credentials')) {
            UI.showFormErrors({
              'login-identifier': 'Invalid email or password',
              'login-password': 'Invalid email or password'
            });
          } else {
            throw error;
          }
          return;
        }
        
        // Supabase auth state listener will handle the rest
        UI.resetForm('login-form');
        return;
      }

      // Fallback to demo users if no @ in identifier
      if (!identifier.includes('@')) {
        const demoUser = this.findDemoUser(identifier, password);
        if (demoUser) {
          await this.loginSuccess(demoUser);
          UI.resetForm('login-form');
          return;
        }
      }

      throw new Error('Invalid credentials');

    } catch (error) {
      Utils.handleError(error, 'Auth.handleLogin');
      UI.showToast('Login failed. Please check your credentials.', 'error');
    } finally {
      UI.setButtonLoading(submitBtn, false);
    }
  },

  /**
   * Handle signup form submission
   * @param {Event} event - Form submission event
   */
  async handleSignup(event) {
    const form = event.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    
    try {
      UI.setButtonLoading(submitBtn, true);
      UI.clearFormErrors();

      const formData = new FormData(form);
      const userData = {
        name: formData.get('name')?.trim(),
        email: formData.get('email')?.trim(),
        phone: formData.get('phone')?.trim(),
        password: formData.get('password'),
        address: formData.get('address')?.trim(),
        usertype: formData.get('usertype')
      };

      // Validate inputs
      const validation = this.validateSignupData(userData);
      if (!validation.isValid) {
        UI.showFormErrors(validation.errors);
        return;
      }

      // Use Supabase authentication
      if (this.supabase) {
        const { data, error } = await this.supabase.auth.signUp({
          email: userData.email,
          password: userData.password,
          options: {
            data: {
              name: userData.name,
              phone: userData.phone,
              address: userData.address,
              user_type: userData.usertype,
              points: 0,
              co2_saved: 0,
              earnings: userData.usertype === 'collector' ? 0 : undefined,
              jobs_today: userData.usertype === 'collector' ? 0 : undefined
            },
            emailRedirectTo: `${window.location.origin}/?verified=true`
          }
        });

        if (error) {
          if (error.message.includes('User already registered')) {
            UI.showFormErrors({
              'signup-email': 'An account with this email already exists. Please try logging in instead.'
            });
          } else if (error.message.includes('Password should be at least')) {
            UI.showFormErrors({
              'signup-password': 'Password should be at least 6 characters long'
            });
          } else {
            throw error;
          }
          return;
        }

        // Show verification message
        this.showEmailVerificationMessage(userData.email);
        UI.resetForm('signup-form');
        return;
      }

      // Fallback to demo mode if Supabase not available
      const existingUsers = Utils.storage.get(CONFIG.STORAGE_KEYS.USERS, []);
      if (existingUsers.find(u => u.email === userData.email || u.phone === userData.phone)) {
        UI.showFormErrors({
          'signup-email': 'User with this email or phone already exists'
        });
        return;
      }

      // Create demo user profile
      const userProfile = {
        id: Utils.generateId(),
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        password: userData.password,
        address: userData.address,
        user_type: userData.usertype,
        points: 0,
        co2_saved: 0,
        earnings: userData.usertype === 'collector' ? 0 : undefined,
        jobs_today: userData.usertype === 'collector' ? 0 : undefined,
        created_at: new Date().toISOString(),
        avatar: null
      };

      existingUsers.push(userProfile);
      Utils.storage.set(CONFIG.STORAGE_KEYS.USERS, existingUsers);

      await this.loginSuccess(userProfile);
      UI.resetForm('signup-form');

    } catch (error) {
      Utils.handleError(error, 'Auth.handleSignup');
      UI.showToast('Signup failed. Please try again.', 'error');
    } finally {
      UI.setButtonLoading(submitBtn, false);
    }
  },

  /**
   * Validate login data
   * @param {object} data - Login data to validate
   * @returns {object} Validation result
   */
  validateLoginData(data) {
    const errors = {};
    let isValid = true;

    if (!data.identifier) {
      errors['login-identifier'] = 'Email or phone is required';
      isValid = false;
    }

    if (!data.password) {
      errors['login-password'] = 'Password is required';
      isValid = false;
    }

    return { isValid, errors };
  },

  /**
   * Validate signup data
   * @param {object} data - Signup data to validate
   * @returns {object} Validation result
   */
  validateSignupData(data) {
    const errors = {};
    let isValid = true;

    if (!data.name || data.name.length < 2) {
      errors['signup-name'] = 'Name must be at least 2 characters';
      isValid = false;
    }

    if (!data.email) {
      errors['signup-email'] = 'Email is required';
      isValid = false;
    } else if (!Utils.validateEmail(data.email)) {
      errors['signup-email'] = 'Please enter a valid email address';
      isValid = false;
    }

    if (!data.phone) {
      errors['signup-phone'] = 'Phone number is required';
      isValid = false;
    } else if (!Utils.validatePhone(data.phone)) {
      errors['signup-phone'] = 'Please enter a valid Bangladesh phone number';
      isValid = false;
    }

    if (!data.password) {
      errors['signup-password'] = 'Password is required';
      isValid = false;
    } else {
      const passwordValidation = Utils.validatePassword(data.password);
      if (!passwordValidation.isValid) {
        errors['signup-password'] = passwordValidation.errors[0];
        isValid = false;
      }
    }

    if (!data.address || data.address.length < 5) {
      errors['signup-address'] = 'Please enter a complete address';
      isValid = false;
    }

    if (!data.usertype) {
      errors['signup-usertype'] = 'Please select a user type';
      isValid = false;
    }

    return { isValid, errors };
  },

  /**
   * Handle successful login
   * @param {object} user - User object
   */
  async loginSuccess(user) {
    this.currentUser = user;
    this.saveCurrentSession(user);
    
    UI.showToast(CONFIG.SUCCESS.LOGIN, 'success');
    UI.showMainApp();
    
    // Emit login event for other modules
    this.emitEvent('login', user);
  },

  /**
   * Handle logout
   */
  async logout() {
    try {
      // Sign out from Supabase if connected
      if (this.supabase && this.currentUser && this.currentUser.email && this.currentUser.email.includes('@')) {
        const { error } = await this.supabase.auth.signOut();
        if (error) {
          console.warn('Failed to sign out from Supabase:', error);
        }
      }
      
      // Clear local state
      this.currentUser = null;
      Utils.storage.remove(CONFIG.STORAGE_KEYS.SESSION);
      
      // Clear any verification notices
      const notice = document.querySelector('.verification-notice');
      if (notice) notice.remove();
      
      UI.showToast(CONFIG.SUCCESS.LOGOUT, 'success');
      UI.showAuth();
      UI.switchAuthPage('login');
      
      // Emit logout event for other modules
      this.emitEvent('logout');
      
    } catch (error) {
      Utils.handleError(error, 'Auth.logout');
      UI.showToast('Logout failed', 'error');
    }
  },

  /**
   * Check for existing session on app load
   */
  async checkExistingSession() {
    try {
      // Check Supabase session first
      if (this.supabase) {
        const { data: { session }, error } = await this.supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Failed to get Supabase session:', error);
        } else if (session) {
          console.log('✅ Found Supabase session for:', session.user.email);
          await this.handleSupabaseSignIn(session);
          return;
        }
      }

      // Fallback to localStorage session for demo users
      const sessionData = Utils.storage.get(CONFIG.STORAGE_KEYS.SESSION);
      if (sessionData && sessionData.email && !sessionData.email.includes('@')) {
        // This is a demo user (phone number as identifier)
        this.currentUser = sessionData;
        
        setTimeout(() => {
          if (this.currentUser) {
            UI.showMainApp();
            this.emitEvent('login', this.currentUser);
          }
        }, CONFIG.ANIMATIONS.SPLASH_DURATION + 500);
      }
    } catch (error) {
      Utils.handleError(error, 'Auth.checkExistingSession');
      Utils.storage.remove(CONFIG.STORAGE_KEYS.SESSION);
    }
  },

  /**
   * Handle Supabase sign in event
   * @param {object} session - Supabase session
   */
  async handleSupabaseSignIn(session) {
    try {
      const user = session.user;
      
      // Create user profile from Supabase data
      this.currentUser = {
        id: user.id,
        email: user.email,
        name: user.user_metadata.name || user.email.split('@')[0],
        phone: user.user_metadata.phone || '',
        address: user.user_metadata.address || '',
        user_type: user.user_metadata.user_type || 'household',
        points: user.user_metadata.points || 0,
        co2_saved: user.user_metadata.co2_saved || 0,
        earnings: user.user_metadata.earnings,
        jobs_today: user.user_metadata.jobs_today,
        avatar: user.user_metadata.avatar || null,
        email_verified: user.email_confirmed_at ? true : false,
        created_at: user.created_at
      };

      // Save session
      this.saveCurrentSession(this.currentUser);
      
      // Show success and navigate to app
      UI.showToast('Welcome back!', 'success');
      UI.showMainApp();
      
      // Emit login event
      this.emitEvent('login', this.currentUser);
      
    } catch (error) {
      Utils.handleError(error, 'Auth.handleSupabaseSignIn');
    }
  },

  /**
   * Handle Supabase sign out event
   */
  async handleSupabaseSignOut() {
    this.currentUser = null;
    Utils.storage.remove(CONFIG.STORAGE_KEYS.SESSION);
    
    UI.showAuth();
    UI.switchAuthPage('login');
    
    this.emitEvent('logout');
  },

  /**
   * Handle user profile updates
   * @param {object} session - Updated session
   */
  async handleUserUpdate(session) {
    if (session && this.currentUser) {
      // Update current user with new metadata
      Object.assign(this.currentUser, session.user.user_metadata);
      this.saveCurrentSession(this.currentUser);
      this.emitEvent('userUpdated', this.currentUser);
    }
  },

  /**
   * Show email verification message
   * @param {string} email - Email address
   */
  showEmailVerificationMessage(email) {
    const message = `
      <div style="text-align: left;">
        <h3>📧 Check Your Email</h3>
        <p>We've sent a verification link to <strong>${email}</strong></p>
        <p>Please click the link in your email to verify your account and complete registration.</p>
        <p><small>Didn't receive the email? Check your spam folder or click the resend button below.</small></p>
      </div>
    `;
    
    UI.showModal('verification-modal');
    const modalBody = document.querySelector('#verification-modal .modal-body');
    if (modalBody) {
      modalBody.innerHTML = message + `
        <div style="margin-top: 20px;">
          <button class="btn btn--primary" onclick="Auth.resendVerificationEmail('${email}')">
            Resend Verification Email
          </button>
          <button class="btn btn--secondary" onclick="UI.hideModal('verification-modal')">
            Close
          </button>
        </div>
      `;
    }
  },

  /**
   * Show resend verification option
   * @param {string} email - Email address
   */
  showResendVerificationOption(email) {
    const message = `
      <div style="text-align: center; margin-top: 20px; padding: 15px; background: rgba(255, 140, 0, 0.1); border-radius: 8px;">
        <p>📧 Need to verify your email?</p>
        <button class="btn btn--secondary btn--sm" onclick="Auth.resendVerificationEmail('${email}')">
          Resend Verification Email
        </button>
      </div>
    `;
    
    const loginForm = document.getElementById('login-form');
    const existingNotice = loginForm.querySelector('.verification-notice');
    if (existingNotice) {
      existingNotice.remove();
    }
    
    const noticeDiv = document.createElement('div');
    noticeDiv.className = 'verification-notice';
    noticeDiv.innerHTML = message;
    loginForm.appendChild(noticeDiv);
  },

  /**
   * Resend verification email
   * @param {string} email - Email address
   */
  async resendVerificationEmail(email) {
    try {
      if (!this.supabase) {
        UI.showToast('Email verification not available in demo mode', 'warning');
        return;
      }

      const { error } = await this.supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/?verified=true`
        }
      });

      if (error) throw error;

      UI.showToast('Verification email sent! Please check your inbox.', 'success');
      
      // Remove resend option
      const notice = document.querySelector('.verification-notice');
      if (notice) notice.remove();
      
    } catch (error) {
      Utils.handleError(error, 'Auth.resendVerificationEmail');
      UI.showToast('Failed to resend verification email. Please try again.', 'error');
    }
  },

  /**
   * Save current session
   * @param {object} user - User object to save
   */
  saveCurrentSession(user) {
    Utils.storage.set(CONFIG.STORAGE_KEYS.SESSION, user);
  },

  /**
   * Create demo data if it doesn't exist
   */
  createDemoData() {
    const users = Utils.storage.get(CONFIG.STORAGE_KEYS.USERS, []);
    if (users.length === 0) {
      const demoUsers = [
        {
          id: 'demo_household_1',
          ...CONFIG.DEMO_USERS.HOUSEHOLD,
          created_at: new Date().toISOString(),
          avatar: null
        },
        {
          id: 'demo_collector_1',
          ...CONFIG.DEMO_USERS.COLLECTOR,
          created_at: new Date().toISOString(),
          avatar: null
        }
      ];
      Utils.storage.set(CONFIG.STORAGE_KEYS.USERS, demoUsers);
    }
  },

  /**
   * Find demo user by credentials
   * @param {string} identifier - Email or phone
   * @param {string} password - Password
   * @returns {object|null} User object or null
   */
  findDemoUser(identifier, password) {
    const users = Utils.storage.get(CONFIG.STORAGE_KEYS.USERS, []);
    return users.find(user => 
      (user.email === identifier || user.phone === identifier) && 
      user.password === password
    );
  },

  /**
   * Update user data
   * @param {object} updates - User data updates
   */
  async updateUser(updates) {
    if (!this.currentUser) return false;

    try {
      // Update Supabase user metadata if connected
      if (this.supabase && this.currentUser.email && this.currentUser.email.includes('@')) {
        const { error } = await this.supabase.auth.updateUser({
          data: {
            ...this.currentUser,
            ...updates
          }
        });

        if (error) {
          console.warn('Failed to update Supabase user metadata:', error);
          // Continue with local update even if Supabase fails
        }
      }

      // Update current user object
      Object.assign(this.currentUser, updates);
      
      // Update in storage
      this.saveCurrentSession(this.currentUser);
      
      // Update demo storage if it's a demo user
      if (!this.currentUser.email.includes('@')) {
        this.saveDemoUser(this.currentUser);
      }
      
      // Emit update event
      this.emitEvent('userUpdated', this.currentUser);
      
      return true;
    } catch (error) {
      Utils.handleError(error, 'Auth.updateUser');
      return false;
    }
  },

  /**
   * Save demo user data
   * @param {object} user - User object to save
   */
  saveDemoUser(user) {
    const users = Utils.storage.get(CONFIG.STORAGE_KEYS.USERS, []);
    const index = users.findIndex(u => u.id === user.id);
    
    if (index !== -1) {
      users[index] = user;
    } else {
      users.push(user);
    }
    
    Utils.storage.set(CONFIG.STORAGE_KEYS.USERS, users);
  },

  /**
   * Get current user
   * @returns {object|null} Current user object
   */
  getCurrentUser() {
    return this.currentUser;
  },

  /**
   * Check if user is authenticated
   * @returns {boolean} True if user is logged in
   */
  isAuthenticated() {
    return !!this.currentUser;
  },

  /**
   * Check if current user has specific role
   * @param {string} role - Role to check
   * @returns {boolean} True if user has role
   */
  hasRole(role) {
    return this.currentUser?.user_type === role;
  },

  /**
   * Handle password reset
   * @param {string} email - Email address
   */
  async resetPassword(email) {
    try {
      if (!Utils.validateEmail(email)) {
        throw new Error('Please enter a valid email address');
      }

      // Use Supabase password reset if available
      if (this.supabase) {
        const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/?reset=true`
        });

        if (error) throw error;
        
        UI.showToast('Password reset link sent to your email! Check your inbox.', 'success', 8000);
      } else {
        // Demo mode fallback
        UI.showToast('Password reset not available in demo mode', 'warning');
      }
      
    } catch (error) {
      Utils.handleError(error, 'Auth.resetPassword');
      UI.showToast(error.message || 'Failed to send reset email', 'error');
    }
  },

  /**
   * Upload and update user avatar
   * @param {File} file - Image file
   */
  async updateAvatar(file) {
    try {
      const validation = Utils.validateFile(file);
      if (!validation.isValid) {
        UI.showToast(validation.errors[0], 'error');
        return false;
      }

      const base64 = await Utils.fileToBase64(file);
      
      const success = this.updateUser({ avatar: base64 });
      if (success) {
        UI.showToast('Profile picture updated!', 'success');
        return true;
      } else {
        throw new Error('Failed to update avatar');
      }
      
    } catch (error) {
      Utils.handleError(error, 'Auth.updateAvatar');
      UI.showToast('Failed to upload avatar', 'error');
      return false;
    }
  },

  /**
   * Simple event system for auth events
   */
  eventListeners: {},

  /**
   * Add event listener
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  addEventListener(event, callback) {
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = [];
    }
    this.eventListeners[event].push(callback);
  },

  /**
   * Remove event listener
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  removeEventListener(event, callback) {
    if (this.eventListeners[event]) {
      const index = this.eventListeners[event].indexOf(callback);
      if (index > -1) {
        this.eventListeners[event].splice(index, 1);
      }
    }
  },

  /**
   * Emit event
   * @param {string} event - Event name
   * @param {any} data - Event data
   */
  emitEvent(event, data) {
    if (this.eventListeners[event]) {
      this.eventListeners[event].forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          Utils.handleError(error, `Auth.emitEvent.${event}`);
        }
      });
    }
  },

  /**
   * Handle URL parameters for auth flows
   */
  handleUrlParams() {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      
      // Handle email verification
      if (urlParams.get('verified') === 'true') {
        UI.showToast('Email verified successfully! You can now sign in.', 'success', 8000);
        this.clearUrlParams();
      }
      
      // Handle password reset
      if (urlParams.get('reset') === 'true') {
        UI.showToast('Password reset initiated. Please check your email for instructions.', 'success', 8000);
        this.clearUrlParams();
      }

      // Handle error messages
      const error = urlParams.get('error');
      if (error) {
        UI.showToast(`Authentication error: ${decodeURIComponent(error)}`, 'error', 8000);
        this.clearUrlParams();
      }
      
    } catch (error) {
      Utils.handleError(error, 'Auth.handleUrlParams');
    }
  },

  /**
   * Clear URL parameters
   */
  clearUrlParams() {
    const url = new URL(window.location);
    url.search = '';
    window.history.replaceState({}, document.title, url.pathname);
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Auth;
} else if (typeof window !== 'undefined') {
  window.Auth = Auth;
} 