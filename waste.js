/**
 * Vangariwala Waste Management Module
 * Handles waste submission, calculations, and pickup requests
 */

const Waste = {
  wasteData: {},
  
  /**
   * Initialize waste management module
   */
  init() {
    this.setupEventListeners();
    this.loadWasteTypes();
    
    // Listen for auth events
    Auth.addEventListener('login', () => {
      this.loadUserWasteData();
    });
  },

  /**
   * Setup waste submission event listeners
   */
  setupEventListeners() {
    // Waste input handlers
    document.querySelectorAll('.waste-input').forEach(input => {
      input.addEventListener('input', () => {
        this.updateWasteSummary();
      });
    });

    // Submit waste button
    const submitBtn = document.getElementById('submit-waste-btn');
    submitBtn?.addEventListener('click', () => {
      this.handleWasteSubmission();
    });
  },

  /**
   * Load waste types into the UI
   */
  loadWasteTypes() {
    const wasteTypesGrid = document.querySelector('.waste-types-grid');
    if (!wasteTypesGrid) return;

    // Update waste type cards with current language
    CONFIG.WASTE_TYPES.forEach(wasteType => {
      const card = document.querySelector(`[data-type="${wasteType.type}"]`);
      if (card) {
        const titleEl = card.querySelector('h4');
        const coInfoEl = card.querySelector('.co2-info');
        
        if (titleEl) {
          const currentLang = UI.currentLanguage || 'en';
          titleEl.textContent = wasteType[`label_${currentLang}`] || wasteType.label_en;
        }
        
        if (coInfoEl) {
          coInfoEl.textContent = `${wasteType.co2_factor}kg CO₂/kg`;
        }
      }
    });
  },

  /**
   * Update waste summary calculations
   */
  updateWasteSummary() {
    let totalWeight = 0;
    let totalPoints = 0;
    let totalCO2 = 0;
    let totalTaka = 0;

    // Calculate totals from all waste inputs
    document.querySelectorAll('.waste-input').forEach(input => {
      const weight = parseFloat(input.value) || 0;
      const wasteType = input.closest('.waste-type-card').dataset.type;
      
      if (weight > 0) {
        totalWeight += weight;
        totalPoints += Utils.calculateWastePoints(wasteType, weight);
        totalCO2 += Utils.calculateCO2Saved(wasteType, weight);
        totalTaka += Utils.calculateTakaEarnings(wasteType, weight);
      }
    });

    // Update summary display
    const totalWeightEl = document.getElementById('total-weight');
    const totalPointsEl = document.getElementById('total-points');
    const totalCO2El = document.getElementById('total-co2');
    const totalTakaEl = document.getElementById('total-taka');

    if (totalWeightEl) totalWeightEl.textContent = `${totalWeight.toFixed(1)} kg`;
    if (totalPointsEl) totalPointsEl.textContent = totalPoints.toString();
    if (totalCO2El) totalCO2El.textContent = `${totalCO2.toFixed(1)} kg`;
    if (totalTakaEl) totalTakaEl.textContent = `৳${totalTaka.toFixed(0)}`;

    // Enable/disable submit button
    const submitBtn = document.getElementById('submit-waste-btn');
    if (submitBtn) {
      submitBtn.disabled = totalWeight === 0;
    }

    // Store current waste data
    this.wasteData = {
      totalWeight,
      totalPoints,
      totalCO2,
      totalTaka,
      wasteTypes: this.getWasteTypeBreakdown()
    };
  },

  /**
   * Get breakdown of waste types with weights
   * @returns {object} Waste type breakdown
   */
  getWasteTypeBreakdown() {
    const breakdown = {};
    
    document.querySelectorAll('.waste-input').forEach(input => {
      const weight = parseFloat(input.value) || 0;
      const wasteType = input.closest('.waste-type-card').dataset.type;
      
      if (weight > 0) {
        breakdown[wasteType] = {
          weight,
          points: Utils.calculateWastePoints(wasteType, weight),
          co2_saved: Utils.calculateCO2Saved(wasteType, weight),
          taka_earned: Utils.calculateTakaEarnings(wasteType, weight)
        };
      }
    });

    return breakdown;
  },

  /**
   * Handle waste submission
   */
  async handleWasteSubmission() {
    if (!Auth.isAuthenticated()) {
      UI.showToast('Please log in to submit waste', 'error');
      return;
    }

    if (this.wasteData.totalWeight === 0) {
      UI.showToast('Please enter waste amounts', 'warning');
      return;
    }

    const submitBtn = document.getElementById('submit-waste-btn');
    
    try {
      UI.setButtonLoading(submitBtn, true);

      // Create submission record
      const submission = {
        id: Utils.generateId(),
        user_id: Auth.getCurrentUser().id,
        date: new Date().toISOString(),
        total_weight: this.wasteData.totalWeight,
        total_points: this.wasteData.totalPoints,
        total_co2_saved: this.wasteData.totalCO2,
        waste_types: this.wasteData.wasteTypes,
        status: 'submitted'
      };

      // Save submission to storage
      const submissions = Utils.storage.get('user_submissions', []);
      submissions.push(submission);
      Utils.storage.set('user_submissions', submissions);

      // Update user points and CO2 saved
      const currentUser = Auth.getCurrentUser();
      const updatedPoints = (currentUser.points || 0) + this.wasteData.totalPoints;
      const updatedCO2 = (currentUser.co2_saved || 0) + this.wasteData.totalCO2;

      Auth.updateUser({
        points: updatedPoints,
        co2_saved: Math.round(updatedCO2 * 100) / 100
      });

      // Create pickup request for collectors
      this.createPickupRequest(submission);

      // Show success message
      UI.showToast(CONFIG.SUCCESS.WASTE_SUBMITTED, 'success');
      
      // Reset form
      this.resetWasteForm();

      // Update dashboard if visible
      if (typeof Dashboard !== 'undefined') {
        Dashboard.updateDashboardData();
      }

    } catch (error) {
      Utils.handleError(error, 'Waste.handleWasteSubmission');
      UI.showToast('Failed to submit waste. Please try again.', 'error');
    } finally {
      UI.setButtonLoading(submitBtn, false);
    }
  },

  /**
   * Create pickup request for collectors
   * @param {object} submission - Waste submission data
   */
  createPickupRequest(submission) {
    const currentUser = Auth.getCurrentUser();
    if (!currentUser) return;

    const pickupRequest = {
      id: Utils.generateId(),
      submission_id: submission.id,
      household_id: currentUser.id,
      household_name: currentUser.name,
      household_address: currentUser.address,
      household_phone: currentUser.phone,
      total_weight: submission.total_weight,
      waste_types: submission.waste_types,
      estimated_value: this.calculateEstimatedValue(submission.waste_types),
      status: 'pending',
      created_at: new Date().toISOString(),
      priority: this.calculatePriority(submission.total_weight)
    };

    // Save to pickup requests
    const requests = Utils.storage.get('pickup_requests', []);
    requests.push(pickupRequest);
    Utils.storage.set('pickup_requests', requests);
  },

  /**
   * Calculate estimated value for collectors
   * @param {object} wasteTypes - Waste types breakdown
   * @returns {number} Estimated value in Taka
   */
  calculateEstimatedValue(wasteTypes) {
    let totalValue = 0;
    
    // Simple pricing model (would be more sophisticated in real app)
    const pricing = {
      plastic: 15, // ৳15 per kg
      paper: 8,    // ৳8 per kg
      metal: 25,   // ৳25 per kg
      glass: 5,    // ৳5 per kg
      electronic: 50, // ৳50 per kg
      organic: 3   // ৳3 per kg
    };

    Object.entries(wasteTypes).forEach(([type, data]) => {
      const rate = pricing[type] || 5;
      totalValue += data.weight * rate;
    });

    return Math.round(totalValue);
  },

  /**
   * Calculate priority based on waste amount
   * @param {number} totalWeight - Total weight in kg
   * @returns {string} Priority level
   */
  calculatePriority(totalWeight) {
    if (totalWeight >= 10) return 'high';
    if (totalWeight >= 5) return 'medium';
    return 'low';
  },

  /**
   * Reset waste submission form
   */
  resetWasteForm() {
    document.querySelectorAll('.waste-input').forEach(input => {
      input.value = '';
    });
    this.updateWasteSummary();
  },

  /**
   * Load pickup requests for collectors
   */
  loadPickupRequests() {
    const requestsContainer = document.getElementById('requests-container');
    if (!requestsContainer) return;

    const requests = Utils.storage.get('pickup_requests', [])
      .filter(request => request.status === 'pending')
      .sort((a, b) => {
        // Sort by priority and date
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
        if (priorityDiff !== 0) return priorityDiff;
        return new Date(b.created_at) - new Date(a.created_at);
      });

    if (requests.length === 0) {
      requestsContainer.innerHTML = `
        <p>${UI.getText('no_requests', {
          en: 'No pickup requests available.',
          bn: 'কোন পিকআপ অনুরোধ উপলব্ধ নেই।'
        })}</p>
      `;
      return;
    }

    requestsContainer.innerHTML = requests.map(request => `
      <div class="request-item" data-request-id="${request.id}">
        <div class="request-header">
          <div class="request-address">${Utils.sanitizeInput(request.household_address)}</div>
          <div class="request-time">${Utils.getRelativeTime(request.created_at)}</div>
        </div>
        <div class="request-details">
          <div class="waste-info">
            ${request.total_weight}kg • ৳${request.estimated_value} • ${request.priority} priority
          </div>
          <button class="btn btn--primary btn--sm accept-request-btn" data-request-id="${request.id}">
            <span data-en="Accept" data-bn="গ্রহণ করুন">Accept</span>
          </button>
        </div>
      </div>
    `).join('');

    // Add event listeners for accept buttons
    document.querySelectorAll('.accept-request-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const requestId = e.target.dataset.requestId;
        this.acceptPickupRequest(requestId);
      });
    });
  },

  /**
   * Accept pickup request
   * @param {string} requestId - Request ID to accept
   */
  async acceptPickupRequest(requestId) {
    const currentUser = Auth.getCurrentUser();
    if (!currentUser || currentUser.user_type !== 'collector') {
      UI.showToast('Only collectors can accept requests', 'error');
      return;
    }

    try {
      const requests = Utils.storage.get('pickup_requests', []);
      const requestIndex = requests.findIndex(r => r.id === requestId);
      
      if (requestIndex === -1) {
        UI.showToast('Request not found', 'error');
        return;
      }

      const request = requests[requestIndex];
      
      // Update request status
      requests[requestIndex] = {
        ...request,
        status: 'accepted',
        collector_id: currentUser.id,
        collector_name: currentUser.name,
        collector_phone: currentUser.phone,
        accepted_at: new Date().toISOString()
      };

      Utils.storage.set('pickup_requests', requests);

      // Update collector stats
      const newEarnings = (currentUser.earnings || 0) + request.estimated_value;
      const newJobsToday = (currentUser.jobs_today || 0) + 1;

      Auth.updateUser({
        earnings: newEarnings,
        jobs_today: newJobsToday
      });

      UI.showToast(CONFIG.SUCCESS.REQUEST_ACCEPTED, 'success');
      
      // Reload requests
      this.loadPickupRequests();

      // Update dashboard
      if (typeof Dashboard !== 'undefined') {
        Dashboard.updateDashboardData();
      }

    } catch (error) {
      Utils.handleError(error, 'Waste.acceptPickupRequest');
      UI.showToast('Failed to accept request', 'error');
    }
  },

  /**
   * Load user's waste submission data
   */
  loadUserWasteData() {
    const currentUser = Auth.getCurrentUser();
    if (!currentUser) return;

    // Load user's submission history
    const submissions = Utils.storage.get('user_submissions', [])
      .filter(s => s.user_id === currentUser.id);

    // Update any UI elements that show submission counts, etc.
    console.log(`User has ${submissions.length} waste submissions`);
  },

  /**
   * Get waste statistics for user
   * @returns {object} Waste statistics
   */
  getWasteStatistics() {
    const currentUser = Auth.getCurrentUser();
    if (!currentUser) return null;

    const submissions = Utils.storage.get('user_submissions', [])
      .filter(s => s.user_id === currentUser.id);

    const stats = {
      total_submissions: submissions.length,
      total_weight: 0,
      total_points: 0,
      total_co2_saved: 0,
      waste_type_breakdown: {}
    };

    submissions.forEach(submission => {
      stats.total_weight += submission.total_weight;
      stats.total_points += submission.total_points;
      stats.total_co2_saved += submission.total_co2_saved;

      Object.entries(submission.waste_types).forEach(([type, data]) => {
        if (!stats.waste_type_breakdown[type]) {
          stats.waste_type_breakdown[type] = { weight: 0, count: 0 };
        }
        stats.waste_type_breakdown[type].weight += data.weight;
        stats.waste_type_breakdown[type].count += 1;
      });
    });

    return stats;
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Waste;
} else if (typeof window !== 'undefined') {
  window.Waste = Waste;
} 