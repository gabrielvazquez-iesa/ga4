# Informe Técnico: GA4Dash Corporate Command Center

## 1. Visión General del Sistema
**GA4Dash** es una plataforma unificada de inteligencia de datos y centro de operaciones diseñada para centralizar la monitorización de ecosistemas digitales, la gestión de credenciales y la coordinación de equipos técnicos. El sistema prioriza una estética premium, una experiencia de usuario fluida y una seguridad de grado corporativo.

---

## 2. Stack Tecnológico Principal

### Núcleo de Desarrollo
*   **Framework**: [Astro 5.0+](https://astro.build/) - Utilizado para la generación de sitios estáticos y dinámicos con alto rendimiento y View Transitions.
*   **Librería UI**: [React 19](https://react.dev/) - Potencia todos los componentes interactivos utilizando los últimos estándares de la web.
*   **Lenguaje**: **JavaScript Moderno (ES6+)** & **TypeScript** - Todo el código está escrito siguiendo las mejores prácticas de ESNext (Async/Await, Optional Chaining, ESM) y garantizando robustez mediante tipado estricto.

### Estilos y Diseño
*   **CSS**: [Tailwind CSS 4.0](https://tailwindcss.com/) - Motor de estilos de última generación para una interfaz responsiva y moderna.
*   **Design System**: [Shadcn UI](https://ui.shadcn.com/) - Basado en primitivas de **Radix UI** para accesibilidad y componentes de alta calidad.
*   **Animaciones**: [Framer Motion](https://www.framer.com/motion/) - Utilizada para transiciones complejas, el motor del Mapa del Sistema y micro-interacciones.
*   **Iconografía**: [Lucide React](https://lucide.dev/) - Set de iconos vectoriales consistentes y ligeros.

### Backend y Datos (BaaS)
*   **Base de Datos**: [Supabase (PostgreSQL)](https://supabase.com/) - Almacenamiento relacional con soporte para datos JSONB complejos.
*   **Autenticación**: [Supabase Auth (GoTrue)](https://supabase.com/auth) - Gestión de sesiones segura mediante JWT.
*   **Seguridad**: [Row Level Security (RLS)](https://supabase.com/docs/guides/auth/row-level-security) - Políticas a nivel de base de datos que garantizan que los usuarios solo accedan a su propia información.

---

## 3. Módulos y Funcionalidades Clave

### A. Analítica y Reporteo
1.  **Dashboard GA4**: Extracción híbrida de datos mediante la API oficial de Google Analytics, procesando métricas de tráfico y conversiones sin exponer tokens en el cliente.
2.  **Reporte Meta Ads**: Integración con la API de Marketing de Facebook para visualización de gasto, alcance y rendimiento de campañas sociales.
3.  **Ecosistema Digital**: Panel de monitorización multi-propiedad para supervisar el estado de múltiples sitios y activos digitales desde una sola vista.

### B. Utilidades de Operación
4.  **Bóveda de Credenciales**: Almacenamiento seguro y encriptado de accesos críticos, restringido por perfiles de permisos especiales.
5.  **Planeador de Guardias**: Herramienta interactiva de calendario para la asignación de responsabilidades técnicas semanales.
6.  **Centro de Notificaciones**: Sistema de mensajería interna y notificaciones persistentes para coordinación de equipo.

### C. Administración Avanzada
7.  **Mapa del Sistema**: Un **motor de grafos personalizado** desarrollado con SVG y Framer Motion que permite visualizar la arquitectura, dependencias y flujo de datos del sistema en tiempo real. Esta solución a medida ofrece un rendimiento superior y una estética integrada comparada con librerías estándar.
8.  **Gestión de Usuarios**: Panel administrativo para control de roles, permisos y personalización de perfiles.

---

## 4. Arquitectura y UX

*   **Diseño Adaptativo**: Interfaz optimizada para Desktop, Tablet y Mobile mediante un **Navegador Flotante (Launchpad)** y un **Sidebar Dinámico**.
*   **Personalización**: Sistema de colores de acento dinámicos que permite a cada usuario (o administrador) definir la identidad visual de su panel.
*   **PWA (Progressive Web App)**: Implementación de Service Workers con estrategia *Network-First* para asegurar estabilidad en la carga y posibilidad de instalación en dispositivos móviles.
*   **Glassmorphism**: Uso extensivo de efectos de desenfoque de fondo y transparencias para una sensación de profundidad y modernidad.

---

## 5. Librerías de Terceros Relevantes

| Librería | Propósito |
| :--- | :--- |
| `@supabase/supabase-js` | Cliente oficial para comunicación con la base de datos y auth. |
| `framer-motion` | Orquestador de animaciones y gestos. |
| `lucide-react` | Biblioteca de iconos. |
| `clsx` & `tailwind-merge` | Utilidades para gestión dinámica de clases CSS. |
| `date-fns` | Manipulación y formateo de fechas (usado en el Planeador). |

---

## 6. Seguridad y Despliegue

*   **Hosting**: Desplegado en **Vercel** para aprovechamiento de Edge Functions y CI/CD automático.
*   **Protección**: 
    *   Variables de entorno protegidas para secretos de API (Google, Meta).
    *   Validaciones de sesión en cada ruta protegida mediante middleware y componentes de React.
    *   Políticas CSP y headers de seguridad para mitigar ataques XSS.

---
**Reporte generado automáticamente por Antigravity AI Engine para Gabriel Vázquez.**
