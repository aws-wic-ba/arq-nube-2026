# 05 — Estimación de costos

## Región y fecha de referencia

| Parámetro | Valor |
|-----------|-------|
| Región | us-east-1 (N. Virginia) |
| Fecha de consulta | 08 de agosto de 2026 |
| Fuentes | Páginas oficiales de pricing de AWS (links al final del documento) |

---

## Supuestos técnicos

| Parámetro | Valor | Clasificación |
|-----------|-------|---------------|
| Lambda memory | 256 MB | [DERIVADO DEL TEMPLATE: Globals.Function.MemorySize] |
| Lambda duration promedio | 300 ms | [SUPUESTO: engine ejecuta < 100ms localmente; se asume overhead de cold start y red] |
| Invocaciones Lambda por assessment | 4 | [DERIVADO DE LA ARQUITECTURA: Validate + Threat + Risk + Build] |
| Step Functions duration total | 2 s | [SUPUESTO: 4 Lambdas + 2 DynamoDB ops + overhead de orquestación] |
| Step Functions Express memory | 64 MB | [SUPUESTO BASADO EN MODELO AWS: Express calcula memoria a partir del tamaño de la definición, payload y uso de Map/Parallel. Se redondea en bloques de 64 MB. Como este workflow no usa Map ni Parallel y su definición/payload son pequeños, se utiliza 64 MB como supuesto de memoria facturable] |
| DynamoDB PROCESSING item | 1,190 bytes (~2 KB) | [MEDIDO con build_processing_item() y caso API Proveedores] |
| DynamoDB COMPLETED item completo | 11,963 bytes (~12 KB) | [MEDIDO con build_completed_update() + merge] |
| WRUs PersistProcessing (PutItem) | 2 | [MEDIDO: ceil(1190/1024)] |
| WRUs PersistCompleted (UpdateItem) | 12 | [DERIVADO: AWS factura UpdateItem por tamaño mayor entre item viejo y nuevo; ceil(11963/1024)] |
| Total WRUs por assessment | 14 | [DERIVADO: 2 + 12] |
| API Gateway requests por assessment | 1 | [DERIVADO: POST /api/assess] |
| Frontend S3 storage | ~50 KB (fijo) | [DERIVADO: tamaño de frontend/] |
| CloudFront requests frontend | 5 por assessment | [SUPUESTO: index.html + css + 4 JS] |
| CloudWatch log ingestion | ~5 KB por assessment | [SUPUESTO: Express ALL + Lambda logs] |
| Log retention | 14 días | [DERIVADO DEL TEMPLATE: WorkflowLogGroup RetentionInDays] |

---

## Precios unitarios oficiales AWS — us-east-1

| Servicio | Métrica | Precio USD | Fuente |
|----------|---------|-----------|--------|
| Lambda requests | 1M invocaciones | $0.20 | AWS Lambda Pricing |
| Lambda compute x86 | 1 GB-segundo | $0.0000166667 | AWS Lambda Pricing |
| Step Functions Express requests | 1M ejecuciones | $1.00 | AWS Step Functions Pricing |
| Step Functions Express duration | 1 GB-segundo | $0.0000166700 | AWS Step Functions Pricing (64MB tier, us-east-1) |
| API Gateway REST | 1M requests (primeras 333M) | $3.50 | Amazon API Gateway Pricing |
| DynamoDB on-demand writes | 1M WRU | $0.625 | Amazon DynamoDB On-Demand Pricing |
| DynamoDB storage | 1 GB/mes | $0.25 | Amazon DynamoDB On-Demand Pricing |
| DynamoDB PITR | 1 GB/mes | $0.20 | Amazon DynamoDB On-Demand Pricing |
| S3 Standard storage | 1 GB/mes | $0.023 | Amazon S3 Pricing |
| S3 GET requests | 1,000 requests | $0.0004 | Amazon S3 Pricing |
| CloudFront requests (HTTP) | 10,000 requests | $0.0100 | Amazon CloudFront Pricing |
| CloudFront transfer (primeros 10 TB) | 1 GB | $0.085 | Amazon CloudFront Pricing |
| CloudWatch Logs ingestion | 1 GB | $0.50 | Amazon CloudWatch Pricing |
| CloudWatch Logs storage | 1 GB/mes | $0.03 | Amazon CloudWatch Pricing |

---

## Fórmulas de cálculo

### Lambda

```
Requests = assessments × 4
GB-seconds = requests × (256/1024) × 0.3 = requests × 0.075

Costo requests = (requests / 1,000,000) × $0.20
Costo compute = GB-seconds × $0.0000166667
```

### Step Functions Express

```
Executions = assessments × 1
Duration GB-seconds = executions × (64/1024) × 2 = executions × 0.125

Costo executions = (executions / 1,000,000) × $1.00
Costo duration = GB-seconds × $0.0000166700
```

Nota: AWS Step Functions Express calcula la memoria utilizada a partir del tamaño de la definición del workflow, el payload de ejecución y el uso de estados Map o Parallel. La memoria facturable se redondea en bloques de 64 MB y la duración en incrementos de 100 ms. Como este workflow no utiliza Map ni Parallel y su definición/payload son pequeños, se utiliza 64 MB como supuesto de memoria facturable.

