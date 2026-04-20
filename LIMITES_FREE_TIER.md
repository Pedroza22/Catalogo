# Análisis de Límites de Capas Gratuitas (Free Tier)

Este documento detalla los límites de las versiones gratuitas de **Supabase** (Base de Datos, Autenticación y Almacenamiento) y **Vercel** (Hosting y Ancho de Banda) para el proyecto "Catálogo". Es importante monitorear estos límites para asegurar que el proyecto se mantenga operativo sin incurrir en costos adicionales.

---

## 1. Supabase (Plan Gratuito / Free Tier)

Supabase ofrece una capa gratuita generosa, pero la base de datos **se pausará automáticamente tras 7 días de inactividad** (si no recibe tráfico o consultas). Sin embargo, se puede reactivar manualmente desde el panel de control.

### Límites Principales:

*   **Base de Datos (PostgreSQL):**
    *   **Espacio en disco:** 500 MB. *(Suficiente para miles de productos, clientes y pedidos. El texto ocupa muy poco espacio).*
    *   **Ancho de banda (Egress / Salida de datos):** 2 GB por mes.
*   **Almacenamiento de Archivos (Supabase Storage):**
    *   **Espacio total para archivos:** 1 GB. *(Aquí se guardan las imágenes de los productos y categorías).*
    *   **Consejo:** Optimiza y comprime las imágenes antes de subirlas. Si cada imagen pesa ~200 KB, podrías almacenar unas 5,000 imágenes. Si pesan 1 MB, solo unas 1,000.
*   **Autenticación (Usuarios):**
    *   **Usuarios Activos Mensuales (MAU):** 50,000 usuarios. *(Límite muy alto para un catálogo local).*
*   **Edge Functions (Funciones en la nube):**
    *   **Invocaciones:** 500,000 por mes.

**¿Cuándo tendrías que pagar en Supabase?**
*   Si superas el 1 GB de imágenes almacenadas.
*   Si el tráfico de salida de datos (gente viendo el catálogo intensamente) supera los 2 GB mensuales.
*   Si la base de datos supera los 500 MB (muy difícil solo con texto de productos y pedidos).

---

## 2. Vercel (Plan Gratuito / Hobby Tier)

Vercel aloja el frontend (la aplicación Next.js). El plan Hobby está diseñado para proyectos personales y sin fines de lucro, aunque es tolerante para proyectos pequeños de baja intensidad.

### Límites Principales:

*   **Ancho de banda (Bandwidth):** 100 GB por mes. *(Muy generoso. Para superarlo, la página tendría que recibir decenas de miles de visitas al mes).*
*   **Serverless Functions (Ejecución de código en el backend de Next.js):**
    *   100 GB-horas por mes.
*   **Edge Middleware:** 1 millón de invocaciones.
*   **Límite de Ejecución (Serverless):** Cada función no puede tardar más de 10 segundos en ejecutarse.
*   **Imágenes Optimizadas (Next/Image):** 1,000 imágenes optimizadas al mes. *(Ojo aquí: si mucha gente carga muchas imágenes diferentes en la página, Vercel cobra por optimizar más de 1,000 imágenes únicas al mes).*

**¿Cuándo tendrías que pagar o tener problemas con Vercel?**
*   Si el sitio web se vuelve extremadamente popular y excedes los 100 GB de ancho de banda mensual.
*   Si usas excesivamente el componente `<Image>` de Next.js de forma dinámica y superas las 1,000 optimizaciones (las vistas de los clientes). Vercel simplemente bloqueará la optimización y servirá las imágenes originales o fallará si se excede repetidamente.

---

## 3. Recomendaciones para mantener el proyecto en "Costo Cero"

Dado que cobraste $800 (asumo USD o moneda local equivalente) y el objetivo es mantener el costo mensual en $0, sigue estas prácticas:

1.  **Optimización Estricta de Imágenes:**
    *   Asegúrate de que quien administre el catálogo suba las imágenes comprimidas (preferiblemente en formato WebP o JPEG con baja calidad, que pesen **menos de 150 KB**). Esto cuidará el límite de 1 GB de Supabase Storage.
2.  **Actividad de la Base de Datos:**
    *   Recuerda ingresar al panel de Supabase o hacer consultas a la base de datos al menos una vez por semana para evitar que Supabase "pause" el proyecto por inactividad.
3.  **Monitoreo Mensual:**
    *   A finales de cada mes, revisa los paneles de control de **Vercel** (sección de Usage) y **Supabase** (sección de Billing/Usage) para ver qué tan cerca están los límites.
4.  **Términos de Servicio (Vercel):**
    *   Técnicamente, el plan "Hobby" de Vercel prohíbe el uso comercial. Si el cliente tiene un dominio propio y genera mucho dinero visible, Vercel *podría* pedirte que pases al plan "Pro" ($20 USD/mes). Sin embargo, para catálogos pequeños, rara vez hacen auditorías.

### Resumen de Capacidad Estimada en Free Tier:
*   **Productos que soporta la BD:** Más de +50,000 productos.
*   **Imágenes que soporta (1GB):** ~3,000 a 5,000 imágenes (si están bien optimizadas a ~200KB c/u).
*   **Visitas mensuales:** ~5,000 a 10,000 visitas (dependiendo de cuántas páginas y fotos vean por visita).