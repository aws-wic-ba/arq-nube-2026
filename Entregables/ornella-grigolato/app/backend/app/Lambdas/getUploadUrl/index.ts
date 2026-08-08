import { APIGatewayEvent } from "aws-lambda";
import s3Helper from "Helpers/s3";

export const handler = async (event: APIGatewayEvent) => {
  try {
    const key = event.queryStringParameters?.key;

    // 1. Validamos que venga el nombre del archivo
    if (!key) {
      return {
        statusCode: 400,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ message: "Falta el nombre del archivo (key)." }),
      };
    }

    // 2. Generamos un nombre único para evitar que las imágenes se pisen entre sí
    // Si mandan "logo.png", queda algo como "1697041234567-logo.png"
    const uniqueFileName = `${Date.now()}-${key}`;

    const newSignedUrl = await s3Helper.getSignedUrlForS3({
      Bucket: process.env.UPLOADS_BUCKET_NAME as string,
      Key: uniqueFileName,
    });

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({
        newSignedUrl,
        // Devolvemos la ruta limpia para que el front ya sepa qué guardar en DynamoDB
        publicUrl: `https://${process.env.UPLOADS_BUCKET_NAME}.s3.amazonaws.com/${uniqueFileName}`,
      }),
    };
  } catch (error) {
    console.error("Error obteniendo signed url desde S3:", error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({
        message: "Error al intentar obtener la signed url desde S3.",
      }),
    };
  }
};