### API Gateway REST

```
Requests = assessments × 1

Costo = (requests / 1,000,000) × $3.50
```

### DynamoDB

```
WRU por assessment = 14 (2 PersistProcessing + 12 PersistCompleted)
Storage por assessment = ~12 KB (item COMPLETED final)

Costo writes = (total_WRU / 1,000,000) × $0.625
Costo storage = storage_GB × $0.25
Costo PITR = storage_GB × $0.20
```

### S3 (Frontend hosting)

```
Storage = ~50 KB (fijo, negligible)
GET requests = assessments × 5

Costo ≈ $0.001/mes (fijo independiente del volumen)
```

### CloudFront

```
Requests = assessments × 6 (5 frontend + 1 API pass-through)
Transfer ≈ assessments × 20 KB (negligible)

Costo requests = (requests / 10,000) × $0.01
```

### CloudWatch Logs

```
Ingestion = assessments × 5 KB
Storage = ingestion × (14/30) factor de retención

Costo ingestion = GB_ingested × $0.50
Costo storage = GB_stored × $0.03
```

---

## Estimación por escenario

### 100 assessments/mes

| Servicio | Detalle | USD/mes |
|----------|---------|---------|
| Lambda requests | 400 req | $0.000 |
| Lambda compute | 30 GB-s | $0.001 |
| SF Express exec | 100 exec | $0.000 |
| SF Express duration | 12.5 GB-s | $0.000 |
| API Gateway REST | 100 req | $0.000 |
| DynamoDB writes | 1,400 WRU | $0.001 |
| DynamoDB storage | 1.2 MB | $0.000 |
| DynamoDB PITR | 1.2 MB | $0.000 |
| S3 | fijo | $0.001 |
| CloudFront | 600 req | $0.001 |
| CloudWatch | 0.5 MB ingest | $0.000 |
| **TOTAL** | | **$0.004** |

### 1.000 assessments/mes

| Servicio | Detalle | USD/mes |
|----------|---------|---------|
| Lambda requests | 4,000 req | $0.001 |
| Lambda compute | 300 GB-s | $0.005 |
| SF Express exec | 1,000 exec | $0.001 |
| SF Express duration | 125 GB-s | $0.002 |
| API Gateway REST | 1,000 req | $0.004 |
| DynamoDB writes | 14,000 WRU | $0.009 |
| DynamoDB storage | 12 MB | $0.003 |
| DynamoDB PITR | 12 MB | $0.002 |
| S3 | fijo | $0.001 |
| CloudFront | 6,000 req | $0.006 |
| CloudWatch | 5 MB ingest | $0.003 |
| **TOTAL** | | **$0.037** |

### 10.000 assessments/mes

| Servicio | Detalle | USD/mes |
|----------|---------|---------|
| Lambda requests | 40,000 req | $0.008 |
| Lambda compute | 3,000 GB-s | $0.050 |
| SF Express exec | 10,000 exec | $0.010 |
| SF Express duration | 1,250 GB-s | $0.021 |
| API Gateway REST | 10,000 req | $0.035 |
| DynamoDB writes | 140,000 WRU | $0.088 |
| DynamoDB storage | 120 MB | $0.030 |
| DynamoDB PITR | 120 MB | $0.024 |
| S3 | fijo | $0.001 |
| CloudFront | 60,000 req | $0.060 |
| CloudWatch | 50 MB ingest | $0.025 |
| **TOTAL** | | **$0.352** |

---

## Resumen comparativo

| Escenario | Total mensual | Costo por assessment |
|-----------|--------------|---------------------|
| 100/mes | $0.004 | $0.00004 |
| 1.000/mes | $0.037 | $0.00004 |
| 10.000/mes | $0.352 | $0.00004 |

El costo por assessment permanece estable porque la arquitectura es puramente pay-per-use sin costos fijos relevantes.

---

## Free Tier — análisis separado

Parte del consumo podría quedar cubierta por beneficios gratuitos dependiendo de la antigüedad, modalidad y elegibilidad de la cuenta AWS. El cálculo principal de este documento no depende del Free Tier.

| Servicio | Beneficio gratuito (según condiciones AWS) | Aplica a nuestro modelo |
|----------|---------------------------------------------|-------------------------|
| Lambda | 1M requests + 400,000 GB-s/mes (always free) | Potencialmente cubre nuestro consumo |
| API Gateway REST | 1M REST calls/mes para cuentas elegibles durante el período definido por AWS. No es un beneficio permanente universal. | Potencialmente cubre el consumo |
| Step Functions | 4,000 state transitions/mes corresponden exclusivamente a Standard Workflows. **No aplicable a Express.** | ❌ No aplica |
| DynamoDB | 25 RCU/WCU gratuitos corresponden a provisioned capacity. Nuestra tabla usa PAY_PER_REQUEST: writes no se descuentan. Los primeros 25 GB de almacenamiento Standard pueden estar cubiertos según condiciones vigentes. | ⚠️ Solo storage potencialmente cubierto |
| S3 | 5 GB storage + 20K GET (según elegibilidad y período) | Potencialmente cubre el consumo |
| CloudFront | 1 TB transfer + 10M requests (según plan y elegibilidad vigente) | Potencialmente cubre el consumo |
| CloudWatch Logs | 5 GB ingestion/mes (según condiciones) | Potencialmente cubre el consumo |

