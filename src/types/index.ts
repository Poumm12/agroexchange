// ─── Database Types ───────────────────────────────────────────────────────

export type UserRole = 'farmer' | 'buyer' | 'transporter' | 'insurer' | 'admin'

export interface User {
  id: string
  email: string
  full_name: string
  username?: string
  avatar_url?: string
  /** Legacy single role — kept for backward compatibility */
  role: UserRole
  /** Multi-role support (Phase B) */
  roles: UserRole[]
  location?: string
  phone?: string
  bio?: string
  trust_score: number
  total_deals: number
  total_value: number
  total_sales?: number
  total_purchases?: number
  successful_deals?: number
  rating: number
  rating_count: number
  verified: boolean
  verified_business?: boolean
  verified_transporter?: boolean
  verified_insurer?: boolean
  // Privacy controls
  show_phone?: boolean
  show_email?: boolean
  show_location?: boolean
  created_at: string
}

export interface Listing {
  id: string
  user_id: string
  title: string
  category: string
  description?: string
  price_per_ton: number
  quantity_tons: number
  measurement_unit?: 'kg' | 'ton' | 'g'
  location: string
  status: 'active' | 'sold' | 'expired' | 'draft'
  image_url?: string
  badge?: string
  flagged?: boolean
  expires_at?: string
  created_at: string
  user?: User
  offer_count?: number
}

export interface Offer {
  id: string
  listing_id: string
  buyer_id: string
  seller_id: string
  price_per_ton: number
  quantity_tons: number
  measurement_unit?: 'kg' | 'ton' | 'g'
  total_value: number
  message?: string
  status: 'pending' | 'accepted' | 'rejected' | 'countered' | 'completed'
  created_at: string
  listing?: Listing
  buyer?: User
  seller?: User
}

export interface Deal {
  id: string
  offer_id: string
  buyer_id: string
  seller_id: string
  listing_id: string
  price_per_ton: number
  quantity_tons: number
  total_value: number
  status: 'active' | 'completed' | 'disputed'
  completed_at?: string
  created_at: string
}

export interface Review {
  id: string
  reviewer_id: string
  reviewed_id: string
  deal_id?: string
  transporter_id?: string
  rating: number
  comment?: string
  created_at: string
  reviewer?: User
}

export interface Transporter {
  id: string
  user_id: string
  vehicle_type: string
  capacity_tons: number
  license_plate?: string
  from_location: string
  to_location: string
  price_per_trip: number
  available: boolean
  rating: number
  rating_count: number
  total_trips: number
  description?: string
  created_at: string
  updated_at?: string
  user?: User
  reviews?: Review[]
}

export interface Notification {
  id: string
  user_id: string
  type: 'offer' | 'deal' | 'review' | 'news' | 'market' | 'transport' | 'message' | 'system'
  title: string
  message: string
  read: boolean
  link?: string
  created_at: string
}

export interface Conversation {
  id: string
  user_a: string
  user_b: string
  listing_id?: string
  last_message: string
  last_message_at: string
  created_at: string
  // hydrated client-side
  other_user?: Pick<User, 'id' | 'full_name' | 'avatar_url' | 'trust_score'>
  unread_count?: number
}

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  recipient_id: string
  body: string
  read: boolean
  created_at: string
}

export interface MarketPrice {
  id: string
  commodity: string
  symbol: string
  price: number
  change_pct: number
  unit: string
  source: string
  updated_at: string
}

export interface NewsArticle {
  id: string
  title: string
  summary: string
  content?: string
  category: string
  source: string
  image_url?: string
  url?: string
  published_at: string
  is_hot: boolean
}

export interface WeatherData {
  location: string
  temp: number
  feels_like: number
  humidity: number
  wind_speed: number
  visibility: number
  condition: string
  icon: string
  forecast: WeatherForecast[]
}

export interface WeatherForecast {
  date: string
  day: string
  temp_max: number
  temp_min: number
  condition: string
  icon: string
}

export interface RankingEntry {
  rank: number
  user: User
  total_deals: number
  total_value: number
  total_sales: number
  total_purchases: number
  rating: number
  trust_score: number
  badge?: 'gold' | 'silver' | 'bronze'
}

// ─── PHASE C: Transport network, map, support ───────────────
export interface TransportListing {
  id: string
  user_id: string
  title: string
  from_location: string
  to_location: string
  vehicle_type?: string
  capacity_tons?: number
  measurement_unit?: 'kg' | 'ton' | 'g'
  price_per_trip?: number
  available_from?: string
  description?: string
  company_photo?: string
  truck_photo?: string
  status: 'active' | 'paused' | 'archived'
  created_at: string
  updated_at?: string
  user?: Pick<User, 'id' | 'full_name' | 'avatar_url' | 'trust_score' | 'rating' | 'rating_count' | 'verified' | 'verified_transporter'>
}

export interface RouteRequest {
  id: string
  user_id: string
  from_location: string
  to_location: string
  product?: string
  quantity_tons?: number
  measurement_unit?: 'kg' | 'ton' | 'g'
  preferred_date?: string
  notes?: string
  status: 'open' | 'matched' | 'closed'
  created_at: string
  user?: Pick<User, 'id' | 'full_name' | 'avatar_url'>
}

export interface SupportTicket {
  id: string
  user_id?: string
  name: string
  email: string
  phone?: string
  message: string
  source: 'ai_assistant' | 'contact_form' | 'other'
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  ai_transcript?: { role: 'user' | 'assistant'; content: string }[]
  created_at: string
}

export type MapCategory = 'silo' | 'mill' | 'warehouse' | 'cooperative' | 'distribution' | 'transport_company'

export interface MapPoint {
  id: string
  name: string
  category: MapCategory
  city?: string
  region?: string
  lat?: number
  lng?: number
  description?: string
  user_id?: string
  phone?: string
  verified: boolean
  created_at: string
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}


// ─── PHASE D: Moderation ────────────────────────────────────
export type ReportContentType = 'listing' | 'transport_listing' | 'route_request' | 'message' | 'review' | 'profile' | 'comment'

export interface ContentReport {
  id: string
  reporter_id?: string
  content_type: ReportContentType
  content_id?: string
  reason: string
  details?: string
  status: 'open' | 'reviewing' | 'actioned' | 'dismissed'
  created_at: string
}

export interface ModerationLog {
  id: string
  actor: 'system' | 'admin'
  actor_id?: string
  content_type: string
  content_id?: string
  action: 'blocked_profanity' | 'flagged' | 'approved' | 'removed' | 'warned'
  reason?: string
  metadata?: Record<string, unknown>
  created_at: string
}
