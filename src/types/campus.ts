export type MealCategory =
  | 'All'
  | 'Thalis & Combos'
  | 'Bowls & Rolls'
  | 'Snacks'
  | 'Beverages';

export type DropPointType = 'Hostel Gate' | 'PG / Flat' | 'Classroom / Block';

export type PaymentMethod = 'UPI on Delivery' | 'Cash on Delivery';

export type OrderStatus =
  | 'confirmed'
  | 'preparing'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export interface MenuItem {
  id: string;
  name: string;
  outlet: string;
  category: Exclude<MealCategory, 'All'>;
  price: number;
  prepTime: string;
  dietary: 'Pure Veg';
  portion: string;
  description: string;
  image: string;
}

export interface CartItem {
  meal: MenuItem;
  quantity: number;
}

export interface OrderLineItem {
  mealId: string;
  name: string;
  outlet: string;
  price: number;
  quantity: number;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  phone?: string;
  campus?: string;
  dropPointType?: DropPointType;
  dropPointDetail?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface OrderRecord {
  id: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  phone: string;
  campus: string;
  dropPointType: DropPointType;
  dropPointDetail: string;
  paymentMethod: PaymentMethod;
  items: OrderLineItem[];
  subtotal: number;
  deliveryFee: number;
  totalAmount: number;
  notes?: string;
  status: OrderStatus;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface OrderFeedback {
  id: string;
  userId: string;
  orderId: string;
  priceRating: number;
  hygieneRating: number;
  deliveryRating: number;
  wouldOrderAgain: boolean;
  comment?: string;
  createdAt?: unknown;
}
