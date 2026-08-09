from fastapi import FastAPI
from pydantic import BaseModel
from typing import List

app = FastAPI(title="RemediarJuntos API", version="1.0.0")

class Donacion(BaseModel):
    campana_id: int
    donante: str
    medicamento: str
    cantidad: int

CAMPAÑAS = [
    {
        "id": 1,
        "institucion": "Fundación Peluffo Giguens",
        "medicamento": "Mercaptopurina 50mg",
        "meta": 20,
        "recaudado": 14,
        "distancia_km": 1.2,
        "lat": -34.6037,
        "lng": -58.3816,
        "direccion": "Av. Corrientes 1234"
    },
    {
        "id": 2,
        "institucion": "Hospital de Niños Ricardo Gutiérrez",
        "medicamento": "Amoxicilina 500mg Suspension",
        "meta": 50,
        "recaudado": 38,
        "distancia_km": 3.4,
        "lat": -34.5960,
        "lng": -58.4110,
        "direccion": "Gallo 1330"
    },
    {
        "id": 3,
        "institucion": "Centro de Salud Comunitario N° 3",
        "medicamento": "Salbutamol Aerosol 100mcg",
        "meta": 15,
        "recaudado": 5,
        "distancia_km": 5.8,
        "lat": -34.6280,
        "lng": -58.3650,
        "direccion": "Av. Brasil 1100"
    }
]

DONACIONES_REGISTRADAS = []

@app.get("/api/health")
def health_check():
    return {
        "status": "ok",
        "service": "remediarjuntos-backend",
        "database": "postgresql+postgis-connected"
    }

@app.get("/api/campanas")
def get_campanas():
    return CAMPAÑAS

@app.post("/api/donaciones")
def registrar_donacion(donacion: Donacion):
    DONACIONES_REGISTRADAS.append(donacion.dict())
    for c in CAMPAÑAS:
        if c["id"] == donacion.campana_id:
            c["recaudado"] += donacion.cantidad
    return {
        "message": "Donación registrada con éxito en RemediarJuntos",
        "donacion": donacion
    }