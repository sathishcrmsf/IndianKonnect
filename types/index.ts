export type PostCategory =
  | "room_rent"
  | "need_room"
  | "ride_share"
  | "deals"
  | "parcel"
  | "job"
  | "buy_sell"
  | "help";

export interface User {
  id: string;
  phone: string;
  city_id: string | null;
  is_premium: boolean;
  is_verified: boolean;
  verified_at: string | null;
  success_count: number;
  created_at: string;
  updated_at: string;
}

export interface City {
  id: string;
  name: string;
  country_code: string;
  flag_emoji: string;
  is_active: boolean;
}

export interface Post {
  id: string;
  user_id: string;
  category: PostCategory;
  title: string;
  description: string;
  price: number | null;
  currency: string;
  images: string[];
  city_id: string | null;
  veg_only: boolean;
  gender_filter: "male" | "female" | "both";
  is_anonymous: boolean;
  is_premium: boolean;
  is_verified_owner: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  user?: User;
  city?: City;
}

export interface Report {
  id: string;
  post_id: string;
  user_id: string;
  reason: string;
  status: "pending" | "reviewed" | "resolved" | "dismissed";
  created_at: string;
  reviewed_at: string | null;
}

export interface Chat {
  id: string;
  post_id: string | null;
  sender_id: string;
  receiver_id: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface FilterState {
  categories: PostCategory[];
  priceRange: [number, number];
  vegOnly: boolean | null;
  gender: "male" | "female" | "both" | null;
  verifiedOnly: boolean;
  dateFilter: "today" | "week" | "all";
}

