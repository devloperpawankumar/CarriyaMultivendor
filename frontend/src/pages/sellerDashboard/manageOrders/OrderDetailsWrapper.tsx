import React, { useEffect, useState } from 'react';
import OrderDetailsPage from './OrderDetailsPage';
import ReturnedOrderDetailsPage from './ReturnedOrderDetailsPage';
import TrackOrderPage from './TrackOrderPage';
import DisapproveReturnPage from './DisapproveReturnPage';
import type { CancelOrderPayload, OrderDetails } from './types/orderTypes';

interface OrderDetailsWrapperProps {
  orderDetails: OrderDetails | null;
  onUpdateStatus?: (status: string) => void;
  onBack?: () => void;
  onAcceptOrder?: () => void;
  onCancelOrder?: (payload: CancelOrderPayload) => void;
  decisionLoading?: boolean;
}

const OrderDetailsWrapper: React.FC<OrderDetailsWrapperProps> = ({
  orderDetails,
  onUpdateStatus,
  onBack,
  onAcceptOrder,
  onCancelOrder,
  decisionLoading = false,
}) => {
  const [currentView, setCurrentView] = useState<'details' | 'track' | 'disapprove'>('details');

  // Ensure we jump to top when opening details view
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, []);

  const handleTrackOrder = () => {
    setCurrentView('track');
  };

  const handleBackToDetails = () => {
    setCurrentView('details');
  };

  const handleBack = () => {
    if (currentView === 'track') {
      setCurrentView('details');
    } else {
      onBack?.();
    }
  };

  if (currentView === 'track') {
    return (
      <TrackOrderPage
        orderId={orderDetails?.orderNumber || orderDetails?.id}
        trackingNumber={orderDetails?.trackingNumber}
        onBack={handleBackToDetails}
      />
    );
  }

  if (currentView === 'disapprove') {
    return (
      <DisapproveReturnPage
        onSubmit={onBack}
        onBack={onBack}
      />
    );
  }

  // If it's a canceled/returned order, show the returned/canceled design
  if (orderDetails?.isReturned || orderDetails?.isCanceled) {
    return (
      <ReturnedOrderDetailsPage
        orderDetails={orderDetails}
        onBack={onBack}
        onDisapprove={() => setCurrentView('disapprove')}
      />
    );
  }

  const EnhancedOrderDetailsPage = OrderDetailsPage as React.ComponentType<any>;

  return (
    <EnhancedOrderDetailsPage
      orderDetails={orderDetails}
      onUpdateStatus={onUpdateStatus}
      onTrackOrder={handleTrackOrder}
      showTrackOrder={true}
      onAcceptOrder={onAcceptOrder}
      onCancelOrder={onCancelOrder}
      decisionLoading={decisionLoading}
    />
  );
};

export default OrderDetailsWrapper;
