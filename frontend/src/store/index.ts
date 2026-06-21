import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import onboardingReducer from './onboardingSlice';
import adminBuyersReducer from './adminBuyersSlice';
import adminSellersReducer from './adminSellersSlice';
import adminDashboardReducer from './adminDashboardSlice';

export const store = configureStore({
  reducer: {
    onboarding: onboardingReducer,
    adminBuyers: adminBuyersReducer,
    adminSellers: adminSellersReducer,
    adminDashboard: adminDashboardReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;


