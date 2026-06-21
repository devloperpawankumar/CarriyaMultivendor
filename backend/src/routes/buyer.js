import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  getDefaultBuyerAddress,
  saveDefaultBuyerAddress,
  listBuyerAddresses,
  createBuyerAddress,
  updateBuyerAddress,
  deleteBuyerAddress,
  setDefaultAddress,
} from '../controllers/buyerAddressController.js';
import {
  getBuyerAccount,
  updateBuyerAccount,
  changeBuyerPassword,
} from '../controllers/buyerAccountController.js';

const router = Router();

// Important: this router is mounted at `/api`, so middleware MUST be scoped
// or it will block unrelated routes like `/api/auth/login`.
router.use('/buyer', requireAuth);

// Account Management
router.get('/buyer/account', getBuyerAccount);
router.patch('/buyer/account', updateBuyerAccount);
router.patch('/buyer/change-password', changeBuyerPassword);

// Address Management (Full CRUD)
router.get('/buyer/addresses', listBuyerAddresses);
router.post('/buyer/addresses', createBuyerAddress);
router.patch('/buyer/addresses/:addressId', updateBuyerAddress);
router.delete('/buyer/addresses/:addressId', deleteBuyerAddress);
router.patch('/buyer/addresses/:addressId/set-default', setDefaultAddress);

// Legacy endpoints (for checkout compatibility)
router.get('/buyer/shipping-address', getDefaultBuyerAddress);
router.put('/buyer/shipping-address', saveDefaultBuyerAddress);

export default router;


