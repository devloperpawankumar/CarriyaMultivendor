import React, { useState, useEffect, useRef } from 'react';
import {
  getShippingInfo,
  updateShippingInfo,
  type ShippingInfo,
} from '../../../services/sellerSettingsService';
import { useToast } from '../../../contexts/ToastContext';
import { pkProvinceDistricts } from '../../../data/pkRegions';

const inputBoxClass =
  'w-full max-w-[655px] h-[35px] rounded-[5px] border border-[#B8B1B1] shadow-[1px_2px_4px_rgba(233,255,242,1)] px-4 text-[11px] text-[#1F1F1F] bg-white outline-none placeholder-[#B8B1B1] focus:border-[#2ECC71] focus:ring-2 focus:ring-[#2ECC71]/20 transition-colors';

const selectBoxClass =
  'w-full max-w-[655px] h-[41px] rounded-[5px] border border-[#B8B1B1] shadow-[1px_2px_4px_rgba(233,255,242,1)] px-4 text-[12px] text-[#1F1F1F] bg-white outline-none focus:border-[#2ECC71] focus:ring-2 focus:ring-[#2ECC71]/20 transition-colors';

const provinces = Object.keys(pkProvinceDistricts);

const ShippingSettings: React.FC = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo | null>(null);
  const [pickupAddress, setPickupAddress] = useState('');
  const [returnAddress, setReturnAddress] = useState('');
  const [sameAsPickup, setSameAsPickup] = useState(false);
  const [pickupProvince, setPickupProvince] = useState<string>('');
  const [pickupDistrict, setPickupDistrict] = useState<string>('');
  const [returnProvince, setReturnProvince] = useState<string>('');
  const [returnDistrict, setReturnDistrict] = useState<string>('');
  const [hasChanges, setHasChanges] = useState(false);
  const loadingRef = useRef(false); // Prevent duplicate calls

  // Load shipping info on mount (with duplicate prevention)
  useEffect(() => {
    if (loadingRef.current) return; // Already loading
    loadingRef.current = true;
    loadShippingInfo().finally(() => {
      loadingRef.current = false;
    });
  }, []);

  // Track changes
  useEffect(() => {
    if (shippingInfo) {
      const hasPickupChange =
        pickupAddress !== shippingInfo.pickupAddress ||
        pickupProvince !== shippingInfo.pickupProvince ||
        pickupDistrict !== shippingInfo.pickupDistrict;
      const hasReturnChange =
        returnAddress !== shippingInfo.returnAddress ||
        returnProvince !== shippingInfo.returnProvince ||
        returnDistrict !== shippingInfo.returnDistrict;
      const hasSameAsPickupChange = sameAsPickup !== shippingInfo.sameAsPickup;
      setHasChanges(hasPickupChange || hasReturnChange || hasSameAsPickupChange);
    }
  }, [
    pickupAddress,
    pickupProvince,
    pickupDistrict,
    returnAddress,
    returnProvince,
    returnDistrict,
    sameAsPickup,
    shippingInfo,
  ]);

  // Auto-fill return address when sameAsPickup is checked
  useEffect(() => {
    if (sameAsPickup) {
      setReturnAddress(pickupAddress);
      setReturnProvince(pickupProvince);
      setReturnDistrict(pickupDistrict);
    }
  }, [sameAsPickup, pickupAddress, pickupProvince, pickupDistrict]);

  const loadShippingInfo = async () => {
    try {
      setLoading(true);
      const data = await getShippingInfo();
      setShippingInfo(data);
      setPickupAddress(data.pickupAddress);
      setPickupProvince(data.pickupProvince);
      setPickupDistrict(data.pickupDistrict);
      setReturnAddress(data.returnAddress);
      setReturnProvince(data.returnProvince);
      setReturnDistrict(data.returnDistrict);
      setSameAsPickup(data.sameAsPickup);
    } catch (error: any) {
      console.error('Failed to load shipping info:', error);
      showToast({
        type: 'error',
        title: 'Failed to load shipping information',
        message: error?.response?.data?.error || error?.message || 'Please try again later',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!hasChanges) {
      showToast({
        type: 'info',
        title: 'No changes',
        message: 'No changes to save',
      });
      return;
    }

    try {
      setSaving(true);

      const updatePayload: any = {
        pickupAddress,
        pickupProvince,
        pickupDistrict,
        sameAsPickup,
      };

      if (!sameAsPickup) {
        updatePayload.returnAddress = returnAddress;
        updatePayload.returnProvince = returnProvince;
        updatePayload.returnDistrict = returnDistrict;
      }

      const updated = await updateShippingInfo(updatePayload);
      setShippingInfo(updated);
      setPickupAddress(updated.pickupAddress);
      setPickupProvince(updated.pickupProvince);
      setPickupDistrict(updated.pickupDistrict);
      setReturnAddress(updated.returnAddress);
      setReturnProvince(updated.returnProvince);
      setReturnDistrict(updated.returnDistrict);
      setSameAsPickup(updated.sameAsPickup);
      setHasChanges(false);

      showToast({
        type: 'success',
        title: 'Shipping information updated',
        message: 'Your shipping addresses have been updated successfully',
      });
    } catch (error: any) {
      console.error('Failed to update shipping info:', error);
      showToast({
        type: 'error',
        title: 'Failed to update shipping information',
        message: error?.response?.data?.error || error?.message || 'Please try again later',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (shippingInfo) {
      setPickupAddress(shippingInfo.pickupAddress);
      setPickupProvince(shippingInfo.pickupProvince);
      setPickupDistrict(shippingInfo.pickupDistrict);
      setReturnAddress(shippingInfo.returnAddress);
      setReturnProvince(shippingInfo.returnProvince);
      setReturnDistrict(shippingInfo.returnDistrict);
      setSameAsPickup(shippingInfo.sameAsPickup);
      setHasChanges(false);
    }
  };

  const availableDistricts = pickupProvince ? pkProvinceDistricts[pickupProvince] || [] : [];
  const availableReturnDistricts = returnProvince ? pkProvinceDistricts[returnProvince] || [] : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-[#4C535F] text-[14px]">Loading shipping information...</div>
      </div>
    );
  }

  return (
    <div className="w-full md:px-6 md:space-y-6">
      {/* Pickup */}
      <div className="text-[#1F1F1F] text-[14px] font-semibold mb-2">Edit a Pick up Adress</div>
      <div className="mb-3">
        <input
          className={inputBoxClass}
          value={pickupAddress}
          onChange={(e) => setPickupAddress(e.target.value)}
          placeholder="Address Details: Number, Street, Landmark, etc."
        />
      </div>
      <div className="mb-2 grid md:grid-cols-2 grid-cols-1 gap-3">
        <select
          className={`${selectBoxClass} ${!pickupProvince ? 'text-[#B8B1B1]' : 'text-[#1F1F1F]'}`}
          value={pickupProvince}
          onChange={(e) => {
            const newProvince = e.target.value;
            setPickupProvince(newProvince);
            setPickupDistrict('');
          }}
        >
          <option value="" disabled>
            Select Province
          </option>
          {provinces.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <select
          className={`${selectBoxClass} ${!pickupDistrict ? 'text-[#B8B1B1]' : 'text-[#1F1F1F]'}`}
          value={pickupDistrict}
          onChange={(e) => setPickupDistrict(e.target.value)}
          disabled={!pickupProvince}
        >
          <option value="" disabled>
            Select District
          </option>
          {availableDistricts.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      {/* Return */}
      <div className="text-[#1F1F1F] text-[14px] font-semibold mb-2">Return Adress</div>
      <div className="mb-2 flex items-center gap-2">
        <label htmlFor="sameAsPickup" className="flex items-center gap-2 cursor-pointer">
          <input
            id="sameAsPickup"
            type="checkbox"
            className="sr-only peer"
            checked={sameAsPickup}
            onChange={(e) => setSameAsPickup(e.target.checked)}
          />
          <span
            className={`w-[17px] h-[17px] rounded border border-[#2ECC71] inline-flex items-center justify-center transition-colors ${
              sameAsPickup ? 'bg-[#2ECC71]' : ''
            }`}
          >
            {sameAsPickup && (
              <svg
                width="12"
                height="12"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M3.5 8.5L6.5 11.5L12.5 5.5"
                  stroke="#FFFFFF"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </span>
          <span className="text-[11px] text-[#B8B1B1]">Same Address as Pickup Address</span>
        </label>
      </div>
      <div className="mb-3">
        <input
          className={inputBoxClass}
          value={returnAddress}
          onChange={(e) => setReturnAddress(e.target.value)}
          placeholder="Address Details: Number, Street, Landmark, etc."
          disabled={sameAsPickup}
        />
      </div>
      <div className="mb-6 grid md:grid-cols-2 grid-cols-1 gap-3">
        <select
          className={`${selectBoxClass} ${!returnProvince ? 'text-[#B8B1B1]' : 'text-[#1F1F1F]'}`}
          value={returnProvince}
          onChange={(e) => {
            const newProvince = e.target.value;
            setReturnProvince(newProvince);
            setReturnDistrict('');
          }}
          disabled={sameAsPickup}
        >
          <option value="" disabled>
            Select Province
          </option>
          {provinces.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <select
          className={`${selectBoxClass} ${!returnDistrict ? 'text-[#B8B1B1]' : 'text-[#1F1F1F]'}`}
          value={returnDistrict}
          onChange={(e) => setReturnDistrict(e.target.value)}
          disabled={sameAsPickup || !returnProvince}
        >
          <option value="" disabled>
            Select District
          </option>
          {availableReturnDistricts.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      {/* Actions */}
      <div className="flex items-center md:gap-16 gap-4">
        <button
          onClick={handleUpdate}
          disabled={saving || !hasChanges}
          className={`bg-[#2ECC71] text-white rounded-lg px-5 h-[49px] text-[14px] font-bold transition-all ${
            saving || !hasChanges
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:bg-[#27AE60] active:scale-95'
          }`}
        >
          {saving ? 'Updating...' : 'Update'}
        </button>
        <button
          onClick={handleReset}
          disabled={saving || !hasChanges}
          className={`text-[#4C535F] text-[14px] font-medium transition-colors ${
            saving || !hasChanges
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:text-[#2ECC71]'
          }`}
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default ShippingSettings;
