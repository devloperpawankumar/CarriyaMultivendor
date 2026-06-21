## Carriya Backend (JavaScript)

Run locally:

```bash
cd backend
npm install
npm run dev # or: npm start
```

Server starts on `http://localhost:4000`.

Environment:

Create a `.env` in `backend/` with:

```env
PORT=4000
MONGODB_URI=mongodb://127.0.0.1:27017/carriya
MONGODB_DB=carriya
JWT_SECRET=change_me_to_a_long_random_string
NODE_ENV=development
```

Key endpoints used by the frontend:
- POST `/api/products` (multipart form: fields from `buildProductFormData`)
- GET `/api/seller/products?page=&pageSize=&status=`
- GET `/api/admin/sellers?status=new`
- GET `/api/payments/balance-overview`
- GET `/api/payments/earnings`
- GET `/api/payments/withdrawals`
- POST `/api/payments/withdrawals` `{ amount, method }`

Auth endpoints:
- POST `/api/auth/signup` `{ email, password, firstName?, lastName? }`
- POST `/api/auth/login` `{ email, password }`
- GET `/api/auth/me` → returns current user or null
- POST `/api/auth/logout`

Uploads are saved under `/uploads` and served at `http://localhost:4000/uploads/...`.

Project structure (MVC):

```
src/
  controllers/        # Request handlers (no Express objects)
    adminController.js
    authController.js
    paymentsController.js
    productsController.js
  db/
    mongoose.js       # Mongo connection
  middleware/
    auth.js           # cookie parsing + JWT decode helpers
    errors.js         # global error + httpError factory
    validate.js       # tiny schema validator
  models/
    User.js
  routes/            # Express routers (thin, map to controllers)
    admin.js
    auth.js
    payments.js
    products.js
  index.js            # App bootstrap, mounts routes/middleware
```


