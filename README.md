# AS DE NARIÑO - Comercializadora

Plataforma de catálogo y gestión de pedidos para la comercializadora AS DE NARIÑO. Desarrollada con Next.js, Tailwind CSS y Supabase.

## 🚀 Inicio Rápido

Para que otro desarrollador pueda trabajar en este proyecto, debe seguir estos pasos:

### 1. Prerrequisitos
- Node.js (v18 o superior recomendado)
- Cuenta en [Supabase](https://supabase.com)

### 2. Instalación de Dependencias
Ejecuta el siguiente comando en la raíz del proyecto:

```bash
npm install
```

### 3. Configuración de Variables de Entorno
Copia el archivo de ejemplo y completa los valores con los datos de tu proyecto de Supabase:

```bash
cp .env.example .env.local
```

Los valores necesarios los encuentras en tu Dashboard de Supabase:
- `NEXT_PUBLIC_SUPABASE_URL`: Settings -> API
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Settings -> API -> `anon` `public`
- `SUPABASE_SERVICE_ROLE_KEY`: Settings -> API -> `service_role` (Secret)
- `DATABASE_URL`: Settings -> Database -> Connection string -> URI

### 4. Configuración de la Base de Datos en Supabase
Para que la aplicación funcione correctamente, debes configurar las tablas y políticas en tu proyecto de Supabase:

1. Ve a tu proyecto en el Dashboard de Supabase.
2. Entra en la sección **SQL Editor**.
3. Crea una "New Query" y pega el contenido de los archivos SQL ubicados en `/scripts` en el siguiente orden:
   - `001_create_tables.sql`: Crea las tablas base, tipos y triggers.
   - `002_fix_policies.sql`: Configura las políticas de seguridad (RLS).
   - `003_fix_profiles_rls.sql`: Ajustes específicos para la tabla de perfiles.
   - `004_fix_rls_recursion.sql`: Corrige posibles errores de recursión en políticas.
   - `006_add_missing_columns.sql`: Agrega columnas de negocio necesarias (cost_price, sku, slug) si no existen.
   - `005_insert_transformed_products.sql`: Inserta el catálogo de productos inicial (Desechables, Aseo, etc.).
4. Ejecuta cada script (botón **Run**).

### 5. Scripts Útiles

#### Desarrollo
Inicia el servidor local:
```bash
npm run dev
```

#### Promover Usuario a Administrador
Para dar permisos de administrador a un usuario ya registrado, utiliza:
```bash
npx tsx scripts/make-admin-v2.ts correo@ejemplo.com admin
```

## 🏗️ Estructura del Proyecto

- `/app`: Rutas de Next.js (Dashboard, Perfil, Catálogo, etc.)
- `/components`: Componentes reutilizables de la interfaz (UI).
- `/lib`: Lógica de negocio, acciones de base de datos y utilidades de Supabase.
- `/public`: Imágenes y activos estáticos (incluye el logo oficial).
- `/scripts`: Scripts de administración y configuración inicial de base de datos.

## 🛠️ Tecnologías Principales

- **Framework**: Next.js 16 (App Router)
- **Estilos**: Tailwind CSS + Shadcn UI
- **Base de Datos & Auth**: Supabase
- **Iconos**: Lucide React
- **Validación**: Zod

## 📄 Notas para Desarrolladores
- La aplicación utiliza **RLS (Row Level Security)** en Supabase. Asegúrate de que las políticas estén configuradas para los roles `admin` y `cliente`.
- Las imágenes de productos se almacenan preferiblemente en un Bucket de Supabase Storage llamado `products`.
