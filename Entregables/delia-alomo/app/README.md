# 🧭 ZeroToTech

**Perdele el miedo a la tecnología. De cero a tu rol IT.**

ZeroToTech es una plataforma interactiva que acompaña a personas sin experiencia técnica a descubrir su lugar en el mundo de la tecnología. No es un curso. No es un test vocacional. Es un mentor digital que guía, motiva y conecta a cada usuario con su camino personalizado en IT.

> Porque nadie debería quedarse afuera de la tecnología por no saber por dónde empezar.

---

## 🎬 Demo

- 🔗 [Demo principal](https://zerototech-mu.vercel.app/)

---

## ❗ Problema

Millones de personas quieren trabajar en tecnología pero nunca dan el primer paso.

- **No saben por dónde empezar.** La información está fragmentada, desactualizada y llena de tecnicismos.
- **Sienten que no son suficientes.** El síndrome del impostor frena antes de intentar.
- **No conocen el ecosistema.** No saben qué roles existen, qué empresas contratan ni qué comunidades los esperan.
- **Están solos.** No tienen mentoría, guía ni acompañamiento.

El resultado: personas capaces abandonan la idea antes de intentarlo.

---

## 💡 Solución

ZeroToTech transforma la incertidumbre en un camino claro.

Una experiencia interactiva y gamificada que:

1. **Descubre el perfil del usuario** mediante un test situacional sin tecnicismos.
2. **Recomienda una ruta personalizada** con recursos, certificaciones y proyectos.
3. **Muestra el ecosistema completo** — roles, empresas, fundaciones, comunidades y eventos.
4. **Motiva con gamificación** — XP, niveles y progreso visible.
5. **Persiste el progreso** sin registro, usando LocalStorage.

El usuario no necesita saber nada de tecnología para empezar. Solo necesita curiosidad.

---

## ✨ Características principales

- 🧭 **Test de orientación IT** — 4 preguntas situacionales que mapean a 5 perfiles tecnológicos.
- 🗺️ **Roadmap personalizado** — Ruta por fases (Fundamentos → Herramientas → Certificaciones → Proyectos) según el perfil.
- ⭐ **Sistema de XP y niveles** — Gamificación que premia el avance y mantiene la motivación.
- 🏢 **Directorio de empresas** — 19 empresas tech (argentinas e internacionales) con cultura, tecnologías y programas para juniors.
- 🎓 **Oportunidades reales** — 14 fundaciones con formación gratuita, 7 comunidades activas y 6 eventos tech.
- 📖 **Glosario interactivo** — Traductor de jerga IT explicado "con manzanas".
- 💾 **Persistencia sin login** — Todo el progreso se guarda en LocalStorage.
- 🎯 **Personalización** — Las recomendaciones se adaptan al perfil descubierto.
- 📱 **100% responsive** — Funciona en móvil, tablet y desktop.
- ♿ **Accesible** — Navegación por teclado, ARIA labels, focus visible, prefers-reduced-motion.

---

## 🛠️ Tecnologías

| Capa | Tecnología |
|------|-----------|
| Framework | React 18 + TypeScript |
| Build | Vite 5 |
| Estilos | Tailwind CSS 3 |
| Iconografía | Lucide React |
| Persistencia | LocalStorage (browser) |
| Deploy | Vercel |
| Tipografías | Cormorant Garamond + Inter |
| Diseño | Design System propio (Noxora) |

---

## 🏗️ Arquitectura

```
src/
├── components/ui/       → Componentes reutilizables (Logo, Button, Badge)
├── features/
│   ├── home/            → Hero + Header + Navegación
│   ├── discovery/       → Test de orientación + Loader
│   ├── results/         → Perfil + Roadmap + XP
│   ├── guide/           → Roles IT + Glosario
│   ├── companies/       → Directorio de empresas
│   ├── community/       → Comunidades tech
│   └── opportunities/   → Fundaciones + Eventos
├── layouts/             → MainLayout (estructura global)
├── hooks/               → Custom hooks
├── styles/              → globals.css + Design Tokens
├── types/               → Tipos compartidos
└── utils/               → Utilidades (cn, helpers)
```

**Principios:**
- Feature-based architecture (cada sección es un módulo independiente).
- Data separada de componentes (preparada para migrar a API/DB).
- Design Tokens centralizados (un solo archivo controla toda la UI).
- Componentes reutilizables (CompanyCard, RoleCard, EventCard, FoundationCard).

---

## 🚀 Instalación y uso

```bash
# Clonar el repositorio
git clone https://github.com/Deliaalomo47/zerototech.git
cd zerototech/zerototech

# Instalar dependencias
npm install

# Iniciar en desarrollo
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview
```

**Requisitos:** Node.js 18+ y npm 9+.

---

## 🗺️ Roadmap

| Fase | Estado | Descripción |
|------|--------|-------------|
| MVP — Test + Resultado | ✅ Completado | Test de 4 preguntas, resultado con perfil IT |
| Roadmap interactivo | ✅ Completado | Ruta por fases con XP y progreso persistente |
| Directorio de empresas | ✅ Completado | 19 empresas con info real y programas juniors |
| Oportunidades | ✅ Completado | Fundaciones, comunidades y eventos |
| Personalización | ✅ Completado | Recomendaciones basadas en perfil |
| Design System Noxora | ✅ Completado | Identidad visual dark space con branding propio |
| Backend + Auth | 🔜 Próximo | Persistencia en la nube, perfiles de usuario |
| Mentorías | 🔜 Próximo | Conectar usuarios con mentores voluntarios |
| Contenido dinámico | 🔜 Próximo | CMS para actualizar empresas y eventos |
| PWA | 🔜 Próximo | Instalable como app nativa |

---

## 📊 Impacto

ZeroToTech ataca un problema real y medible:

- **El 65% de las personas** que consideran una carrera en tech no dan el primer paso por falta de orientación.
- **Argentina tiene 10.000+ vacantes IT** sin cubrir cada año.
- **Las fundaciones incluidas** ofrecen formación 100% gratuita pero muchas personas no saben que existen.

**ZeroToTech conecta la demanda con la oferta** de forma humana, accesible y motivadora.

No mide conocimiento. Mide potencial.
No evalúa. Acompaña.
No vende cursos. Abre puertas.

---

## 🏆 Diferenciales

| Aspecto | ZeroToTech | Otros |
|---------|-----------|-------|
| Enfoque | Orientación + motivación | Solo contenido técnico |
| Barrera de entrada | Cero — sin registro, sin tecnicismos | Requiere cuenta, conocimientos previos |
| Gamificación | XP, niveles, progreso visual | Ausente o superficial |
| Ecosistema | Empresas + fundaciones + comunidades + eventos | Solo cursos |
| Personalización | Basada en perfil descubierto | Genérica |
| Tono | Cercano, empático, motivador | Técnico, frío |
| Accesibilidad | WCAG AA, responsive, sin barreras | Variable |

---

## 👩‍💻 Equipo

Proyecto individual desarrollado para el **Kiro AI Hackathon 2026**.

Diseño, desarrollo, UX, contenido y branding realizados por una sola persona con la asistencia de Kiro AI como copiloto de desarrollo.

---

## 📄 Licencia

MIT — Libre para usar, modificar y distribuir.

---

<div align="center">

**ZeroToTech no te enseña tecnología.**
**Te ayuda a descubrir que sí podés formar parte de ella.**

🧭 *Descubrí. Explorá. Crecé.*

</div>
