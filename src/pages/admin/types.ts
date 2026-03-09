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
  | "auditlog"
  | "payouts";

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

export type ProgramForm = {
  name: string;
  domainId: string;
  categoryId: string;
  gridDescription: string;
  gridImageUrl: string;
  overview: string;
  sortOrder: string;
  durationLabel: string;
  durationWeeks: string;
  priceIN: string;
  priceUK: string;
  priceUS: string;
  whatYouGet: string;
  whoIsThisFor: string;
  tags: string;
  detailHeading: string;
  detailDescription: string;
};
