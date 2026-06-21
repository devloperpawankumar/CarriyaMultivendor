/**
 * Test utility to verify Redux setup is working correctly
 * This is for development/debugging purposes only
 */

import { store } from '../store';
import { fetchBuyersAsync } from '../store/adminBuyersSlice';
import { fetchSellersAsync } from '../store/adminSellersSlice';
import { fetchDashboardOverviewAsync } from '../store/adminDashboardSlice';

/**
 * Test Redux store configuration
 */
export const testReduxConfiguration = () => {
  console.group('🧪 Redux Configuration Test');
  
  const state = store.getState();
  console.log('✅ Store initialized successfully');
  console.log('Available reducers:', Object.keys(state));
  
  // Check each reducer
  console.log('\n📦 Reducer States:');
  console.log('- adminBuyers:', state.adminBuyers ? '✅' : '❌');
  console.log('- adminSellers:', state.adminSellers ? '✅' : '❌');
  console.log('- adminDashboard:', state.adminDashboard ? '✅' : '❌');
  console.log('- onboarding:', state.onboarding ? '✅' : '❌');
  
  console.groupEnd();
  return true;
};

/**
 * Test API integration with real data
 */
export const testApiIntegration = async () => {
  console.group('🌐 API Integration Test');
  
  try {
    // Test buyers API
    console.log('\n📝 Testing Buyers API...');
    const buyersResult = await store.dispatch(
      fetchBuyersAsync({ page: 1, pageSize: 5 })
    );
    
    if (fetchBuyersAsync.fulfilled.match(buyersResult)) {
      console.log('✅ Buyers API working');
      console.log(`   Found ${buyersResult.payload.total} buyers`);
    } else {
      console.error('❌ Buyers API failed:', buyersResult.error);
    }
    
    // Test sellers API
    console.log('\n👥 Testing Sellers API...');
    const sellersResult = await store.dispatch(
      fetchSellersAsync({ page: 1, pageSize: 5 })
    );
    
    if (fetchSellersAsync.fulfilled.match(sellersResult)) {
      console.log('✅ Sellers API working');
      console.log(`   Found ${sellersResult.payload.total} sellers`);
    } else {
      console.error('❌ Sellers API failed:', sellersResult.error);
    }
    
    // Test dashboard API
    console.log('\n📊 Testing Dashboard API...');
    const dashboardResult = await store.dispatch(fetchDashboardOverviewAsync());
    
    if (fetchDashboardOverviewAsync.fulfilled.match(dashboardResult)) {
      console.log('✅ Dashboard API working');
      console.log('   Stats:', {
        totalUsers: dashboardResult.payload.stats.totalUsers,
        totalSellers: dashboardResult.payload.stats.totalSellers,
        totalOrders: dashboardResult.payload.stats.totalOrders,
      });
    } else {
      console.error('❌ Dashboard API failed:', dashboardResult.error);
    }
    
    console.groupEnd();
    return true;
  } catch (error) {
    console.error('❌ API Integration Test Failed:', error);
    console.groupEnd();
    return false;
  }
};

/**
 * Run all tests
 */
export const runAllTests = async () => {
  console.log('🚀 Starting Redux & API Tests...\n');
  
  testReduxConfiguration();
  await testApiIntegration();
  
  console.log('\n✨ All tests completed!');
};

// Export for use in development console
if (process.env.NODE_ENV === 'development') {
  (window as any).testRedux = {
    config: testReduxConfiguration,
    api: testApiIntegration,
    all: runAllTests,
  };
  
  console.log('💡 Redux test utilities available:');
  console.log('   window.testRedux.config() - Test Redux configuration');
  console.log('   window.testRedux.api() - Test API integration');
  console.log('   window.testRedux.all() - Run all tests');
}

