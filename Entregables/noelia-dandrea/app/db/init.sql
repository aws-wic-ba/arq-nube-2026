-- Esquema y datos semilla de Cocina & Objetivo
-- Se ejecuta automáticamente la primera vez que arranca el contenedor de Postgres.
-- En AWS, este mismo esquema vive en Aurora Serverless v2 (PostgreSQL).

CREATE TABLE ingredientes (
  id     SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL UNIQUE
);

CREATE TABLE recetas (
  id        SERIAL PRIMARY KEY,
  nombre    TEXT NOT NULL,
  minutos   INT  NOT NULL,
  kcal      INT  NOT NULL,
  proteina  INT  NOT NULL,
  objetivos TEXT[] NOT NULL,
  pasos     TEXT NOT NULL,
  tip       TEXT NOT NULL
);

-- Relación N:N: una receta tiene muchos ingredientes y un ingrediente
-- aparece en muchas recetas. Es el motivo principal de elegir una base relacional.
CREATE TABLE receta_ingrediente (
  receta_id      INT REFERENCES recetas(id)      ON DELETE CASCADE,
  ingrediente_id INT REFERENCES ingredientes(id) ON DELETE CASCADE,
  PRIMARY KEY (receta_id, ingrediente_id)
);

CREATE TABLE ejercicios (
  id           SERIAL PRIMARY KEY,
  nombre       TEXT NOT NULL,
  zona         TEXT NOT NULL,
  series       TEXT NOT NULL,
  como         TEXT NOT NULL,
  objetivo     TEXT NOT NULL,
  bajo_impacto BOOLEAN NOT NULL DEFAULT true
);

