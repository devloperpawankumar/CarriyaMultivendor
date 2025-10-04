import React from 'react';
import galleryicon from '../../../assets/images/Seller/gallery-add.png';

const StoreInformation: React.FC = () => {
  const [logoPreview, setLogoPreview] = React.useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = React.useState<string | null>(null);
  const [description, setDescription] = React.useState<string>('');
  const logoInputRef = React.useRef<HTMLInputElement | null>(null);
  const bannerInputRef = React.useRef<HTMLInputElement | null>(null);

  const handleSelectLogo: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setLogoPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return url;
    });
  };

  const handleSelectBanner: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setBannerPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return url;
    });
  };

  React.useEffect(() => {
    return () => {
      if (logoPreview) URL.revokeObjectURL(logoPreview);
      if (bannerPreview) URL.revokeObjectURL(bannerPreview);
    };
  }, [logoPreview, bannerPreview]);

  return (
    <div className="space-y-6">
      {/* Upload areas */}
      <div className="space-y-6">
        {/* Logo */}
        <div className="flex flex-col  justify-start">
          <div className="text-[#8D98AA] text-[11px]  mb-2 ">Store Logo Here</div>
          <div
            className="bg-[#E9FFF2] border border-[#4C535F] border-dashed rounded-[18px] md:w-[124px] w-[115px] md:h-[124px] h-[110px] flex flex-col items-center justify-center cursor-pointer"
            onClick={() => logoInputRef.current?.click()}
          >
            {logoPreview ? (
              <img src={logoPreview} alt="logo" className="w-[110px] h-[110px] object-contain rounded-[14px]" />
            ) : (
              <>
                <img src={galleryicon} alt="gallery" className="w-8 h-8 mb-1" />
                <div className="text-[#4C535F] text-[10px] leading-[16px] mt-2 text-center">Upload your<br />logo</div>
              </>
            )}
            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleSelectLogo}
            />
          </div>
        </div>
        {/* Banner */}
        <div>
          <div className="text-[#8D98AA] text-[11px] mb-2">Store Banner Here</div>
          <div
            className="bg-[#E9FFF2] border border-[#4C535F] border-dashed rounded-[18px] h-[140px] flex flex-col items-center justify-center w-full max-w-[98%] mx-auto cursor-pointer"
            onClick={() => bannerInputRef.current?.click()}
          >
            {bannerPreview ? (
              <img src={bannerPreview} alt="banner" className="w-[95%] h-[120px] object-contain rounded-[14px]" />
            ) : (
              <>
                <img src={galleryicon} alt="gallery" className="w-10 h-10 mb-2" />
                <div className="text-[#4C535F] text-[12px] text-center">Upload your banner</div>
              </>
            )}
            <input
              ref={bannerInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleSelectBanner}
            />
          </div>
        </div>
      </div>

      {/* Description */}
      <div>
        <div className="text-[#4C535F] text-[12px] font-medium mb-2">Description</div>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-[8px] border border-[#E0E4EC] bg-[#E9FFF2] px-4 py-3 text-[#4C535F] text-[12px] min-h-[140px] resize-vertical outline-none"
          placeholder="Write your description here what are you selling and what is this for?"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center md:gap-16 gap-6">
        <button className="bg-[#2ECC71] text-white rounded-lg px-5 md:h-[49px] h-[35px] text-[14px] font-bold">Update Profile</button>
        <button className="text-[#4C535F] text-[14px] font-medium">Reset</button>
      </div>
    </div>
  );
};

export default StoreInformation;


