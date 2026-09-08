// Canonical value lists for fields that are plain strings at the database
// layer (SQLite has no native enum support). Keep these in sync with any
// UI copy / filters that reference them.

export const ROLES = ["SUPER_ADMIN", "ADMIN", "AGENT", "BUYER"] as const;
export type Role = (typeof ROLES)[number];

export const PROPERTY_TYPES = [
  "APARTMENT",
  "FLAT",
  "VILLA",
  "HOUSE",
  "PLOT",
  "LAND",
  "SHOP",
  "OFFICE",
  "COMMERCIAL",
] as const;
export type PropertyTypeValue = (typeof PROPERTY_TYPES)[number];

export const PROPERTY_TYPE_LABELS: Record<PropertyTypeValue, string> = {
  APARTMENT: "Apartment",
  FLAT: "Flat",
  VILLA: "Villa",
  HOUSE: "House",
  PLOT: "Plot",
  LAND: "Land",
  SHOP: "Shop",
  OFFICE: "Office",
  COMMERCIAL: "Commercial",
};

export const TRANSACTION_TYPES = ["BUY", "RESALE", "RENT"] as const;
export type TransactionTypeValue = (typeof TRANSACTION_TYPES)[number];

export const TRANSACTION_TYPE_LABELS: Record<TransactionTypeValue, string> = {
  BUY: "Buy",
  RESALE: "Resale",
  RENT: "Rent",
};

export const PROPERTY_STATUSES = [
  "READY_TO_MOVE",
  "UNDER_CONSTRUCTION",
  "NEW_LAUNCH",
  "RESALE",
] as const;
export type PropertyStatusValue = (typeof PROPERTY_STATUSES)[number];

export const PROPERTY_STATUS_LABELS: Record<PropertyStatusValue, string> = {
  READY_TO_MOVE: "Ready to Move",
  UNDER_CONSTRUCTION: "Under Construction",
  NEW_LAUNCH: "New Launch",
  RESALE: "Resale",
};

export const FURNISHING_OPTIONS = ["FURNISHED", "SEMI_FURNISHED", "UNFURNISHED"] as const;
export type FurnishingValue = (typeof FURNISHING_OPTIONS)[number];

export const FURNISHING_LABELS: Record<FurnishingValue, string> = {
  FURNISHED: "Furnished",
  SEMI_FURNISHED: "Semi Furnished",
  UNFURNISHED: "Unfurnished",
};

export const FACING_OPTIONS = [
  "EAST",
  "WEST",
  "NORTH",
  "SOUTH",
  "NORTH_EAST",
  "NORTH_WEST",
  "SOUTH_EAST",
  "SOUTH_WEST",
] as const;
export type FacingValue = (typeof FACING_OPTIONS)[number];

export const FACING_LABELS: Record<FacingValue, string> = {
  EAST: "East",
  WEST: "West",
  NORTH: "North",
  SOUTH: "South",
  NORTH_EAST: "North-East",
  NORTH_WEST: "North-West",
  SOUTH_EAST: "South-East",
  SOUTH_WEST: "South-West",
};

export const LISTING_STATUSES = [
  "PENDING_VERIFICATION",
  "UNDER_REVIEW",
  "VERIFIED",
  "REJECTED",
  "PUBLISHED",
  "UNDER_OFFER",
  "BOOKED",
  "SOLD",
  "RENTED",
  "UNAVAILABLE",
] as const;
export type ListingStatusValue = (typeof LISTING_STATUSES)[number];

export const LISTING_STATUS_LABELS: Record<ListingStatusValue, string> = {
  PENDING_VERIFICATION: "Pending Verification",
  UNDER_REVIEW: "Under Review",
  VERIFIED: "Verified",
  REJECTED: "Rejected",
  PUBLISHED: "Published",
  UNDER_OFFER: "Under Offer",
  BOOKED: "Booked",
  SOLD: "Sold",
  RENTED: "Rented",
  UNAVAILABLE: "Unavailable",
};

// Listing statuses that should appear in public search results.
export const ACTIVE_LISTING_STATUSES: ListingStatusValue[] = [
  "PUBLISHED",
  "VERIFIED",
  "UNDER_OFFER",
];

export const BEDROOM_OPTIONS = [1, 2, 3, 4, 5] as const;

export const LEAD_SOURCES = [
  "WEBSITE_FORM",
  "CALLBACK_REQUEST",
  "SITE_VISIT_REQUEST",
  "WHATSAPP",
  "PHONE_CALL",
  "SELLER_SUBMISSION",
  "CONTACT_FORM",
] as const;
export type LeadSourceValue = (typeof LEAD_SOURCES)[number];

export const LEAD_STATUSES = [
  "NEW",
  "CONTACTED",
  "INTERESTED",
  "SITE_VISIT_SCHEDULED",
  "SITE_VISIT_COMPLETED",
  "NEGOTIATION",
  "BOOKED",
  "SOLD",
  "NOT_INTERESTED",
  "LOST",
] as const;
export type LeadStatusValue = (typeof LEAD_STATUSES)[number];

export const LEAD_STATUS_LABELS: Record<LeadStatusValue, string> = {
  NEW: "New",
  CONTACTED: "Contacted",
  INTERESTED: "Interested",
  SITE_VISIT_SCHEDULED: "Site Visit Scheduled",
  SITE_VISIT_COMPLETED: "Site Visit Completed",
  NEGOTIATION: "Negotiation",
  BOOKED: "Booked",
  SOLD: "Sold",
  NOT_INTERESTED: "Not Interested",
  LOST: "Lost",
};

export const AMENITIES_LIST = [
  "Parking",
  "Lift",
  "Security",
  "Power Backup",
  "Gym",
  "Swimming Pool",
  "Clubhouse",
  "Garden",
  "Balcony",
  "Terrace",
  "CCTV",
  "Water Supply",
  "Gated Community",
] as const;

export const COMPANY = {
  name: "BOK MyHome",
  tagline: "Find a Property You'll Love.",
  phone: "+91 90000 00000",
  whatsapp: "919000000000",
  email: "hello@bokmyhome.com",
  city: "Dhanbad",
  address: "Bank More, Dhanbad, Jharkhand 826001",
};

export const MAX_COMPARE_PROPERTIES = 4;
