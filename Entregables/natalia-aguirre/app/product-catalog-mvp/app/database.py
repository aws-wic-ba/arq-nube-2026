import os
import boto3
from botocore.exceptions import ClientError
from fastapi import HTTPException

# Se inicializa el cliente usando las mejores prácticas: configuración externa mediante variables de entorno
AWS_REGION = os.getenv("AWS_REGION", "us-east-1")
TABLE_NAME = os.getenv("DYNAMODB_TABLE", "ProductsCatalog")

# Boto3 toma automáticamente las credenciales del IAM Role asignado a la tarea de Fargate
dynamodb = boto3.resource("dynamodb", region_name=AWS_REGION)
table = dynamodb.Table(TABLE_NAME)

def get_product_by_id(product_id: str):
    try:
        response = table.get_item(Key={"product_id": product_id})
        return response.get("Item")
    except ClientError as e:
        raise HTTPException(status_code=500, detail=f"Database error: {e.response['Error']['Message']}")

def create_or_update_product(product_data: dict):
    try:
        table.put_item(Item=product_data)
        return product_data
    except ClientError as e:
        raise HTTPException(status_code=500, detail=f"Database error: {e.response['Error']['Message']}")

def scan_all_products(limit: int = 20):
    try:
        # Nota: Scan es aceptable para MVP. Para producción con millones de datos, indexar por GSI.
        response = table.scan(Limit=limit)
        return response.get("Items", [])
    except ClientError as e:
        raise HTTPException(status_code=500, detail=f"Database error: {e.response['Error']['Message']}")
