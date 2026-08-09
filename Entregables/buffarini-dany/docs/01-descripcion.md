# 01 · Descripción de la app

## ¿Qué hace la app?

Es una **lista de tareas (to-do list)** web, hecha en Rust:

- Muestra todas las tareas cargadas.
- Permite agregar una tarea nueva (formulario simple, un campo de texto).
- Permite marcar una tarea como completada / no completada.
- Permite borrar una tarea.
- Muestra un mensaje de confirmación/error (flash message) después de cada acción.

Es una única página (`/`) que se recarga en cada acción — no usa JavaScript ni SPA, todo el
render es server-side con templates de Tera.

**Stack técnico:**

| Capa           | Tecnología                                  |
| -------------- | -------------------------------------------- |
| Lenguaje       | Rust                                         |
| Framework web  | Actix-web 4                                  |
| Base de datos  | PostgreSQL (vía `sqlx`, con queries verificadas en tiempo de compilación) |
| Templates      | Tera (motor de templates tipo Jinja2)        |
| Sesiones       | Cookie firmada (`actix-session`)             |

**Código fuente base:** [render-examples/actix_todo](https://github.com/render-examples/actix_todo)
(fork del ejemplo oficial de `actix/examples`), licencia MIT.

## ¿Por qué la elegiste?
Estoy practicando aprender Rust de forma autodidacta porque me interesa el diseño de software bajo principios SOLID:
| Letra | Principio                     | En inglés                                 | Idea principal                                                                                      |
| ----- | ----------------------------- | ----------------------------------------- | --------------------------------------------------------------------------------------------------- |
| **S** | **Responsabilidad Única**     | **Single Responsibility Principle (SRP)** | Una clase debe tener **una sola razón para cambiar**.                                               |
| **O** | **Abierto/Cerrado**           | **Open/Closed Principle (OCP)**           | El software debe estar **abierto a extensión, pero cerrado a modificación**.                        |
| **L** | **Sustitución de Liskov**     | **Liskov Substitution Principle (LSP)**   | Una subclase debe poder **sustituir a su clase base** sin romper el comportamiento esperado.        |
| **I** | **Segregación de Interfaces** | **Interface Segregation Principle (ISP)** | Es mejor tener **interfaces pequeñas y específicas** que una interfaz grande y general.             |
| **D** | **Inversión de Dependencias** | **Dependency Inversion Principle (DIP)**  | Los módulos de alto nivel no deben depender de detalles; ambos deben depender de **abstracciones**. |



## ¿Quiénes son los usuarios?
Esta es un app personal, de un solo usuario para llevar el registro de mis practicas

## Base de datos

**PostgreSQL**

Esquema (una sola tabla):

```sql
CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  description VARCHAR NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT 'f'
);
```

Los datos son estructurados y con esquema fijo. 
Una tarea tiene id, description, completed — no hay campos variables ni anidados, así que no necesitás la flexibilidad de un documento (Mongo/DynamoDB).
> No hay relaciones complejas hoy, pero podría haberlas. Si en el futuro se agregan usuarios, categorías o etiquetas a las tareas, una base relacional te permite modelarlo con JOINs y foreign keys sin reestructurar todo — algo que en NoSQL requiere pensar el modelo de datos distinto desde el principio.
> Necesito consistencia fuerte. Al marcar una tarea como completada o se la elimina, importa que esa escritura sea inmediata y consistente (ACID) — no hay tolerancia a "eventual consistency" en una lista de tareas (si esta marcada completada y todavía se ve como pendiente un segundo después, es un bug, no un detalle menor).

El volumen y la concurrencia son bajos. No hay necesidad de escalado horizontal masivo ni de particionar datos entre múltiples nodos — el motivo típico para elegir NoSQL (escala horizontal) no aplica acá.

Postgres es gratuito, maduro y bien soportado en AWS (RDS lo ofrece administrado), lo cual simplifica la migración de "contenedor local" a "servicio administrado en la nube" sin cambiar de motor.
