# Scalable Authentication Components

This directory contains reusable authentication components designed for scalability and easy backend integration.

## Architecture Overview

The authentication system is built with a modular approach that allows for easy customization and backend integration:

### Core Components

1. **SignupLayout** - Main layout wrapper for signup pages
2. **SignupForm** - Reusable form component with configurable fields
3. **UserTypeToggle** - Toggle between buyer/seller user types
4. **FormField** - Individual form input component
5. **TermsCheckbox** - Terms and conditions checkbox
6. **ActionButton** - Reusable button component

### Key Features

- **Scalable**: Easy to add new user types or form fields
- **Reusable**: Components can be used across different signup flows
- **Backend Ready**: Form data is structured for easy API integration
- **Responsive**: Mobile-first design with desktop optimizations
- **Type Safe**: Full TypeScript support with proper interfaces

## Usage Examples

### Basic Signup Form
```tsx
import SignupForm, { SignupFormData } from '../components/auth/SignupForm';

const handleSubmit = (data: SignupFormData) => {
  // Send data to your backend API
  fetch('/api/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
};

<SignupForm
  userType="buyer"
  onUserTypeChange={setUserType}
  onSubmit={handleSubmit}
  submitButtonText="Create Account"
  showPhoneField={true}
/>
```

### Custom Form Fields
```tsx
import FormField from '../components/auth/FormField';

<FormField
  type="email"
  name="email"
  value={email}
  onChange={handleChange}
  placeholder="Enter your email"
  required
/>
```

## Backend Integration

### API Endpoints Expected

The components expect these API endpoints:

- `POST /api/auth/signup` - User registration
- `POST /api/auth/verify-email` - Email verification
- `POST /api/auth/send-otp` - Send OTP (WhatsApp/SMS)

### Data Structure

```typescript
interface SignupFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
}

interface APIResponse {
  success: boolean;
  message: string;
  data?: {
    userId: string;
    verificationToken?: string;
  };
}
```

### Error Handling

Components are designed to work with standard HTTP status codes:
- `200` - Success
- `400` - Validation errors
- `409` - User already exists
- `500` - Server error

## Customization

### Adding New User Types

1. Update the `UserType` type in `UserTypeToggle.tsx`
2. Add new user type options to the toggle component
3. Update form validation logic as needed

### Adding New Form Fields

1. Extend the `SignupFormData` interface
2. Add new `FormField` components to the form
3. Update validation logic

### Styling Customization

All components use Tailwind CSS classes that can be easily customized:
- Colors: `bg-[#2ECC71]`, `text-[#767676]`
- Spacing: `px-[20px]`, `py-[10px]`
- Sizing: `w-[600px]`, `h-[67px]`

## File Structure

```
src/components/auth/
├── SignupLayout.tsx      # Main layout wrapper
├── SignupForm.tsx        # Main form component
├── UserTypeToggle.tsx    # User type selection
├── FormField.tsx         # Individual input field
├── TermsCheckbox.tsx     # Terms and conditions
├── ActionButton.tsx      # Reusable button
└── README.md            # This documentation
```

## Future Enhancements

- Add form validation with error messages
- Implement password strength indicator
- Add social login integration
- Create login form components
- Add password reset functionality
- Implement two-factor authentication
