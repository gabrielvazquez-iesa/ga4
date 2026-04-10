# GA4 Analytics & Management System v4.0

![Astro](https://img.shields.io/badge/Astro-BC52EE?style=for-the-badge&logo=astro&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Supabase](https://img.shields.io/badge/Supabase-181818?style=for-the-badge&logo=supabase&logoColor=3ECF8E)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

Plataforma inteligente y segura diseñada para la gestión de analíticas de Google Analytics 4, administración de accesos institucionales y planificación de guardias para el equipo de Mercadeo y Comunicaciones.

## 🚀 Arquitectura y Tecnologías

El sistema utiliza una arquitectura híbrida moderna para garantizar velocidad, seguridad e interactividad:

- **Frontend Core**: [Astro](https://astro.build/) para una carga ultra-rápida (SSG/SSR).
- **Componentes Interactivos**: [React](https://reactjs.org/) con transiciones fluidas.
- **Base de Datos y Auth**: [Supabase](https://supabase.com/) con PostgreSQL y Row Level Security (RLS).
- **Notificaciones en Tiempo Real**: WebSocket nativo de Supabase para alertas en vivo.
- **Seguridad de Datos**: Encriptación AES-256 (Server-side) para la Bóveda de Accesos.
- **Diseño**: Tailwind CSS con estética Dark Mode premium y animaciones de micro-interacción.

## 📦 Módulos del Sistema

| Módulo | Descripción |
| :--- | :--- |
| **Dashboard GA4** | Visualización centralizada de métricas (Visitas, Usuarios, Rebote) en tiempo real. |
| **Analítica Web** | Desglose por secciones (IESA al Día, Cursos) con MoM (Month-over-Month). |
| **Bóveda (Vault)** | Gestión segura de credenciales institucionales con encriptación militar. |
| **Duty Planner** | Calendario inteligente de guardias con detección de feriados y cálculo de horas extra. |
| **Social Metrics** | Reportes de engagement y rendimiento en plataformas sociales. |
| **Directorio** | Gestión de usuarios, perfiles y permisos granulares de acceso. |
| **Notificaciones** | Centro de alertas con suscripción en tiempo real y registro de auditoría. |

## 🛠️ Instalación y Desarrollo

1. **Clonar el repositorio**:
   ```bash
   git clone https://github.com/Harbinger93/GA4.git
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Variables de Entorno**:
   Configurar `.env` con las claves de Supabase y `VAULT_SECRET_KEY`.

4. **Ejecutar en desarrollo**:
   ```bash
   npm run dev
   ```

5. **Build para producción**:
   ```bash
   npm run build
   ```

## 🔒 Seguridad

- **Autenticación**: Integración con Supabase Auth.
- **Biometría**: Soporte para Passkeys y FaceID/TouchID en navegadores compatibles.
- **Encriptación**: Datos sensibles de la bóveda nunca se almacenan en texto plano.

---
*Desarrollado para el equipo de Mercadeo y Comunicaciones del IESA.*
