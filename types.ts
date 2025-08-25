import type { Database } from './integrations/supabase/types';

export type ProductWithCategory = Database['public']['Tables']['products']['Row'] & {
  categories: Pick<Database['public']['Tables']['categories']['Row'], 'name'> | null;
};

export type Product = Database['public']['Tables']['products']['Row'];
export type Category = Database['public']['Tables']['categories']['Row'];

// Types for the Cart feature
export type CartItem = Database['public']['Tables']['cart_items']['Row'];
export type CartItemWithProduct = CartItem & {
  products: Pick<Product, 'id' | 'name' | 'price' | 'image_url'> | null;
};

// Types for the new Order feature
export type Order = Database['public']['Tables']['orders']['Row'];
export type OrderItem = Database['public']['Tables']['order_items']['Row'];
export type OrderItemWithProduct = OrderItem & {
  products: Pick<Product, 'id' | 'name' | 'image_url'> | null;
};
export type OrderWithItems = Order & {
  order_items: OrderItemWithProduct[];
};

// Types for the new Wishlist feature
export type WishlistItem = Database['public']['Tables']['wishlist_items']['Row'];
export type WishlistItemWithProduct = WishlistItem & {
  products: Product | null;
};

// Types for the new Address feature
export type UserAddress = Database['public']['Tables']['user_addresses']['Row'];

// Types for Manual Payment feature
export type ManualPayment = Database['public']['Tables']['manual_payments']['Row'];

// Types for the new Review feature
export type Review = Database['public']['Tables']['reviews']['Row'];
export type ReviewWithProfile = Review & {
  profiles: Pick<Database['public']['Tables']['profiles']['Row'], 'id' | 'name' | 'photo_url'> | null;
};
