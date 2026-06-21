# 🎛️ Admin Settings Page - Complete Guide

## 📋 Overview

The Admin Settings page provides a centralized location for configuring platform-wide settings including commission rates, escrow periods, seller approvals, and notifications.

## 🔗 Route Information

**New Route:** `/admin/settings`  
**Old Route (Deprecated):** `/admin/edit-content` ❌

All navigation references have been updated across the platform.

---

## 🎨 Design Features

### ✅ Exact Match with Design
- Clean white cards with subtle shadows
- Consistent spacing and layout
- Professional typography (Arimo font family)
- Green accent color (#2ECC71) for active states
- Responsive design for all screen sizes

### 📱 Responsive Layout
- **Desktop**: Max width 850px, centered
- **Tablet**: Adapts with flexible padding
- **Mobile**: Single column layout, touch-friendly toggles

---

## 🔧 Settings Sections

### 1. Platform Commission

**Purpose**: Set the default commission percentage charged to sellers on each transaction.

**Fields**:
- **Commission Percentage**: Number input (0-100%)
- **Save Button**: Green button to save changes

**Features**:
- Input validation (0-100)
- Percentage symbol (%) displayed in input
- Individual save button
- Loading state while saving

**API Integration**:
```typescript
// TODO: Replace with actual API endpoint
POST /api/admin/settings/commission
{
  "commission": 15
}
```

---

### 2. Escrow Settings

**Purpose**: Configure how long payments are held in escrow before being released to sellers.

**Fields**:
- **Escrow Holding Days**: Number input (0-365 days)
- **Save Button**: Green button to save changes

**Features**:
- Input validation (0-365)
- Individual save button
- Loading state while saving

**API Integration**:
```typescript
// TODO: Replace with actual API endpoint
POST /api/admin/settings/escrow
{
  "holdingDays": 7
}
```

---

### 3. Seller Approval

**Purpose**: Choose whether new sellers require manual approval or are automatically approved.

**Fields**:
- **Manual Approval Required**: Toggle switch (ON/OFF)
- **Help Text**: Explanation of what the setting does

**Features**:
- Green toggle when enabled
- Gray toggle when disabled
- Auto-saves on toggle
- Smooth animation

**States**:
- **ON (Green)**: New sellers require admin approval
- **OFF (Gray)**: New sellers are automatically approved

**API Integration**:
```typescript
// TODO: Replace with actual API endpoint
POST /api/admin/settings/seller-approval
{
  "manualApprovalRequired": true
}
```

---

### 4. Notification Settings

**Purpose**: Configure platform notification preferences.

**Notifications**:

1. **New Order Notifications** 🔔
   - Notify admin when new orders are placed
   - Default: ON

2. **New Seller Notifications** 👤
   - Notify admin when new sellers register
   - Default: ON

3. **Payment Release Notifications** 💰
   - Notify admin when payments are released
   - Default: OFF

4. **Dispute Notifications** ⚠️
   - Notify admin when disputes are raised
   - Default: ON

**Features**:
- Individual toggle for each notification type
- Green toggle when enabled
- Gray toggle when disabled
- Auto-saves on toggle
- Smooth animations

**API Integration**:
```typescript
// TODO: Replace with actual API endpoint
POST /api/admin/settings/notifications
{
  "newOrder": true,
  "newSeller": true,
  "paymentRelease": false,
  "dispute": true
}
```

---

## 🎯 Component Structure

```
AdminDashboardSettings.tsx
├── State Management
│   ├── settings (all settings data)
│   ├── savingCommission (loading state)
│   └── savingEscrow (loading state)
├── Platform Commission Card
│   ├── Title & Description
│   ├── Number Input with % symbol
│   └── Save Button
├── Escrow Settings Card
│   ├── Title & Description
│   ├── Number Input (days)
│   └── Save Button
├── Seller Approval Card
│   ├── Title & Description
│   ├── Toggle Switch
│   └── Help Text
└── Notification Settings Card
    ├── Title & Description
    └── 4x Toggle Switches
        ├── New Order Notifications
        ├── New Seller Notifications
        ├── Payment Release Notifications
        └── Dispute Notifications
```

---

## 🚀 Usage

### Access the Page

1. **Navigate to Admin Dashboard**:
   ```
   http://localhost:3000/admin/dashboard
   ```

2. **Click Settings in Sidebar**:
   - The settings icon will highlight green
   - Page loads at `/admin/settings`

### Update Platform Commission

1. Find the "Platform Commission" card
2. Change the percentage value (e.g., 15 → 18)
3. Click "Save" button
4. Wait for confirmation message
5. Settings are now updated

### Update Escrow Period

1. Find the "Escrow Settings" card
2. Change the days value (e.g., 7 → 10)
3. Click "Save" button
4. Wait for confirmation message
5. Settings are now updated

### Toggle Seller Approval

1. Find the "Seller Approval" card
2. Click the toggle switch
3. **Green** = Manual approval required
4. **Gray** = Automatic approval
5. Changes save automatically

### Configure Notifications

1. Find the "Notification Settings" card
2. Toggle any notification on/off
3. **Green** = Notifications enabled
4. **Gray** = Notifications disabled
5. Changes save automatically

---

## 🎨 Visual Design

### Color Palette

```css
/* Primary Colors */
Background (Light Green): #F0FFF7
Cards (White): #FFFFFF
Primary Green: #2ECC71
Green Hover: #27AE60

/* Text Colors */
Heading: #101828
Body: #364153
Secondary: #6A7282

/* Border & Controls */
Border: #D1D5DC
Disabled: #D1D5DC
```

### Typography

```css
/* Headings */
Page Title: 32px, Bold
Card Title: 20px, Bold
Field Label: 14px, Medium

/* Body Text */
Description: 14px, Regular
Help Text: 13px, Regular

/* Font Family */
font-family: 'Arimo', sans-serif
```

### Spacing

```css
/* Card Spacing */
Card Padding: 32px (desktop), 24px (mobile)
Card Gap: 24px
Border Radius: 16px

/* Input Spacing */
Input Height: 44px
Input Padding: 16px
Button Padding: 10px 24px
```

---

## 🔄 State Management

### Settings State Type

```typescript
interface SettingsData {
  platformCommission: number;
  escrowHoldingDays: number;
  manualApprovalRequired: boolean;
  notifications: {
    newOrder: boolean;
    newSeller: boolean;
    paymentRelease: boolean;
    dispute: boolean;
  };
}
```

### Default Values

```typescript
{
  platformCommission: 15,
  escrowHoldingDays: 7,
  manualApprovalRequired: true,
  notifications: {
    newOrder: true,
    newSeller: true,
    paymentRelease: false,
    dispute: true,
  }
}
```

---

## 📱 Responsive Behavior

### Desktop (1024px+)
- Max width: 850px, centered
- All cards full width
- Padding: 32px
- Two-column layout for inputs + buttons

### Tablet (768px - 1023px)
- Padding: 24px
- Cards adapt to width
- Inputs stack if needed

### Mobile (< 768px)
- Padding: 16px
- Single column layout
- Full-width inputs and buttons
- Larger touch targets for toggles

---

## 🔌 Backend Integration

### API Endpoints Needed

1. **Get Settings**
```typescript
GET /api/admin/settings
Response: {
  success: true,
  data: {
    platformCommission: 15,
    escrowHoldingDays: 7,
    manualApprovalRequired: true,
    notifications: {
      newOrder: true,
      newSeller: true,
      paymentRelease: false,
      dispute: true
    }
  }
}
```

2. **Update Commission**
```typescript
POST /api/admin/settings/commission
Body: { commission: 15 }
Response: { success: true, message: "Commission updated" }
```

3. **Update Escrow**
```typescript
POST /api/admin/settings/escrow
Body: { holdingDays: 7 }
Response: { success: true, message: "Escrow settings updated" }
```

4. **Update Seller Approval**
```typescript
POST /api/admin/settings/seller-approval
Body: { manualApprovalRequired: true }
Response: { success: true, message: "Approval settings updated" }
```

5. **Update Notifications**
```typescript
POST /api/admin/settings/notifications
Body: {
  newOrder: true,
  newSeller: true,
  paymentRelease: false,
  dispute: true
}
Response: { success: true, message: "Notification settings updated" }
```

### Integration Steps

1. **Add API service functions** in `adminService.ts`:

```typescript
// Get all settings
export const getAdminSettings = async (): Promise<SettingsData> => {
  const response = await fetch('/api/admin/settings', {
    headers: { 'Authorization': `Bearer ${getToken()}` }
  });
  return response.json();
};

// Update commission
export const updateCommission = async (commission: number) => {
  const response = await fetch('/api/admin/settings/commission', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`
    },
    body: JSON.stringify({ commission })
  });
  return response.json();
};

