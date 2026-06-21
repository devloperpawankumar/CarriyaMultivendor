import React, { useState, useEffect, useRef } from 'react';
import galleryicon from '../../../assets/images/Seller/gallery-add.png';
import {
  getSellerSettings,
  updateSellerSettings,
  uploadStoreLogo,
  uploadStoreBanner,
  type SellerSettings,
} from '../../../services/sellerSettingsService';
import { useToast } from '../../../contexts/ToastContext';

const StoreInformation: React.FC = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [settings, setSettings] = useState<SellerSettings | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [description, setDescription] = useState<string>('');
  const [hasChanges, setHasChanges] = useState(false);

  // Store uploaded Cloudinary URLs (not saved to DB yet)
  const [uploadedLogoUrl, setUploadedLogoUrl] = useState<string | null>(null);
  const [uploadedBannerUrl, setUploadedBannerUrl] = useState<string | null>(null);

  const logoInputRef = useRef<HTMLInputElement | null>(null);
  const bannerInputRef = useRef<HTMLInputElement | null>(null);
  const loadingRef = useRef(false); // Prevent duplicate calls
  const uploadingLogoRef = useRef(false); // Prevent duplicate logo uploads
  const uploadingBannerRef = useRef(false); // Prevent duplicate banner uploads

  // Load settings on mount (with duplicate prevention)
  useEffect(() => {
    if (loadingRef.current) return; // Already loading
    loadingRef.current = true;
    loadSettings().finally(() => {
      loadingRef.current = false;
    });
  }, []);

  // Track changes
  useEffect(() => {
    if (settings) {
      const hasDescriptionChange = description !== (settings.storeDescription || '');
      const hasLogoChange = uploadedLogoUrl !== null && uploadedLogoUrl !== settings.storeLogo;
      const hasBannerChange = uploadedBannerUrl !== null && uploadedBannerUrl !== settings.storeBanner;
      setHasChanges(hasDescriptionChange || hasLogoChange || hasBannerChange);
    }
  }, [description, uploadedLogoUrl, uploadedBannerUrl, settings]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await getSellerSettings();
      setSettings(data);
      setDescription(data.storeDescription || '');
      setLogoPreview(data.storeLogo || null);
      setBannerPreview(data.storeBanner || null);
      setUploadedLogoUrl(null);
      setUploadedBannerUrl(null);
    } catch (error: any) {
      console.error('Failed to load settings:', error);
      showToast({
        type: 'error',
        title: 'Failed to load settings',
        message: error?.response?.data?.error || error?.message || 'Please try again later',
      });
    } finally {
      setLoading(false);
    }
  };

  // Professional: Upload immediately when file is selected (best practice)
  const handleSelectLogo: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Prevent duplicate uploads
    if (uploadingLogoRef.current) {
      e.target.value = ''; // Clear input
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showToast({
        type: 'error',
        title: 'Invalid file type',
        message: 'Please select an image file',
      });
      e.target.value = ''; // Clear input
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      showToast({
        type: 'error',
        title: 'File too large',
        message: 'Logo must be less than 5MB',
      });
      e.target.value = ''; // Clear input
      return;
    }

    // Show immediate preview with blob URL
    const blobUrl = URL.createObjectURL(file);
    setLogoPreview((prev) => {
      if (prev && prev.startsWith('blob:')) URL.revokeObjectURL(prev);
      return blobUrl;
    });

    // Upload immediately to Cloudinary (professional practice)
    uploadingLogoRef.current = true;
    try {
      const result = await uploadStoreLogo(file);
      
      // Clean up blob URL and use Cloudinary URL
      URL.revokeObjectURL(blobUrl);
      setLogoPreview(result.url);
      setUploadedLogoUrl(result.url);

      showToast({
        type: 'success',
        title: 'Logo uploaded',
        message: 'Logo uploaded successfully. Click "Update Profile" to save.',
      });
    } catch (error: any) {
      console.error('Failed to upload logo:', error);
      // Revert to previous logo on error
      setLogoPreview(settings?.storeLogo || null);
      setUploadedLogoUrl(null);
      
      const errorData = error?.response?.data;
      showToast({
        type: 'error',
        title: 'Failed to upload logo',
        message: errorData?.error || error?.message || 'Please try again',
      });
    } finally {
      uploadingLogoRef.current = false;
      e.target.value = ''; // Clear input to allow re-selecting the same file
    }
  };

  // Professional: Upload immediately when file is selected (best practice)
  const handleSelectBanner: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Prevent duplicate uploads
    if (uploadingBannerRef.current) {
      e.target.value = ''; // Clear input
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showToast({
        type: 'error',
        title: 'Invalid file type',
        message: 'Please select an image file',
      });
      e.target.value = ''; // Clear input
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      showToast({
        type: 'error',
        title: 'File too large',
        message: 'Banner must be less than 10MB',
      });
      e.target.value = ''; // Clear input
      return;
    }

    // Show immediate preview with blob URL
    const blobUrl = URL.createObjectURL(file);
    setBannerPreview((prev) => {
      if (prev && prev.startsWith('blob:')) URL.revokeObjectURL(prev);
      return blobUrl;
    });

    // Upload immediately to Cloudinary (professional practice)
    uploadingBannerRef.current = true;
    try {
      const result = await uploadStoreBanner(file);
      
      // Clean up blob URL and use Cloudinary URL
      URL.revokeObjectURL(blobUrl);
      setBannerPreview(result.url);
      setUploadedBannerUrl(result.url);

      showToast({
        type: 'success',
        title: 'Banner uploaded',
        message: 'Banner uploaded successfully. Click "Update Profile" to save.',
      });
    } catch (error: any) {
      console.error('Failed to upload banner:', error);
      // Revert to previous banner on error
      setBannerPreview(settings?.storeBanner || null);
      setUploadedBannerUrl(null);
      
      const errorData = error?.response?.data;
      showToast({
        type: 'error',
        title: 'Failed to upload banner',
        message: errorData?.error || error?.message || 'Please try again',
      });
    } finally {
      uploadingBannerRef.current = false;
      e.target.value = ''; // Clear input to allow re-selecting the same file
    }
  };

  // Handle remove logo
  const handleRemoveLogo = () => {
    if (logoPreview && logoPreview.startsWith('blob:')) {
      URL.revokeObjectURL(logoPreview);
    }
    setLogoPreview(null);
    setUploadedLogoUrl('');
    setHasChanges(true);
  };

  // Handle remove banner
  const handleRemoveBanner = () => {
    if (bannerPreview && bannerPreview.startsWith('blob:')) {
      URL.revokeObjectURL(bannerPreview);
    }
    setBannerPreview(null);
    setUploadedBannerUrl('');
    setHasChanges(true);
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

      // Save uploaded URLs to database (or empty string to remove)
      const updatedSettings = await updateSellerSettings({
        storeDescription: description,
        storeLogo: uploadedLogoUrl !== null ? uploadedLogoUrl : settings?.storeLogo,
        storeBanner: uploadedBannerUrl !== null ? uploadedBannerUrl : settings?.storeBanner,
      });

      setSettings(updatedSettings);
      setUploadedLogoUrl(null);
      setUploadedBannerUrl(null);
      setHasChanges(false);

      showToast({
        type: 'success',
        title: 'Settings updated',
        message: 'Your store information has been updated successfully',
      });
    } catch (error: any) {
      console.error('Failed to update settings:', error);
      const errorData = error?.response?.data;
      showToast({
        type: 'error',
        title: 'Failed to update settings',
        message: errorData?.error || error?.message || 'Please try again later',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (settings) {
      setDescription(settings.storeDescription || '');
      setLogoPreview(settings.storeLogo || null);
      setBannerPreview(settings.storeBanner || null);
      setUploadedLogoUrl(null);
      setUploadedBannerUrl(null);
      setHasChanges(false);

      // Clean up blob URLs
      if (logoPreview && logoPreview.startsWith('blob:')) {
        URL.revokeObjectURL(logoPreview);
      }
      if (bannerPreview && bannerPreview.startsWith('blob:')) {
        URL.revokeObjectURL(bannerPreview);
      }
    }
  };

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      if (logoPreview && logoPreview.startsWith('blob:')) {
        URL.revokeObjectURL(logoPreview);
      }
      if (bannerPreview && bannerPreview.startsWith('blob:')) {
        URL.revokeObjectURL(bannerPreview);
      }
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-[#4C535F] text-[14px]">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Upload areas */}
      <div className="space-y-6">
        {/* Logo */}
        <div className="flex flex-col justify-start">
          <div className="text-[#8D98AA] text-[11px] mb-2">Store Logo Here</div>
          <div className="relative">
            <div
              className="bg-[#E9FFF2] border border-[#4C535F] border-dashed rounded-[18px] md:w-[124px] w-[115px] md:h-[124px] h-[110px] flex flex-col items-center justify-center cursor-pointer hover:border-[#2ECC71] transition-colors"
              onClick={() => logoInputRef.current?.click()}
            >
              {logoPreview ? (
                <div className="relative w-full h-full">
                  <img
                    src={logoPreview}
                    alt="logo"
                    className="w-[110px] h-[110px] object-contain rounded-[14px]"
                  />
                  {/* Remove button overlay */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveLogo();
                    }}
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                    title="Remove logo"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <>
                  <img src={galleryicon} alt="gallery" className="w-8 h-8 mb-1" />
                  <div className="text-[#4C535F] text-[10px] leading-[16px] mt-2 text-center">
                    Upload your<br />logo
                  </div>
                </>
              )}
            </div>
            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleSelectLogo}
            />
            {uploadedLogoUrl && uploadedLogoUrl !== settings?.storeLogo && (
              <div className="text-[#2ECC71] text-[10px] mt-1">New logo uploaded - click "Update Profile" to save</div>
            )}
          </div>
        </div>

        {/* Banner */}
        <div>
          <div className="text-[#8D98AA] text-[11px] mb-2">Store Banner Here</div>
          <div className="relative">
            <div
              className="bg-[#E9FFF2] border border-[#4C535F] border-dashed rounded-[18px] h-[140px] flex flex-col items-center justify-center w-full max-w-[98%] mx-auto cursor-pointer hover:border-[#2ECC71] transition-colors"
              onClick={() => bannerInputRef.current?.click()}
            >
              {bannerPreview ? (
                <div className="relative w-full h-full">
                  <img
                    src={bannerPreview}
                    alt="banner"
                    className="w-[95%] h-[120px] object-cover rounded-[14px]"
                  />
                  {/* Remove button overlay */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveBanner();
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                    title="Remove banner"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <>
                  <img src={galleryicon} alt="gallery" className="w-10 h-10 mb-2" />
                  <div className="text-[#4C535F] text-[12px] text-center">Upload your banner</div>
                </>
              )}
            </div>
            <input
              ref={bannerInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleSelectBanner}
            />
            {uploadedBannerUrl && uploadedBannerUrl !== settings?.storeBanner && (
              <div className="text-[#2ECC71] text-[10px] mt-1 text-center">New banner uploaded - click "Update Profile" to save</div>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      <div>
        <div className="text-[#4C535F] text-[12px] font-medium mb-2">Description</div>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-[8px] border border-[#E0E4EC] bg-[#E9FFF2] px-4 py-3 text-[#4C535F] text-[12px] min-h-[140px] resize-vertical outline-none focus:border-[#2ECC71] focus:ring-2 focus:ring-[#2ECC71]/20 transition-colors"
          placeholder="Write your description here what are you selling and what is this for?"
          maxLength={5000}
        />
        <div className="text-[#8D98AA] text-[10px] mt-1 text-right">
          {description.length}/5000 characters
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center md:gap-16 gap-6 pt-4">
        <button
          onClick={handleUpdate}
          disabled={saving || !hasChanges}
          className={`bg-[#2ECC71] text-white rounded-lg px-5 md:h-[49px] h-[35px] text-[14px] font-bold transition-all ${
            saving || !hasChanges
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:bg-[#27AE60] active:scale-95'
          }`}
        >
          {saving ? 'Saving...' : 'Update Profile'}
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

export default StoreInformation;
