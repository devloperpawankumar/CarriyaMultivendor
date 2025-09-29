import React from 'react';
import ImagePreviewCard from '../../../components/common/ImagePreviewCard';
import VideoPreviewCard from '../../../components/common/VideoPreviewCard';
import SellerScaffold from '../../../components/seller/SellerScaffold';
import { sellerMenuIcons, sellerMenuRoutes } from '../../../components/seller/menuConfig';
import uploadImage from '../../../assets/images/auth/Upload.png';
import { createProduct } from '../../../services/productService';
import ProductDescription from '../../../components/seller/product/ProductDescription';
import SelectColorField from '../../../components/seller/product/SelectColorField';
import dropdown from '../../../assets/images/Seller/_ (2).png';

type ProductForm = {
  title: string;
  price: string;
  stock: string;
  discount?: string;
  categoryPath: string;
  description: string;
  keywords: string[];
  images: File[];
  videos: File[];
  unlimitedStock: boolean;
  sizes: string[];
  colors: { name: string; hex: string }[];
};

const initialForm: ProductForm = {
  title: '',
  price: '',
  stock: '',
  discount: '',
  categoryPath: '',
  description: '',
  keywords: [],
  images: [],
  videos: [],
  unlimitedStock: false,
  sizes: [],
  colors: [],
};

