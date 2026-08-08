import { getAssociationHandler } from "Helpers/associations/getAssociationHandler";

// Endpoint PÚBLICO: lo consume la página del refugio (/refugio/{slug}), que
// tiene que poder abrirse sin sesión. Sin authorizer.
export const handler = getAssociationHandler;
