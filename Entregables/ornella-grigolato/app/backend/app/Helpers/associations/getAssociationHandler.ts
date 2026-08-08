import APIGatewayAuthorizedEvent from "app/Types/APIGatewayAuthorizedEvent";
import { Association } from "Types/Association";
import dynamoServices from "Helpers/dynamo";

/** Lógica compartida por el endpoint público y el privado: son exactamente el
 *  mismo comportamiento, la única diferencia está en el authorizer que cada
 *  ruta declara en su serverless.function.yml. */
export const getAssociationHandler = async (
  event: APIGatewayAuthorizedEvent,
) => {
  const identifier = event.pathParameters?.id as string;
  let association: Association;
  // 1. Validamos que realmente haya llegado información
  if (!identifier) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "Falta el ID o el slug de la asociación.",
      }),
    };
  }

  const isUUID =
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
      identifier,
    );

  // 2. Intentamos obtener la asociación desde DynamoDB
  try {
    if (isUUID) {
      association = await dynamoServices.getItem({
        TableName: process.env.ASSOCIATIONS_TABLE_NAME as string,
        Key: { id: identifier },
      });
    } else {
      association = await dynamoServices.getQueryOne({
        TableName: process.env.ASSOCIATIONS_TABLE_NAME as string,
        IndexName: "slug-index",
        KeyConditionExpression: "slug = :slug",
        ExpressionAttributeValues: {
          ":slug": identifier,
        },
      });
    }
  } catch (error) {
    console.error("Error obteniendo desde DynamoDB:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Error interno al intentar obtener la asociación.",
      }),
    };
  }

  // 3. Validamos si la base de datos devolvió información
  if (!association) {
    return {
      statusCode: 404, // Not Found
      body: JSON.stringify({
        message: "La asociación no existe o no fue encontrada.",
      }),
    };
  }

  // 4. Caso de éxito
  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
    },
    body: JSON.stringify({
      association,
    }),
  };
};
