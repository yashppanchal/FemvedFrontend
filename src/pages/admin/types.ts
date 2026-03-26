export type AdminTab =
  | "summary"
  | "users"
  | "experts"
  | "domains"
  | "categories"
  | "programs"
  | "coupons"
  | "orders"
  | "enrollments"
  | "analytics"
  | "gdpr"
  | "payouts"
  | "testimonials";

export type UserRow = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  isActive: boolean;
  createdAt: string;
};

export type DomainRow = {
  id: string;
  name: string;
};

export type CategoryRow = {
  id: string;
  name: string;
  domainId: string;
};

export type ProgramRow = {
  id: string;
  name: string;
  domainId: string;
  categoryId: string;
  status?: string;
  expertName?: string;
  expertId?: string;
};

export type DomainForm = {
  name: string;
};

export type CategoryForm = {
  domainId: string;
  name: string;
  heroTitle: string;
  heroSubtext: string;
  ctaLabel: string;
  ctaLink: string;
  pageHeader: string;
  imageUrl: string;
  whatsIncluded: string;
  keyAreas: string;
};

export type DurationEntry = {
  durationId?: string;          // present when editing an existing duration
  priceIdIN?: string;           // existing price row IDs for upsert logic
  priceIdUK?: string;
  priceIdUS?: string;
  label: string;
  weeks: string;
  priceIN: string;
  priceUK: string;
  priceUS: string;
};

export type ProgramForm = {
  name: string;
  domainId: string;
  categoryId: string;
  expertId: string;
  gridDescription: string;
  gridImageUrl: string;
  overview: string;
  sortOrder: string;
  durations: DurationEntry[];
  whatYouGet: string;
  whoIsThisFor: string;
  tags: string;
  detailHeading: string;
  detailDescription: string;
};
