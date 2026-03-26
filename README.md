# GA4 Analytics Dashboard (IESA) 📊

Un sistema de analítica profesional y seguro diseñado para la institución IESA. Proporciona una interfaz intuitiva para visualizar datos de Google Analytics 4, gestionar credenciales de servicios y generar reportes mensuales automatizados para gerencia.

## 🚀 Características Principales

- **Dashboard Gerencial:** Visualización dinámica de métricas clave (Páginas Vistas, Usuarios, Engagement) con gráficos interactivos de Recharts.
- **Autenticación Institucional:** Registro y acceso restringido exclusivamente al dominio `@iesa.edu.ve` (validado mediante Supabase Auth + Database Triggers).
- **Gestión por Áreas:** Soporte para departamentos (Mercadeo, Comunicaciones, Ventas, RRHH, etc.) con perfiles de usuario personalizados.
- **Bóveda de Credenciales:** Sistema seguro para almacenar y compartir cuentas de servicios (GA4, Google Ads, Meta, etc.) con niveles de acceso de administrador.
- **Reportes Mensuales:** Herramienta de exportación rápida (Estilo Excel) para métricas de desempeño, optimizada para copiar y pegar directamente en Google Sheets.
- **Modo Claro/Oscuro:** Interfaz moderna con soporte nativo de Tailwind CSS y persistencia de preferencia de tema.
- **Navegación SPA:** Implementación de Astro ClientRouter para una experiencia fluida sin recargas de página.

## 🛠️ Stack Tecnológico

- **Frontend:** [Astro 6](https://astro.build/) (SSR & ClientRouter)
- **Componentes:** [React](https://reactjs.org/) (Islas de interactividad)
- **Estilos:** [Tailwind CSS](https://tailwindcss.com/)
- **Base de Datos & Auth:** [Supabase](https://supabase.com/)
- **IconButton / Iconos:** [Lucide React](https://lucide.dev/)
- **Gráficos:** [Recharts](https://recharts.org/)
- **Notificaciones:** [Sonner](https://sonner.stevenly.me/)

## 📦 Instalación y Configuración

### 1. Clonar el repositorio
```bash
git clone https://github.com/Harbinger93/GA4.git
cd ga4-dashboard
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Variables de Entorno
Crea un archivo `.env` en la raíz del proyecto con las siguientes claves de Supabase:
```env
PUBLIC_SUPABASE_URL=tu_url_de_supabase
PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
```

### 4. Lanzar en Desarrollo
```bash
npm run dev
```
La aplicación estará disponible en `http://localhost:4321`.

## 🔒 Seguridad y Roles

El sistema implementa una política de seguridad estricta:
- **Validación de Dominio:** Solo correos `@iesa.edu.ve` pueden registrarse.
- **Super Admins:** Cuentas específicas (`admin@iesa.edu.ve`, `gabriel.vazquez@iesa.edu.ve`) tienen permisos para gestionar usuarios y editar la bóveda de credenciales.
- **Notificaciones:** Los administradores reciben alertas automáticas en su panel cuando un nuevo usuario se registra en el sistema.

## 📄 Estructura de Reportes
El módulo de "Reportes y Analíticas" está diseñado para coincidir con la estructura del reporte mensual de IESA, incluyendo 16 métricas críticas como:
- Usuarios nuevos vs recurrentes
- Tasa de rebote
- Tiempo promedio de sesión
- Tráfico orgánico y de RRSS

---
Desarrollado para **IESA** | 2026
