import json
import boto3
import uuid

dynamodb = boto3.resource('dynamodb')
tabla_donantes = dynamodb.Table('Donantes')

def lambda_handler(event, context):
    # Paso 1: traducir el texto que llega a una caja utilizable
    datos = json.loads(event['body'])

    # Paso 2: sacar cada dato de su casilla
    nombre = datos['nombre']
    tipo_donante = datos['tipo_donante']
    identificacion = datos['identificacion']
    correo = datos['correo']
    es_anonimo = datos['es_anonimo']

    # Paso 3: generar un ID único para este donante
    donante_id = str(uuid.uuid4())

    # Paso 4: guardar todo junto en la base de datos
    tabla_donantes.put_item(
        Item={
            'Donante_id': donante_id,
            'nombre': nombre,
            'tipo_donante': tipo_donante,
            'identificacion': identificacion,
            'correo': correo,
            'es_anonimo': es_anonimo
        }
    )

    # Paso 5: avisar que todo salió bien
    return {
        'statusCode': 200,
        'body': json.dumps({'mensaje': 'Donante creado', 'Donante_id': donante_id})
    }