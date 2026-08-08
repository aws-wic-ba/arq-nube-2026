import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, TransactWriteCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const TABLA_INVENTARIO = process.env.TABLA_INVENTARIO || "InventarioApp";

export const handler = async (event) => {
  try {
    const body = JSON.parse(event.body || "{}");
    const { idNegocio, items, metodoPago, montoTotal } = body;

    // Validación básica de entrada
    if (!idNegocio || !items || !Array.isArray(items) || items.length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ mensaje: "Datos de venta inválidos o incompletos." }),
      };
    }

    const timestamp = new Date().toISOString();
    const idVenta = `VENTA#${Date.now()}`;
    const pkNegocio = `NEGOCIO#${idNegocio}`;

    // 1. Preparar la transacción
    const transactItems = [];

    // Operación A: Registrar el documento de la venta
    transactItems.push({
      Put: {
        TableName: TABLA_INVENTARIO,
        Item: {
          PK: pkNegocio,
          SK: idVenta,
          items: items,
          montoTotal: montoTotal,
          metodoPago: metodoPago || "Efectivo",
          fecha: timestamp,
        },
      },
    });

    // Operación B: Descontar el stock de cada producto en la transacción
    for (const item of items) {
      transactItems.push({
        Update: {
          TableName: TABLA_INVENTARIO,
          Key: {
            PK: pkNegocio,
            SK: `PRODUCTO#${item.idProducto}`,
          },
          // Resta la cantidad vendida si el stock es suficiente
          UpdateExpression: "SET stock_actual = stock_actual - :cant",
          ConditionExpression: "attribute_exists(PK) AND stock_actual >= :cant",
          ExpressionAttributeValues: {
            ":cant": item.cantidad,
          },
        },
      });
    }

    // 2. Ejecutar la transacción en DynamoDB
    const command = new TransactWriteCommand({
      TransactItems: transactItems,
    });

    await docClient.send(command);

    return {
      statusCode: 201,
      body: JSON.stringify({
        mensaje: "Venta registrada con éxito",
        idVenta: idVenta,
        fecha: timestamp,
      }),
    };

  } catch (error) {
    console.error("Error al procesar la venta:", error);

    if (error.name === "TransactionCanceledException") {
      return {
        statusCode: 400,
        body: JSON.stringify({
          mensaje: "No se pudo completar la venta. Verifique que haya suficiente stock disponible.",
        }),
      };
    }

    return {
      statusCode: 500,
      body: JSON.stringify({ mensaje: "Error interno del servidor", error: error.message }),
    };
  }
};