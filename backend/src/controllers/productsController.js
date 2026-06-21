import path from 'path';
import mongoose from 'mongoose';
import { Product } from '../models/Product.js';
import { SellerSettings } from '../models/SellerSettings.js';
import { Review } from '../models/Review.js';
import { httpError } from '../middleware/errors.js';
import { configureCloudinary, uploadToCloudinary, uploadBufferToCloudinary } from '../utils/cloudinary.js';

const clampPercentage = (value) => {
  const pct = Number(value) || 0;
  return Math.min(Math.max(pct, 0), 100);
};

const calculateFinalPrice = (price, discount) => {
  const basePrice = Number(price) || 0;
  const pct = clampPercentage(discount);
  const discounted = Math.round(basePrice * (1 - pct / 100));
  return pct >= 100 ? 0 : Math.max(discounted, 0);
};

// Calculate stock status (Daraz/Amazon style - shows status instead of exact count)
const calculateStockStatus = (product) => {
  if (product.unlimitedStock) {
    return 'unlimited';
  }
  const stock = Number(product.stock) || 0;
  const lowStockThreshold = Number(product.lowStockThreshold) || 10;
  
  if (stock === 0) {
    return 'out_of_stock';
  } else if (stock <= lowStockThreshold) {
    return 'low_stock';
  } else {
    return 'in_stock';
  }
};

// Create a new product
export async function createProduct(req, res, next) {
  try {
    configureCloudinary();
    const body = req.body || {};
    const files = req.files || {};
    const sellerId = req.user?.id;

    if (!sellerId) {
      return next(httpError(401, 'Unauthorized'));
    }

    // Process sizes array
    let sizes = [];
    Object.keys(body)
      .filter((k) => k.startsWith('sizes['))
      .sort()
      .forEach((k) => {
        const size = String(body[k] || '').trim();
        if (size) sizes.push(size);
      });
    if (sizes.length === 0) {
      const rawSizes = body.sizesJson ?? body.sizes;
      if (rawSizes) {
        try {
          const parsed = typeof rawSizes === 'string' ? JSON.parse(rawSizes) : rawSizes;
          if (Array.isArray(parsed)) {
            sizes = parsed.map((s) => String(s || '').trim()).filter(Boolean);
          }
        } catch (err) {
          console.warn('Failed to parse sizes payload', err.message);
        }
      }
    }

    // Process colors array
    const colorIndexes = new Set(
      Object.keys(body)
        .filter((k) => k.startsWith('colors[') && k.endsWith('][name]'))
        .map((k) => (k.match(/colors\[(\d+)\]/) || [])[1])
        .filter(Boolean)
    );
    let colors = Array.from(colorIndexes)
      .sort((a, b) => Number(a) - Number(b))
      .map((idx) => {
        const name = String(body[`colors[${idx}][name]`] || '').trim();
        const hex = String(body[`colors[${idx}][hex]`] || '').trim();
        if (!name) return null;
        return { name, hex: hex || undefined };
      })
      .filter(Boolean);

    if (colors.length === 0) {
      const rawColors = body.colorsJson ?? body.colors;
      if (rawColors) {
        try {
          const parsed = typeof rawColors === 'string' ? JSON.parse(rawColors) : rawColors;
          if (Array.isArray(parsed)) {
            colors = parsed
              .map((c) => {
                if (!c) return null;
                const name = String(c.name || c.hex || '').trim();
                const hex = String(c.hex || '').trim();
                if (!name) return null;
                return { name, hex: hex || undefined };
              })
              .filter(Boolean);
          }
        } catch (err) {
          console.warn('Failed to parse colors payload', err.message);
        }
      }
    }

    // Process keywords
    const keywords = body.keywords
      ? String(body.keywords)
          .split(',')
          .map((k) => k.trim().toLowerCase())
          .filter(Boolean)
      : [];

    // Accept pre-uploaded URLs if provided in multiple formats
    // Supported formats:
    // - Indexed keys: imageUrls[0]=..., videoUrls[0]=...
    // - Array style: imageUrls[]=..., videoUrls[]=...
    // - Plain field: imageUrls=comma,separated or JSON array, same for videoUrls
    const bodyImageUrlKeys = Object.keys(body).filter((k) => k.startsWith('imageUrls['));
    const bodyVideoUrlKeys = Object.keys(body).filter((k) => k.startsWith('videoUrls['));

    const fromIndexed = (keys, prefix) =>
      keys
        .sort()
        .map((k) => String(body[k] || '').trim())
        .filter(Boolean);

    const coerceUrls = (val) => {
      if (!val) return [];
      if (Array.isArray(val)) return val.map((v) => String(v).trim()).filter(Boolean);
      const s = String(val).trim();
      if (!s) return [];
      // Try JSON array
      if ((s.startsWith('[') && s.endsWith(']')) || (s.startsWith('"') && s.endsWith('"'))) {
        try {
          const parsed = JSON.parse(s);
          return Array.isArray(parsed)
            ? parsed.map((v) => String(v).trim()).filter(Boolean)
            : [String(parsed).trim()].filter(Boolean);
        } catch {}
      }
      // Fallback: comma separated
      if (s.includes(',')) return s.split(',').map((v) => v.trim()).filter(Boolean);
      // Single URL
      return [s];
    };

    let images = fromIndexed(bodyImageUrlKeys, 'imageUrls');
    let videos = fromIndexed(bodyVideoUrlKeys, 'videoUrls');

    // array style fields
    if (images.length === 0 && (body['imageUrls[]'] !== undefined)) {
      images = coerceUrls(body['imageUrls[]']);
    }
    if (videos.length === 0 && (body['videoUrls[]'] !== undefined)) {
      videos = coerceUrls(body['videoUrls[]']);
    }

    // plain fields
    if (images.length === 0 && (body.imageUrls !== undefined)) {
      images = coerceUrls(body.imageUrls);
    }
    if (videos.length === 0 && (body.videoUrls !== undefined)) {
      videos = coerceUrls(body.videoUrls);
    }

    // If not pre-uploaded, upload media to Cloudinary (parallel for speed)
    if (images.length === 0 || videos.length === 0) {
      const imageFiles = Array.isArray(files.images) ? files.images : files.images ? [files.images] : [];
      const videoFiles = Array.isArray(files.videos) ? files.videos : files.videos ? [files.videos] : [];

      const [uploadedImages, uploadedVideos] = await Promise.all([
        images.length > 0
          ? Promise.resolve(images)
          : Promise.all(
              imageFiles.map(async (file) => {
                try {
                  if (file.buffer) {
                    const res = await uploadBufferToCloudinary(file.buffer, 'carriya/products', undefined, 'auto');
                    return res.secure_url || null;
                  }
                  return await uploadToCloudinary(file.path, 'products');
                } catch (err) {
                  console.warn('Failed to upload image:', file.originalname, err.message);
                  return null;
                }
              })
            ).then((arr) => arr.filter(Boolean)),
        videos.length > 0
          ? Promise.resolve(videos)
          : Promise.all(
              videoFiles.map(async (file) => {
                try {
                  if (file.buffer) {
                    const res = await uploadBufferToCloudinary(file.buffer, 'carriya/products', undefined, 'video');
                    return res.secure_url || null;
                  }
                  return await uploadToCloudinary(file.path, 'products');
                } catch (err) {
                  console.warn('Failed to upload video:', file.originalname, err.message);
                  return null;
                }
              })
            ).then((arr) => arr.filter(Boolean)),
      ]);
      images = uploadedImages;
      videos = uploadedVideos;
    }

    // Require at least one image only when publishing
    if (images.length === 0 && String(body.action || 'draft') === 'publish') {
      return next(httpError(422, 'Validation failed', { images: 'At least one image is required' }));
    }

    const price = Number(body.price || 0);
    if (price <= 0) {
      return next(httpError(422, 'Validation failed', { price: 'Price must be greater than 0' }));
    }

    const stock = Number(body.stock || 0);
    const discount = clampPercentage(body.discount ? Number(body.discount) : 0);
    const unlimitedStock = String(body.unlimitedStock) === 'true';

    const action = String(body.action || 'draft');
    const isPublished = action === 'publish';

    const finalPrice = calculateFinalPrice(price, discount);

    const productData = {
      sellerId,
      title: String(body.title || '').trim(),
      description: String(body.description || '').trim(),
      categoryPath: String(body.categoryPath || '').trim(),
      price,
      discount,
      stock: unlimitedStock ? 0 : Math.max(0, stock),
      unlimitedStock,
      sizes,
      colors,
      images,
      videos,
      thumbnailUrl: images[0],
      keywords,
      status: action === 'publish' ? 'active' : 'draft',
      isPublished,
    };

    const product = await Product.create(productData);
    res.status(201).json({
      id: product._id.toString(),
      slug: product.slug,
      message: 'Product created successfully',
      price,
      discount,
      finalPrice,
    });
  } catch (e) {
    if (e.name === 'ValidationError') {
      const fieldErrors = {};
      Object.keys(e.errors || {}).forEach((key) => {
        fieldErrors[key] = e.errors[key].message;
      });
      return next(httpError(422, 'Validation failed', fieldErrors));
    }
    next(e);
  }
}

