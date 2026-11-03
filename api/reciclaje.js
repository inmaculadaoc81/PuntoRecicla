// Solicitud de reciclaje y destrucción de datos (/solicitud-reciclaje): valida y envía el resumen por correo al equipo.
// Mismas variables de Vercel que /api/contacto: SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS, CONTACT_EMAIL.
const nodemailer = require("nodemailer");

const t = (v, max = 2000) => String(v ?? "").replace(/[<>]/g, "").replace(/\r/g, "").trim().slice(0, max);
const lista = (v, max = 30) => (Array.isArray(v) ? v : []).slice(0, max).map((x) => t(x, 120)).filter(Boolean);

const PROVINCIAS = ["A Coruña", "Álava", "Albacete", "Alicante", "Almería", "Asturias", "Ávila", "Badajoz", "Barcelona", "Burgos", "Cáceres", "Cádiz", "Cantabria", "Castellón", "Ciudad Real", "Córdoba", "Cuenca", "Girona", "Granada", "Guadalajara", "Gipuzkoa", "Huelva", "Huesca", "Jaén", "La Rioja", "León", "Lleida", "Lugo", "Madrid", "Málaga", "Murcia", "Navarra", "Ourense", "Palencia", "Pontevedra", "Salamanca", "Segovia", "Sevilla", "Soria", "Tarragona", "Teruel", "Toledo", "Valencia", "Valladolid", "Bizkaia", "Zamora", "Zaragoza"];
const MAX_ARCHIVOS = 5;
const MAX_BYTES = 3 * 1024 * 1024;
const TIPOS_OK = ["image/jpeg", "application/pdf"];

