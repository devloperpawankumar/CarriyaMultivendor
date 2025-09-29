import React, { useEffect, useState } from 'react';
import OrderDetailsPage from './OrderDetailsPage';
import ReturnedOrderDetailsPage from './ReturnedOrderDetailsPage';
import TrackOrderPage from './TrackOrderPage';
import DisapproveReturnPage from './DisapproveReturnPage';

export interface OrderDetails {
  id: string;
  customerName: string;
  address: string;
  paymentMethod: string;
  paymentStatus: string;
  orderDate: string;
  shippingCharges: string;
  productName: string;
  unitPrice: string;
  quantity: number;
  platformCommission: string;
  discount: string;
  sellerPayout: string;
  productImage?: string;
  // Return/Cancellation specific (for Canceled/Returned view)
  isReturned?: boolean;
  isCanceled?: boolean;
  returnReason?: string;
}

interface OrderDetailsWrapperProps {
  orderDetails: OrderDetails | null;
  onUpdateStatus?: () => void;
  onBack?: () => void;
}

const OrderDetailsWrapper: React.FC<OrderDetailsWrapperProps> = ({
  orderDetails,
  onUpdateStatus,
  onBack,
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
        orderId={orderDetails?.id}
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

  return (
    <OrderDetailsPage
      orderDetails={orderDetails}
      onUpdateStatus={onUpdateStatus}
      onTrackOrder={handleTrackOrder}
      showTrackOrder={true}
    />
  );
};

export default OrderDetailsWrapper;
