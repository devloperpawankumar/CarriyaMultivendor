# Toast Notification System

A global toast notification system that provides consistent UI messages throughout the application.

## Features

- **Global Context**: Toast notifications are available throughout the entire app
- **Multiple Types**: Success, Error, Warning, and Info toasts
- **Auto-dismiss**: Toasts automatically disappear after a specified duration
- **Manual Close**: Users can manually close toasts
- **Consistent Styling**: All toasts follow the same design pattern
- **Positioned**: Toasts appear in the top-right corner
- **Stacked**: Multiple toasts can be displayed simultaneously

## Usage

### Basic Usage

```tsx
import { useToast } from '../contexts/ToastContext';

const MyComponent = () => {
  const { showToast } = useToast();

  const handleSuccess = () => {
    showToast({
      type: 'success',
      title: 'Success!',
      message: 'Operation completed successfully',
      duration: 4000, // Optional, defaults to 4000ms
    });
  };

  const handleError = () => {
    showToast({
      type: 'error',
      title: 'Error',
      message: 'Something went wrong',
    });
  };

  return (
    <div>
      <button onClick={handleSuccess}>Show Success</button>
      <button onClick={handleError}>Show Error</button>
    </div>
  );
};
```

### Using Utility Functions

For common toast patterns, use the utility functions:

```tsx
import { useToast } from '../contexts/ToastContext';
import { commonToasts } from '../utils/toast';

const MyComponent = () => {
  const { showToast } = useToast();

  const handleAddToCart = () => {
    // Add item to cart logic...
    showToast(commonToasts.addedToCart());
  };

  const handlePayment = () => {
    // Payment logic...
    showToast(commonToasts.paymentSuccess());
  };
};
```

## Toast Types

- **Success** (`#2ECC71`): For successful operations
- **Error** (`#E74C3C`): For errors and failures
- **Warning** (`#F39C12`): For warnings and cautions
- **Info** (`#3498DB`): For informational messages

## Configuration

The toast system is already configured in `App.tsx` with the `ToastProvider` and `ToastContainer` components. No additional setup is required.

## Replacing Alert() Calls

All `alert()` calls in the application have been replaced with appropriate toast notifications:

- **Before**: `alert('User Already Exists with this email..');`
- **After**: `showToast(commonToasts.userExists());`

This provides a much better user experience with consistent styling and positioning.
