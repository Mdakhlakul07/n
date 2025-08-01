# 🌱 Vangariwala - Smart Waste Management PWA

A modern Progressive Web Application for connecting households with scrap collectors in Bangladesh, promoting sustainable waste management and environmental responsibility.

![Vangariwala](Logo.jpeg)

## ✨ Features

### 🏠 **For Households**
- **Waste Submission**: Submit different types of waste (organic, plastic, paper, metal, glass, electronic)
- **Points System**: Earn points for each waste submission
- **CO₂ Tracking**: Track environmental impact with CO₂ savings calculations
- **Pickup Scheduling**: Schedule convenient waste pickup times
- **Call Service**: Instant connection with nearby waste collectors
- **History Tracking**: View past submissions and environmental contributions

### 🚛 **For Collectors**
- **Request Management**: View and accept pickup requests from households
- **Earnings Tracking**: Monitor daily earnings and job completion
- **Priority System**: Requests prioritized by weight and urgency
- **Contact Information**: Direct access to household contact details

### 🌐 **General Features**
- **Bilingual Support**: Full English and Bengali (বাংলা) language support
- **PWA Capabilities**: Installable app with offline functionality
- **Responsive Design**: Works seamlessly on mobile and desktop
- **Real-time Notifications**: Toast notifications and browser push notifications
- **Service Worker**: Offline caching and background sync
- **Modern UI/UX**: Clean, accessible design with smooth animations

### 🔐 **Authentication Features** (New!)
- **Real User Registration**: Create accounts with Supabase backend
- **Email Verification**: Secure email verification for new accounts
- **Password Reset**: Forgot password functionality with email recovery
- **Persistent Sessions**: Automatic login on return visits
- **Demo Mode**: Local demo accounts still available for testing
- **Secure Storage**: User data stored securely in Supabase
- **Real-time Auth**: Instant authentication state changes

## 🚀 Getting Started

### **Demo Accounts**

#### Household User
- **Email**: `test@example.com`
- **Password**: `demo123`
- **Features**: Submit waste, track points, schedule pickups

#### Collector User
- **Email**: `collector@example.com`
- **Password**: `demo123`
- **Features**: Accept requests, track earnings, manage jobs

### **Installation**

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Vangariwala
   ```

2. **Configure Supabase** (For real authentication)
   
   **Option A: Quick Setup**
   - Open `setup-supabase.html` in your browser
   - Follow the step-by-step setup guide
   - Update `js/config.js` with your Supabase credentials
   
   **Option B: Manual Setup**
   - Create a Supabase project at [supabase.com](https://supabase.com)
   - Get your Project URL and anon public key from Settings → API
   - Update the SUPABASE configuration in `js/config.js`:
   ```javascript
   SUPABASE: {
     URL: 'https://your-project-ref.supabase.co',
     ANON_KEY: 'your-anon-key'
   }
   ```
   - Configure redirect URLs in Supabase Auth settings

3. **Serve the application**
   ```bash
   # Using Python 3
   python -m http.server 8000
   
   # Using Node.js (http-server)
   npx http-server -p 8000
   
   # Using PHP
   php -S localhost:8000
   ```

4. **Open in browser**
   Navigate to `http://localhost:8000`

5. **Install as PWA** (Optional)
   - Chrome/Edge: Click the install icon in the address bar
   - Mobile: Use "Add to Home Screen" option

## 🏗️ Project Structure

```
Vangariwala/
├── index.html              # Main HTML structure
├── style.css               # Comprehensive CSS with responsive design
├── manifest.json           # PWA manifest configuration
├── sw.js                   # Service worker for offline functionality
├── Logo.jpeg               # Application logo
├── js/
│   ├── app.js              # Main application orchestrator
│   ├── auth.js             # Authentication and user management
│   ├── config.js           # Configuration and constants
│   ├── dashboard.js        # Dashboard functionality
│   ├── ui.js               # UI management and interactions
│   ├── utils.js            # Utility functions and helpers
│   └── waste.js            # Waste management and calculations
└── README.md               # This file
```

## 🔧 Technical Architecture

