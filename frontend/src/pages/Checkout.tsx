import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CategoryMenu from '../components/CategoryMenu';
import { useClickOutside } from '../hooks/useClickOutside';
import homeIcon from '../assets/images/Payment/Frame (2).png';
import officeIcon from '../assets/images/Payment/Frame (3).png';
import arrowIcon from '../assets/images/Product/_.png';
import locations from '../data/locations';
import {
  emptyBuyerInfo,
  loadBuyerInfo,
  saveBuyerInfo,
  BuyerInfo,
  fetchBuyerInfoFromApi,
  saveBuyerInfoToApi,
} from '../services/checkoutService';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

const Checkout: React.FC = () => {
  const [showCategories, setShowCategories] = useState(false);
  const browseButtonRef = useRef<HTMLButtonElement | null>(null);
  const categoriesDropdownRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { showToast } = useToast();
  useClickOutside(() => setShowCategories(false), {
    enabled: showCategories,
    include: [browseButtonRef, categoriesDropdownRef],
    escapeCloses: true,
    eventType: 'mousedown',
  });
 
  const [form, setForm] = useState<BuyerInfo>(emptyBuyerInfo);
  const [errors, setErrors] = useState<Partial<Record<keyof BuyerInfo, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);

  useEffect(() => {
    const draft = loadBuyerInfo();
    if (draft) {
      setForm({ ...draft });
    } else {
      setForm({ ...emptyBuyerInfo });
    }
  }, [user?.email]);

  useEffect(() => {
    if (!isAuthenticated) return;
    let ignore = false;
    setIsLoadingAddress(true);
    fetchBuyerInfoFromApi()
      .then((data) => {
        if (!ignore && data) {
          setForm(data);
        }
      })
      .catch((error) => {
        if (process.env.NODE_ENV !== 'production') {
          console.error('Failed to load buyer address', error);
        }
      })
      .finally(() => {
        if (!ignore) setIsLoadingAddress(false);
      });
    return () => {
      ignore = true;
    };
  }, [isAuthenticated, user?.email]);

  const handleInputChange = (field: keyof BuyerInfo) => (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = event.target.value;
    setForm(prev => {
      const next = { ...prev, [field]: value };
      if (field === 'province') {
        next.city = '';
        next.area = '';
      } else if (field === 'city') {
        next.area = '';
      }
      return next;
    });
    setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  // Ensure selects show placeholder color when empty to match input placeholders
  const getSelectColorClass = (currentValue: string) =>
    currentValue ? 'text-[#3d3d3d]' : 'text-[#B8B1B1]';

  const provinceList = Object.keys(locations);
  const cityList = form.province ? Object.keys(locations[form.province]) : [];
  const areaList = form.province && form.city ? locations[form.province][form.city] : [];

  const normalizeForm = (): BuyerInfo => ({
    fullName: form.fullName.trim(),
    contactNumber: form.contactNumber.trim(),
    streetAddress: form.streetAddress.trim(),
    locality: form.locality.trim(),
    province: form.province.trim(),
    city: form.city.trim(),
    area: form.area.trim(),
    addressNotes: form.addressNotes.trim(),
  });

  const validateForm = (target: BuyerInfo = form) => {
    const newErrors: Partial<Record<keyof BuyerInfo, string>> = {};
    if (!target.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!/^\+?\d{7,15}$/.test(target.contactNumber.trim()))
      newErrors.contactNumber = 'Enter a valid phone number';
    if (!target.streetAddress.trim()) newErrors.streetAddress = 'Building / street is required';
    if (!target.locality.trim()) newErrors.locality = 'Locality is required';
    if (!target.province) newErrors.province = 'Province is required';
    if (!target.city) newErrors.city = 'City is required';
    if (!target.area) newErrors.area = 'Area is required';
    if (!target.addressNotes.trim()) newErrors.addressNotes = 'Full address is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    const normalized = normalizeForm();
    if (!validateForm(normalized)) {
      return;
    }
    setForm(normalized);
    saveBuyerInfo(normalized);
    setIsSubmitting(true);
    try {
      if (isAuthenticated) {
        await saveBuyerInfoToApi(normalized);
      }
      navigate('/checkout/review');
    } catch (error: any) {
      showToast({
        type: 'error',
        title: 'Unable to save address',
        message: error?.message || 'Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderError = (field: keyof BuyerInfo) =>
    errors[field] ? <p className="mt-1 text-xs text-red-500">{errors[field]}</p> : null;

  const fieldBorder = (field: keyof BuyerInfo) =>
    errors[field] ? 'border-red-500' : 'border-[#B8B1B1]';

  
  return (
    <div className="min-h-screen bg-white">
      <Header variant="simple" />
      <div className="max-w-[1200px] mx-auto px-4 py-8">
        {/* Browse Categories (hidden on mobile) */}
        <div className="relative mb-4 hidden md:block">
          <button ref={browseButtonRef} onClick={() => setShowCategories(v => !v)} className="inline-flex items-center space-x-2 text-[#2ECC71] font-bold text-sm">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M4 6h16M4 12h16M4 18h16" stroke="#2ECC71" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span>Browse Categories</span>
          </button>
          {showCategories && (
            <div className="absolute z-50 mt-2" ref={categoriesDropdownRef}>
              <CategoryMenu />
            </div>
          )}
        </div>
        <h1 className="sr-only">Checkout</h1>

        {/* Desktop Layout */}
        <div className="hidden md:block">
          {/* Form grid similar to Figma fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-1">
              <div className={`h-[67px] rounded-[15px] border ${fieldBorder('fullName')} shadow-[1px_2px_4px_rgba(233,255,242,1)] flex items-center px-6 mb-2`}>
                <input
                  className="w-full placeholder-[#B8B1B1] text-[20px] outline-none"
                  placeholder="Full Name"
                  value={form.fullName}
                  onChange={handleInputChange('fullName')}
                />
              </div>
              {renderError('fullName')}
              <div className={`h-[67px] rounded-[15px] border ${fieldBorder('contactNumber')} shadow-[1px_2px_4px_rgba(233,255,242,1)] flex items-center px-6 my-2`}>
                <input
                  className="w-full placeholder-[#B8B1B1] text-[20px] outline-none"
                  placeholder="Contact Number"
                  value={form.contactNumber}
                  onChange={handleInputChange('contactNumber')}
                />
              </div>
              {renderError('contactNumber')}
              <div className={`h-[67px] rounded-[15px] border ${fieldBorder('streetAddress')} shadow-[1px_2px_4px_rgba(233,255,242,1)] flex items-center px-6 my-2`}>
                <input
                  className="w-full placeholder-[#B8B1B1] text-[20px] outline-none"
                  placeholder="Building / House no / Floor / Street"
                  value={form.streetAddress}
                  onChange={handleInputChange('streetAddress')}
                />
              </div>
              {renderError('streetAddress')}
              <div className={`h-[67px] rounded-[15px] border ${fieldBorder('locality')} shadow-[1px_2px_4px_rgba(233,255,242,1)] flex items-center px-6 my-2`}>
                <input
                  className="w-full placeholder-[#B8B1B1] text-[20px] outline-none"
                  placeholder="Colony / Suburb / Locality / Landmark"
                  value={form.locality}
                  onChange={handleInputChange('locality')}
                />
              </div>
              {renderError('locality')}
            </div>
            <div className="col-span-1">
              <div className={`h-[67px] rounded-[15px] border ${fieldBorder('province')} shadow-[1px_2px_4px_rgba(233,255,242,1)] flex items-center px-6 mb-2 justify-between`}>
                <select
                  className={`w-full text-[20px] outline-none appearance-none bg-transparent ${getSelectColorClass(form.province)}`}
                  value={form.province}
                  onChange={handleInputChange('province')}
                >
                  <option value="" disabled>
                    Select Province
                  </option>
                  {provinceList.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 9l6 6 6-6" stroke="#B8B1B1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              {renderError('province')}
              <div className={`h-[67px] rounded-[15px] border ${fieldBorder('city')} shadow-[1px_2px_4px_rgba(233,255,242,1)] flex items-center px-6 my-2 justify-between`}>
                <select
                  className={`w-full text-[20px] outline-none appearance-none bg-transparent ${getSelectColorClass(form.city)}`}
                  value={form.city}
                  onChange={handleInputChange('city')}
                  disabled={!form.province}
                >
                  <option value="" disabled>
                    Select City
                  </option>
                  {cityList.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 9l6 6 6-6" stroke="#B8B1B1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              {renderError('city')}
              <div className={`h-[67px] rounded-[15px] border ${fieldBorder('area')} shadow-[1px_2px_4px_rgba(233,255,242,1)] flex items-center px-6 my-2 justify-between`}>
                <select
                  className={`w-full text-[20px] outline-none appearance-none bg-transparent ${getSelectColorClass(form.area)}`}
                  value={form.area}
                  onChange={handleInputChange('area')}
                  disabled={!form.province || !form.city}
                >
                  <option value="" disabled>
                    Select Area
                  </option>
                  {areaList.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 9l6 6 6-6" stroke="#B8B1B1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              {renderError('area')}
              <div className={`h-[67px] rounded-[15px] border ${fieldBorder('addressNotes')} shadow-[1px_2px_4px_rgba(233,255,242,1)] flex items-center px-6 my-2`}>
                <input
                  className="w-full placeholder-[#B8B1B1] text-[20px] outline-none"
                  placeholder="Write your full address"
                  value={form.addressNotes}
                  onChange={handleInputChange('addressNotes')}
                />
              </div>
              {renderError('addressNotes')}
            </div>
          </div>

          {/* Controls below form : Home, Office, Next */}
          <div className="flex flex-wrap gap-4 items-center mt-8">
            <div className="flex items-center gap-2 border border-[#DADADA] rounded-[15px] shadow-sm px-4 py-3">
             <img src={homeIcon} alt="Home" />
              <span className="text-[#949494] text-[35px] leading-none">Home</span>
            </div>
            <div className="flex items-center gap-2 border border-[#DADADA] rounded-[15px] shadow-sm px-4 py-3">
           <img src={officeIcon} alt="Office" />
              <span className="text-[#949494] text-[35px] leading-none">Office</span>
            </div>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || isLoadingAddress}
              className={`ml-auto w-[254px] h-[68px] rounded-[15px] text-white text-[35px] font-medium ${
                isSubmitting || isLoadingAddress ? 'bg-[#B8B1B1] cursor-not-allowed' : 'bg-[#2ECC71]'
              }`}
            >
              {isSubmitting ? 'Saving...' : 'Next'}
            </button>
          </div>
        </div>

        {/* Mobile Layout  */}
        <div className="md:hidden space-y-4">
          {/* Form fields in mobile layout */}
          <div className="space-y-4">
            <div className={`h-[38px] rounded-[10px] border ${fieldBorder('fullName')} shadow-[1px_2px_4px_rgba(233,255,242,1)] flex items-center px-[18px]`}>
              <input
                className="w-full placeholder-[#B8B1B1] text-[12px] outline-none"
                placeholder="Full Name"
                value={form.fullName}
                onChange={handleInputChange('fullName')}
              />
            </div>
            {renderError('fullName')}
            <div className={`h-[38px] rounded-[10px] border ${fieldBorder('contactNumber')} shadow-[1px_2px_4px_rgba(233,255,242,1)] flex items-center px-[18px]`}>
              <input
                className="w-full placeholder-[#B8B1B1] text-[12px] outline-none"
                placeholder="Contact Number"
                value={form.contactNumber}
                onChange={handleInputChange('contactNumber')}
              />
            </div>
            {renderError('contactNumber')}
            <div className={`h-[38px] rounded-[10px] border ${fieldBorder('streetAddress')} shadow-[1px_2px_4px_rgba(233,255,242,1)] flex items-center px-[18px]`}>
              <input
                className="w-full placeholder-[#B8B1B1] text-[12px] outline-none"
                placeholder="Building / House no / Floor / Street"
                value={form.streetAddress}
                onChange={handleInputChange('streetAddress')}
              />
            </div>
            {renderError('streetAddress')}
            <div className={`h-[38px] rounded-[10px] border ${fieldBorder('locality')} shadow-[1px_2px_4px_rgba(233,255,242,1)] flex items-center px-[18px]`}>
              <input
                className="w-full placeholder-[#B8B1B1] text-[12px] outline-none"
                placeholder="Colony / Suburb / Locality / Landmark"
                value={form.locality}
                onChange={handleInputChange('locality')}
              />
            </div>
            {renderError('locality')}
            <div className={`h-[38px] rounded-[10px] border ${fieldBorder('province')} shadow-[1px_2px_4px_rgba(233,255,242,1)] flex items-center px-[18px] justify-between relative`}>
              <select
                className={`w-full text-[12px] outline-none appearance-none bg-transparent ${getSelectColorClass(form.province)} ${fieldBorder('province') === 'border-red-500' ? 'text-red-500' : ''}`}
                value={form.province}
                onChange={handleInputChange('province')}
              >
                <option value="" disabled>
                  Select Province
                </option>
                {provinceList.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              <img src={arrowIcon} alt="Arrow" />
            </div>
            {renderError('province')}
            <div className={`h-[38px] rounded-[10px] border ${fieldBorder('city')} shadow-[1px_2px_4px_rgba(233,255,242,1)] flex items-center px-[18px] justify-between relative`}>
              <select
                className={`w-full text-[12px] outline-none appearance-none bg-transparent ${getSelectColorClass(form.city)} ${fieldBorder('city') === 'border-red-500' ? 'text-red-500' : ''}`}
                value={form.city}
                onChange={handleInputChange('city')}
                disabled={!form.province}
              >
                <option value="" disabled>
                  Select City
                </option>
                {cityList.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <img src={arrowIcon} alt="Arrow" />
            </div>
            {renderError('city')}
            <div className={`h-[38px] rounded-[10px] border ${fieldBorder('area')} shadow-[1px_2px_4px_rgba(233,255,242,1)] flex items-center px-[18px] justify-between relative`}>
              <select
                className={`w-full text-[12px] outline-none appearance-none bg-transparent ${getSelectColorClass(form.area)} ${fieldBorder('area') === 'border-red-500' ? 'text-red-500' : ''}`}
                value={form.area}
                onChange={handleInputChange('area')}
                disabled={!form.province || !form.city}
              >
                <option value="" disabled>
                  Select Area
                </option>
                {areaList.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
              <img src={arrowIcon} alt="Arrow" />
            </div>
            {renderError('area')}
            <div className={`h-[38px] rounded-[10px] border ${fieldBorder('addressNotes')} shadow-[1px_2px_4px_rgba(233,255,242,1)] flex items-center px-[18px]`}>
              <input
                className="w-full placeholder-[#B8B1B1] text-[12px] outline-none"
                placeholder="Write your full address"
                value={form.addressNotes}
                onChange={handleInputChange('addressNotes')}
              />
            </div>
            {renderError('addressNotes')}
          </div>

          {/* Home and Office buttons - mobile layout */}
          <div className="flex gap-4 justify-center mt-8">
            <div className="flex items-center gap-2 border border-[#B8B1B1] rounded-[5px] shadow-[1px_2px_4px_rgba(0,0,0,0.25)] px-4 py-2" style={{ width: 104.44, height: 37.78 }}>
              <img src={homeIcon} alt="Home" className="w-[20px] h-[20px]" />
              <span className="text-[#949494] text-[15px] font-medium">Home</span>
            </div>
            <div className="flex items-center gap-2 border border-[#B8B1B1] rounded-[5px] shadow-[1px_2px_4px_rgba(0,0,0,0.25)] px-4 py-2" style={{ width: 104.44, height: 37.78 }}>
              <img src={officeIcon} alt="Office" className="w-[20px] h-[20px]" />
              <span className="text-[#949494] text-[15px] font-medium">Office</span>
            </div>
          </div>

          {/* Next button - mobile layout */}
          <div className="flex justify-center mt-6">
            <button 
              onClick={handleSubmit} 
              disabled={isSubmitting || isLoadingAddress}
              className={`w-[170px] h-[35px] rounded-[5px] text-white text-[15px] font-bold flex items-center justify-center ${
                isSubmitting || isLoadingAddress ? 'bg-[#B8B1B1] cursor-not-allowed' : 'bg-[#2ECC71]'
              }`}
            >
              {isSubmitting ? 'Saving...' : 'Next'}
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Checkout;