// ... similar functions for other settings
```

2. **Update component** to use real API:

```typescript
// In AdminDashboardSettings.tsx
import { 
  getAdminSettings, 
  updateCommission, 
  updateEscrow,
  updateSellerApproval,
  updateNotifications
} from '../../services/adminService';

// In useEffect
useEffect(() => {
  const loadSettings = async () => {
    try {
      const data = await getAdminSettings();
      setSettings(data);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };
  loadSettings();
}, []);

// In save handlers
const handleSaveCommission = async () => {
  setSavingCommission(true);
  try {
    await updateCommission(settings.platformCommission);
    alert('Commission updated successfully!');
  } catch (error) {
    alert('Failed to save commission.');
  } finally {
    setSavingCommission(false);
  }
};
```

---

## 🧪 Testing Checklist

### Visual Tests

- [ ] Page loads without errors
- [ ] All cards display correctly
- [ ] Typography matches design
- [ ] Colors match design
- [ ] Spacing is consistent
- [ ] Responsive on mobile
- [ ] Responsive on tablet
- [ ] Responsive on desktop

### Functional Tests

#### Platform Commission
- [ ] Can input values 0-100
- [ ] Cannot input negative values
- [ ] Cannot input values > 100
- [ ] % symbol displays correctly
- [ ] Save button works
- [ ] Loading state shows
- [ ] Success message appears

#### Escrow Settings
- [ ] Can input values 0-365
- [ ] Cannot input negative values
- [ ] Cannot input values > 365
- [ ] Save button works
- [ ] Loading state shows
- [ ] Success message appears

#### Seller Approval
- [ ] Toggle switches on/off
- [ ] Color changes (green/gray)
- [ ] Animation is smooth
- [ ] Help text displays

#### Notifications
- [ ] All 4 toggles work
- [ ] Each toggle independent
- [ ] Color changes (green/gray)
- [ ] Animation is smooth
- [ ] Default states correct

### Navigation Tests
- [ ] Settings icon highlights in sidebar
- [ ] Can navigate from all admin pages
- [ ] Route is `/admin/settings`
- [ ] No 404 errors

---

## 🎊 Migration Notes

### What Changed

1. **Route Updated**:
   - Old: `/admin/edit-content`
   - New: `/admin/settings`

2. **Component Replaced**:
   - Old: `EditContent.tsx`
   - New: `AdminDashboardSettings.tsx`

3. **Files Updated**:
   - `App.tsx` - Route definition
   - `AdminDashboardPayments.tsx` - Navigation
   - `AdminDashboardOrders.tsx` - Navigation
   - `AdminDashboardSellers.tsx` - Navigation
   - `AdminDashboardBuyers.tsx` - Navigation
   - `SellerDetails.tsx` - Navigation
   - `SeeTransaction.tsx` - Navigation
   - `index.tsx` - Active key detection

### Old File

The old `EditContent.tsx` file is no longer used but has been kept for reference. It can be safely deleted if needed.

---

## 📝 Summary

✅ **Complete settings management interface**  
✅ **4 distinct settings sections**  
✅ **Matches design exactly**  
✅ **Fully responsive**  
✅ **Backend-ready**  
✅ **Auto-save for toggles**  
✅ **Loading states**  
✅ **Success feedback**  
✅ **All navigation updated**  

**The new Admin Settings page is ready to use!** 🚀

Access it at: `http://localhost:3000/admin/settings`

