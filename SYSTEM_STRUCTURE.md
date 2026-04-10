# Informe Técnico de Estructura del Sistema (GA4 Management)

## 1. Propósito y Objetivos
El sistema GA4 Management ha sido construido para centralizar y automatizar los procesos de análisis de datos y administración operativa del departamento de Mercadeo. 
- **Mejora de Procesos**: Automatiza la extracción de datos de la API de Google Analytics 4, eliminando la necesidad de reportes manuales. Proporciona una "Bóveda" segura para credenciales, reduciendo riesgos de seguridad por manejo de archivos planos. El "Duty Planner" automatiza la detección de feriados y el cálculo de horas extra, facilitando la nómina y planificación.

## 2. Arquitectura del Sistema
El sistema sigue un modelo de **Arquitectura Híbrida de Isla (Astro Islands)** combinada con un **Backend-as-a-Service (Supabase)**.

- **Capa de Presentación**: Astro para el routing y SSR (Server Side Rendering), React para componentes con estado complejo.
- **Capa de Lógica (Middleware)**: API Routes de Astro/Next ejecutándose en Vercel Functions.
- **Capa de Datos**: Supabase (PostgreSQL) con Realtime activado.

## 3. Módulos y Funcionalidad

### A. Dashboard y Analítica (GA4/Social)
- **Funcionalidad**: Consulta métricas mediante la API oficial. Incluye filtros por fecha (7, 30, 90 días) y desgloses por ruta de contenido.
- **Tecnologia**: Recharts para visualización, `api-fetch` para comunicación con Vercel Functions.

### B. Bóveda de Seguridad (Vault)
- **Funcionalidad**: Almacena usuarios y contraseñas de servicios institucionales.
- **Seguridad**: Los datos se encriptan mediante AES-256 en el servidor antes de guardarse en Supabase. El cliente nunca recibe la clave secreta.
- **Acceso**: Limitado por RLS y MFA (biometría).

### C. Planificador de Guardias (Duty Planner)
- **Funcionalidad**: Calendario interactivo de turnos. 
- **Lógica Especial**: Calcula automáticamente horas extra si el turno cae en fin de semana, feriado venezolano (lista estática de 2025-2026) o fuera del horario 8am-5pm.
- **Auditoría**: Cada cambio genera un log en `duty_audit_logs`.

### D. Centro de Notificaciones
- **Funcionalidad**: Sistema de mensajería interna y registro de eventos del sistema.
- **Realtime**: Suscripción vía WebSockets a la tabla `system_notifications`.

## 4. Estructura de Base de Datos (Esquema Principal)

| Tabla | Propósito |
| :--- | :--- |
| `user_profiles` | Perfiles de usuario, roles, avatars y estados. |
| `vault_credentials` | Datos encriptados de la bóveda. |
| `duty_shifts` | Registro de turnos, fechas, usuarios y notas. |
| `system_notifications` | Alertas globales y personales con estado `is_read`. |
| `duty_audit_logs` | Historial inmutable de cambios en el calendario. |

## 5. Infraestructura y Seguridad
- **Host**: Vercel (Deployment continuo desde GitHub).
- **Seguridad Web y Protección de Datos**: 
    - HTTPS obligatorio en todo el sitio.
    - Autenticación JWT mediante Supabase.
    - **Protección RLS (Row-Level Security) Estricta**: Todas las tablas del esquema público están blindadas. El acceso "público" incondicional (`USING (true)`) está deshabilitado. Solo usuarios con una sesión JWT válida (`auth.uid() IS NOT NULL`) pueden ver la información operativa general.
    - **Control Granular (Bóveda)**: Credenciales encriptadas mediante AES-256 (Server-side). Las políticas RLS restringen la lectura exclusivamente a perfiles del departamento de "Mercadeo" o "Comunicaciones", o miembros con el flag `has_vault_access`.
    - Biometría: Soporte para Passkey/WebAuthn en flujos de inicio de sesión modernos.

## 6. Mantenimiento y Escalabilidad
El sistema está diseñado para ser modular. Cada componente en `src/components` es independiente, lo que permite añadir módulos (ej. Gestión de Inventario, Presupuesto) simplemente creando un nuevo componente e insertándolo en el Sidebar.