// List seller's products with filtering and pagination
export async function listSellerProducts(req, res, next) {
  try {
    const sellerId = req.user?.id;
    if (!sellerId) {
      return next(httpError(401, 'Unauthorized'));
    }

    const page = Math.max(1, Number(req.query.page || 1));
    const pageSize = Math.min(50, Math.max(1, Number(req.query.pageSize || 10)));
    const status = String(req.query.status || 'all');

    const query = { sellerId };
    if (status === 'low_stock') {
      // Low stock: unlimitedStock is false AND (stock <= lowStockThreshold OR stock = 0)
      // Include both active products with low stock AND out of stock products
      query.unlimitedStock = false;
      // Don't filter by status here - we'll include both 'active' and 'out_of_stock' products
      // We'll filter by stock in the aggregation pipeline
      // console.log('[Low Stock] Query - sellerId:', sellerId, 'unlimitedStock: false, including active and out_of_stock');
    } else if (status !== 'all') {
      query.status = status;
    }

    // For low stock, we need to filter by stock threshold
    let products;
    let total;
    if (status === 'low_stock') {
      // First, let's check what products exist for this seller
      const allSellerProducts = await Product.find({ sellerId })
        .select('title stock status unlimitedStock lowStockThreshold isPublished')
        .lean();
      
      // console.log('[Low Stock] All seller products:', allSellerProducts.length);
      // console.log('[Low Stock] Products breakdown:', {
      //   total: allSellerProducts.length,
      //   active: allSellerProducts.filter(p => p.status === 'active').length,
      //   draft: allSellerProducts.filter(p => p.status === 'draft').length,
      //   unlimited: allSellerProducts.filter(p => p.unlimitedStock === true).length,
      //   withStock: allSellerProducts.filter(p => !p.unlimitedStock && p.stock > 0).length,
      //   lowStock: allSellerProducts.filter(p => 
      //     !p.unlimitedStock && 
      //     p.stock <= (p.lowStockThreshold || 10) && 
      //     p.status === 'active'
      //   ).length
      // });
      
      // Log each product's details
      allSellerProducts.forEach(p => {
        const threshold = p.lowStockThreshold || 10;
        const isLowStock = !p.unlimitedStock && p.stock <= threshold && p.status === 'active';
        // console.log(`[Low Stock] Product: "${p.title}" - Stock: ${p.stock}, Status: ${p.status}, Unlimited: ${p.unlimitedStock}, Threshold: ${threshold}, IsLowStock: ${isLowStock}`);
      });

      // Use MongoDB aggregation to filter by lowStockThreshold efficiently
      // This handles per-product thresholds (if set) or defaults to 10
      // Include products with stock = 0 (out of stock) OR stock <= threshold (low stock)
      try {
        const aggregationPipeline = [
          { $match: query },
          {
            $addFields: {
              threshold: { $ifNull: ['$lowStockThreshold', 10] }
            }
          },
          {
            $match: {
              $expr: {
                $or: [
                  { $eq: ['$stock', 0] }, // Include out of stock products
                  { $lte: ['$stock', '$threshold'] } // Include low stock products
                ]
              }
            }
          },
          { $sort: { createdAt: -1 } },
          {
            $facet: {
              total: [{ $count: 'count' }],
              items: [
                { $skip: (page - 1) * pageSize },
                { $limit: pageSize },
                {
                  $project: {
                    _id: 1,
                    title: 1,
                    price: 1,
                    stock: 1,
                    discount: 1,
                    status: 1,
                    thumbnailUrl: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    salesCount: 1,
                    views: 1,
                    isPublished: 1,
                    unlimitedStock: 1,
                    lowStockThreshold: 1,
                    slug: 1
                  }
                }
              ]
            }
          }
        ];

        // console.log('[Low Stock] Aggregation pipeline query - sellerId:', sellerId, 'unlimitedStock: false, status: active');
        const result = await Product.aggregate(aggregationPipeline);
        total = result[0]?.total[0]?.count || 0;
        products = result[0]?.items || [];
        // console.log('[Low Stock] Aggregation result - Total:', total, 'Products found:', products.length);
        // if (products.length > 0) {
        //   console.log('[Low Stock] Sample product IDs:', products.map(p => p._id.toString()));
        // }
      } catch (aggError) {
        console.error('Aggregation error for low stock:', aggError);
        // Fallback to simpler query if aggregation fails
        const allProducts = await Product.find(query)
          .select('title price stock discount status thumbnailUrl createdAt updatedAt salesCount views isPublished unlimitedStock lowStockThreshold slug')
          .lean();
        
        const filteredProducts = allProducts.filter(p => {
          if (p.unlimitedStock) return false;
          const threshold = p.lowStockThreshold || 10;
          // Include products with stock = 0 (out of stock) OR stock <= threshold (low stock)
          return p.stock === 0 || p.stock <= threshold;
        });
        
        total = filteredProducts.length;
        products = filteredProducts
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice((page - 1) * pageSize, page * pageSize);
        // console.log('[Low Stock] Fallback query - Total:', total, 'Products found:', products.length);
      }
      
      // If aggregation returned 0 but we know there should be products, use fallback
      if (total === 0 && allSellerProducts.filter(p => {
        if (p.unlimitedStock) return false;
        const threshold = p.lowStockThreshold || 10;
        // Include products with stock = 0 (out of stock) OR stock <= threshold (low stock)
        return p.stock === 0 || p.stock <= threshold;
      }).length > 0) {
        // console.log('[Low Stock] Aggregation returned 0 but products exist, using fallback query');
        const allProducts = await Product.find(query)
          .select('title price stock discount status thumbnailUrl createdAt updatedAt salesCount views isPublished unlimitedStock lowStockThreshold slug')
          .lean();
        
        const filteredProducts = allProducts.filter(p => {
          if (p.unlimitedStock) return false;
          const threshold = p.lowStockThreshold || 10;
          // Include products with stock = 0 (out of stock) OR stock <= threshold (low stock)
          return p.stock === 0 || p.stock <= threshold;
        });
        
        total = filteredProducts.length;
        products = filteredProducts
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice((page - 1) * pageSize, page * pageSize);
        // console.log('[Low Stock] Fallback query result - Total:', total, 'Products found:', products.length);
      }
    } else {
      total = await Product.countDocuments(query);
      products = await Product.find(query)
        .select('title price stock discount status thumbnailUrl createdAt updatedAt salesCount views isPublished unlimitedStock slug')
        .sort({ createdAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean();
    }

    res.json({
      items: products.map((p) => {
        const currentPrice = calculateFinalPrice(p.price, p.discount);
        // Amazon/Daraz style: Use slug as primary identifier, not raw database ID
        // Security: Slug is already public (in URLs), but authorization is enforced on all operations
        // - Delete/Edit require authentication + ownership verification (sellerId check)
        // - Routes are protected with requireAuth + requireRole('seller')
        // - Double verification: query filter + explicit ownership check
        return {
          id: p.slug || String(p._id || ''), // Primary identifier: slug (user-friendly, Amazon/Daraz style)
          title: p.title || '',
          price: Number(p.price) || 0,
          currentPrice: Number(currentPrice) || 0, // Price after discount (Daraz/Amazon style)
          stock: Number(p.stock) || 0,
          discount: Number(p.discount) || 0,
          status: p.status || 'draft',
          thumbnailUrl: p.thumbnailUrl || undefined,
          unlimitedStock: Boolean(p.unlimitedStock),
          // Analytics fields (useful for seller dashboard - Amazon/Daraz also show these)
          salesCount: Number(p.salesCount) || 0,
          views: Number(p.views) || 0,
          isPublished: Boolean(p.isPublished),
          // Note: Removed 'finalPrice' (redundant with currentPrice)
        };
      }),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (e) {
    next(e);
  }
}

// Get single product by ID or slug
export async function getProduct(req, res, next) {
  try {
    const { productId } = req.params;
    const isSlug = !productId.match(/^[0-9a-fA-F]{24}$/);
    const authUserId = req.user?.id; // Authenticated user (could be buyer or seller)
    const authUserRole = req.user?.role; // 'seller' | 'buyer' | 'admin' | undefined
    const isSellerRoute = typeof req.originalUrl === 'string' && req.originalUrl.includes('/seller/products/');

    let product;
    if (isSlug) {
      // Slug lookup - handle both public and seller routes
      if (isSellerRoute) {
        // Seller route: allow viewing own product (including drafts), enforce ownership
        const isAuthenticatedSeller = !!authUserId && authUserRole === 'seller';
        if (!isAuthenticatedSeller) {
          return next(httpError(403, 'Forbidden'));
        }
        
        // Lookup by slug for seller's own products (including drafts)
        product = await Product.findOne({
          $or: [{ slug: productId }, { slugHistory: productId }],
          sellerId: authUserId, // Ensure ownership
        })
          .populate('sellerId', 'firstName lastName')
          .lean();
        
        // Verify ownership (double-check)
        if (product) {
          const productSellerId = product.sellerId?._id?.toString() || product.sellerId?.toString() || String(product.sellerId);
          if (productSellerId !== String(authUserId)) {
            return next(httpError(403, 'You can only view your own products'));
          }
        }
      } else {
        // Public route: only published active products
        product = await Product.findOne({
          isPublished: true,
          status: 'active',
          $or: [{ slug: productId }, { slugHistory: productId }],
        })
          .populate('sellerId', 'firstName lastName')
          .lean();
      }
    } else {
      // ObjectId lookup
      // Professional rule:
      // - Public route (/api/products/:id): always restrict to published active products (regardless of who is logged in)
      // - Seller route (/api/seller/products/:id): allow viewing own product (including drafts), enforce ownership
      const query = { _id: productId };
      if (!isSellerRoute) {
        // Public route → public visibility only
        query.isPublished = true;
        query.status = 'active';
      }
      product = await Product.findOne(query)
        .populate('sellerId', 'firstName lastName')
        .lean();
      
      // If seller route, verify ownership
      if (product && isSellerRoute) {
        const isAuthenticatedSeller = !!authUserId && authUserRole === 'seller';
        if (!isAuthenticatedSeller) {
          return next(httpError(403, 'Forbidden'));
        }
        const productSellerId = product.sellerId?._id?.toString() || product.sellerId?.toString() || String(product.sellerId);
        if (productSellerId !== String(authUserId)) {
          return next(httpError(403, 'You can only view your own products'));
        }
      }
    }

    if (!product) {
      return next(httpError(404, 'Product not found'));
    }

    const sellerObjectId =
      product.sellerId && typeof product.sellerId === 'object' && product.sellerId !== null
        ? product.sellerId._id || product.sellerId.id
        : product.sellerId;

    const sellerIdString =
      sellerObjectId && typeof sellerObjectId.toString === 'function'
        ? sellerObjectId.toString()
        : sellerObjectId
        ? String(sellerObjectId)
        : undefined;

    let sellerSettings = sellerObjectId
      ? await SellerSettings.findOne({ sellerId: sellerObjectId })
          .select('sellerCode storeSlug storeName')
          .lean()
      : null;

    // Auto-generate sellerCode if missing (on-the-fly migration)
    if (sellerSettings && !sellerSettings.sellerCode) {
      try {
        const code = await SellerSettings.generateSellerCode(sellerSettings._id);
        await SellerSettings.findByIdAndUpdate(sellerSettings._id, { $set: { sellerCode: code } });
        sellerSettings.sellerCode = code;
      } catch (err) {
        console.warn(`Failed to generate sellerCode for ${sellerSettings._id}:`, err.message);
      }
    }

    // Increment views for published products
    if (product.isPublished && product.status === 'active') {
      await Product.updateOne({ _id: product._id }, { $inc: { views: 1 } });
      product.views = (product.views || 0) + 1;
    }

    // Sync reviewCount with actual approved reviews count (ensures accuracy)
    const actualReviewCount = await Review.countDocuments({
      productId: product._id,
      status: 'approved',
    });
    
    // Update product.reviewCount if it's out of sync (only if different)
    if (actualReviewCount !== (product.reviewCount || 0)) {
      // Use findByIdAndUpdate to update without converting to full document
      await Product.findByIdAndUpdate(product._id, { 
        reviewCount: actualReviewCount 
      });
      product.reviewCount = actualReviewCount;
    }

    // Calculate current price (discount already applied in pre-save hook if originalPrice exists)
    const currentPrice = calculateFinalPrice(product.price, product.discount);
    const originalPrice = product.discount > 0 ? product.price : undefined;

    res.set('Cache-Control', 'public, max-age=60, s-maxage=300');
    if (isSlug && product.slug && product.slug !== productId) {
      res.set('X-Canonical-Product-Slug', product.slug);
    }
    
    // Build response object
    const response = {
      // Public-facing product identifier: use slug instead of raw database _id
      id: product.slug || product._id.toString(),
      sellerCode: sellerSettings?.sellerCode, // Public seller code (Daraz/Amazon style) - replaces raw sellerId
      sellerSlug: sellerSettings?.storeSlug,
      storeName: sellerSettings?.storeName || undefined,
      sellerName: product.sellerId
        ? `${product.sellerId.firstName || ''} ${product.sellerId.lastName || ''}`.trim()
        : 'Unknown',
      title: product.title,
      description: product.description,
      categoryPath: product.categoryPath,
      price: product.price, // Original price
      originalPrice,
      currentPrice, // Price after discount (Daraz/Amazon style)
      discount: product.discount,
      // Stock status (Daraz/Amazon style - shows status instead of exact count for public)
      stockStatus: calculateStockStatus(product),
      sizes: product.sizes || [],
      colors: product.colors || [],
      images: product.images || [],
      videos: product.videos || [],
      thumbnailUrl: product.thumbnailUrl,
      isAvailable: (product.status === 'active' && product.isPublished && (product.unlimitedStock || product.stock > 0)),
      rating: product.rating || 0,
      reviewCount: product.reviewCount || 0,
      salesCount: product.salesCount || 0, // Sales count (public - users can see how popular a product is)
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
    
    // Include internal fields only for seller/admin routes (they need to manage their products)
    if (isSellerRoute) {
      response.stock = product.stock || 0;
      response.unlimitedStock = product.unlimitedStock;
      response.slug = product.slug;
      response.status = product.status;
      response.isPublished = product.isPublished;
      response.views = product.views || 0;
      response.keywords = product.keywords || [];
      // Note: salesCount is already included in public response above
    }
    
    // Note: Removed from public API (Daraz/Amazon style):
    // - unlimitedStock (internal flag)
    // - slug (redundant with id)
    // - finalPrice (redundant with currentPrice)
    // - status, isPublished (internal product state)
    // - views (internal analytics)
    // - keywords (internal SEO data)
    
    res.json(response);
  } catch (e) {
    next(e);
  }
}

// Update product
export async function updateProduct(req, res, next) {
  try {
    const { productId } = req.params;
    const sellerId = req.user?.id;
    const body = req.body || {};
    const files = req.files || {};

    if (!productId) {
      return next(httpError(400, 'Product identifier is required'));
    }

    if (!sellerId) {
      return next(httpError(401, 'Unauthorized'));
    }

    // Support both slug and ObjectId (Amazon/Daraz style - use slug as primary identifier)
    // Security: Authorization is enforced at multiple levels:
    // 1. Route level: requireAuth + requireRole('seller') middleware
    // 2. Query level: Filter by sellerId in database query
    // 3. Application level: Explicit ownership verification
    const isObjectId = mongoose.Types.ObjectId.isValid(productId);
    let product;
    if (isObjectId) {
      product = await Product.findById(productId);
    } else {
      // Lookup by slug (seller's own products only, including drafts)
      // Security: Query includes sellerId filter to prevent unauthorized access
      product = await Product.findOne({ 
        slug: productId,
        sellerId: sellerId // First layer: Database-level ownership filter
      });
    }

    if (!product) {
      // Don't reveal if product exists but user doesn't own it (security best practice)
      return next(httpError(404, 'Product not found'));
    }

    // Second layer: Application-level ownership verification (defense in depth)
    if (String(product.sellerId) !== String(sellerId)) {
      return next(httpError(403, 'Forbidden: You can only update your own products'));
    }

    // Process sizes if provided
    if (body.sizes !== undefined || body.sizesJson !== undefined) {
      let sizes = [];
      Object.keys(body)
        .filter((k) => k.startsWith('sizes['))
        .sort()
        .forEach((k) => {
          const size = String(body[k] || '').trim();
          if (size) sizes.push(size);
        });
      if (sizes.length === 0) {
        const rawSizes = body.sizesJson ?? body.sizes;
        if (rawSizes) {
          try {
            const parsed = typeof rawSizes === 'string' ? JSON.parse(rawSizes) : rawSizes;
            if (Array.isArray(parsed)) {
              sizes = parsed.map((s) => String(s || '').trim()).filter(Boolean);
            }
          } catch (err) {
            console.warn('Failed to parse sizes payload', err.message);
          }
        }
      }
      // Update sizes if provided (even if empty array to clear sizes)
      // Check if sizes were explicitly provided
      const hasSizeIndexes = Object.keys(body).some((k) => k.startsWith('sizes['));
      const hasSizesJson = body.sizesJson !== undefined;
      const hasSizesField = body.sizes !== undefined;
      
      if (hasSizeIndexes || hasSizesJson || hasSizesField) {
        product.sizes = sizes;
      }
    }

    // Process colors if provided - check for indexed keys or JSON fallback
    const colorIndexes = new Set(
      Object.keys(body)
        .filter((k) => k.startsWith('colors[') && k.endsWith('][name]'))
        .map((k) => (k.match(/colors\[(\d+)\]/) || [])[1])
        .filter(Boolean)
    );
    
    let colors = [];
    if (colorIndexes.size > 0) {
      // Parse from indexed FormData fields
      colors = Array.from(colorIndexes)
        .sort((a, b) => Number(a) - Number(b))
        .map((idx) => {
          const name = String(body[`colors[${idx}][name]`] || '').trim();
          const hex = String(body[`colors[${idx}][hex]`] || '').trim();
          if (!name) return null;
          return { name, hex: hex || undefined };
        })
        .filter(Boolean);
    } else if (body.colorsJson !== undefined) {
      // Fallback to JSON if indexed fields not found
      try {
        const parsed = typeof body.colorsJson === 'string' ? JSON.parse(body.colorsJson) : body.colorsJson;
        if (Array.isArray(parsed)) {
          colors = parsed
            .map((c) => {
              if (!c || typeof c !== 'object') return null;
              const name = String(c.name || c.hex || '').trim();
              const hex = String(c.hex || '').trim();
              if (!name) return null;
              return { name, hex: hex || undefined };
            })
            .filter(Boolean);
        }
      } catch (err) {
        console.warn('Failed to parse colorsJson payload', err.message);
      }
    } else if (body.colors !== undefined) {
      // Fallback to plain colors field
      try {
        const parsed = typeof body.colors === 'string' ? JSON.parse(body.colors) : body.colors;
        if (Array.isArray(parsed)) {
          colors = parsed
            .map((c) => {
              if (!c || typeof c !== 'object') return null;
              const name = String(c.name || c.hex || '').trim();
              const hex = String(c.hex || '').trim();
              if (!name) return null;
              return { name, hex: hex || undefined };
            })
            .filter(Boolean);
        }
      } catch (err) {
        console.warn('Failed to parse colors payload', err.message);
      }
    }
    
    // Update colors if provided (even if empty array to clear colors)
    // Check if colors were explicitly provided (not just undefined)
    const hasColorIndexes = colorIndexes.size > 0;
    const hasColorsJson = body.colorsJson !== undefined;
    const hasColorsField = body.colors !== undefined;
    
    if (hasColorIndexes || hasColorsJson || hasColorsField) {
      product.colors = colors;
    }

    // Update images - handle both new file uploads and pre-uploaded URLs
    const bodyImageUrlKeys = Object.keys(body).filter((k) => k.startsWith('imageUrls['));
    const bodyVideoUrlKeys = Object.keys(body).filter((k) => k.startsWith('videoUrls['));
    
    // Helper to extract indexed URLs
    const fromIndexed = (keys, prefix) => {
      return keys
        .map((k) => {
          const match = k.match(new RegExp(`${prefix}\\[(\\d+)\\]`));
          return match ? Number(match[1]) : null;
        })
        .filter((idx) => idx !== null)
        .sort((a, b) => a - b)
        .map((idx) => String(body[`${prefix}[${idx}]`] || '').trim())
        .filter(Boolean);
    };
    
    // Helper to coerce URLs from various formats
    const coerceUrls = (val) => {
      if (Array.isArray(val)) return val.map((v) => String(v || '').trim()).filter(Boolean);
      if (typeof val === 'string') {
        try {
          const parsed = JSON.parse(val);
          if (Array.isArray(parsed)) return parsed.map((v) => String(v || '').trim()).filter(Boolean);
        } catch {
          // Not JSON, treat as comma-separated
          return val.split(',').map((v) => v.trim()).filter(Boolean);
        }
      }
      return [];
    };
    
    let imageUrls = fromIndexed(bodyImageUrlKeys, 'imageUrls');
    let videoUrls = fromIndexed(bodyVideoUrlKeys, 'videoUrls');
    
    // Fallback to array-style keys
    if (imageUrls.length === 0 && body['imageUrls[]'] !== undefined) {
      imageUrls = coerceUrls(body['imageUrls[]']);
    }
    if (videoUrls.length === 0 && body['videoUrls[]'] !== undefined) {
      videoUrls = coerceUrls(body['videoUrls[]']);
    }
    
    // Fallback to plain field
    if (imageUrls.length === 0 && body.imageUrls !== undefined) {
      imageUrls = coerceUrls(body.imageUrls);
    }
    if (videoUrls.length === 0 && body.videoUrls !== undefined) {
      videoUrls = coerceUrls(body.videoUrls);
    }
    
    // Process new image file uploads
    if (files.images) {
      const imageFiles = Array.isArray(files.images) ? files.images : [files.images];
      const newImages = [];
      for (const file of imageFiles) {
        try {
          // Use buffer if available (memory storage), otherwise use path
          if (file.buffer) {
            const { configureCloudinary, uploadBufferToCloudinary } = await import('../utils/cloudinary.js');
            configureCloudinary();
            const r = await uploadBufferToCloudinary(file.buffer, 'carriya/products');
            newImages.push(r.secure_url);
          } else {
            const url = await uploadToCloudinary(file.path, 'products');
            newImages.push(url);
          }
        } catch (err) {
          console.warn('Failed to upload image:', file.originalname, err.message);
        }
      }
      if (newImages.length > 0) {
        imageUrls = [...imageUrls, ...newImages];
      }
    }
    
    // Process new video file uploads
    if (files.videos) {
      const videoFiles = Array.isArray(files.videos) ? files.videos : [files.videos];
      const newVideos = [];
      for (const file of videoFiles) {
        try {
          // Use buffer if available (memory storage), otherwise use path
          if (file.buffer) {
            const { configureCloudinary, uploadBufferToCloudinary } = await import('../utils/cloudinary.js');
            configureCloudinary();
            const r = await uploadBufferToCloudinary(file.buffer, 'carriya/products', undefined, 'video');
            newVideos.push(r.secure_url);
          } else {
            const url = await uploadToCloudinary(file.path, 'products');
            newVideos.push(url);
          }
        } catch (err) {
          console.warn('Failed to upload video:', file.originalname, err.message);
        }
      }
      if (newVideos.length > 0) {
        videoUrls = [...videoUrls, ...newVideos];
      }
    }
    
    // Update images and videos if provided (either from URLs or new uploads)
    // Always update if imageUrls are provided OR new files are uploaded OR explicitly cleared
    const hasImageUrls = body.imageUrls !== undefined || body['imageUrls[]'] !== undefined || bodyImageUrlKeys.length > 0;
    const hasVideoUrls = body.videoUrls !== undefined || body['videoUrls[]'] !== undefined || bodyVideoUrlKeys.length > 0;
    const hasNewImageFiles = files.images && (Array.isArray(files.images) ? files.images.length > 0 : !!files.images);
    const hasNewVideoFiles = files.videos && (Array.isArray(files.videos) ? files.videos.length > 0 : !!files.videos);
    
    if (hasImageUrls || hasNewImageFiles) {
      // If imageUrls were provided or new files uploaded, update images
      if (imageUrls.length > 0) {
        product.images = imageUrls;
        // Always update thumbnail to first image
        product.thumbnailUrl = imageUrls[0];
      } else if (hasImageUrls && imageUrls.length === 0) {
        // Explicitly cleared
        product.images = [];
        product.thumbnailUrl = undefined;
      } else if (hasNewImageFiles && imageUrls.length === 0) {
        // Only new files, no URLs - this shouldn't happen as we add new files to imageUrls above
        // But just in case, keep existing images
        if (product.images.length === 0) {
          product.images = [];
          product.thumbnailUrl = undefined;
        }
      }
    }
    
    if (hasVideoUrls || hasNewVideoFiles) {
      if (videoUrls.length > 0) {
        product.videos = videoUrls;
      } else if (hasVideoUrls && videoUrls.length === 0) {
        // Explicitly cleared
        product.videos = [];
      }
    }

    // Update other fields
    if (body.title !== undefined) product.title = String(body.title || '').trim();
    if (body.description !== undefined) product.description = String(body.description || '').trim();
    if (body.categoryPath !== undefined) product.categoryPath = String(body.categoryPath || '').trim();
    if (body.price !== undefined) {
      const price = Number(body.price);
      if (price > 0) product.price = price;
    }
    if (body.discount !== undefined) {
      product.discount = clampPercentage(Number(body.discount) || 0);
    }
    if (body.stock !== undefined) {
      product.stock = Math.max(0, Number(body.stock) || 0);
    }
    if (body.unlimitedStock !== undefined) {
      product.unlimitedStock = String(body.unlimitedStock) === 'true';
    }
    if (body.keywords !== undefined) {
      product.keywords = String(body.keywords)
        .split(',')
        .map((k) => k.trim().toLowerCase())
        .filter(Boolean);
    }
    if (body.action !== undefined) {
      const action = String(body.action);
      product.isPublished = action === 'publish';
      product.status = action === 'publish' ? 'active' : 'draft';
    }

    await product.save();
    const price = Number(product.price) || 0;
    const discount = Number(product.discount) || 0;
    const finalPrice = calculateFinalPrice(price, discount);

    // Return clean response - Amazon/Daraz style (use slug as primary identifier)
    res.json({
      success: true,
      id: product.slug || String(product._id), // Primary identifier: slug (user-friendly) or fallback to ObjectId
      message: 'Product updated successfully',
      price,
      discount,
      finalPrice,
    });
  } catch (e) {
    if (e.name === 'ValidationError') {
      const fieldErrors = {};
      Object.keys(e.errors || {}).forEach((key) => {
        fieldErrors[key] = e.errors[key].message;
      });
      return next(httpError(422, 'Validation failed', fieldErrors));
    }
    if (e.name === 'CastError') {
      return next(httpError(400, 'Invalid data format'));
    }
    next(e);
  }
}

// Delete product
export async function deleteProduct(req, res, next) {
  try {
    const { productId } = req.params;
    const sellerId = req.user?.id;

    if (!productId) {
      return next(httpError(400, 'Product identifier is required'));
    }

    if (!sellerId) {
      return next(httpError(401, 'Unauthorized'));
    }

    // Support both slug and ObjectId (Amazon/Daraz style - use slug as primary identifier)
    // Security: Authorization is enforced at multiple levels:
    // 1. Route level: requireAuth + requireRole('seller') middleware
    // 2. Query level: Filter by sellerId in database query
    // 3. Application level: Explicit ownership verification
    const isObjectId = mongoose.Types.ObjectId.isValid(productId);
    let product;
    if (isObjectId) {
      product = await Product.findById(productId);
    } else {
      // Lookup by slug (seller's own products only, including drafts)
      // Security: Query includes sellerId filter to prevent unauthorized access
      product = await Product.findOne({ 
        slug: productId,
        sellerId: sellerId // First layer: Database-level ownership filter
      });
    }

    if (!product) {
      // Don't reveal if product exists but user doesn't own it (security best practice)
      return next(httpError(404, 'Product not found'));
    }

    // Second layer: Application-level ownership verification (defense in depth)
    if (String(product.sellerId) !== String(sellerId)) {
      return next(httpError(403, 'Forbidden: You can only delete your own products'));
    }

    // Delete the product using the actual database ID
    await Product.deleteOne({ _id: product._id });
    
    res.json({ 
      success: true, 
      message: 'Product deleted successfully',
      id: product.slug || product._id.toString() // Return slug (Amazon/Daraz style) or fallback to ID
    });
  } catch (e) {
    if (e.name === 'CastError') {
      return next(httpError(400, 'Invalid product ID format'));
    }
    next(e);
  }
}

// List products for buyers (public catalog)
export async function listProducts(req, res, next) {
  try {
    const page = Math.max(1, Number(req.query.page || 1));
    const pageSize = Math.min(50, Math.max(1, Number(req.query.pageSize || 20)));
    const category = String(req.query.category || '').trim();
    const sellerIdFilter = String(req.query.sellerId || '').trim();
    const sellerSlugFilter = String(req.query.sellerSlug || '').trim();
    const search = String(req.query.search || '').trim();
    const sort = String(req.query.sort || 'newest'); // newest, price_asc, price_desc, popular

    const query = {
      isPublished: true,
      status: 'active',
    };

    let sellerObjectId = null;

    if (sellerSlugFilter) {
      const sellerSettings = await SellerSettings.findOne({ storeSlug: sellerSlugFilter })
        .select('sellerId storeSlug')
        .lean();
      if (!sellerSettings) {
        res.set('Cache-Control', 'public, max-age=60, s-maxage=300');
        return res.json({
          items: [],
          total: 0,
          page,
          pageSize,
          totalPages: 0,
        });
      }
      sellerObjectId = sellerSettings.sellerId;
    } else if (sellerIdFilter) {
      if (!mongoose.Types.ObjectId.isValid(sellerIdFilter)) {
        res.set('Cache-Control', 'public, max-age=60, s-maxage=300');
        return res.json({
          items: [],
          total: 0,
          page,
          pageSize,
          totalPages: 0,
        });
      }
      sellerObjectId = sellerIdFilter;
    }

    if (sellerObjectId) {
      query.sellerId = sellerObjectId;
    }

    if (category) {
      query.categoryPath = { $regex: category, $options: 'i' };
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { keywords: { $in: [search.toLowerCase()] } },
      ];
    }

    let sortOption = {};
    switch (sort) {
      case 'price_asc':
        sortOption = { price: 1 };
        break;
      case 'price_desc':
        sortOption = { price: -1 };
        break;
      case 'popular':
        sortOption = { salesCount: -1, views: -1 };
        break;
      case 'newest':
      default:
        sortOption = { createdAt: -1 };
        break;
    }

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .select('sellerId title price discount stock unlimitedStock lowStockThreshold thumbnailUrl slug salesCount rating reviewCount createdAt')
      .sort(sortOption)
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .lean();

    const sellerInfoMap = new Map();
    if (products.length > 0) {
      const sellerIdStrings = [
        ...new Set(
          products
            .map((p) => (p.sellerId ? String(p.sellerId) : null))
            .filter(Boolean)
        ),
      ];

      if (sellerIdStrings.length > 0) {
        // Convert string IDs to ObjectIds for MongoDB query
        const sellerObjectIds = sellerIdStrings
          .filter((id) => mongoose.Types.ObjectId.isValid(id))
          .map((id) => new mongoose.Types.ObjectId(id));

        if (sellerObjectIds.length > 0) {
          const sellerSettings = await SellerSettings.find({ sellerId: { $in: sellerObjectIds } })
            .select('sellerId sellerCode storeSlug storeName')
            .lean();
          
          // Generate sellerCode for any missing ones (on-the-fly migration)
          for (const setting of sellerSettings) {
            let code = setting.sellerCode;
            if (!code) {
              // Auto-generate if missing
              try {
                code = await SellerSettings.generateSellerCode(setting._id);
                await SellerSettings.findByIdAndUpdate(setting._id, { $set: { sellerCode: code } });
              } catch (err) {
                console.warn(`Failed to generate sellerCode for ${setting._id}:`, err.message);
              }
            }
            
            sellerInfoMap.set(String(setting.sellerId), {
              code: code || undefined,
              slug: setting.storeSlug,
              name: setting.storeName,
            });
          }
        }
      }
    }

    const totalPages = total > 0 ? Math.ceil(total / pageSize) : 0;

    res.set('Cache-Control', 'public, max-age=60, s-maxage=300');
    res.json({
      items: products.map((p) => {
        const currentPrice = calculateFinalPrice(p.price, p.discount);
        const sellerId = p.sellerId ? String(p.sellerId) : undefined;
        const sellerInfo = sellerId ? sellerInfoMap.get(sellerId) : undefined;
        return {
          // Public-facing product identifier: use slug instead of raw database _id
          id: p.slug || p._id.toString(),
          sellerCode: sellerInfo?.code, // Public seller code (Daraz/Amazon style) - replaces raw sellerId
          sellerSlug: sellerInfo?.slug,
          sellerName: sellerInfo?.name,
          title: p.title,
          price: p.price, // Original price
          currentPrice, // Price after discount (Daraz/Amazon style)
          discount: p.discount,
          // Stock status (Daraz/Amazon style - shows status instead of exact count)
          stockStatus: calculateStockStatus(p),
          thumbnailUrl: p.thumbnailUrl,
          rating: p.rating || 0,
          reviewCount: p.reviewCount || 0,
          isAvailable: p.unlimitedStock || p.stock > 0,
          // Note: Removed fields that Daraz/Amazon don't expose publicly:
          // - unlimitedStock (internal flag)
          // - slug (redundant with id)
          // - finalPrice (redundant with currentPrice)
          // - salesCount (internal metric - they show badges, not exact counts)
        };
      }),
      total,
      page,
      pageSize,
      totalPages,
    });
  } catch (e) {
    next(e);
  }
}
