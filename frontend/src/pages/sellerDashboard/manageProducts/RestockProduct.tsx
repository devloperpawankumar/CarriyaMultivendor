import React from 'react';
import SellerScaffold from '../../../components/seller/SellerScaffold';
import { sellerMenuIcons, sellerMenuRoutes } from '../../../components/seller/menuConfig';
import { useNavigate, useParams } from 'react-router-dom';
import { getProduct, restockProduct, ProductDetail } from '../../../services/productService';
import { useToast } from '../../../contexts/ToastContext';
import { extractProductIdFromPublicId } from './utils/productPublicId';

const RestockProduct: React.FC = () => {
  const navigate = useNavigate();
  const { productId: productParam } = useParams<{ productId: string }>();
  const resolvedProductId = React.useMemo(() => {
    const normalized = (productParam || '').trim();
    if (!normalized) return '';
    return extractProductIdFromPublicId(normalized) || normalized;
  }, [productParam]);
  const { showToast } = useToast();
  
  const [product, setProduct] = React.useState<ProductDetail | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [restockQuantity, setRestockQuantity] = React.useState(0);
  const [currentStock, setCurrentStock] = React.useState(0);

  // Fetch product details on mount
  React.useEffect(() => {
    if (!resolvedProductId) {
      setError('Product reference is required');
      setLoading(false);
      return;
    }

    const abortController = new AbortController();
    let isMounted = true;

    const loadProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        const productData = await getProduct(resolvedProductId, true); // true = isSeller
        
        if (abortController.signal.aborted || !isMounted) return;

        setProduct(productData);
        setCurrentStock(productData.stock || 0);
        setRestockQuantity(0);
      } catch (err: any) {
        if (abortController.signal.aborted || !isMounted) return;
        
        const message = err?.response?.data?.message || err?.message || 'Failed to load product details';
        setError(message);
        showToast({
          type: 'error',
          title: 'Error',
          message: message,
        });
      } finally {
        if (isMounted && !abortController.signal.aborted) {
          setLoading(false);
        }
      }
    };

    loadProduct();

    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, [resolvedProductId, showToast]);

  const handleQuantityChange = (delta: number) => {
    const newQuantity = Math.max(0, restockQuantity + delta);
    setRestockQuantity(newQuantity);
  };

  const handleQuantityInput = (value: string) => {
    const num = parseInt(value, 10);
    if (isNaN(num) || num < 0) {
      setRestockQuantity(0);
      return;
    }
    setRestockQuantity(num);
  };

  const handleRestock = async () => {
    if (!resolvedProductId || !product) return;

    if (restockQuantity <= 0) {
      showToast({
        type: 'warning',
        title: 'Invalid Quantity',
        message: 'Please enter a quantity greater than 0',
      });
      return;
    }

    if (product.unlimitedStock) {
      showToast({
        type: 'info',
        title: 'Unlimited Stock',
        message: 'This product has unlimited stock enabled. No restocking needed.',
      });
      return;
    }

    const abortController = new AbortController();
    let isMounted = true;

    try {
      setSubmitting(true);
      setError(null);

      const newStock = currentStock + restockQuantity;
      
      await restockProduct({
        productId: resolvedProductId,
        stock: newStock,
      });

      if (abortController.signal.aborted || !isMounted) return;

      showToast({
        type: 'success',
        title: 'Restock Successful',
        message: `Successfully added ${restockQuantity} units. New stock: ${newStock}`,
        duration: 5000,
      });

      // Navigate back to low stock page after a short delay
      setTimeout(() => {
        navigate('/seller/manage-products/low-stock');
      }, 1500);
    } catch (err: any) {
      if (abortController.signal.aborted || !isMounted) return;

      const message = err?.response?.data?.message || err?.message || 'Failed to restock product';
      setError(message);
      showToast({
        type: 'error',
        title: 'Restock Failed',
        message: message,
      });
    } finally {
      if (isMounted && !abortController.signal.aborted) {
        setSubmitting(false);
      }
    }
  };

  const handleCancel = () => {
    navigate('/seller/manage-products/low-stock');
  };

  const formatPrice = (value: number) => {
    return Intl.NumberFormat('en-PK', { maximumFractionDigits: 0 }).format(value || 0);
  };

  const calculateNewStock = () => {
    return currentStock + restockQuantity;
  };

  if (loading) {
    return (
      <SellerScaffold menuIcons={sellerMenuIcons} menuRoutes={sellerMenuRoutes}>
        <div className="w-full px-3 md:px-6 lg:px-8">
          <div className="flex flex-col mb-4 md:mb-8 gap-3">
            <div className="flex-1 py-3 mb-4">
              <h1 className="text-[20px] md:text-[32px] lg:text-[40px] font-bold text-black leading-none">Restock Product</h1>
              <p className="text-[#949494] text-[12px] md:text-[16px] mt-1">Manage Products &gt; Low Stock &gt; Restock Product</p>
            </div>
          </div>
          <div className="flex justify-center md:py-0 py-5">
            <div className="bg-white border border-[#B8B1B1] rounded-[25px] p-4 py-10 md:p-6 lg:p-8 shadow-[2px_4px_4px_0px_rgba(46,204,113,0.15)] max-w-[600px] w-full">
              <div className="flex flex-col items-center gap-6 md:gap-8">
                <div className="w-[120px] h-[120px] md:w-[153px] md:h-[150px] rounded-[20px] md:rounded-[33px] border border-[#B8B1B1] bg-gray-200 animate-pulse"></div>
                <div className="w-full space-y-4 md:space-y-6">
                  <div className="bg-gray-200 h-[50px] md:h-[66px] rounded-[10px] animate-pulse"></div>
                  <div className="bg-gray-200 h-[50px] md:h-[66px] rounded-[10px] animate-pulse"></div>
                  <div className="bg-gray-200 h-[50px] md:h-[66px] rounded-[10px] animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SellerScaffold>
    );
  }

  if (error && !product) {
    return (
      <SellerScaffold menuIcons={sellerMenuIcons} menuRoutes={sellerMenuRoutes}>
        <div className="w-full px-3 md:px-6 lg:px-8">
          <div className="flex flex-col mb-4 md:mb-8 gap-3">
            <div className="flex-1 py-3 mb-4">
              <h1 className="text-[20px] md:text-[32px] lg:text-[40px] font-bold text-black leading-none">Restock Product</h1>
              <p className="text-[#949494] text-[12px] md:text-[16px] mt-1">Manage Products &gt; Low Stock &gt; Restock Product</p>
            </div>
          </div>
          <div className="flex justify-center md:py-0 py-5">
            <div className="bg-white border border-red-300 rounded-[25px] p-4 py-10 md:p-6 lg:p-8 shadow-[2px_4px_4px_0px_rgba(231,76,60,0.15)] max-w-[600px] w-full">
              <div className="flex flex-col items-center gap-4">
                <div className="text-red-600 text-center">
                  <p className="text-[18px] md:text-[22px] font-semibold mb-2">Error Loading Product</p>
                  <p className="text-[14px] md:text-[16px]">{error}</p>
                </div>
                <button
                  onClick={handleCancel}
                  className="mt-4 px-6 py-2 bg-[#2ECC71] text-white rounded-[10px] font-medium hover:bg-[#27AE60] transition-colors"
                >
                  Go Back
                </button>
              </div>
            </div>
          </div>
        </div>
      </SellerScaffold>
    );
  }

  if (!product) {
    return null;
  }

  const hasImage = product.thumbnailUrl && product.thumbnailUrl.trim() !== '';
  const finalPrice = product.discount > 0 
    ? Math.round(product.price * (1 - product.discount / 100))
    : product.price;

  return (
    <SellerScaffold menuIcons={sellerMenuIcons} menuRoutes={sellerMenuRoutes}>
      <div className="w-full px-3 md:px-6 lg:px-8">
        {/* Header Section */}
        <div className="flex flex-col mb-4 md:mb-8 gap-3">
          <div className="flex flex-row items-center justify-between md:flex-row md:items-start gap-3">
            <div className="flex-1 py-3 mb-4">
              <h1 className="text-[20px] md:text-[32px] lg:text-[40px] font-bold text-black leading-none">Restock Product</h1>
              <p className="text-[#949494] text-[12px] md:text-[16px] mt-1">Manage Products &gt; Low Stock &gt; Restock Product</p>
            </div>
          </div>
        </div>

        {/* Main Content Container - Centered Card */}
        <div className="flex justify-center md:py-0 py-5">
          <div className="bg-white border border-[#B8B1B1] rounded-[25px] p-4 py-10 md:p-6 lg:p-8 shadow-[2px_4px_4px_0px_rgba(46,204,113,0.15)] max-w-[600px] w-full">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-[10px]">
                <p className="text-red-600 text-sm md:text-base">{error}</p>
              </div>
            )}

            <div className="flex flex-col items-center gap-6 md:gap-8">
              {/* Product Image Section - Centered */}
              <div className="flex justify-center">
                <div className="w-[120px] h-[120px] md:w-[153px] md:h-[150px] rounded-[20px] md:rounded-[33px] border border-[#B8B1B1] bg-[rgba(46,204,113,0.17)] flex items-center justify-center overflow-hidden">
                  {hasImage ? (
                    <img 
                      src={product.thumbnailUrl} 
                      alt={product.title} 
                      className="w-[90px] h-[90px] md:w-[120px] md:h-[120px] object-cover rounded-[8px] md:rounded-[10px]" 
                    />
                  ) : (
                    <div className="w-[90px] h-[90px] md:w-[120px] md:h-[120px] rounded-[8px] md:rounded-[10px] bg-gray-200 flex items-center justify-center">
                      <span className="text-[10px] md:text-[12px] text-gray-400 text-center">No Image</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Product Title */}
              <div className="text-center">
                <h2 className="text-[18px] md:text-[24px] font-semibold text-black">{product.title}</h2>
                <p className="text-[14px] md:text-[16px] text-[#949494] mt-1">Price: {formatPrice(finalPrice)} PKR</p>
              </div>

              {/* Form Section */}
              <div className="w-full space-y-4 md:space-y-6">
                {/* Current Stock Section */}
                <div className="bg-[#FAFAFA] border border-[#B8B1B1] rounded-[10px] p-4 md:p-6 min-h-[50px] md:min-h-[66px] flex items-center shadow-[1px_2px_4px_0px_rgba(46,204,113,0.2)]">
                  <div className="flex items-center justify-between w-full">
                    <h3 className="text-[16px] md:text-[20px] font-medium text-black">Current Stock Available</h3>
                    <div className="flex flex-col items-end gap-2">
                      <div className={`text-[16px] md:text-[20px] font-medium ${currentStock === 0 ? 'text-red-600' : (currentStock > 0 && currentStock <= 10) ? 'text-orange-600' : 'text-black'}`}>
                        {product.unlimitedStock ? 'Unlimited' : currentStock}
                      </div>
                      {!product.unlimitedStock && (
                        <>
                          {currentStock === 0 && (
                            <span className="text-[12px] md:text-[14px] font-semibold px-2 py-1 rounded bg-red-50 border border-red-200 text-red-600">
                              Out of Stock
                            </span>
                          )}
                          {currentStock > 0 && currentStock <= 10 && (
                            <span className="text-[12px] md:text-[14px] font-semibold px-2 py-1 rounded bg-orange-50 border border-orange-200 text-orange-600">
                              Low Stock
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {!product.unlimitedStock && (
                  <>
                    {/* Add Quantity Section */}
                    <div className="bg-[#FAFAFA] border border-[#B8B1B1] rounded-[10px] p-4 md:p-6 h-[50px] md:h-[66px] flex items-center shadow-[1px_2px_4px_0px_rgba(46,204,113,0.2)]">
                      <div className="flex items-center justify-between w-full">
                        <h3 className="text-[16px] md:text-[20px] font-medium text-black">Add Quantity</h3>
                        
                        <div className="flex items-center gap-3 md:gap-4">
                          <input
                            type="number"
                            min="0"
                            value={restockQuantity}
                            onChange={(e) => handleQuantityInput(e.target.value)}
                            className="bg-white border border-[#B8B1B1] rounded-[5px] w-[60px] md:w-[80px] h-[35px] md:h-[43px] text-center text-[16px] md:text-[20px] font-medium text-black focus:outline-none focus:ring-2 focus:ring-[#2ECC71]"
                            disabled={submitting}
                          />
                          <div className="flex flex-col gap-1 md:gap-2">
                            <button
                              onClick={() => handleQuantityChange(1)}
                              disabled={submitting}
                              className="text-[#2ECC71] text-[18px] md:text-[23px] font-medium leading-none w-[10px] h-[20px] md:w-[13px] md:h-[27px] mt-1 md:mt-2 flex items-center justify-center hover:text-[#27AE60] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              +
                            </button>
                            <button
                              onClick={() => handleQuantityChange(-1)}
                              disabled={submitting}
                              className="text-[#2ECC71] text-[24px] md:text-[30px] font-medium leading-none w-[8px] h-[28px] md:w-[9px] md:h-[35px] mb-0 md:mb-1 flex items-center justify-center hover:text-[#27AE60] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              -
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* New Stock After Restock Section */}
                    {restockQuantity > 0 && (
                      <div className="bg-[#E8F8F5] border border-[#2ECC71] rounded-[10px] p-4 md:p-6 h-[50px] md:h-[66px] flex items-center shadow-[1px_2px_4px_0px_rgba(46,204,113,0.2)]">
                        <div className="flex items-center justify-between w-full">
                          <h3 className="text-[16px] md:text-[20px] font-medium text-black">New Stock After Restock</h3>
                          <div className="text-[16px] md:text-[20px] font-semibold text-[#2ECC71]">
                            {calculateNewStock()}
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {product.unlimitedStock && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-[10px] p-4 md:p-6">
                    <p className="text-[14px] md:text-[16px] text-yellow-800 text-center">
                      This product has unlimited stock enabled. No restocking is needed.
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="w-full flex flex-col md:flex-row gap-3 md:gap-4 mt-4">
                <button
                  onClick={handleCancel}
                  disabled={submitting}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-[10px] font-medium hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Cancel
                </button>
                {!product.unlimitedStock && (
                  <button
                    onClick={handleRestock}
                    disabled={submitting || restockQuantity <= 0}
                    className="flex-1 px-6 py-3 bg-[#2ECC71] text-white rounded-[10px] font-medium hover:bg-[#27AE60] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Restocking...</span>
                      </>
                    ) : (
                      'Confirm Restock'
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </SellerScaffold>
  );
};

export default RestockProduct;
