export type CartItem = {
  id: string;
  title: string;
  image: string;
  price: number;
  compareAt?: number;
  color?: string;
  size?: string;
  qty: number;
  shopName?: string;
};

export type CartTotals = {
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
};