function referencia() {
  const d = new Date();
  const f = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  return `RZ-${f}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

/** Devuelve { datos } o { error }. Se exporta para poder probarlo sin enviar nada. */
function validar(b) {
  const d = {
    idioma: t(b.idioma, 60), pais: t(b.pais, 80), tipo_solicitante: t(b.tipo_solicitante, 60), nombre: t(b.nombre, 120), empresa: t(b.empresa, 140), nif: t(b.nif, 20),
    email: t(b.email, 180), telefono: t(b.telefono, 30), contacto_preferido: t(b.contacto_preferido, 40),
    materiales: lista(b.materiales), cantidad: t(b.cantidad, 120), marca_modelo: t(b.marca_modelo, 300), estado: t(b.estado, 80), datos_personales: t(b.datos_personales, 80),
    descripcion: t(b.descripcion), copia_seguridad: t(b.copia_seguridad, 80), servicios: lista(b.servicios), nivel_destruccion: t(b.nivel_destruccion, 80), numero_serie: t(b.numero_serie, 80),
    entrega: t(b.entrega, 80), adicional: t(b.adicional), origen: t(b.origen, 20),
    c_privacidad: b.c_privacidad === true, c_condiciones: b.c_condiciones === true, c_propiedad: b.c_propiedad === true, c_destruccion: b.c_destruccion === true, c_whatsapp: b.c_whatsapp === true, c_marketing: b.c_marketing === true,
  };
  const req = ["idioma", "pais", "tipo_solicitante", "nombre", "email", "telefono", "contacto_preferido", "cantidad", "estado", "datos_personales", "copia_seguridad", "entrega"];
  for (const k of req) if (!d[k]) return { error: "Faltan datos obligatorios de la solicitud." };
  if (!d.materiales.length) return { error: "Indica qué quieres reciclar o destruir." };
  if (!d.servicios.length) return { error: "Selecciona al menos un servicio." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.email)) return { error: "El correo electrónico no es válido." };
  if (!/^\+?\d{7,15}$/.test(d.telefono.replace(/[\s().-]/g, ""))) return { error: "El teléfono no es válido." };
  if (!d.c_privacidad || !d.c_condiciones || !d.c_propiedad) return { error: "Faltan confirmaciones obligatorias." };
  const destruye = d.servicios.some((s) => /^(Borrado seguro|Destrucción)/i.test(s));
  if (destruye && !d.c_destruccion) return { error: "Para pedir borrado o destrucción necesitamos tu autorización expresa." };
  if (/recogida a domicilio/i.test(d.entrega)) {
    d.rec = {
      direccion: t(b.rec_direccion, 200), cp: t(b.rec_cp, 5), localidad: t(b.rec_localidad, 100), provincia: t(b.rec_provincia, 40), piso: t(b.rec_piso, 100), ascensor: t(b.rec_ascensor, 20),
      fecha: t(b.rec_fecha, 10), franja: t(b.rec_franja, 20), contacto: t(b.rec_contacto, 120), telefono: t(b.rec_telefono, 30), restricciones: t(b.rec_restricciones, 1000),
    };
    if (!d.rec.direccion || !/^\d{5}$/.test(d.rec.cp) || !d.rec.localidad || !d.rec.provincia) return { error: "Faltan los datos de la dirección de recogida." };
    if (!PROVINCIAS.includes(d.rec.provincia)) return { error: "La recogida solo está disponible en la España peninsular." };
  }
  const adj = Array.isArray(b.adjuntos) ? b.adjuntos.slice(0, MAX_ARCHIVOS) : [];
  let total = 0;
  d.adjuntos = [];
  for (const a of adj) {
    const tipo = t(a && a.tipo, 40);
    const base64 = String((a && a.base64) || "").replace(/\s/g, "");
    if (!TIPOS_OK.includes(tipo) || !/^[A-Za-z0-9+/]+={0,2}$/.test(base64)) return { error: "Alguno de los archivos adjuntos no es válido." };
    const bytes = Buffer.from(base64, "base64");
    total += bytes.length;
    if (total > MAX_BYTES) return { error: "Los adjuntos superan los 3 MB." };
    d.adjuntos.push({ filename: t(a.nombre, 80).replace(/[^\w.\- ()áéíóúñÁÉÍÓÚÑ]/g, "_") || "archivo", content: bytes, contentType: tipo });
  }
  return { datos: d };
}

function texto(d, ref) {
  const si = (v) => (v ? "Sí" : "No");
  const l = [];
  l.push(`SOLICITUD DE RECICLAJE ${ref}`, "");
  l.push("== CONTACTO ==", `Nombre: ${d.nombre}`, `Tipo de solicitante: ${d.tipo_solicitante}`);
  if (d.empresa) l.push(`Empresa u organización: ${d.empresa}`);
  if (d.nif) l.push(`NIF/NIE/CIF: ${d.nif}`);
  l.push(`Correo: ${d.email}`, `Teléfono: ${d.telefono}`, `Prefiere que le contactemos por: ${d.contacto_preferido}`, `Idioma: ${d.idioma}`, `País: ${d.pais}`, "");
  l.push("== QUÉ QUIERE RECICLAR O DESTRUIR ==", `Material: ${d.materiales.join(", ")}`, `Cantidad aproximada: ${d.cantidad}`);
  if (d.marca_modelo) l.push(`Marca y modelo: ${d.marca_modelo}`);
  l.push(`Estado: ${d.estado}`, `¿Contienen información personal o confidencial?: ${d.datos_personales}`, `Copia de seguridad: ${d.copia_seguridad}`);
  if (d.descripcion) l.push(`Descripción: ${d.descripcion}`);
  l.push("", "== SERVICIOS Y ENTREGA ==", `Servicios: ${d.servicios.join(", ")}`);
  if (d.nivel_destruccion) l.push(`Nivel de destrucción: ${d.nivel_destruccion}`);
  if (d.numero_serie) l.push(`Identificar por número de serie: ${d.numero_serie}`);
  l.push(`Entrega: ${d.entrega}`);
  if (d.rec) {
    l.push("", "== RECOGIDA ==", `Dirección: ${d.rec.direccion}, ${d.rec.cp} ${d.rec.localidad} (${d.rec.provincia})`);
    if (d.rec.piso) l.push(`Piso/puerta: ${d.rec.piso}`);
    if (d.rec.ascensor) l.push(`Ascensor: ${d.rec.ascensor}`);
    if (d.rec.restricciones) l.push(`Escaleras/restricciones/pesados: ${d.rec.restricciones}`);
    if (d.rec.fecha || d.rec.franja) l.push(`Preferencia: ${d.rec.fecha || "sin fecha"} · ${d.rec.franja || "sin franja"}`);
    if (d.rec.contacto || d.rec.telefono) l.push(`Contacto en la recogida: ${d.rec.contacto || "—"} · ${d.rec.telefono || "—"}`);
  }
  if (d.adicional) l.push("", "== INFORMACIÓN ADICIONAL ==", d.adicional);
  l.push("", "== CONFIRMACIONES ==", `Política de privacidad: ${si(d.c_privacidad)}`, `Condiciones del servicio: ${si(d.c_condiciones)}`, `Declaración de propiedad/autorización: ${si(d.c_propiedad)}`,
    `Autoriza borrado o destrucción: ${si(d.c_destruccion)}`, `Autoriza contacto por WhatsApp: ${si(d.c_whatsapp)}`, `Desea recibir novedades: ${si(d.c_marketing)}`, `Adjuntos: ${d.adjuntos.length}`, `Origen: ${d.origen || "—"}`);
  return l.join("\n");
}

async function handler(req, res) {
  if (req.method !== "POST") { res.setHeader("Allow", "POST"); return res.status(405).json({ ok: false, error: "Método no permitido" }); }
  try {
    const b = req.body && typeof req.body === "object" ? req.body : {};
    // Campo trampa: un robot lo rellena y un humano no lo ve. Se responde como si hubiera ido bien.
    if (t(b.web, 50)) return res.status(200).json({ ok: true, referencia: referencia() });
    const v = validar(b);
    if (v.error) return res.status(400).json({ ok: false, error: v.error });
    const d = v.datos;
    // Primero se registra en el dashboard de Kelatos (vista de reciclaje + aviso en la campana). Si no responde, se cae al correo.
    try {
      const ip = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim().slice(0, 64);
      const ctl = new AbortController();
      const to = setTimeout(() => ctl.abort(), 20000);
      const r = await fetch(process.env.RECICLAJE_API_URL || "https://db.affirmatechnology.com/kelatos-api/webhooks/reciclaje", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...b, ip, origen: "web-puntorecicla" }), signal: ctl.signal });
      clearTimeout(to);
      const j = await r.json().catch(() => ({}));
      if (r.ok && j.ok && j.referencia) return res.status(200).json({ ok: true, referencia: j.referencia });
      if (r.status >= 400 && r.status < 500) return res.status(r.status).json({ ok: false, error: j.error || "Solicitud no válida" });
    } catch (e) { console.error("relay dashboard:", e && e.message); }
    const ref = referencia();
    const port = Number(process.env.SMTP_PORT || 465);
    const tr = nodemailer.createTransport({ host: process.env.SMTP_HOST, port, secure: String(process.env.SMTP_SECURE ?? "true") === "true", auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }, connectionTimeout: 10000, greetingTimeout: 10000, socketTimeout: 25000 });
    await tr.sendMail({
      from: `"PuntoRecicla" <${process.env.SMTP_USER}>`,
      to: process.env.CONTACT_EMAIL || process.env.SMTP_USER,
      replyTo: d.email,
      subject: `Solicitud de reciclaje ${ref} — ${d.nombre}`,
      text: texto(d, ref),
      attachments: d.adjuntos.length ? d.adjuntos : undefined,
    });
    return res.status(200).json({ ok: true, referencia: ref });
  } catch (e) {
    console.error(e);
    // `codigo` es solo el tipo de fallo de nodemailer (EAUTH, ETIMEDOUT, ECONNECTION…): ayuda a diagnosticar el correo sin exponer ningún dato.
    return res.status(500).json({ ok: false, error: "No se pudo enviar la solicitud", codigo: String((e && (e.code || e.responseCode)) || "DESCONOCIDO").slice(0, 30), configurado: !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) });
  }
}

module.exports = handler;
module.exports.validar = validar;
module.exports.texto = texto;
