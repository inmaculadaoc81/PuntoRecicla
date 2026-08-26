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
- H1 de portada reescrito, corto, directo y totalmente afirmativo
  (sin interrogación ni condicionales): "Reciclamos tus equipos.
  Protegemos toda tu información." Tamaño del H1 aumentado:
  clamp(38-56px) → clamp(46-74px) en escritorio, 39px → 48px en móvil.