const AddProduct: React.FC = () => {
  const [form, setForm] = React.useState<ProductForm>(initialForm);
  // Colors are handled inside SelectColorField component now

  const handleChange = (field: keyof ProductForm, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (action: 'publish' | 'draft') => {
    const payload = { ...form, action } as any;
    // eslint-disable-next-line no-console
    console.log('submit add-product', payload);
    createProduct(payload).then((res) => {
      // eslint-disable-next-line no-console
      console.log('created product response', res.status);
    }).catch((err) => {
      // eslint-disable-next-line no-console
      console.error('create product failed', err);
    });
  };

  // Available colors moved inside SelectColorField's color picker

  // Preview URLs for images/videos
  const imagePreviews = React.useMemo(() =>
    form.images.map((f) => ({ file: f, url: URL.createObjectURL(f) })),
  [form.images]);
  const [imageIdx, setImageIdx] = React.useState(0);
  React.useEffect(() => {
    if (imageIdx >= imagePreviews.length) setImageIdx(0);
  }, [imagePreviews.length, imageIdx]);
  const videoPreviews = React.useMemo(() =>
    form.videos.map((f) => ({ file: f, url: URL.createObjectURL(f) })),
  [form.videos]);
  const [videoIdx, setVideoIdx] = React.useState(0);
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const [isVideoPlaying, setIsVideoPlaying] = React.useState(false);
  React.useEffect(() => {
    if (videoIdx >= videoPreviews.length) setVideoIdx(0);
  }, [videoPreviews.length, videoIdx]);
  React.useEffect(() => {
    // Pause and reset when switching videos or when list changes
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
    setIsVideoPlaying(false);
  }, [videoIdx, videoPreviews.length]);
  React.useEffect(() => {
    return () => {
      imagePreviews.forEach((p) => URL.revokeObjectURL(p.url));
      videoPreviews.forEach((p) => URL.revokeObjectURL(p.url));
    };
  }, [imagePreviews, videoPreviews]);

  return (
    <SellerScaffold menuIcons={sellerMenuIcons} menuRoutes={sellerMenuRoutes}>
      {/* Mobile: smaller heading sizes; Desktop unchanged */}

      <h1 className="text-[24px] md:text-[40px] font-bold text-black  md:[-mb-2] -mb-4     text-left w-full md:py-0 py-2  max-w-[736px]">Add New Products</h1>
      <div className="text-[#949494] text-[14px] md:text-[20px] w-full text-left mb-4 md:mb-6  max-w-[736px]">Manage Products &gt; Add Products</div>
      
      {/* Title (Figma order 1) */}
      {/* Mobile responsive: label/input smaller per Figma; Desktop sizes preserved */}
      <div className="w-full max-w-[736px] mb-4 md:mb-6">
        <label className="block text-[17px] md:text-[35px] font-semibold text-black mb-2">Product Title</label>
        <input
          value={form.title}
          onChange={(e) => handleChange('title', e.target.value)}
          className="w-full h-[38px] md:h-[80px] rounded-[10px] shadow-[2px_3px_4px_rgba(46,204,113,0.25)] border border-[#E2E0E0] px-4 text-[14px] md:text-[30px]"
          placeholder="Nokia 4G Mobile - 64 GB"
        />
      </div>

      {/* Price and Stock row (Figma order 2) */}
      {/* Mobile responsive: keep two inputs in one row at 168px each per Figma */}
      <div className="w-full max-w-[736px] grid grid-cols-2 gap-3 md:gap-6 mb-2">
        <div>
          <label className="block text-[17px] md:text-[35px] font-semibold text-black mb-2">Price (PKR)</label>
          <input
            value={form.price}
            onChange={(e) => handleChange('price', e.target.value)}
            className="w-full h-[38px] md:h-[80px] rounded-[10px] shadow-[2px_3px_4px_rgba(46,204,113,0.25)] border border-[#E2E0E0] px-4 text-[14px] md:text-[30px]"
            placeholder="45,000"
          />
        </div>
        <div>
          <label className="block text-[17px] md:text-[35px] font-semibold text-black mb-2">Stock</label>
          <input
            value={form.stock}
            onChange={(e) => handleChange('stock', e.target.value)}
            className="w-full h-[38px] md:h-[80px] rounded-[10px] shadow-[2px_3px_4px_rgba(46,204,113,0.25)] border border-[#E2E0E0] px-4 text-[14px] md:text-[30px]"
            placeholder="50"
          />
        </div>
      </div>

      {/* Discount + Unlimited Stock (same row per Figma 359:1173) */}
      {/* Mobile responsive: two-column row with compact heights */}
      <div className="w-full max-w-[736px] grid grid-cols-2 gap-3 md:grid-cols-2 md:gap-6 mb-6 md:mb-8">
        <div className="max-w-full md:max-w-[372px]">
          <div className="flex items-center gap-2 md:gap-3 mb-2">
            <label className="block text-[17px] md:text-[35px] font-semibold text-black">Discount</label>
            <span className="hidden  md:inline   md:text-[13px] text-[#949494]">(Must be higher than product price)</span>
          </div>
          <input
            value={form.discount}
            onChange={(e) => handleChange('discount', e.target.value)}
            className="w-full h-[38px] md:h-[80px] rounded-[10px] shadow-[2px_3px_4px_rgba(46,204,113,0.25)] border border-[#E2E0E0] px-4 text-[12px] md:text-[25px]"
            placeholder="Optional"
          />
        </div>
        <div className="flex items-center justify-center gap-3 md:gap-4 md:mt-16 mt-6" style={{ height: 60 }}>

        <button
            type="button"
            className="relative md:w-[49px] md:h-[27px] w-[36px] h-[20px] rounded-[25px]  "
            style={{ backgroundColor: form.unlimitedStock ? '#2ECC71' : '#B8B1B1' }}
            onClick={() => handleChange('unlimitedStock', !form.unlimitedStock)}
          >
            <span
              className="absolute   top-[3px] md:w-[23px] md:h-[22px] w-[15px] h-[15px] rounded-full bg-white transition-all "
              style={{ left: form.unlimitedStock ? 23 : 3 }}
            />
          </button>
          <div className="text-[14px] md:text-[35px] text-[#B8B1B1]">Unlimited Stock</div>
      
        </div>
      </div>

  
      {/* Upload Images (Figma order 4) - same line with preview */}
      {/* Mobile responsive: keep upload box and preview side-by-side per Figma */}
      <div className="w-full max-w-[736px]  flex flex-row justify-between gap-4 md:flex-row md:items-start md:gap-10 mb-8 md:mb-10">
        {/* Upload box */}
        <div>
          <label className="block text-[17px] md:text-[35px] font-semibold text-black mb-2">Upload Image</label>
          <div className="relative flex justify-start md:justify-end py-1 md:py-3">
            <div className="w-[142.69px] h-[117.23px] md:w-[269px] md:h-[221px] border-2 border border-[#B8B1B1] bg-white rounded-[20px] md:rounded-[20px] flex flex-col items-center justify-center cursor-pointer hover:border-[#2ECC71] transition-colors">
              <div className="w-[81.16px] h-[72.67px] md:w-[153px] mt-2 md:h-[137px] border border-[#2ECC71] rounded-[25px] md:rounded-[25px] flex items-center justify-center mb-2 md:mb-4">
                <div className="w-[63.65px] h-[65.78px] md:w-[120px] md:h-[124px] flex items-center justify-center">
                  <img src={uploadImage} alt="Upload" />
                </div>
              </div>
              <p className="text-[10px] md:text-[20px] text-[#B8B1B1] font-normal">Drag or Click to upload</p>
              <input type="file" multiple accept="image/*" onChange={(e) => handleChange('images', Array.from(e.target.files || []))} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
            </div>
          </div>
        </div>

        {/* Preview card */}
        <div className="mt-[35px] md:mt-[54px]">
          <ImagePreviewCard
            urls={imagePreviews.map((p) => p.url)}
            index={imageIdx}
            setIndex={(updater) => setImageIdx((i) => updater(i))}
          />
        </div>
      </div>

      {/* Upload Video (Figma order 5) - same line with preview */}
      {/* Mobile responsive: keep upload box and preview side-by-side per Figma */}
      <div className="w-full max-w-[736px]  flex flex-row justify-between gap-4 md:flex-row md:items-start md:gap-10 mb-8 md:mb-10">
        {/* Upload box */}
        <div>
          <label className="block text-[17px] md:text-[35px] font-semibold text-black mb-2">Upload Videos</label>
          <div className="relative flex justify-start md:justify-end py-1 md:py-3 ">
            <div className="w-[142.69px] h-[117.23px] md:w-[269px] md:h-[221px] border-2 border border-[#B8B1B1] rounded-[20px] md:rounded-[20px] flex flex-col items-center justify-center cursor-pointer hover:border-[#2ECC71] transition-colors bg-white">
              <div className="w-[81.16px] h-[72.67px] md:w-[153px] mt-2 md:h-[137px] border border-[#2ECC71] rounded-[25px] md:rounded-[25px] flex items-center justify-center mb-2 md:mb-4">
                <div className="w-[63.65px] h-[65.78px] md:w-[120px] md:h-[124px] flex items-center justify-center">
                  <img src={uploadImage} alt="Upload" />
                </div>
              </div>
              <p className="text-[10px] md:text-[20px] text-[#B8B1B1] font-normal">Drag or Click to upload</p>
              <input type="file" multiple accept="video/*" onChange={(e) => handleChange('videos', Array.from(e.target.files || []))} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
            </div>
          </div>
        </div>

        {/* Preview card (dummy placeholder if empty) */}
        <div className="mt-[35px] md:mt-[54px]">
          <div
            className="w-[142.69px] h-[117.23px] md:w-[258px] md:h-[255px] rounded-[20px] relative flex items-center justify-center"

          >
            <VideoPreviewCard
              urls={videoPreviews.map((p) => p.url)}
              index={videoIdx}
              setIndex={(updater) => setVideoIdx((i) => updater(i))}
            />
          </div>
        </div>
      </div>

    

      {/* Category (Figma order 7) */}
      {/* Mobile responsive: 352px wide select with compact height */}
      <div className="w-full max-w-[736px] mb-4 md:mb-6">
        <label className="block text-[17px] md:text-[35px] font-semibold text-black mb-2">Category</label>
        <div className="relative">
          <select
            value={form.categoryPath}
            onChange={(e) => handleChange('categoryPath', e.target.value)}
            className="w-full h-[38px] md:h-[80px] rounded-[10px] shadow-[2px_3px_4px_rgba(46,204,113,0.25)] border border-[#E2E0E0] px-4 text-[14px] md:text-[30px] pr-10 md:pr-14 bg-white appearance-none"
          >
            <option value="" disabled>
              Select a category
            </option>
            <option value="Mobile phones > Nokia">Mobile phones &gt; Nokia</option>
            <option value="Mobile phones > Samsung">Mobile phones &gt; Samsung</option>
            <option value="Laptops > Apple">Laptops &gt; Apple</option>
            <option value="Laptops > Dell">Laptops &gt; Dell</option>
            <option value="Accessories > Headphones">Accessories &gt; Headphones</option>
            <option value="Accessories > Chargers">Accessories &gt; Chargers</option>
          </select>
          <span className="pointer-events-none absolute right-3 md:right-6 top-1/2 transform -translate-y-1/2 flex items-center">
            <img src={dropdown} alt="dropdown" className="w-2 h-2  md:w-4 md:h-4" />
          </span>
        </div>
      </div>

      {/* Mobile responsive: smaller editor height per Figma */}
      <ProductDescription
        value={form.description}
        onChange={(val) => handleChange('description', val)}
        className="w-full max-w-[736px] mb-8 md:mb-10"
      />

      {/* Keywords Related Products (Figma order 6) */}
      {/* Exact Figma dimensions: 736px width, 231px height */}
      <div className="w-full max-w-[736px] mb-8 md:mb-10">
        <label className="block text-[17px] md:text-[35px] font-semibold text-black mb-2">Add Keywords Related Products</label>
        <textarea
          className="w-full h-[231px] rounded-[10px] shadow-[2px_3px_4px_rgba(46,204,113,0.25)] border border-[#B8B8B8] px-4 py-4 text-[12px] md:text-[25px] resize-none"
          
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              const value = (e.target as HTMLTextAreaElement).value.trim();
              if (value) {
                handleChange('keywords', [...form.keywords, value]);
                (e.target as HTMLTextAreaElement).value = '';
              }
            }
          }}
        />
        {form.keywords.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {form.keywords.map((keyword, idx) => (
              <span key={idx} className="px-3 py-1 rounded-full border text-sm bg-gray-50">{keyword}</span>
            ))}
          </div>
        )}
      </div>

      {/* Sizes and colors */}
      {/* Mobile responsive: sizes and colors in two columns per Figma */}
      <div className="w-full max-w-[736px] grid grid-cols-2 gap-3 md:grid-cols-2 md:gap-6 mb-8 md:mb-10">
        <div>
          <label className="block text-[17px] md:text-[35px] font-semibold text-black mb-2">Enter Product Size</label>
          <input
            className="w-full h-[38px] md:h-[80px] rounded-[10px] shadow-[2px_3px_4px_rgba(46,204,113,0.25)] border border-[#E2E0E0] px-4 text-[12px] md:text-[25px]"
            placeholder="Optional"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const value = (e.target as HTMLInputElement).value.trim();
                if (value) {
                  handleChange('sizes', [...form.sizes, value]);
                  (e.target as HTMLInputElement).value = '';
                }
              }
            }}
          />
          {form.sizes.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {form.sizes.map((s, idx) => (
                <span key={idx} className="px-3 py-1 rounded-full border text-sm">{s}</span>
              ))}
            </div>
          )}
        </div>
        <div>
          <label className="block text-[17px] md:text-[35px] font-semibold text-black mb-2">Color Name</label>
          <input
            className="w-full h-[38px] md:h-[80px] rounded-[10px] shadow-[2px_3px_4px_rgba(46,204,113,0.25)] border border-[#E2E0E0] px-4 text-[12px] md:text-[25px]"
            placeholder="Optional"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const value = (e.target as HTMLInputElement).value.trim();
                if (value) {
                  handleChange('colors', [...form.colors, { name: value, hex: '#000000' }]);
                  (e.target as HTMLInputElement).value = '';
                }
              }
            }}
          />
          {/* {form.colors.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {form.colors.map((c, idx) => (
                <span key={idx} className="px-3 py-1 rounded-full border text-sm" style={{ borderColor: '#CECECE' }}>{c.name}</span>
              ))}
            </div>
          )} */}
        </div>
      </div>

      {/* Select Color - modular component */}
      {/* Mobile responsive: color picker field width 168px per Figma */}
      <SelectColorField
        className="w-full max-w-[736px] mb-8 md:mb-10 relative"
        fieldWidthClass="w-[168px] md:w-1/2"
        selected={form.colors}
        onChangeColors={(colors) => setForm((prev) => ({ ...prev, colors }))}
      />

      {/* End fields; actions below */}

      {/* Actions */}
      {/* Mobile responsive: buttons in one row; keep widths but adjust spacing */}
      <div className="w-full flex justify-end gap-3 md:gap-6 max-w-[1014px]">
        <button
          type="button"
          className="w-[168px] md:w-[278px] h-[38px] md:h-[62px] rounded-[15px] text-white text-[16px] md:text-[30px] font-bold"
          style={{ backgroundColor: '#B8B1B1' }}
          onClick={() => handleSubmit('draft')}
        >
          Save as draft
        </button>
        <button
          type="button"
          className="w-[168px] md:w-[278px] h-[38px] md:h-[62px] rounded-[15px] text-white text-[16px] md:text-[30px] font-bold"
          style={{ backgroundColor: '#2ECC71' }}
          onClick={() => handleSubmit('publish')}
        >
          Publish Products
        </button>
      </div>
    </SellerScaffold>
  );
};

export default AddProduct;