### **Frontend Stack**
- **HTML5**: Semantic markup with accessibility features
- **CSS3**: Modern styling with CSS Grid, Flexbox, and animations
- **Vanilla JavaScript**: Modular ES6+ architecture
- **Progressive Web App**: Service Worker, Web App Manifest
- **Responsive Design**: Mobile-first approach

### **Key Components**

#### **Authentication System** (`auth.js`)
- User registration and login
- Session management with localStorage
- Real-time form validation
- Demo account support

#### **Dashboard Management** (`dashboard.js`)
- Role-based dashboards (household vs collector)
- Statistics tracking and display
- Tab navigation and content switching
- Profile management

#### **Waste Management** (`waste.js`)
- Waste type calculations (points, CO₂ savings)
- Submission handling and storage
- Pickup request generation
- Collector request management

#### **UI Framework** (`ui.js`)
- Component-based UI management
- Language switching (English/Bengali)
- Modal dialogs and notifications
- Responsive behavior handling

#### **Utility Functions** (`utils.js`)
- Data validation and sanitization
- Local storage management
- Date/time formatting
- Device detection and feature support

### **Data Storage**
- **localStorage**: User sessions and app data
- **Demo Mode**: No backend required for testing
- **Offline Support**: Service Worker caching

## 🌍 Environment & Sustainability

### **Waste Types Supported**
- **Organic Waste** 🥬: 0.6kg CO₂ saved per kg, 10 points/kg
- **Plastic Waste** ♻️: 1.2kg CO₂ saved per kg, 10 points/kg
- **Paper Waste** 📄: 0.4kg CO₂ saved per kg, 10 points/kg
- **Metal Waste** 🔧: 0.1kg CO₂ saved per kg, 15 points/kg
- **Glass Waste** 🍶: 0.1kg CO₂ saved per kg, 12 points/kg
- **Electronic Waste** 📱: 0.8kg CO₂ saved per kg, 20 points/kg

### **Environmental Impact**
- Real-time CO₂ savings calculations
- Points-based incentive system
- Environmental awareness promotion
- Sustainable waste management practices

## 📱 PWA Features

### **Installability**
- Web App Manifest for app-like installation
- Custom splash screen and icons
- Standalone display mode

### **Offline Functionality**
- Service Worker for resource caching
- Offline page for network failures
- Background sync for pending submissions
- Cache management and optimization

### **Push Notifications**
- Browser notification support
- Background sync notifications
- Request updates for collectors
- Submission confirmations

## 🔧 Configuration

Key configuration options in `js/config.js`:

```javascript
const CONFIG = {
  APP_NAME: 'Vangariwala',
  APP_VERSION: '2.0.0',
  
  // Language settings
  LANGUAGES: {
    DEFAULT: 'en',
    SUPPORTED: ['en', 'bn']
  },
  
  // Feature flags
  FEATURES: {
    ENABLE_PUSH_NOTIFICATIONS: false,
    ENABLE_GEOLOCATION: true,
    ENABLE_CAMERA: true,
    ENABLE_OFFLINE_MODE: false
  }
  
  // ... more configuration options
};
```

## 🎨 Customization

### **Theming**
The app uses CSS custom properties for easy theming:

```css
:root {
  --color-primary: #FF8C00;        /* Orange theme */
  --color-primary-hover: #FFA500;
  --color-background: #FFF8E1;
  --font-family: "Inter", "Noto Sans Bengali", sans-serif;
}
```

### **Language Support**
Add new languages by:
1. Adding language code to `CONFIG.LANGUAGES.SUPPORTED`
2. Adding translations with `data-[lang]` attributes in HTML
3. Updating language toggle functionality

## 🌐 Browser Support

- **Chrome/Chromium**: Full support including PWA features
- **Firefox**: Core functionality (limited PWA support)
- **Safari**: Core functionality with basic PWA support
- **Edge**: Full support including PWA features
- **Mobile Browsers**: Optimized responsive experience

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Inter Font**: Modern typography by Rasmus Andersson
- **Noto Sans Bengali**: Bengali language support by Google Fonts
- **OpenStreetMap**: Map data for location services
- **Emoji Icons**: Native emoji icons for better accessibility

## 📞 Support

For support, feedback, or contributions, please open an issue on the repository or contact the development team.

---

**Built with ❤️ for a sustainable future in Bangladesh** 🇧🇩 