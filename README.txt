PUNTORECICLA ONE PAGE
Dominio: https://reciclajedeordenadores.com.es/
(corregido de http:// a https:// en canonical, og:url no existía,
JSON-LD, robots.txt y sitemap.xml; sin colisión con ningún otro
dominio revisado en esta sesión)
Teléfono visible en caja: +34 910 05 47 24 (intencional, distinto del
teléfono de los botones de llamada — no se ha tocado)
Teléfono de botones: +34 914 46 85 03
WhatsApp: +34 649 97 01 28
El correo SMTP no aparece visible; se usa solo en /api/contacto.
Variables Vercel compartidas: SMTP_HOST, SMTP_PORT=465, SMTP_SECURE=true, SMTP_USER, SMTP_PASS, CONTACT_EMAIL.

Google Analytics:
G-5Q94Z7KL0B

HISTORIAL: el repositorio era multipágina (16 páginas /servicios/ de
reciclaje y destrucción de datos) y se convirtió a one-page; esas
páginas fueron eliminadas en commits anteriores. Como ya no existen en
el sitemap actual, se ha añadido middleware.mjs para redirigir (301)
cualquier URL antigua a la home, evitando 404 en enlaces indexados o
backlinks antiguos. Excluye /api/* y cualquier ruta con extensión de
archivo. Se añadió "@vercel/functions": "^2.0.3" a package.json como
dependencia de esta función.

REVISIÓN (fixes aplicados en esta pasada):
- Ya estaba bien: banner de cookies (ya corregido en un commit
  anterior), schema.org LocalBusiness, sección SEO "Guía"
  (id="sobre-reciclaje"), menú móvil, borde blanco del chat,
  api/contacto.js con SMTP + nodemailer. No se ha tocado ninguno.
- Google Analytics: no existía. Añadido G-5Q94Z7KL0B.
- Dominio corregido de http:// a https:// (canonical, JSON-LD,
  robots.txt, sitemap.xml).
- Schema.org: añadidos areaServed y sameAs (Google Maps y YouTube),
  que faltaban.
- .navcall: el texto largo ("Atención Telefónica 24 horas 365 días")
  deformaba la píldora del menú. Acortado a solo el número
  (+34 914 46 85 03) y añadido white-space:nowrap como salvaguarda. El
  botón grande de teléfono de la sección hero (.cta.phone) conserva su
  texto completo, ya que ahí no hay problema de desbordamiento.

REVISIÓN ADICIONAL (checklist unificado de la familia, a petición del cliente):
- H1 verificado: "Reciclamos tus equipos. Protegemos toda tu
  información." ya es afirmativo, corto y no repite la plantilla "no
  funciona". No se ha tocado.
- BUG REAL — el botón CTA de teléfono no tenía icono, a diferencia del
  de WhatsApp. Añadido (verificado con cuidado el cierre de las
  etiquetas </a>: 18 aperturas / 18 cierres).
- BUG REAL — la casilla de política de privacidad existía pero el
  texto no enlazaba a ningún sitio. Añadido el enlace estándar de la
  familia a https://kelatos.com/privacy-policy/, resaltado en azul.
- BUG REAL — texto decorativo gigante ".data:after" ("DATOS", 190px)
  sin ninguna reducción de tamaño en tablet/móvil. Añadida (100px
  tablet, 64px móvil). El ticker ".hero:after" ya se ocultaba
  correctamente en móvil, no se ha tocado.
- Añadido "Sábados, domingos y días festivos estamos cerrados" debajo
  del horario.
- No se ha añadido franja de aviso de servicio técnico independiente:
  no aplica a este negocio (reciclaje de equipos y destrucción de
  datos, sin el enfoque de reparación de marcas concretas del resto
  de la familia).
- Verificado sin bugs: no existe ninguna etiqueta rotada tipo
  hero-chip (.shape es una forma decorativa sin texto); Cal.com ya
  estaba presente; schema.org ya usaba correctamente el teléfono de la
  caja de información (+34 910 05 47 24, distinto del de los
  botones); formulario correctamente conectado a /api/contacto.
- H1 de portada reescrito, corto, directo y totalmente afirmativo
  (sin interrogación ni condicionales): "Reciclamos tus equipos.
  Protegemos toda tu información." Tamaño del H1 aumentado:
  clamp(38-56px) → clamp(46-74px) en escritorio, 39px → 48px en móvil.

REVISIÓN ADICIONAL (checklist unificado de la familia, a petición del cliente — repo 34/48):
- BUG REAL — enlace de Cal.com desactualizado. Actualizado a
  https://cal.com/kelatos/30min?embed=true&theme=light&attendeePhoneNumber=%2B34&overlayCalendar=true.
- Verificado: el correo soporte@kelatos.com no aparece visible.
- BUG REAL — el mensaje prellenado de WhatsApp decía "¡Hola Kelatos!".
  Corregido a "¡Hola PuntoRecicla!".
- Verificado: el menú móvil ya se cerraba correctamente al pulsar un
  enlace.
- Verificado: sin iconos ni imágenes con proporciones fijas
  incorrectas.
- Verificado: el H1 en móvil ya está en 48px.
- BUG REAL — botones del hero (.cta) con border-radius de 15px y sin
  estado hover. Aumentado a border-radius:999px; añadido
  filter:brightness(.88) en wa/pickup (colores sólidos) y relleno
  sólido con var(--orange) + texto blanco en el botón de teléfono
  (estilo contorno, borde naranja) al pasar el ratón.
- Verificado: ".badge" es un único elemento con icono y texto, no el
  patrón de franja de insignias de 4 elementos de la familia Dyson; no
  aplica la reubicación.
- No se ha añadido franja de aviso de servicio técnico independiente:
  no aplica a este negocio (reciclaje de equipos y destrucción de
  datos, sin el enfoque de reparación del resto de la familia).

SOLICITUD DE RECICLAJE (2026-11-03):
- Página independiente /solicitud-reciclaje (solicitud-reciclaje.html + assets/reciclaje.css + assets/reciclaje.js), fuera de la landing.
- Envío a /api/reciclaje (api/reciclaje.js): valida en servidor, admite hasta 5 adjuntos (fotos JPG o PDF, 3 MB) y manda el resumen por correo
  (mismas variables SMTP_* / CONTACT_EMAIL que /api/contacto). Campo trampa anti-spam "web". Referencia RZ-AAAAMMDD-XXXX.
- QR de recepción: assets/qr-solicitud-reciclaje.svg (web) y .png (imprimir). Apunta a /solicitud-reciclaje?utm_source=qr&utm_medium=recepcion.
  Está en la página de la solicitud y en la landing (sección "Solicitud de reciclaje"), y todos los enlaces se abren en pestaña nueva.
- vercel.json: la nueva ruta se excluye de la redirección 301 a la home. sitemap.xml incluye la página nueva.

BLOG (/blog):
- Los artículos NO viven en este repositorio: los genera y aprueba el agente
  SEO de Kelatos (Agentes V2 → organización «PuntoRecicla», clave puntorecicla)
  y se leen en vivo de la API pública de Kelatos, sin token:
  https://db.affirmatechnology.com/kelatos-api/publico/blog?org=puntorecicla
- api/blog.js + lib/blog.js generan /blog y /blog/<slug> en el servidor.
- api/sitemap.js genera /sitemap.xml con la home, /solicitud-reciclaje, /blog y
  cada artículo (se eliminó el sitemap.xml estático).
- Estilos en assets/blog.css. Enlace «Blog» en el menú y en el pie de la home y
  de la página de solicitud.
