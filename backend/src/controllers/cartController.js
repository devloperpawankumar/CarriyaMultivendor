import { Cart } from '../models/Cart.js';
import { Product } from '../models/Product.js';
import { SellerSettings } from '../models/SellerSettings.js';
import { httpError } from '../middleware/errors.js';
import mongoose from 'mongoose';

// Helper function to find product by slug or ObjectId
async function findProductByIdOrSlug(identifier) {
  // Check if it's a valid MongoDB ObjectId (24 hex characters)
  if (mongoose.Types.ObjectId.isValid(identifier) && identifier.match(/^[0-9a-fA-F]{24}$/)) {
    return await Product.findById(identifier);
  }
  // Otherwise, treat it as a slug
  return await Product.findOne({ slug: identifier, isPublished: true, status: 'active' });
}

// Helper function to get guest identifiers from request (Amazon/Daraz style)
function getGuestIdentifiers(req) {
  // Try to get from headers first (client sends these)
  const sessionId = req.headers['x-session-id'] || req.cookies?.sessionId;
  const deviceId = req.headers['x-client-id'] || req.cookies?.deviceId;
  
  return { sessionId, deviceId };
}

// Helper function to get or create cart (supports both authenticated and guest)
async function getOrCreateCartForRequest(req) {
  const userId = req.user?.id;
  
  if (userId) {
    // Authenticated user - use user cart
    return await Cart.getOrCreateCart(userId);
  } else {
    // Guest user - use session/device cart
    const { sessionId, deviceId } = getGuestIdentifiers(req);
    if (!sessionId && !deviceId) {
      throw new Error('Guest cart requires sessionId or deviceId');
    }
    return await Cart.getOrCreateGuestCart(sessionId, deviceId);
  }
}

// Helper function to find cart by request (supports both authenticated and guest)
async function findCartByRequest(req) {
  const userId = req.user?.id;
  
  if (userId) {
    return await Cart.findOne({ userId });
  } else {
    const { sessionId, deviceId } = getGuestIdentifiers(req);
    if (sessionId) {
      return await Cart.findOne({ sessionId });
    }
    if (deviceId) {
      return await Cart.findOne({ deviceId });
    }
    return null;
  }
}

// Get user's cart (supports both authenticated and guest)
export async function getCart(req, res, next) {
  try {
    const cart = await getOrCreateCartForRequest(req);
    await cart.populate({
      path: 'items.productId',
      select: 'title price discount stock unlimitedStock thumbnailUrl slug status isPublished sellerId',
      populate: {
        path: 'sellerId',
        select: 'firstName lastName'
      }
    });

    // Filter out unavailable products and calculate current prices
    const validItems = [];
    for (const item of cart.items) {
      const product = item.productId;
      if (!product) {
        // Product was deleted, remove from cart
        continue;
      }

      // Check if product is still available
      const isAvailable = product.status === 'active' && 
                         product.isPublished && 
                         (product.unlimitedStock || product.stock > 0);

      if (!isAvailable) {
        continue; // Skip unavailable products
      }

      // Calculate current price
      const currentPrice = product.originalPrice 
        ? product.price // If originalPrice exists, price is already discounted
        : (product.discount > 0
          ? Math.round(product.price * (1 - product.discount / 100))
          : product.price);

      // Update item price if it changed
      if (item.price !== currentPrice) {
        item.price = currentPrice;
      }

      // Check stock availability
      if (!product.unlimitedStock && product.stock < item.quantity) {
        // Adjust quantity to available stock
        item.quantity = product.stock;
      }

      validItems.push(item);
    }

    // Update cart if items were removed or modified
    if (validItems.length !== cart.items.length) {
      cart.items = validItems;
      await cart.save();
    }

    const total = cart.calculateTotal();
    const itemCount = cart.getItemCount();

    // Get seller store names for all products
    // Extract sellerId properly (handles both populated object and ObjectId)
    const sellerIds = [...new Set(validItems.map(item => {
      const sellerId = item.productId.sellerId;
      if (!sellerId) return null;
      // If populated as object, get _id; if it's already an ObjectId, convert to string
      if (typeof sellerId === 'object' && sellerId !== null) {
        // Populated document has _id property
        if (sellerId._id) {
          return String(sellerId._id);
        }
        // Or it might be the ObjectId itself
        if (sellerId.toString) {
          return sellerId.toString();
        }
      }
      return String(sellerId);
    }).filter(Boolean))];
    
    const sellerSettingsMap = new Map();
    
    if (sellerIds.length > 0) {
      const sellerObjectIds = sellerIds
        .filter(id => mongoose.Types.ObjectId.isValid(id))
        .map(id => new mongoose.Types.ObjectId(id));
      
      if (sellerObjectIds.length > 0) {
        const sellerSettings = await SellerSettings.find({ sellerId: { $in: sellerObjectIds } })
          .select('sellerId storeName')
          .lean();
        
        sellerSettings.forEach(setting => {
          sellerSettingsMap.set(String(setting.sellerId), setting.storeName);
        });
      }
    }

    res.json({
      items: validItems.map((item) => {
        // Extract sellerId properly
        const sellerIdObj = item.productId.sellerId;
        let sellerIdString = null;
        let sellerFirstName = null;
        let sellerLastName = null;
        
        if (sellerIdObj) {
          if (typeof sellerIdObj === 'object' && sellerIdObj !== null) {
            sellerIdString = String(sellerIdObj._id || sellerIdObj.id || sellerIdObj);
            sellerFirstName = sellerIdObj.firstName;
            sellerLastName = sellerIdObj.lastName;
          } else {
            sellerIdString = String(sellerIdObj);
          }
        }
        
        const storeName = sellerIdString 
          ? (sellerSettingsMap.get(sellerIdString) || 
             (sellerFirstName && sellerLastName
               ? `${sellerFirstName} ${sellerLastName}`.trim()
               : undefined))
          : undefined;
        
        // Amazon/Daraz style: Use public identifiers instead of raw database IDs
        // - productId: Use product slug (public identifier) instead of ObjectId
        // - id: Keep cart item ID for operations (needed for update/delete), but it's internal
        return {
          id: item._id.toString(), // Cart item ID (needed for update/delete operations)
          productId: item.productId.slug || item.productId._id.toString(), // Public product identifier (slug)
          title: item.productId.title,
          price: item.price,
          quantity: item.quantity,
          color: item.color,
          size: item.size,
          thumbnailUrl: item.productId.thumbnailUrl,
          slug: item.productId.slug, // Keep slug for reference (redundant with productId but useful)
          stock: item.productId.stock,
          unlimitedStock: item.productId.unlimitedStock,
          subtotal: item.price * item.quantity,
          shopName: storeName,
          // Note: Removed raw database ObjectIds from public API (Daraz/Amazon style - security best practice)
        };
      }),
      total,
      itemCount,
      updatedAt: cart.updatedAt,
    });
  } catch (e) {
    next(e);
  }
}

