import APIGatewayAuthorizedEvent from "app/Types/APIGatewayAuthorizedEvent";
import { Association } from "Types/Association";
import dynamoServices from "Helpers/dynamo";
import cognitoServices from "Helpers/cognito";
import { generateSlug } from "Helpers/utils/createSlug";

export const handler = async (event: APIGatewayAuthorizedEvent) => {
  // El front manda la contraseña en el body, pero no forma parte de la asociación.
  let associationData: Association & { password?: string };

  // 1. Intentamos parsear el body
  try {
    associationData = JSON.parse(event.body ?? "{}");
  } catch (error) {
    return {
      statusCode: 400,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ message: "El formato de los datos es inválido." }),
    };
  }

  // 2. Validamos que realmente haya llegado información
  if (!associationData || Object.keys(associationData).length === 0) {
    return {
      statusCode: 400,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ message: "Faltan los datos de la asociación." }),
    };
  }

  // 3. Sacamos la contraseña del body: no la guardamos en texto plano. Validamos que hayan
  // llegado los datos de autenticación
  const { password, ...association } = associationData;
  if (!password || !association.email) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Email y contraseña requeridos." }),
    };
  }

  // 4. El nombre define el slug: sin nombre no hay URL pública ni panel.
  if (!association.name) {
    return {
      statusCode: 400,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ message: "El nombre del refugio es requerido." }),
    };
  }

  const associationSlug = generateSlug(association.name);

  // Un nombre hecho sólo de emojis o símbolos deja el slug vacío, y con él
  // vacío no hay página pública ni claim con el que entrar al panel.
  if (!associationSlug) {
    return {
      statusCode: 400,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({
        message: "El nombre del refugio necesita al menos una letra o número.",
      }),
    };
  }

  // 5. Validamos que no exista otro refugio con el mismo slug
  try {
    const existing = await dynamoServices.getQueryOne<Association | undefined>({
      TableName: process.env.ASSOCIATIONS_TABLE_NAME as string,
      IndexName: "slug-index",
      KeyConditionExpression: "slug = :slug",
      ExpressionAttributeValues: { ":slug": associationSlug },
    });

    if (existing) {
      return {
        statusCode: 409,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({
          message: "Ya existe un refugio con ese nombre. Probá con otro.",
        }),
      };
    }
  } catch (error) {
    console.error("Error verificando el slug en DynamoDB:", error);
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({
        message: "Error interno al validar el nombre del refugio.",
      }),
    };
  }

  let cognitoUserId = "";

  // 6. Creamos usuario en Cognito
  try {
    const cognitoResponse = await cognitoServices.adminCreateUser({
      UserPoolId: process.env.COGNITO_USER_POOL_ID as string,
      Username: association.email,
      UserAttributes: [
        { Name: "email", Value: association.email },
        { Name: "email_verified", Value: "true" },
        { Name: "custom:association_slug", Value: associationSlug },
      ],
      MessageAction: "SUPPRESS",
    });

    cognitoUserId =
      cognitoResponse.User?.Attributes?.find((a) => a.Name === "sub")?.Value ||
      crypto.randomUUID();

    await cognitoServices.adminSetUserPassword({
      UserPoolId: process.env.COGNITO_USER_POOL_ID as string,
      Username: association.email,
      Password: password,
      Permanent: true,
    });
  } catch (error: any) {
    console.error("Error en Cognito:", error);
    if (error.name === "UsernameExistsException") {
      return {
        statusCode: 409,
        body: JSON.stringify({ message: "El correo ya está registrado." }),
      };
    }
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Error creando credenciales." }),
    };
  }

  // 7. Armamos el registro final. El front necesita el slug para abrir el panel
  // del refugio recién creado, así que lo devolvemos en la respuesta.
  const createdAssociation: Association = {
    ...association,
    id: crypto.randomUUID(),
    cognitoUserId: cognitoUserId,
    slug: associationSlug,
  };

  // 8. Intentamos guardar en DynamoDB
  try {
    await dynamoServices.putItem({
      TableName: process.env.ASSOCIATIONS_TABLE_NAME as string,
      Item: createdAssociation,
    });
  } catch (error) {
    console.error("Error guardando en DynamoDB:", error);
    // Rollback del usuario
    try {
      await cognitoServices.adminDeleteUser({
        UserPoolId: process.env.COGNITO_USER_POOL_ID as string,
        Username: association.email,
      });
    } catch (rollbackError) {
      console.error("Fallo el rollback en Cognito.", rollbackError);
    }
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({
        message: "Error interno al intentar guardar la asociación.",
      }),
    };
  }

  // 9. Caso de éxito
  return {
    statusCode: 200,
    headers: { "Access-Control-Allow-Origin": "*" },
    body: JSON.stringify({
      message: "¡Asociación guardada con éxito!",
      association: createdAssociation,
    }),
  };
};
