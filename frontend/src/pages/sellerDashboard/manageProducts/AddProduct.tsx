import React from 'react';
import { useSearchParams, useNavigate, useParams } from 'react-router-dom';
import { useToast } from '../../../contexts/ToastContext';
import { toastUtils } from '../../../utils/toast';
import ImagePreviewCard from '../../../components/common/ImagePreviewCard';
import VideoPreviewCard from '../../../components/common/VideoPreviewCard';
import SellerScaffold from '../../../components/seller/SellerScaffold';
import { sellerMenuIcons, sellerMenuRoutes } from '../../../components/seller/menuConfig';
import uploadImage from '../../../assets/images/auth/Upload.png';
import { createProduct, updateProduct, getProduct, uploadMedia, ProductDetail } from '../../../services/productService';
import ProductDescription from '../../../components/seller/product/ProductDescription';
import SelectColorField from '../../../components/seller/product/SelectColorField';
import dropdown from '../../../assets/images/Seller/_ (2).png';
import { extractProductIdFromPublicId } from './utils/productPublicId';

// Image compression constraints
const MAX_IMAGE_BYTES = 3 * 1024 * 1024; // 3MB
const IMAGE_MAX_DIMENSION = 1920; // max width/height

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
  const { productId: productParam } = useParams<{ productId?: string }>();
  const navigate = useNavigate();
  // Support both path-based (professional) and query-based (legacy) edit mode
  const [searchParams] = useSearchParams();
  const legacyEditId = searchParams.get('edit');
  const rawEditProductId = productParam || legacyEditId || '';
  const resolvedEditProductId = React.useMemo(() => {
    if (!rawEditProductId) return '';
    return extractProductIdFromPublicId(rawEditProductId) || rawEditProductId;
  }, [rawEditProductId]);
  const isEditMode = !!rawEditProductId;
  
  // Redirect legacy query-based URLs to path-based (professional approach)
  React.useEffect(() => {
    if (legacyEditId && !productParam) {
      navigate(`/seller/manage-products/edit/${legacyEditId}`, { replace: true });
    }
  }, [legacyEditId, productParam, navigate]);

  const [form, setForm] = React.useState<ProductForm>(initialForm);
  const [imageUrls, setImageUrls] = React.useState<string[]>([]);
  const [videoUrls, setVideoUrls] = React.useState<string[]>([]);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isLoadingProduct, setIsLoadingProduct] = React.useState(false);
  const { showToast } = useToast();
  const [uploadingImages, setUploadingImages] = React.useState(false);
  const [uploadingVideos, setUploadingVideos] = React.useState(false);
  // Colors are handled inside SelectColorField component now

  // Load product data if in edit mode
  React.useEffect(() => {
    console.log('Edit mode check:', { isEditMode, editProductId: rawEditProductId, searchParams: searchParams.toString() });
    
    if (!isEditMode || !resolvedEditProductId) {
      console.log('Not in edit mode or no product ID, skipping load');
      return;
    }

    console.log('Loading product for editing:', resolvedEditProductId);
    let isMounted = true;
    setIsLoadingProduct(true);

    getProduct(resolvedEditProductId, true) // Use seller route to access drafts
      .then((product: ProductDetail) => {
        if (!isMounted) return;

        console.log('Loaded product for editing:', product);

        setForm({
          title: product.title || '',
          price: String(product.price || ''),
          // If unlimitedStock is true, stock might be 0 or undefined, but we should still show the value if it exists
          // Always show stock value, even if unlimitedStock is true (for editing purposes)
          stock: String(product.stock ?? ''),
          discount: product.discount > 0 ? String(product.discount) : '',
          categoryPath: product.categoryPath || '',
          description: product.description || '',
          keywords: product.keywords || [],
          images: [],
          videos: [],
          unlimitedStock: product.unlimitedStock || false,
          sizes: product.sizes || [],
          colors: product.colors || [],
        });

        // Set existing image/video URLs
        if (product.images && product.images.length > 0) {
          setImageUrls(product.images);
        }
        if (product.videos && product.videos.length > 0) {
          setVideoUrls(product.videos);
        }
      })
      .catch((err: any) => {
        if (!isMounted) return;
        console.error('Error loading product:', err);
        const message = err?.response?.data?.message || err?.message || 'Failed to load product';
        showToast(toastUtils.error('Load Failed', message));
      })
      .finally(() => {
        if (isMounted) setIsLoadingProduct(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isEditMode, resolvedEditProductId]); // Removed showToast from dependencies to avoid unnecessary re-runs

  const handleChange = (field: keyof ProductForm, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const sanitizeDecimalInput = (value: string) => {
    let sanitized = value.replace(/[^0-9.]/g, '');
    const dotIndex = sanitized.indexOf('.');
    if (dotIndex !== -1) {
      sanitized = sanitized.slice(0, dotIndex + 1) + sanitized.slice(dotIndex + 1).replace(/\./g, '');
    }
    if (sanitized.startsWith('.')) {
      sanitized = `0${sanitized}`;
    }
    return sanitized;
  };

  const sanitizeIntegerInput = (value: string) => value.replace(/[^0-9]/g, '');

  const handlePriceInput = (rawValue: string) => {
    const sanitized = sanitizeDecimalInput(rawValue);
    setForm((prev) => ({ ...prev, price: sanitized }));
    setErrors((prev) => {
      const next = { ...prev };
      if (rawValue !== sanitized) {
        next.price = 'Only numbers allowed';
      } else if (!sanitized.trim()) {
        next.price = 'Valid price is required';
      } else if (Number(sanitized) <= 0) {
        next.price = 'Price must be greater than 0';
      } else {
        delete next.price;
      }
      return next;
    });
  };

  const handleStockInput = (rawValue: string) => {
    const sanitized = sanitizeIntegerInput(rawValue);
    const unlimited = form.unlimitedStock;
    setForm((prev) => ({ ...prev, stock: sanitized }));
    setErrors((prev) => {
      const next = { ...prev };
      if (rawValue !== sanitized) {
        next.stock = 'Only numbers allowed';
      } else if (!unlimited) {
        if (!sanitized.trim()) {
          next.stock = 'Valid stock is required';
        } else {
          delete next.stock;
        }
      } else {
        delete next.stock;
      }
      return next;
    });
  };

  const handleDiscountInput = (rawValue: string) => {
    const sanitized = sanitizeDecimalInput(rawValue);
    setForm((prev) => ({ ...prev, discount: sanitized }));
    setErrors((prev) => {
      const next = { ...prev };
      if (rawValue !== sanitized) {
        next.discount = 'Only numbers allowed';
      } else if (!sanitized.trim()) {
        delete next.discount;
      } else {
        const value = Number(sanitized);
        if (Number.isNaN(value)) {
          next.discount = 'Enter a valid number';
        } else if (value < 0 || value > 100) {
          next.discount = 'Discount must be between 0 and 100';
        } else {
          delete next.discount;
        }
      }
      return next;
    });
  };

  const addSize = React.useCallback((rawValue: string) => {
    const value = rawValue.trim();
    if (!value) return;
    setForm((prev) => {
      if (prev.sizes.includes(value)) return prev;
      return { ...prev, sizes: [...prev.sizes, value] };
    });
  }, []);

  const handleToggleUnlimitedStock = () => {
    const isCurrentlyUnlimited = form.unlimitedStock;
    setForm((prev) => ({ ...prev, unlimitedStock: !prev.unlimitedStock }));
    setErrors((prev) => {
      const next = { ...prev };
      if (!isCurrentlyUnlimited) {
        delete next.stock;
      } else if (!form.stock.trim()) {
        next.stock = 'Valid stock is required';
      }
      return next;
    });
  };

  const validate = (data: ProductForm): Record<string, string> => {
    const nextErrors: Record<string, string> = {};
    if (!data.title.trim()) nextErrors.title = 'Title is required';
    if (!data.price.trim() || isNaN(Number(data.price)) || Number(data.price) <= 0) nextErrors.price = 'Valid price is required';
    if (!data.unlimitedStock) {
      if (!data.stock.trim() || isNaN(Number(data.stock)) || Number(data.stock) < 0) nextErrors.stock = 'Valid stock is required';
    }
    if (!data.categoryPath.trim()) nextErrors.categoryPath = 'Category is required';
    if (!data.description.trim()) nextErrors.description = 'Description is required';
    if ((!imageUrls || imageUrls.length === 0) && (!data.images || data.images.length === 0)) nextErrors.images = 'At least one image is required';
    if (data.discount && (isNaN(Number(data.discount)) || Number(data.discount) < 0 || Number(data.discount) > 100)) {
      nextErrors.discount = 'Discount must be between 0 and 100';
    }
    // Optional: validate videos size/type if needed
    return nextErrors;
  };

  const resetForm = () => {
    setForm(initialForm);
    setErrors({});
    setImageUrls([]);
    setVideoUrls([]);
  };

  const handleSubmit = async (action: 'publish' | 'draft') => {
    if (uploadingImages) {
      showToast(toastUtils.info('Please wait', 'Images are still uploading.'));
      return;
    }
    if (action === 'publish' && (imageUrls.length === 0) && (!form.images || form.images.length === 0)) {
      setErrors((prev) => ({ ...prev, images: 'At least one image is required' }));
      showToast(toastUtils.error('Validation Error', 'Please add at least one image.'));
      return;
    }
    const nextErrors = validate(form);
    if (action === 'draft') {
      // For drafts, images are optional
      if (nextErrors.images) delete nextErrors.images;
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      showToast(toastUtils.error('Validation Error', 'Please fix the highlighted errors.'));
      return;
    }
    try {
      setIsSubmitting(true);
      const payload = { ...form, action, imageUrls, videoUrls } as any;
      
      if (isEditMode && resolvedEditProductId) {
        // Update existing product
        await updateProduct({ ...payload, productId: resolvedEditProductId });
        showToast(toastUtils.success('Product Updated', action === 'publish' ? 'Your product has been updated and published.' : 'Draft updated.'));
        // Reset form and redirect to My Products after successful update
        resetForm();
        // Small delay to show success message before redirecting
        setTimeout(() => {
          navigate('/seller/manage-products/my-products');
        }, 1000);
      } else {
        // Create new product
        await createProduct(payload);
        showToast(toastUtils.success('Product Created', action === 'publish' ? 'Your product has been published.' : 'Draft saved.'));
        resetForm();
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || (isEditMode ? 'Failed to update product' : 'Failed to create product');
      showToast(toastUtils.error(isEditMode ? 'Update Failed' : 'Create Failed', msg));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Available colors moved inside SelectColorField's color picker

  // Preview URLs for images/videos
  const imagePreviews = React.useMemo(() => {
    if (imageUrls.length > 0) return imageUrls.map((u) => ({ file: undefined as any, url: u }));
    return form.images.map((f) => ({ file: f, url: URL.createObjectURL(f) }));
  }, [form.images, imageUrls]);
  const [imageIdx, setImageIdx] = React.useState(0);
  React.useEffect(() => {
    if (imageIdx >= imagePreviews.length) setImageIdx(0);
  }, [imagePreviews.length, imageIdx]);
  const videoPreviews = React.useMemo(() => {
    if (videoUrls.length > 0) return videoUrls.map((u) => ({ file: undefined as any, url: u }));
    return form.videos.map((f) => ({ file: f, url: URL.createObjectURL(f) }));
  }, [form.videos, videoUrls]);
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
      if (imageUrls.length === 0) imagePreviews.forEach((p) => { try { URL.revokeObjectURL(p.url); } catch {} });
      if (videoUrls.length === 0) videoPreviews.forEach((p) => { try { URL.revokeObjectURL(p.url); } catch {} });
    };
  }, [imagePreviews, videoPreviews, imageUrls.length, videoUrls.length]);

  // Compress a single image to JPEG under size/dimension constraints
  const compressImage = async (file: File): Promise<File> => {
    if (!file.type.startsWith('image/')) return file;
    const imageUrl = URL.createObjectURL(file);
    try {
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const el = new Image();
        el.onload = () => resolve(el);
        el.onerror = reject;
        el.src = imageUrl;
      });

      const { naturalWidth, naturalHeight } = img;
      let targetWidth = naturalWidth;
      let targetHeight = naturalHeight;
      const maxDim = IMAGE_MAX_DIMENSION;
      if (Math.max(naturalWidth, naturalHeight) > maxDim) {
        const scale = maxDim / Math.max(naturalWidth, naturalHeight);
        targetWidth = Math.round(naturalWidth * scale);
        targetHeight = Math.round(naturalHeight * scale);
      }

      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return file;
      // Improve quality
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

      // Prefer JPEG for better compression; loop quality down if needed
      let quality = 0.85;
      let blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality));
      while (blob && blob.size > MAX_IMAGE_BYTES && quality > 0.4) {
        quality -= 0.1;
        blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality));
      }
      if (blob && blob.size <= MAX_IMAGE_BYTES) {
        const newName = file.name.replace(/\.(png|webp|heic|heif|gif)$/i, '.jpg');
        return new File([blob], newName, { type: 'image/jpeg' });
      }
      // If still too big or failed, return original; backend will handle or reject
      return file;
    } catch {
      return file;
    } finally {
      URL.revokeObjectURL(imageUrl);
    }
  };

  const prepareImagesForUpload = async (files: File[]): Promise<File[]> => {
    const images = files.filter((f) => f.type.startsWith('image/'));
    const others = files.filter((f) => !f.type.startsWith('image/'));
    const compressed = await Promise.all(images.map((f) => compressImage(f)));
    const finalImages: File[] = [];
    for (const f of compressed) {
      if (f.size > MAX_IMAGE_BYTES) {
        showToast(toastUtils.error('Image too large', `Reduce below ${Math.round(MAX_IMAGE_BYTES / (1024 * 1024))}MB: ${f.name}`, 4000));
      } else {
        finalImages.push(f);
      }
    }
    return [...finalImages, ...others];
  };

  const handleImmediateUpload = async (files: File[], type: 'image' | 'video') => {
    if (!files || files.length === 0) return;
    if (type === 'image') setUploadingImages(true); else setUploadingVideos(true);
    try {
      const readyFiles = type === 'image' ? await prepareImagesForUpload(files) : files;
      const results = await Promise.all(readyFiles.map((f) => uploadMedia(f)));
      const urls = results.map((r) => r.url).filter(Boolean);
      if (type === 'image') {
        setImageUrls((prev) => [...prev, ...urls]);
        // Clear form.images since they're already uploaded and in imageUrls
        // This prevents duplicate uploads when submitting
        setForm((prev) => ({ ...prev, images: [] }));
      } else {
        setVideoUrls((prev) => [...prev, ...urls]);
        // Clear form.videos since they're already uploaded and in videoUrls
        setForm((prev) => ({ ...prev, videos: [] }));
      }
    } catch (e:any) {
      // keep a single error toast for failures
      showToast(toastUtils.error('Upload failed', e?.message || 'Please try again', 4000));
    } finally {
      if (type === 'image') setUploadingImages(false); else setUploadingVideos(false);
    }
  };

  return (
    <SellerScaffold menuIcons={sellerMenuIcons} menuRoutes={sellerMenuRoutes}>
      {/* Professional Loading Skeleton - Covers entire form */}
      {isLoadingProduct ? (
        <div className="w-full max-w-[736px] space-y-6 md:space-y-8">
          {/* Header Skeleton */}
          <div>
            <div className="h-[40px] md:h-[48px] bg-gray-200 rounded animate-pulse w-[300px] md:w-[400px] mb-2"></div>
            <div className="h-[20px] md:h-[24px] bg-gray-200 rounded animate-pulse w-[250px] md:w-[350px]"></div>
          </div>

          {/* Product Title Skeleton */}
          <div>
            <div className="h-[20px] md:h-[35px] bg-gray-200 rounded animate-pulse w-[150px] md:w-[200px] mb-2"></div>
            <div className="h-[38px] md:h-[80px] bg-gray-200 rounded-[10px] animate-pulse"></div>
          </div>

          {/* Price and Stock Row Skeleton */}
          <div className="grid grid-cols-2 gap-3 md:gap-6">
            <div>
              <div className="h-[20px] md:h-[35px] bg-gray-200 rounded animate-pulse w-[100px] md:w-[150px] mb-2"></div>
              <div className="h-[38px] md:h-[80px] bg-gray-200 rounded-[10px] animate-pulse"></div>
            </div>
            <div>
              <div className="h-[20px] md:h-[35px] bg-gray-200 rounded animate-pulse w-[80px] md:w-[120px] mb-2"></div>
              <div className="h-[38px] md:h-[80px] bg-gray-200 rounded-[10px] animate-pulse"></div>
            </div>
          </div>

          {/* Discount and Unlimited Stock Row Skeleton */}
          <div className="grid grid-cols-2 gap-3 md:gap-6">
            <div>
              <div className="h-[20px] md:h-[35px] bg-gray-200 rounded animate-pulse w-[100px] md:w-[150px] mb-2"></div>
              <div className="h-[38px] md:h-[80px] bg-gray-200 rounded-[10px] animate-pulse"></div>
            </div>
            <div className="flex items-center gap-3 md:gap-4 md:mt-16 mt-6">
              <div className="w-[36px] h-[20px] md:w-[49px] md:h-[27px] bg-gray-200 rounded-[25px] animate-pulse"></div>
              <div className="h-[20px] md:h-[35px] bg-gray-200 rounded animate-pulse w-[120px] md:w-[200px]"></div>
            </div>
          </div>

          {/* Image Upload Section Skeleton */}
          <div className="flex flex-row justify-between gap-4 md:gap-10">
            <div>
              <div className="h-[20px] md:h-[35px] bg-gray-200 rounded animate-pulse w-[120px] md:w-[180px] mb-2"></div>
              <div className="w-[142.69px] h-[117.23px] md:w-[269px] md:h-[221px] bg-gray-200 rounded-[20px] animate-pulse"></div>
            </div>
            <div className="mt-[35px] md:mt-[54px]">
              <div className="w-[142.69px] h-[117.23px] md:w-[258px] md:h-[255px] bg-gray-200 rounded-[20px] animate-pulse"></div>
            </div>
          </div>

          {/* Video Upload Section Skeleton */}
          <div className="flex flex-row justify-between gap-4 md:gap-10">
            <div>
              <div className="h-[20px] md:h-[35px] bg-gray-200 rounded animate-pulse w-[130px] md:w-[190px] mb-2"></div>
              <div className="w-[142.69px] h-[117.23px] md:w-[269px] md:h-[221px] bg-gray-200 rounded-[20px] animate-pulse"></div>
            </div>
            <div className="mt-[35px] md:mt-[54px]">
              <div className="w-[142.69px] h-[117.23px] md:w-[258px] md:h-[255px] bg-gray-200 rounded-[20px] animate-pulse"></div>
            </div>
          </div>

          {/* Category Skeleton */}
          <div>
            <div className="h-[20px] md:h-[35px] bg-gray-200 rounded animate-pulse w-[100px] md:w-[150px] mb-2"></div>
            <div className="h-[38px] md:h-[80px] bg-gray-200 rounded-[10px] animate-pulse"></div>
          </div>

          {/* Description Editor Skeleton */}
          <div>
            <div className="h-[20px] md:h-[35px] bg-gray-200 rounded animate-pulse w-[120px] md:w-[180px] mb-2"></div>
            <div className="h-[200px] md:h-[300px] bg-gray-200 rounded-[10px] animate-pulse"></div>
          </div>

          {/* Keywords Skeleton */}
          <div>
            <div className="h-[20px] md:h-[35px] bg-gray-200 rounded animate-pulse w-[250px] md:w-[350px] mb-2"></div>
            <div className="h-[231px] bg-gray-200 rounded-[10px] animate-pulse"></div>
          </div>

          {/* Sizes Skeleton */}
          <div>
            <div className="h-[20px] md:h-[35px] bg-gray-200 rounded animate-pulse w-[150px] md:w-[220px] mb-2"></div>
            <div className="h-[38px] md:h-[80px] bg-gray-200 rounded-[10px] animate-pulse"></div>
          </div>

          {/* Colors Skeleton */}
          <div>
            <div className="h-[20px] md:h-[35px] bg-gray-200 rounded animate-pulse w-[140px] md:w-[200px] mb-2"></div>
            <div className="h-[38px] md:h-[80px] bg-gray-200 rounded-[10px] animate-pulse w-[168px] md:w-1/2"></div>
          </div>

          {/* Action Buttons Skeleton */}
          <div className="flex justify-end gap-3 md:gap-6">
            <div className="w-[168px] md:w-[278px] h-[38px] md:h-[62px] bg-gray-200 rounded-[15px] animate-pulse"></div>
            <div className="w-[168px] md:w-[278px] h-[38px] md:h-[62px] bg-gray-200 rounded-[15px] animate-pulse"></div>
          </div>
        </div>
      ) : (
        <>
          {/* Mobile: smaller heading sizes; Desktop unchanged */}
          <h1 className="text-[24px] md:text-[40px] font-bold text-black  md:[-mb-2] -mb-4     text-left w-full md:py-0 py-2  max-w-[736px]">
            {isEditMode ? 'Edit Product' : 'Add New Products'}
          </h1>
          <div className="text-[#949494] text-[14px] md:text-[20px] w-full text-left mb-4 md:mb-6  max-w-[736px]">
            Manage Products &gt; {isEditMode ? 'Edit Product' : 'Add Products'}
          </div>
          
          {/* Title */}
          {/* Mobile responsive: label/input smaller per ; Desktop sizes preserved */}
          <div className="w-full max-w-[736px] mb-4 md:mb-6">
            <label className="block text-[17px] md:text-[35px] font-semibold text-black mb-2">Product Title</label>
            <input
              value={form.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className="w-full h-[38px] md:h-[80px] rounded-[10px] shadow-[2px_3px_4px_rgba(46,204,113,0.25)] border border-[#E2E0E0] px-4 text-[14px] md:text-[30px]"
              placeholder="Nokia 4G Mobile - 64 GB"
            />
            {errors.title && <p className="text-red-500 text-xs md:text-sm mt-1">{errors.title}</p>}
          </div>

      {/* Price and Stock row */}
      {/* Mobile responsive: keep two inputs in one row at 168px  */}
      <div className="w-full max-w-[736px] grid grid-cols-2 gap-3 md:gap-6 mb-2">
        <div>
          <label className="block text-[17px] md:text-[35px] font-semibold text-black mb-2">Price (PKR)</label>
          <input
            value={form.price}
            onChange={(e) => handlePriceInput(e.target.value)}
            className="w-full h-[38px] md:h-[80px] rounded-[10px] shadow-[2px_3px_4px_rgba(46,204,113,0.25)] border border-[#E2E0E0] px-4 text-[14px] md:text-[30px]"
            placeholder="45,000"
          />
          {errors.price && <p className="text-red-500 text-xs md:text-sm mt-1">{errors.price}</p>}
        </div>
        <div>
          <label className="block text-[17px] md:text-[35px] font-semibold text-black mb-2">Stock</label>
          <input
            value={form.stock}
            onChange={(e) => handleStockInput(e.target.value)}
            disabled={form.unlimitedStock}
            className={`w-full h-[38px] md:h-[80px] rounded-[10px] shadow-[2px_3px_4px_rgba(46,204,113,0.25)] border border-[#E2E0E0] px-4 text-[14px] md:text-[30px] ${
              form.unlimitedStock ? 'bg-gray-100 cursor-not-allowed opacity-60' : ''
            }`}
            placeholder={form.unlimitedStock ? 'Unlimited' : '50'}
          />
          {!form.unlimitedStock && errors.stock && <p className="text-red-500 text-xs md:text-sm mt-1">{errors.stock}</p>}
        </div>
      </div>

      {/* Discount + Unlimited Stock  */}
      {/* Mobile responsive: two-column row with compact heights */}
      <div className="w-full max-w-[736px] grid grid-cols-2 gap-3 md:grid-cols-2 md:gap-6 mb-6 md:mb-8">
        <div className="max-w-full md:max-w-[372px]">
          <div className="flex items-center gap-2 md:gap-3 mb-2">
            <label className="block text-[17px] md:text-[35px] font-semibold text-black">Discount</label>
            <span className="hidden  md:inline   md:text-[13px] text-[#949494]">(Must be higher than product price)</span>
          </div>
          <input
            value={form.discount}
            onChange={(e) => handleDiscountInput(e.target.value)}
            className="w-full h-[38px] md:h-[80px] rounded-[10px] shadow-[2px_3px_4px_rgba(46,204,113,0.25)] border border-[#E2E0E0] px-4 text-[12px] md:text-[25px]"
            placeholder="Optional"
          />
          {errors.discount && <p className="text-red-500 text-xs md:text-sm mt-1">{errors.discount}</p>}
        </div>
        <div className="flex items-center justify-center gap-3 md:gap-4 md:mt-16 mt-6" style={{ height: 60 }}>

        <button
            type="button"
            className="relative md:w-[49px] md:h-[27px] w-[36px] h-[20px] rounded-[25px]  "
            style={{ backgroundColor: form.unlimitedStock ? '#2ECC71' : '#B8B1B1' }}
            onClick={handleToggleUnlimitedStock}
          >
            <span
              className="absolute   top-[3px] md:w-[23px] md:h-[22px] w-[15px] h-[15px] rounded-full bg-white transition-all "
              style={{ left: form.unlimitedStock ? 23 : 3 }}
            />
          </button>
          <div className="text-[14px] md:text-[35px] text-[#B8B1B1]">Unlimited Stock</div>
      
        </div>
      </div>

  
      {/* Upload Images  - same line with preview */}
      {/* Mobile responsive: keep upload box and preview */}
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
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => {
                  const list = Array.from(e.target.files || []);
                  handleChange('images', list);
                  handleImmediateUpload(list, 'image');
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
          </div>
          {errors.images && <p className="text-red-500 text-xs md:text-sm mt-1">{errors.images}</p>}
        </div>

        {/* Preview card */}
        <div className="mt-[35px] md:mt-[54px]">
          {uploadingImages && imagePreviews.length === 0 ? (
            <div className="w-[142.69px] h-[117.23px] md:w-[258px] md:h-[255px] rounded-[20px] border border-dashed border-gray-300 flex items-center justify-center text-gray-400">
              <div className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" /> Uploading…</div>
            </div>
          ) : (
            <ImagePreviewCard
              urls={imagePreviews.map((p) => p.url)}
              index={imageIdx}
              setIndex={(updater) => setImageIdx((i) => updater(i))}
            />
          )}
        </div>
      </div>

      {/* Upload Video  - same line with preview */}
      {/* Mobile responsive: keep upload box and preview  */}
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
              <input
                type="file"
                multiple
                accept="video/*"
                onChange={(e) => {
                  const list = Array.from(e.target.files || []);
                  handleChange('videos', list);
                  handleImmediateUpload(list, 'video');
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Preview card (dummy placeholder if empty) */}
        <div className="mt-[35px] md:mt-[54px]">
          <div
            className="w-[142.69px] h-[117.23px] md:w-[258px] md:h-[255px] rounded-[20px] relative flex items-center justify-center"
          >
            {uploadingVideos && videoPreviews.length === 0 ? (
              <div className="w-full h-full rounded-[20px] border border-dashed border-gray-300 flex items-center justify-center text-gray-400">
                <div className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" /> Uploading…</div>
              </div>
            ) : (
              <VideoPreviewCard
                urls={videoPreviews.map((p) => p.url)}
                index={videoIdx}
                setIndex={(updater) => setVideoIdx((i) => updater(i))}
              />
            )}
          </div>
        </div>
      </div>

      

      {/* Category  */}
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
        {errors.categoryPath && <p className="text-red-500 text-xs md:text-sm mt-1">{errors.categoryPath}</p>}
      </div>

      {/* Mobile responsive: smaller editor height */}
      <ProductDescription
        value={form.description}
        onChange={(val) => handleChange('description', val)}
        className="w-full max-w-[736px] mb-8 md:mb-10"
      />
      {errors.description && <p className="text-red-500 text-xs md:text-sm -mt-8 mb-8 md:mb-10">{errors.description}</p>}

      {/* Keywords Related Products */}
      {/* Exact dimensions: 736px width, 231px height */}
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
      {/* Mobile responsive: sizes and colors in two columns  */}
      <div className="w-full max-w-[736px] mb-8 md:mb-10">
        <label className="block text-[17px] md:text-[35px] font-semibold text-black mb-2">Enter Product Size</label>
        
        {/* Standard size quick-select buttons */}
        <div className="mb-3 flex flex-wrap gap-2">
          {['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'].map((stdSize) => (
            <button
              key={stdSize}
              type="button"
              onClick={() => addSize(stdSize)}
              disabled={form.sizes.includes(stdSize)}
              className={`px-3 py-1.5 md:px-4 md:py-2 rounded-full border text-xs md:text-sm font-medium transition-colors ${
                form.sizes.includes(stdSize)
                  ? 'bg-[#2ECC71] text-white border-[#2ECC71] cursor-not-allowed'
                  : 'bg-white text-black border-[#E2E0E0] hover:border-[#2ECC71] hover:text-[#2ECC71]'
              }`}
            >
              {stdSize}
            </button>
          ))}
        </div>

        {/* Custom size input */}
        <input
          className="w-full h-[38px] md:h-[80px] rounded-[10px] shadow-[2px_3px_4px_rgba(46,204,113,0.25)] border border-[#E2E0E0] px-4 text-[12px] md:text-[25px]"
          placeholder="Or enter custom size (e.g., 28, 30, 32)"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              const value = (e.target as HTMLInputElement).value.trim().toUpperCase();
              if (value) {
                addSize(value);
                (e.target as HTMLInputElement).value = '';
              }
            }
          }}
          onBlur={(e) => {
            const input = e.target as HTMLInputElement;
            const value = input.value.trim().toUpperCase();
            if (value) {
              addSize(value);
              input.value = '';
            }
          }}
        />
        {form.sizes.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {form.sizes.map((s, idx) => (
              <span 
                key={idx} 
                className="px-3 py-1 rounded-full border text-sm bg-gray-50 flex items-center gap-2"
              >
                {s}
                <button
                  type="button"
                  onClick={() => {
                    setForm((prev) => ({
                      ...prev,
                      sizes: prev.sizes.filter((_, i) => i !== idx),
                    }));
                  }}
                  className="text-red-500 hover:text-red-700 ml-1"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Select Color - modular component */}
      {/* Mobile responsive: color picker field width 168px */}
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
          className="w-[168px] md:w-[278px] h-[38px] md:h-[62px] rounded-[15px] text-white text-[16px] md:text-[30px] font-bold disabled:opacity-60"
          style={{ backgroundColor: '#B8B1B1' }}
          onClick={() => handleSubmit('draft')}
          disabled={isSubmitting || isLoadingProduct}
        >
          {isSubmitting ? (isEditMode ? 'Updating...' : 'Saving...') : (isEditMode ? 'Update Draft' : 'Save as draft')}
        </button>
        <button
          type="button"
          className="w-[168px] md:w-[278px] h-[38px] md:h-[62px] rounded-[15px] text-white text-[16px] md:text-[30px] font-bold disabled:opacity-60"
          style={{ backgroundColor: '#2ECC71' }}
          onClick={() => handleSubmit('publish')}
          disabled={isSubmitting || isLoadingProduct}
        >
          {isSubmitting ? (isEditMode ? 'Updating...' : 'Publishing...') : (isEditMode ? 'Update & Publish' : 'Publish Products')}
        </button>
      </div>
        </>
      )}
    </SellerScaffold>
  );
};

export default AddProduct;


