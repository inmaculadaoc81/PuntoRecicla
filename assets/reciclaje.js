/* Solicitud de reciclaje: listas, lógica condicional, validación, adjuntos y envío a /api/reciclaje. */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var form = $("#solicitud");
  if (!form) return;

  // ── Menú móvil (igual que la web principal) ──
  var menuBtn = $("#menuBtn"), menu = $("#mainMenu");
  if (menuBtn && menu) {
    menuBtn.addEventListener("click", function () { var o = menu.classList.toggle("open"); menuBtn.setAttribute("aria-expanded", String(o)); });
  }

  // ── Listas ──
  var IDIOMAS = ["es", "en", "fr", "pt", "de", "it", "ro", "ca", "ar", "zh"];
  var NO_PAIS = ["AC", "CP", "DG", "EA", "EU", "EZ", "IC", "QO", "TA", "UN", "XA", "XB", "ZZ"]; // códigos que no son países
  var PAISES_TOP = ["ES", "PT", "FR", "IT", "DE", "GB", "NL", "BE", "RO", "MA", "AD"];
  var PROVINCIAS = ["A Coruña", "Álava", "Albacete", "Alicante", "Almería", "Asturias", "Ávila", "Badajoz", "Barcelona", "Burgos", "Cáceres", "Cádiz", "Cantabria", "Castellón", "Ciudad Real", "Córdoba", "Cuenca", "Girona", "Granada", "Guadalajara", "Gipuzkoa", "Huelva", "Huesca", "Jaén", "La Rioja", "León", "Lleida", "Lugo", "Madrid", "Málaga", "Murcia", "Navarra", "Ourense", "Palencia", "Pontevedra", "Salamanca", "Segovia", "Sevilla", "Soria", "Tarragona", "Teruel", "Toledo", "Valencia", "Valladolid", "Bizkaia", "Zamora", "Zaragoza"];

  function opciones(sel, lista, textoInicial) {
    sel.innerHTML = "";
    var o = document.createElement("option"); o.value = ""; o.textContent = textoInicial; sel.appendChild(o);
    lista.forEach(function (x) { var p = document.createElement("option"); p.value = x.v; p.textContent = x.t; sel.appendChild(p); });
  }
  var nombresIdioma, nombresPais;
  try { nombresIdioma = new Intl.DisplayNames(["es"], { type: "language" }); nombresPais = new Intl.DisplayNames(["es"], { type: "region" }); } catch (e) { nombresIdioma = null; nombresPais = null; }
  var cap = function (s) { return s.charAt(0).toUpperCase() + s.slice(1); };
  opciones($("#idioma"), IDIOMAS.map(function (c) { var t = nombresIdioma ? cap(nombresIdioma.of(c)) : c; return { v: t, t: t }; }), "Selecciona tu idioma");
  (function () {
    var todos = [];
    if (nombresPais) {
      for (var a = 65; a <= 90; a++) for (var b = 65; b <= 90; b++) {
        var code = String.fromCharCode(a) + String.fromCharCode(b), n;
        try { n = nombresPais.of(code); } catch (e) { n = code; }
        if (n && n !== code && PAISES_TOP.indexOf(code) < 0 && NO_PAIS.indexOf(code) < 0 && !/desconocid/i.test(n)) todos.push({ v: n, t: n });
      }
      todos.sort(function (x, y) { return x.t.localeCompare(y.t, "es"); });
    }
    var top = PAISES_TOP.map(function (c) { var n = nombresPais ? nombresPais.of(c) : c; return { v: n, t: n }; });
    var sel = $("#pais");
    opciones(sel, top.concat(todos), "Selecciona un país");
    sel.value = top[0].v; // España por defecto
  })();
  opciones($("#provincia"), PROVINCIAS.map(function (p) { return { v: p, t: p }; }), "Selecciona una provincia");

  // Fecha preferida: a partir de mañana, solo lunes a viernes (se valida al enviar)
  (function () {
    var d = new Date(); d.setDate(d.getDate() + 1);
    var iso = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
    $("#fecha").min = iso;
  })();

  // ── Lógica condicional ──
  var s4 = $("#s4"), n5 = $("#n5"), n6 = $("#n6");
  function recogida() { var r = form.querySelector("input[name=entrega]:checked"); return !!r && r.value === "Solicito recogida a domicilio"; }
  function quiereDestruir() { return $$("input[data-destruye]:checked").length > 0; }
  function actualizarCondicionales() {
    var rec = recogida();
    s4.hidden = !rec;
    n5.textContent = rec ? "5" : "4";
    n6.textContent = rec ? "6" : "5";
    $("#copiaAviso").hidden = $("#copia").value !== "No, y necesito conservarla";
    $(".cond").hidden = !quiereDestruir();
    progreso();
  }
  // Marcar «Recogida a domicilio» en servicios sugiere la entrega con recogida (y al revés)
  form.addEventListener("change", function (e) {
    var t = e.target;
    if (t.name === "entrega" && t.value === "Solicito recogida a domicilio") {
      var cb = form.querySelector("input[name=servicios][value='Recogida a domicilio']"); if (cb) cb.checked = true;
    }
    if (t.name === "servicios" && t.value === "Recogida a domicilio" && t.checked && !form.querySelector("input[name=entrega]:checked")) {
      var r = form.querySelector("input[name=entrega][value='Solicito recogida a domicilio']"); if (r) r.checked = true;
    }
    actualizarCondicionales();
  });

  // ── Progreso de campos obligatorios ──
  function obligatorios() {
    var lista = [];
    $$("[required]", form).forEach(function (el) { if (!el.closest("[hidden]")) lista.push(el); });
    return lista;
  }
  function completo(el) { return el.type === "checkbox" ? el.checked : String(el.value || "").trim() !== ""; }
  function progreso() {
    var o = obligatorios(), hechos = o.filter(completo).length;
    var grupos = ["materiales", "servicios", "entrega"];
    grupos.forEach(function (g) {
      o.push({ g: g }); if (form.querySelector("[name=" + g + "]:checked")) hechos++;
    });
    var total = o.length;
    $("#progressBar").style.width = total ? Math.round((hechos / total) * 100) + "%" : "0";
    $("#progressText").textContent = "Campos obligatorios completados: " + hechos + " de " + total;
  }
  form.addEventListener("input", progreso);
  actualizarCondicionales();

  // ── Adjuntos (fotos reducidas en el navegador; máx. 5 archivos y ~3 MB) ──
  var MAX_ARCH = 5, MAX_BYTES = 2.5 * 1024 * 1024;
  var adjuntos = []; // {nombre, tipo, base64, bytes}
  var inputArch = $("#archivos"), lista = $("#listaArchivos"), estadoArch = $("#archivosEstado");
  function pintarArchivos() {
    lista.innerHTML = "";
    adjuntos.forEach(function (a, i) {
      var li = document.createElement("li");
      var s = document.createElement("span"); s.textContent = a.nombre + " · " + Math.max(1, Math.round(a.bytes / 1024)) + " KB";
      var b = document.createElement("button"); b.type = "button"; b.textContent = "Quitar"; b.addEventListener("click", function () { adjuntos.splice(i, 1); pintarArchivos(); });
      li.appendChild(s); li.appendChild(b); lista.appendChild(li);
    });
    estadoArch.textContent = adjuntos.length ? adjuntos.length + (adjuntos.length === 1 ? " archivo" : " archivos") : "Ningún archivo seleccionado";
  }
  function aBase64(blob) {
    return new Promise(function (ok, ko) { var r = new FileReader(); r.onload = function () { ok(String(r.result).split(",")[1] || ""); }; r.onerror = ko; r.readAsDataURL(blob); });
  }
  function reducirImagen(file) {
    return new Promise(function (ok, ko) {
      var url = URL.createObjectURL(file), img = new Image();
      img.onload = function () {
        var max = 1600, k = Math.min(1, max / Math.max(img.width, img.height));
        var c = document.createElement("canvas"); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
        c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
        c.toBlob(function (b) { URL.revokeObjectURL(url); b ? ok(b) : ko(new Error("img")); }, "image/jpeg", 0.72);
      };
      img.onerror = function () { URL.revokeObjectURL(url); ko(new Error("img")); };
      img.src = url;
    });
  }
  inputArch.addEventListener("change", async function () {
    var avisos = [];
    for (var f of Array.prototype.slice.call(inputArch.files)) {
      if (adjuntos.length >= MAX_ARCH) { avisos.push("Máximo " + MAX_ARCH + " archivos."); break; }
      try {
        var esPdf = f.type === "application/pdf", blob = f, nombre = f.name;
        if (!esPdf && /^image\//.test(f.type)) { blob = await reducirImagen(f); nombre = f.name.replace(/\.[^.]+$/, "") + ".jpg"; }
        else if (!esPdf) { avisos.push(f.name + ": solo se admiten fotos o PDF."); continue; }
        var total = adjuntos.reduce(function (s, a) { return s + a.bytes; }, 0) + blob.size;
        if (total > MAX_BYTES) { avisos.push(f.name + ": supera los 2,5 MB en total."); continue; }
        adjuntos.push({ nombre: nombre.slice(0, 80), tipo: esPdf ? "application/pdf" : "image/jpeg", base64: await aBase64(blob), bytes: blob.size });
      } catch (e) { avisos.push(f.name + ": no se pudo leer."); }
    }
    inputArch.value = "";
    pintarArchivos();
    if (avisos.length) estado(avisos.join(" "), true);
  });

  // ── Validación y envío ──
  var estadoEl = $("#estado");
  function estado(t, error) { estadoEl.textContent = t || ""; estadoEl.className = error ? "error" : ""; }
  function limpiarErrores() {
    $$(".err", form).forEach(function (e) { e.classList.remove("err"); });
    $$(".err-msg", form).forEach(function (e) { e.remove(); });
  }
  function marcar(el, msg) {
    var cont = el.closest(".f, .chk, .checks, .radios") || el;
    cont.classList.add("err");
    if (msg && !cont.querySelector(".err-msg")) { var m = document.createElement("div"); m.className = "err-msg"; m.textContent = msg; cont.appendChild(m); }
  }
  function validar() {
    limpiarErrores();
    var primero = null, errores = 0;
    function fallo(el, msg) { errores++; marcar(el, msg); if (!primero) primero = el; }
    obligatorios().forEach(function (el) { if (!completo(el)) fallo(el, el.type === "checkbox" ? "Es necesario aceptarlo para enviar la solicitud." : "Campo obligatorio."); });
    ["materiales", "servicios"].forEach(function (g) {
      if (!form.querySelector("[name=" + g + "]:checked")) fallo($("[data-group=" + g + "]"), "Selecciona al menos una opción.");
    });
    if (!form.querySelector("[name=entrega]:checked")) fallo($("[data-group=entrega]"), "Selecciona cómo quieres entregar los equipos.");
    var email = form.elements.email.value.trim();
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) fallo(form.elements.email, "Revisa el correo electrónico.");
    var tel = form.elements.telefono.value.replace(/[\s().-]/g, "");
    if (tel && !/^\+?\d{7,15}$/.test(tel)) fallo(form.elements.telefono, "Escribe un teléfono válido, con prefijo si no es de España.");
    if (quiereDestruir() && !form.elements.c_destruccion.checked) fallo(form.elements.c_destruccion, "Has pedido borrado o destrucción: necesitamos tu autorización expresa.");
    if (recogida()) {
      ["rec_direccion", "rec_cp", "rec_localidad", "rec_provincia"].forEach(function (n) { if (!String(form.elements[n].value).trim()) fallo(form.elements[n], "Campo obligatorio para la recogida."); });
      if (form.elements.rec_cp.value && !/^\d{5}$/.test(form.elements.rec_cp.value.trim())) fallo(form.elements.rec_cp, "El código postal tiene 5 dígitos.");
      if (form.elements.rec_fecha.value) {
        var d = new Date(form.elements.rec_fecha.value + "T12:00:00"), dow = d.getDay();
        if (dow === 0 || dow === 6) fallo(form.elements.rec_fecha, "Elige un día de lunes a viernes.");
      }
    }
    return { errores: errores, primero: primero };
  }

  form.addEventListener("submit", async function (ev) {
    ev.preventDefault();
    estado("");
    var v = validar();
    if (v.errores) {
      estado("Revisa los " + v.errores + " campo" + (v.errores === 1 ? "" : "s") + " marcado" + (v.errores === 1 ? "" : "s") + " en rojo.", true);
      var objetivo = v.primero.closest(".f, .chk, .checks, .radios") || v.primero;
      objetivo.scrollIntoView({ behavior: "smooth", block: "center" });
      if (v.primero.focus) try { v.primero.focus({ preventScroll: true }); } catch (e) {}
      return;
    }
    var fd = new FormData(form), datos = {};
    fd.forEach(function (val, k) {
      if (k === "materiales" || k === "servicios") (datos[k] = datos[k] || []).push(val);
      else datos[k] = val;
    });
    ["c_privacidad", "c_condiciones", "c_propiedad", "c_destruccion", "c_whatsapp", "c_marketing"].forEach(function (k) { datos[k] = !!form.elements[k].checked; });
    if (!recogida()) Object.keys(datos).forEach(function (k) { if (k.indexOf("rec_") === 0) delete datos[k]; });
    datos.adjuntos = adjuntos.map(function (a) { return { nombre: a.nombre, tipo: a.tipo, base64: a.base64 }; });
    datos.origen = document.referrer ? "web" : (location.search.indexOf("utm_source=qr") >= 0 ? "qr" : "directo");

    var btn = $("#enviar"); btn.disabled = true; btn.textContent = "Enviando…";
    try {
      // Si el servidor no responde en 45 s se corta, para que el botón no se quede en «Enviando…» para siempre.
      var ctl = new AbortController(), reloj = setTimeout(function () { ctl.abort(); }, 45000);
      var r = await fetch("/api/reciclaje", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(datos), signal: ctl.signal });
      clearTimeout(reloj);
      var j = await r.json().catch(function () { return {}; });
      if (!r.ok || !j.ok) throw new Error(j.error || "No se pudo enviar");
      form.hidden = true;
      $(".req-progress").hidden = true; $("#progressText").hidden = true;
      $("#referencia").textContent = j.referencia || "";
      var ok = $("#exito"); ok.hidden = false; ok.focus(); ok.scrollIntoView({ behavior: "smooth", block: "start" });
      if (window.gtag) gtag("event", "solicitud_reciclaje_enviada", { event_category: "formulario" });
    } catch (e) {
      estado("No hemos podido enviar la solicitud. Inténtalo de nuevo o escríbenos por WhatsApp (+34 649 97 01 28) o llámanos al +34 914 46 85 03.", true);
      btn.disabled = false; btn.textContent = "Enviar solicitud de reciclaje";
    }
  });
})();
