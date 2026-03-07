export type AdminTab = "users" | "domains" | "categories" | "programs";

export type UserRow = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
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

export type ProgramStatus = "Draft" | "Published";

export type ProgramRow = {
  id: string;
  title: string;
  domainId: string;
  categoryId: string;
  status: ProgramStatus;
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
  title: string;
  domainId: string;
  categoryId: string;
  status: ProgramStatus;
};
