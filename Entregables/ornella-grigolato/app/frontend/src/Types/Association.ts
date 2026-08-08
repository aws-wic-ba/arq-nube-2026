export interface Association {
  id: string;
  slug: string;
  email: string;

  name: string;
  description: string;
  city: string;
  contactPhone: string;

  logoUrl: string;
  primaryColor: string;
  secondaryColor?: string;
}