// Add item to cart (supports both authenticated and guest)
export async function addToCart(req, res, next) {
  try {
    const { productId, quantity, color, size } = req.body || {};

    if (!productId) {
      return next(httpError(422, 'Validation failed', { productId: 'Product ID is required' }));
    }

    const qty = Math.max(1, Number(quantity || 1));

    // Fetch product by slug or ObjectId
    const product = await findProductByIdOrSlug(productId);
    if (!product) {
      return next(httpError(404, 'Product not found'));
    }

    // Check availability
    if (!product.isAvailable()) {
      return next(httpError(400, 'Product is not available'));
    }

    // Check stock
    if (!product.unlimitedStock && product.stock < qty) {
      return next(httpError(400, `Insufficient stock. Available: ${product.stock}`));
    }

    // Get or create cart (works for both authenticated and guest)
    const cart = await getOrCreateCartForRequest(req);

    // Calculate current price
    const currentPrice = product.originalPrice
      ? product.price // If originalPrice exists, price is already discounted
      : (product.discount > 0
        ? Math.round(product.price * (1 - product.discount / 100))
        : product.price);

    // Use the actual product ObjectId for cart storage
    const productObjectId = product._id;
    
    // Check if item already exists (same product, color, size)
    const itemKey = `${productObjectId.toString()}_${color || 'default'}_${size || 'default'}`;
    const existingItemIndex = cart.items.findIndex((item) => {
      const itemKeyCompare = `${item.productId.toString()}_${item.color || 'default'}_${item.size || 'default'}`;
      return itemKeyCompare === itemKey;
    });

    if (existingItemIndex >= 0) {
      // Update quantity of existing item
      const existingItem = cart.items[existingItemIndex];
      const newQuantity = existingItem.quantity + qty;

      // Check stock again with new quantity
      if (!product.unlimitedStock && product.stock < newQuantity) {
        return next(httpError(400, `Insufficient stock. Available: ${product.stock}, current in cart: ${existingItem.quantity}`));
      }

      existingItem.quantity = newQuantity;
      existingItem.price = currentPrice; // Update price if changed
    } else {
      // Add new item (use product ObjectId, not slug)
      cart.items.push({
        productId: productObjectId,
        quantity: qty,
        color: color || undefined,
        size: size || undefined,
        price: currentPrice,
        productSnapshot: {
          title: product.title,
          thumbnailUrl: product.thumbnailUrl,
        },
      });
    }

    await cart.save();
    await cart.populate('items.productId', 'title thumbnailUrl slug');

    const addedItem = cart.items[cart.items.length - 1];
    // Amazon/Daraz style: Use public identifier (slug) instead of raw ObjectId
    const productSlug = product.slug || productObjectId.toString();
    
    res.json({
      success: true,
      item: {
        id: addedItem._id.toString(), // Cart item ID (needed for operations)
        productId: productSlug, // Public product identifier (slug)
        quantity: addedItem.quantity,
        price: addedItem.price,
      },
      cartTotal: cart.calculateTotal(),
      itemCount: cart.getItemCount(),
    });
  } catch (e) {
    next(e);
  }
}