**Créditos AWS para cuentas nuevas:** Desde 2025, AWS ofrece hasta $200 en créditos para nuevas cuentas que pueden aplicarse a servicios elegibles. Este beneficio es temporal y no forma parte del cálculo base.

**Todos los totales de este documento se calculan en modalidad PAY-AS-YOU-GO sin aplicar Free Tier ni créditos promocionales.**

---

## Principales cost drivers

Ordenados de mayor a menor impacto en el escenario de 10.000 assessments/mes:

| # | Servicio | USD/mes (10K) | % del total |
|---|----------|--------------|-------------|
| 1 | DynamoDB writes | $0.088 | 25% |
| 2 | CloudFront | $0.060 | 17% |
| 3 | Lambda compute | $0.050 | 14% |
| 4 | API Gateway REST | $0.035 | 10% |
| 5 | DynamoDB storage + PITR | $0.054 | 15% |
| 6 | CloudWatch Logs | $0.025 | 7% |
| 7 | Step Functions | $0.031 | 9% |
| 8 | Otros (Lambda req, S3, SF exec) | $0.009 | 3% |

**Para reducir costos si el volumen crece significativamente:**
- Implementar TTL en DynamoDB para limpiar assessments antiguos (reduce storage + PITR).
- Reducir log level de Express Workflow de ALL a ERROR.
- Evaluar DynamoDB provisioned con auto-scaling si uso se estabiliza.
- Considerar Lambda ARM64 (Graviton) para ~20% menos en compute.

---

## Inputs para AWS Pricing Calculator

Para reproducir esta estimación en [calculator.aws](https://calculator.aws/):

| Servicio | Parámetros |
|----------|-----------|
| Lambda | Region: us-east-1, Arch: x86, Memory: 256 MB, Requests/mes: 4000, Duration: 300 ms |
| Step Functions | Type: Express, Executions/mes: 1000, Avg duration: 2s, Memory: 64 MB |
| API Gateway | Type: REST, Requests/mes: 1000 |
| DynamoDB | Mode: On-Demand, WRU/mes: 14000, Storage: 12 MB, PITR: enabled |
| S3 | Storage: 1 MB, GET/mes: 5000 |
| CloudFront | Requests/mes: 6000, Transfer: < 1 MB |
| CloudWatch | Ingestion: 5 MB/mes, Retention: 14 days |

---

## Comparación con alternativa container (EC2/ECS)

| Concepto | Serverless (actual) | Container (t3.small 24/7) |
|----------|--------------------|----|
| Costo base | $0 cuando no hay uso | ~$15/mes mínimo |
| + NAT Gateway | No aplica | ~$35/mes |
| + ALB | No aplica | ~$20/mes |
| Total mínimo | $0.004 - $0.35/mes | ~$70/mes |
| Break-even | N/A a volúmenes del MVP | Justificable > 500K assessments/mes |

La arquitectura serverless es significativamente más económica para el volumen esperado del caso de uso.

---

## Limitaciones de la estimación

| Limitación | Impacto |
|-----------|---------|
| Lambda duration (300 ms) es un supuesto | Si cold starts son frecuentes podría ser mayor; si engine es eficiente podría ser menor |
| DynamoDB storage es acumulativo | Sin TTL, crece mes a mes indefinidamente |
| Step Functions duration (2s) es un supuesto | Depende de latencia real de Lambda + DynamoDB en AWS |
| No incluye transfer out de API Gateway | Mínimo para JSON responses < 20 KB |
| No incluye custom domain (Route53) | No definido en IaC actual |
| No incluye WAF | No definido en IaC actual |
| Precios AWS pueden cambiar | Consultar pricing pages antes de usar en producción |
| Express memory billing | AWS calcula memoria según definición, payload y uso de Map/Parallel. Se usa 64 MB como supuesto basado en modelo AWS (sin Map/Parallel, definición pequeña) |

---

## Fuentes oficiales

- [AWS Lambda Pricing](https://aws.amazon.com/lambda/pricing/)
- [AWS Step Functions Pricing](https://aws.amazon.com/step-functions/pricing/)
- [Amazon API Gateway Pricing](https://aws.amazon.com/api-gateway/pricing/)
- [Amazon DynamoDB On-Demand Pricing](https://aws.amazon.com/dynamodb/pricing/on-demand/)
- [Amazon S3 Pricing](https://aws.amazon.com/s3/pricing/)
- [Amazon CloudFront Pricing](https://aws.amazon.com/cloudfront/pricing/)
- [Amazon CloudWatch Pricing](https://aws.amazon.com/cloudwatch/pricing/)
- [AWS Free Tier](https://aws.amazon.com/free/)
