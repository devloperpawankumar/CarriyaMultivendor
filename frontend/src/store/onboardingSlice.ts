import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type OnboardingState = {
  phone: string;
  otpVerified: boolean;
  firstName: string;
  lastName: string;
  email: string;
};

const initialState: OnboardingState = {
  phone: '',
  otpVerified: false,
  firstName: '',
  lastName: '',
  email: '',
};

const onboardingSlice = createSlice({
  name: 'onboarding',
  initialState,
  reducers: {
    setPhone(state, action: PayloadAction<string>) {
      state.phone = action.payload;
    },
    setOtpVerified(state, action: PayloadAction<boolean>) {
      state.otpVerified = action.payload;
    },
    setFirstName(state, action: PayloadAction<string>) {
      state.firstName = action.payload;
    },
    setLastName(state, action: PayloadAction<string>) {
      state.lastName = action.payload;
    },
    setEmail(state, action: PayloadAction<string>) {
      state.email = action.payload;
    },
    resetOnboarding() {
      return initialState;
    },
  },
});

export const { setPhone, setOtpVerified, setFirstName, setLastName, setEmail, resetOnboarding } = onboardingSlice.actions;
export default onboardingSlice.reducer;