// Update cart item quantity (supports both authenticated and guest)
export async function updateCartItem(req, res, next) {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body || {};

    const qty = Math.max(0, Number(quantity || 0));

    const cart = await findCartByRequest(req);
    if (!cart) {
      return next(httpError(404, 'Cart not found'));
    }

    const itemIndex = cart.items.findIndex((item) => String(item._id) === itemId);
    if (itemIndex === -1) {
      return next(httpError(404, 'Cart item not found'));
    }

    if (qty === 0) {
      // Remove item
      cart.items.splice(itemIndex, 1);
    } else {
      const item = cart.items[itemIndex];
      // Fetch product to check stock
      const product = await Product.findById(item.productId);
      if (!product) {
        cart.items.splice(itemIndex, 1);
      } else {
        // Check stock
        if (!product.unlimitedStock && product.stock < qty) {
          return next(httpError(400, `Insufficient stock. Available: ${product.stock}`));
        }

        // Update price if changed
        const currentPrice = product.originalPrice
          ? product.price
          : (product.discount > 0
            ? Math.round(product.price * (1 - product.discount / 100))
            : product.price);
        item.price = currentPrice;
        item.quantity = qty;
      }
    }

    await cart.save();

    res.json({
      success: true,
      cartTotal: cart.calculateTotal(),
      itemCount: cart.getItemCount(),
    });
  } catch (e) {
    next(e);
  }
}

// Remove item from cart (supports both authenticated and guest)
export async function removeFromCart(req, res, next) {
  try {
    const { itemId } = req.params;

    const cart = await findCartByRequest(req);
    if (!cart) {
      return next(httpError(404, 'Cart not found'));
    }

    const itemIndex = cart.items.findIndex((item) => String(item._id) === itemId);
    if (itemIndex === -1) {
      return next(httpError(404, 'Cart item not found'));
    }

    cart.items.splice(itemIndex, 1);
    await cart.save();

    res.json({
      success: true,
      cartTotal: cart.calculateTotal(),
      itemCount: cart.getItemCount(),
    });
  } catch (e) {
    next(e);
  }
}

// Clear cart (supports both authenticated and guest)
export async function clearCart(req, res, next) {
  try {
    const cart = await findCartByRequest(req);
    if (!cart) {
      return res.json({ success: true });
    }

    cart.items = [];
    await cart.save();

    res.json({ success: true });
  } catch (e) {
    next(e);
  }
}

// Merge guest cart into user cart (called on login)
export async function mergeGuestCart(req, res, next) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return next(httpError(401, 'Unauthorized'));
    }

    const { sessionId, deviceId } = getGuestIdentifiers(req);
    
    // Find guest cart
    let guestCart = null;
    if (sessionId) {
      guestCart = await Cart.findOne({ sessionId });
    }
    if (!guestCart && deviceId) {
      guestCart = await Cart.findOne({ deviceId });
    }

    if (!guestCart || guestCart.items.length === 0) {
      // No guest cart to merge, just return user cart
      const userCart = await Cart.getOrCreateCart(userId);
      await userCart.populate('items.productId', 'title price discount stock unlimitedStock thumbnailUrl slug status isPublished');
      
      return res.json({
        success: true,
        merged: false,
        message: 'No guest cart to merge',
      });
    }

    // Merge guest cart into user cart
    const mergedCart = await Cart.mergeGuestCartToUser(guestCart._id, userId);
    await mergedCart.populate('items.productId', 'title price discount stock unlimitedStock thumbnailUrl slug status isPublished');

    res.json({
      success: true,
      merged: true,
      itemCount: mergedCart.getItemCount(),
      total: mergedCart.calculateTotal(),
    });
  } catch (e) {
    next(e);
  }
}

