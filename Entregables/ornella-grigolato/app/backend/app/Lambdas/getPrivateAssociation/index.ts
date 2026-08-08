import APIGatewayAuthorizedEvent from "app/Types/APIGatewayAuthorizedEvent";
import { getAssociationHandler } from "Helpers/associations/getAssociationHandler";

// Endpoint PRIVADO: mismo comportamiento que el público, pero detrás del
// authorizer de Cognito y sólo sobre el refugio de quien llama.
export const handler = async (event: APIGatewayAuthorizedEvent) => {
  const identifier = event.pathParameters?.id;
  const userSlug =
    event.requestContext.authorizer?.claims?.["custom:association_slug"];

  // El authorizer sólo garantiza que el token es válido, no que el refugio
  // pedido sea el de quien pregunta: sin este chequeo, cualquier refugio
  // logueado lee los datos de otro cambiando el slug de la URL.
  if (!userSlug || identifier !== userSlug) {
    return {
      statusCode: 403,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({ message: "Acceso denegado a este refugio." }),
    };
  }

  return getAssociationHandler(event);
};