-- Los perfiles guardan datos personales: en AWS esta tabla vive en subred
-- privada y cifrada con KMS. El peso y la altura no se registran acá,
-- sino en el histórico (DynamoDB), para minimizar datos sensibles en la relacional.
CREATE TABLE perfiles (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sexo       CHAR(1) NOT NULL,
  edad       INT NOT NULL CHECK (edad BETWEEN 15 AND 100),
  peso       NUMERIC(5,2) NOT NULL,
  altura     INT NOT NULL,
  actividad  TEXT NOT NULL,
  objetivo   TEXT NOT NULL,
  creado_en  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_ri_ingrediente ON receta_ingrediente(ingrediente_id);
CREATE INDEX idx_ejercicios_obj ON ejercicios(objetivo);

INSERT INTO ingredientes (nombre) VALUES
  ('huevo'), ('pollo'), ('carne picada'), ('atún'), ('lentejas'), ('garbanzos'),
  ('arroz'), ('avena'), ('fideos'), ('papa'), ('batata'), ('tomate'), ('cebolla'),
  ('zanahoria'), ('zapallo'), ('brócoli'), ('espinaca'), ('morrón'), ('palta'),
  ('banana'), ('manzana'), ('yogur'), ('queso'), ('leche'), ('pan integral'),
  ('aceite de oliva'), ('frutos secos');

INSERT INTO recetas (nombre, minutos, kcal, proteina, objetivos, pasos, tip) VALUES
  ('Wok de pollo con verduras y arroz', 25, 610, 48, ARRAY['musculo','mantener'],
   'Sellá el pollo en tiras, salteá las verduras a fuego fuerte y serví sobre el arroz.',
   'Comé primero las verduras del wok y dejá el arroz para el final.'),
  ('Tortilla de espinaca y queso', 15, 330, 26, ARRAY['bajar','mantener','musculo'],
   'Salteá cebolla y espinaca, mezclá con huevo batido y queso, cociná tapada.',
   'Acompañala con ensalada grande para llegar al 50% de verduras del plato.'),
  ('Guiso liviano de lentejas', 40, 480, 24, ARRAY['bajar','mantener'],
   'Rehogá las verduras, sumá las lentejas y el tomate, cociná 30 minutos.',
   'Fibra y proteína vegetal: saciedad barata y de bajo índice glucémico.'),
  ('Bowl de atún, garbanzos y palta', 10, 420, 32, ARRAY['bajar','mantener'],
   'Escurrí el atún y los garbanzos, mezclá con tomate y cebolla, coroná con palta.',
   'Se arma la noche anterior y no necesita microondas.'),
  ('Avena nocturna con yogur y banana', 5, 450, 22, ARRAY['musculo','mantener'],
   'Mezclá avena, yogur y leche, dejá en la heladera toda la noche.',
   'Buen desayuno post-entrenamiento: carbohidrato + proteína.'),
  ('Sopa crema de zapallo y brócoli', 30, 240, 10, ARRAY['bajar'],
   'Herví las verduras y procesá con un poco de leche.',
   'Tomala como entrada: baja las calorías totales de la comida siguiente.');

INSERT INTO receta_ingrediente (receta_id, ingrediente_id)
SELECT r.id, i.id FROM recetas r JOIN ingredientes i ON TRUE
WHERE (r.nombre = 'Wok de pollo con verduras y arroz' AND i.nombre IN ('pollo','brócoli','zanahoria','morrón','cebolla','arroz','aceite de oliva'))
   OR (r.nombre = 'Tortilla de espinaca y queso'      AND i.nombre IN ('huevo','espinaca','cebolla','queso','aceite de oliva'))
   OR (r.nombre = 'Guiso liviano de lentejas'         AND i.nombre IN ('lentejas','zanahoria','cebolla','morrón','tomate','papa'))
   OR (r.nombre = 'Bowl de atún, garbanzos y palta'   AND i.nombre IN ('atún','garbanzos','palta','tomate','cebolla','aceite de oliva'))
   OR (r.nombre = 'Avena nocturna con yogur y banana' AND i.nombre IN ('avena','yogur','banana','frutos secos','leche'))
   OR (r.nombre = 'Sopa crema de zapallo y brócoli'   AND i.nombre IN ('zapallo','brócoli','cebolla','zanahoria','leche'));

INSERT INTO ejercicios (nombre, zona, series, como, objetivo, bajo_impacto) VALUES
  ('Caminata rápida o bici', 'Cardio', '30-40 min, 4 veces por semana', 'Ritmo en el que podés hablar pero no cantar.', 'bajar', true),
  ('Plancha frontal', 'Abdomen', '3 x 30-45 seg', 'Codos bajo los hombros, sin hundir la cintura.', 'bajar', true),
  ('Bicicleta abdominal', 'Abdomen', '3 x 20', 'Movimiento lento, sin tirar del cuello.', 'bajar', false),
  ('Sentadilla con peso corporal', 'Piernas y glúteos', '3 x 15', 'Bajás como si te sentaras en una silla.', 'bajar', true),
  ('Caminata diaria', 'Cardio', '8.000 a 10.000 pasos', 'El piso mínimo de actividad.', 'mantener', true),
  ('Zancadas alternadas', 'Piernas y glúteos', '3 x 12 por pierna', 'Rodilla de atrás cerca del piso, tronco erguido.', 'mantener', true),
  ('Plancha lateral', 'Abdomen', '3 x 30 seg por lado', 'Cuerpo en línea, cadera bien arriba.', 'mantener', true),
  ('Sentadilla con carga', 'Piernas y glúteos', '4 x 8 progresando peso', 'Subí el peso cuando llegues cómoda a 8.', 'musculo', true),
  ('Peso muerto rumano', 'Piernas y glúteos', '4 x 10', 'Cadera hacia atrás, espalda neutra.', 'musculo', true),
  ('Hip thrust', 'Piernas y glúteos', '4 x 12', 'Empujás con los talones y apretás arriba.', 'musculo', true),
  ('Remo con mancuerna', 'Tren superior', '4 x 10 por brazo', 'Tirás con la espalda, no con el brazo.', 'musculo', true),
  ('Press de hombros', 'Tren superior', '3 x 10', 'Sin arquear la zona lumbar.', 'musculo', true);
