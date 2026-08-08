import { fetchAuthSession, signOut } from "aws-amplify/auth";

// Cognito guarda el refugio del usuario en este atributo custom
const ASSOCIATION_CLAIM = "custom:association_slug";

/** Qué refugio está viendo el usuario. */
export async function getActiveAssociation(): Promise<string | null> {
  const { tokens } = await fetchAuthSession();
  const slug = tokens?.idToken?.payload[ASSOCIATION_CLAIM];

  return typeof slug === "string" && slug ? slug : null;
}

/** fetchAuthSession devuelve el token */
export async function getAuthHeaders(): Promise<Record<string, string>> {
  const { tokens } = await fetchAuthSession();
  const idToken = tokens?.idToken?.toString();

  if (!idToken) {
    throw new Error("Tu sesión expiró. Volvé a iniciar sesión.");
  }

  // El authorizer COGNITO_USER_POOLS de API Gateway espera el ID token.
  return { Authorization: idToken };
}

export async function hasActiveSession(): Promise<boolean> {
  try {
    const { tokens } = await fetchAuthSession();
    return !!tokens?.idToken;
  } catch {
    return false;
  }
}

export async function endSession(): Promise<void> {
  try {
    await signOut();
  } catch (error) {
    console.error("Error cerrando sesión:", error);
  }
}
