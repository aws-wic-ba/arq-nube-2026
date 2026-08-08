# features/home

Pantalla de bienvenida / landing. Todavía sin implementar.

Convención para esta y el resto de las features:

```
features/home/
  components/   componentes que solo usa esta feature
  Home.tsx      componente de página, exportado desde acá
  index.ts      barrel export
```

`MainLayout` seguirá siendo el único lugar que define fondo y ancho;
esta feature solo aporta contenido dentro de `<Container>`.
