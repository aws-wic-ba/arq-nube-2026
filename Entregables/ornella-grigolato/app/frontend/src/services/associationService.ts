import type { Association } from "../Types/Association";

const CREATE_ASSOCIATION_URL = `${import.meta.env.VITE_API_URL_POST}/createAssociation`;

export interface CreateAssociationInput {
  email: string;
  password: string;
  name: string;
  description: string;
  city: string;
  contactPhone: string;
  logoUrl: string;
  primaryColor: string;
  secondaryColor?: string;
}

export interface CreateAssociationResponse {
  message: string;
  association: Association;
}

export async function createAssociation(
  input: CreateAssociationInput,
): Promise<CreateAssociationResponse> {
  const response = await fetch(CREATE_ASSOCIATION_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  const data: Partial<CreateAssociationResponse> = await response
    .json()
    .catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.message || `No pudimos crear tu refugio (error ${response.status}).`,
    );
  }

  return {
    message: data.message ?? "",
    association: data.association as Association,
  };
}
