from fastapi import FastAPI, HTTPException, status
from pydantic import BaseModel, Field
from typing import List, Optional
from app.database import get_product_by_id, create_or_update_product, scan_all_products

app = FastAPI(title="AWS Serverless Product Catalog MVP", version="1.0.0")

# Modelos de validación de datos de entrada/salida (Pydantic)
class Product(BaseModel):
    product_id: str = Field(..., description="ID único del producto")
    name: str = Field(..., min_length=2, max_length=100)
    description: Optional[str] = None
    price: float = Field(..., gt=0, description="El precio debe ser mayor a cero")
    stock: int = Field(..., ge=0, description="El stock no puede ser negativo")

@app.get("/health", status_code=status.HTTP_200_OK)
def health_check():
    # Crucial para que el Load Balancer de AWS verifique si el contenedor está vivo
    return {"status": "healthy", "service": "product-catalog"}

@app.get("/products/{product_id}", response_model=Product)
def read_product(product_id: str):
    product = get_product_by_id(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return product

@app.post("/products", response_model=Product, status_code=status.HTTP_201_CREATED)
def add_product(product: Product):
    existing = get_product_by_id(product.product_id)
    if existing:
        raise HTTPException(status_code=400, detail="El ID del producto ya existe")
    return create_or_update_product(product.model_dump())

@app.get("/products", response_model=List[Product])
def list_products(limit: Optional[int] = 20):
    return scan_all_products(limit=limit)
