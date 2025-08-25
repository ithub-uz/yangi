# 🚀 React Native Starter App

A production-ready React Native starter app with modern features, security, and performance optimizations.

## ✨ Features

### 🔐 **Authentication & Security**
- **Biometric Authentication** - Face ID, Touch ID, Fingerprint support
- **PIN Code Fallback** - 4-digit PIN with secure storage
- **Lock Screen** - Auto-lock with configurable timeout
- **Secure Storage** - Encrypted data storage using Expo SecureStore
- **Input Validation** - Zod schemas with react-hook-form integration
- **Rate Limiting** - Protection against brute force attacks
- **Password Strength Validation** - Real-time password strength checking

### 🎨 **Modern Design System**
- **Design Tokens** - Consistent colors, typography, spacing, and shadows
- **Theme Support** - Light, dark, and system theme modes
- **Component Library** - Reusable UI components with variants
- **Responsive Design** - Optimized for different screen sizes
- **Accessibility** - WCAG compliant components

### 📱 **User Experience**
- **Multi-language Support** - English and Uzbek with i18next
- **Haptic Feedback** - Tactile responses for interactions
- **Smooth Animations** - Optimized transitions and micro-interactions
- **Loading States** - Skeleton screens and loading indicators
- **Error Handling** - Graceful error boundaries and user feedback

### 🔔 **Notifications**
- **Push Notifications** - Expo notifications with permission handling
- **Notification Center** - In-app notification management
- **Customizable Settings** - User-controlled notification preferences

### ⚡ **Performance & Monitoring**
- **Performance Monitoring** - Real-time performance metrics
- **Memory Management** - Optimized memory usage tracking
- **Lazy Loading** - Component and image lazy loading
- **Image Optimization** - Cached and optimized image loading
- **Bundle Optimization** - Tree shaking and code splitting

### 🛠 **Developer Experience**
- **TypeScript** - Full type safety throughout the app
- **ESLint & Prettier** - Code quality and formatting
- **Error Boundaries** - Graceful error handling
- **Logging System** - Comprehensive logging with remote capabilities
- **Hot Reload** - Fast development with Expo

## 🏗 Architecture

```
src/
├── app/                    # Expo Router app directory
├── components/             # Reusable components
│   ├── ui/                # Design system components
│   └── ...                # Feature-specific components
├── hooks/                 # Custom React hooks
├── services/              # Business logic services
├── store/                 # State management (Zustand)
├── utils/                 # Utility functions
├── validation/            # Zod validation schemas
├── design/                # Design tokens and constants
├── types/                 # TypeScript type definitions
└── locales/               # Internationalization
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- Bun (recommended) or npm
- Expo CLI
- iOS Simulator or Android Emulator

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd starter

# Install dependencies
bun install

# Start the development server
bun start
```

### Environment Setup

Create a `.env` file in the root directory:

```env
# App Configuration
EXPO_PUBLIC_APP_NAME="Starter App"
EXPO_PUBLIC_APP_VERSION="1.0.0"

# API Configuration (for production)
EXPO_PUBLIC_API_URL="https://api.yourapp.com"

# Logging Configuration
EXPO_PUBLIC_LOG_LEVEL="info"
EXPO_PUBLIC_REMOTE_LOGGING_URL="https://logs.yourapp.com"
```

## 📱 Usage

### Authentication Flow

1. **Onboarding** - First-time user experience
2. **Sign Up** - Account creation with validation
3. **Sign In** - Secure authentication
4. **Biometric Setup** - Optional biometric enrollment
5. **PIN Setup** - Fallback authentication method

### Settings Management

- **Theme** - Light, dark, or system theme
- **Language** - English or Uzbek
- **Notifications** - Push notification preferences
- **Security** - Biometric and PIN settings
- **Lock Screen** - Auto-lock configuration

### Logging

Structured logging with multiple levels:

```typescript
import { logger } from '@/services/logger';

logger.info('User action completed', { userId, action });
logger.error('API call failed', error, { endpoint });
logger.debug('Component rendered', { componentName });
```

## 🔧 Configuration

### Design System

Customize the design system in `design/tokens.ts`:

```typescript
export const colors = {
  primary: {
    500: '#your-brand-color',
    // ... other shades
  },
  // ... other color palettes
};
```

### Validation Schemas

Add new validation schemas in `validation/schemas.ts`:

```typescript
export const newFormSchema = z.object({
  field: z.string().min(1, 'Required'),
  // ... other fields
});
```

### Security Settings

Configure security in `utils/security.ts`:

```typescript
// Rate limiting
SecurityUtils.checkRateLimit('login_attempts', 5, 60000);

// Password validation
const strength = SecurityUtils.validatePasswordStrength(password);
```

## 📊 Performance

### Optimization Features

- **Component Memoization** - React.memo for expensive components
- **Image Caching** - Expo Image with memory and disk caching
- **Lazy Loading** - Components loaded on demand
- **Memory Monitoring** - Real-time memory usage tracking
- **Bundle Analysis** - Webpack bundle analyzer integration

### Monitoring Metrics

- Component render times
- Memory usage patterns
- API response times
- User interaction metrics
- Error rates and types

## 🔒 Security

### Security Features

- **Data Encryption** - SHA-256 hashing for sensitive data
- **Secure Storage** - Expo SecureStore for credentials
- **Input Sanitization** - XSS and injection protection
- **Rate Limiting** - Brute force attack prevention
- **Session Management** - Secure token handling

### Best Practices

- All user inputs are validated with Zod
- Sensitive data is encrypted before storage
- API calls include proper error handling
- Authentication tokens are securely managed
- Rate limiting prevents abuse

## 🌍 Internationalization

### Supported Languages

- **English** (en) - Default language
- **Uzbek** (uz) - Localized content

### Adding New Languages

1. Create translation file in `locales/`
2. Add language to `i18n.ts`
3. Update language selector in settings

## 🧪 Testing

### Testing Strategy

- **Unit Tests** - Component and utility testing
- **Integration Tests** - API and state management testing
- **E2E Tests** - User flow testing with Detox
- **Performance Tests** - Load and stress testing

### Running Tests

```bash
# Unit tests
bun test

# E2E tests
bun test:e2e

# Performance tests
bun test:performance
```

## 📦 Deployment

### Build Configuration

```bash
# Development build
bun run build:dev

# Production build
bun run build:prod

# EAS Build
eas build --platform all
```

### Environment Variables

Configure different environments:

```bash
# Development
bun start

# Staging
bun start --env staging

# Production
bun start --env production
```

## 🤝 Contributing

### Development Workflow

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### Code Standards

- Follow TypeScript best practices
- Use ESLint and Prettier
- Write meaningful commit messages
- Add JSDoc comments for complex functions
- Follow the established component patterns

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Documentation

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [Zustand Documentation](https://github.com/pmndrs/zustand)

### Issues

For bugs and feature requests, please use the [GitHub Issues](https://github.com/your-repo/issues) page.

### Community

Join our community:
- [Discord Server](https://discord.gg/your-server)
- [Telegram Group](https://t.me/your-group)

---

**Built with ❤️ using React Native, Expo, and modern web technologies**
