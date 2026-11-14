import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.109.0/+esm';

const SUPABASE_URL = 'https://gwapsieolcvkjobbqmlj.supabase.co';
const SUPABASE_KEY = 'sb_publishable_4qWVXnj9Xivn7f-i9eXggQ_iSJDFYhq';
const sb = createClient(SUPABASE_URL, SUPABASE_KEY);
// Protección contra bots (Cloudflare Turnstile). Dejar vacío = apagado.
// Para activarla: pegá acá la "Site key" de Turnstile y activá CAPTCHA en Supabase (ver guía de seguridad).
const TURNSTILE_SITEKEY = '';
const captchaBox = () => TURNSTILE_SITEKEY ? '<div id="cf-turnstile" style="margin:12px 0"></div>' : '';
const captcha = () => (TURNSTILE_SITEKEY && window.turnstile) ? window.turnstile.getResponse() : undefined;
function mountCaptcha() {
  if (!TURNSTILE_SITEKEY) return; const el = document.getElementById('cf-turnstile'); if (!el) return;
  const draw = () => window.turnstile.render(el, { sitekey: TURNSTILE_SITEKEY });
  if (window.turnstile) return draw();
  const s = document.createElement('script'); s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'; s.async = true; s.onload = draw; document.head.appendChild(s);
}

/* ---------- utilidades ---------- */
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money = n => 'ARS ' + Number(n || 0).toLocaleString('es-AR', { maximumFractionDigits: 0 });
const fd = s => s ? s.slice(8, 10) + '/' + s.slice(5, 7) + '/' + s.slice(0, 4) : '—';
const fdt = s => { if (!s) return '—'; const d = new Date(s); return d.toLocaleDateString('es-AR') + ' · ' + d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }); };
const D = s => new Date(+s.slice(0, 4), +s.slice(5, 7) - 1, +s.slice(8, 10));
const today = () => { const n = new Date(); return new Date(n.getFullYear(), n.getMonth(), n.getDate()); };
const days = s => Math.round((D(s) - today()) / 864e5);
const MES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
const per = s => MES[+s.slice(5, 7) - 1] + ' ' + s.slice(0, 4);
const addM = (s, m) => { const y = +s.slice(0, 4), mo = +s.slice(5, 7) - 1, d = +s.slice(8, 10); const t = new Date(y, mo + m, 1); const last = new Date(t.getFullYear(), t.getMonth() + 1, 0).getDate(); const x = new Date(t.getFullYear(), t.getMonth(), Math.min(d, last)); return x.getFullYear() + '-' + String(x.getMonth() + 1).padStart(2, '0') + '-' + String(x.getDate()).padStart(2, '0'); };
const P = {bell:'M6 8a6 6 0 0112 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.9 1.9 0 003.4 0',home:'M3 10.5L12 3l9 7.5V21H3zM9 21v-6h6v6',wallet:'M3 7h16a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2zM3 7V6a2 2 0 012-2h12M16 14h2',chat:'M21 12a8 8 0 01-11.6 7.1L3 21l1.9-5.4A8 8 0 1121 12z',user:'M12 12a4 4 0 100-8 4 4 0 000 8zM4 21a8 8 0 0116 0',rec:'M6 3h12v18l-3-2-3 2-3-2-3 2zM9 8h6M9 12h6',chev:'M9 6l6 6-6 6',back:'M15 6l-6 6 6 6',folder:'M3 6h6l2 2h10v11H3z',cal:'M8 2v4M16 2v4M3 8h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z',plus:'M12 5v14M5 12h14',home2:'M3 10.5L12 3l9 7.5V21H3z'};
const I = n => `<svg viewBox="0 0 24 24"><path d="${P[n]}"/></svg>`;

/* ---------- estado ---------- */
const S = { cuentas: {}, tels: {}, user: null, profile: null, role: 'inquilino', cs: [], cid: null, props: {}, names: {}, route: 'bienvenida', p: {}, unread: 0 };
const cur = () => S.cs.find(c => c.id === S.cid);
const isOwner = () => S.role === 'propietario';
const addr = c => { const p = S.props[c.propiedad_id] || {}; return esc(p.direccion || '') + (p.barrio ? ' · ' + esc(p.barrio) : ''); };
const other = c => isOwner() && !c.inquilino_id ? esc(c.inquilino_email || '—') + ' (invitado)' : esc(S.names[isOwner() ? c.inquilino_id : c.propietario_id] || '—');
const num = s => Number(String(s || '').replace(/\./g, '').replace(',', '.'));
const waLink = (tel, text) => { let d = String(tel || '').replace(/\D/g, '').replace(/^0+/, ''); if (d.length > 10 && !d.startsWith('54')) { for (const i of [2, 3, 4]) { if (d.slice(i, i + 2) === '15' && d.length - 2 === 10) { d = d.slice(0, i) + d.slice(i + 2); break; } } } if (d && !d.startsWith('54')) d = '549' + d; return 'https://wa.me/' + d + '?text=' + encodeURIComponent(text); };
const invMsg = c => `Hola! Te invité a Habita para gestionar nuestro alquiler de ${(S.props[c.propiedad_id] || {}).direccion || ''}: pagos, reclamos y documentos en un solo lugar. Registrate con este correo (${c.inquilino_email}) en ${location.origin}`;
const invCard = c => `<div class="card" style="background:var(--amb);color:var(--ambt);border-color:var(--amb)"><b>Falta que ${esc(c.inquilino_email)} se registre</b><div style="font-size:14px;margin-top:4px">Mandale la invitación. Apenas cree su cuenta con ese correo, el contrato le aparece solo.</div><a class="btn" target="_blank" rel="noopener" href="https://wa.me/?text=${encodeURIComponent(invMsg(c))}">Enviar invitación por WhatsApp</a><button class="btn o" data-act="copiar" data-t="${esc(invMsg(c))}">Copiar mensaje</button></div>`;
const waCard = (r, c) => { if (!c) return ''; const to = isOwner() ? c.inquilino_id : c.propietario_id; const txt = `Hola ${(S.names[to] || '').split(' ')[0]}, te escribo por el reclamo #HB-${r.numero} (${r.titulo}). Podés ver el detalle en Habita: ${location.origin}`; return `<a class="btn o" target="_blank" rel="noopener" href="${waLink(S.tels[to], txt)}">Avisar por WhatsApp</a>`; };

let toastT;
function toast(m) { document.querySelector('.tip')?.remove(); const t = document.createElement('div'); t.className = 'tip'; t.textContent = m; document.body.appendChild(t); clearTimeout(toastT); toastT = setTimeout(() => t.remove(), 3500); }

/* ---------- componentes ---------- */
const pill = (t, c = '') => `<span class="pill ${c}">${t}</span>`;
const btn = (t, go, c = '', id = '') => `<button class="btn ${c}" data-go="${go}" ${id ? `data-id="${id}"` : ''}>${t}</button>`;
const abtn = (t, act, c = '', id = '') => `<button class="btn ${c}" data-act="${act}" ${id ? `data-id="${id}"` : ''}>${t}</button>`;
const kv = (a, b) => `<div class="kv"><span>${a}</span><b>${b}</b></div>`;
const row = (i, t, s, go, id = '') => `<button class="row" data-go="${go}" ${id ? `data-id="${id}"` : ''}><span class="ic">${I(i)}</span><span class="rc"><b>${t}</b><small>${s}</small></span>${I('chev')}</button>`;
const ttl = (e, h, s) => `${e ? `<div class="eb">${e}</div>` : ''}<h1>${h}</h1>${s ? `<p class="sub">${s}</p>` : ''}`;
const bar = r => `<div class="bar"><b class="logo">habita</b>${r || ''}</div>`;
const back = go => `<button class="ib" data-go="${go}" aria-label="Volver">${I('back')}</button>`;
const bellB = () => `<button class="ib" data-go="notif" aria-label="Notificaciones">${I('bell')}${S.unread ? '<i class="dot"></i>' : ''}</button>`;
const fld = (l, name, type = 'text', extra = '') => `<div class="f"><label>${l}</label><input name="${name}" type="${type}" ${extra}></div>`;
const nav = t => { const it = [['home', 'Inicio', 'home'], ['wallet', 'Pagos', 'pagos'], ['chat', 'Reclamos', 'reclamos'], ['user', 'Perfil', 'perfil']]; return `<nav>${it.map((x, i) => `<button class="${i === t ? 'on' : ''}" data-go="${x[2]}">${I(x[0])}${x[1]}</button>`).join('')}</nav>`; };
const rolTxt = () => isOwner() ? 'Propietario' : 'Inquilino';
const noContrato = () => `<div class="card empty">${isOwner() ? 'Todavía no cargaste ningún contrato.' : 'Todavía no tenés un contrato asociado a tu cuenta.<br><br>Pedile a tu propietario que lo cargue con este correo:<br><b>' + esc(S.user.email) + '</b>'}</div>${isOwner() ? btn('Nuevo contrato', 'nuevo') : ''}`;
const estPill = e => ({ pagado: pill('Pagado', 'g'), pendiente: pill('Pendiente'), informado: pill('Para confirmar', 'b'), vencido: pill('Vencido', 'r') }[e] || pill(e));
const CAT = { plomeria: 'Plomería', electricidad: 'Electricidad', gas: 'Gas', cerrajeria: 'Cerrajería', humedad: 'Humedad', otro: 'Otro' };
const REST = { recibido: 'Recibido', en_revision: 'En revisión', en_arreglo: 'En arreglo', resuelto: 'Resuelto' };
const DOCS = [['dni', 'DNI', 'Frente y dorso'], ['recibo_sueldo', 'Recibo de sueldo', 'Últimos 3 meses'], ['certificado_laboral', 'Certificado laboral', 'Antigüedad y sueldo'], ['garantia_propietaria', 'Garantía propietaria', 'Escritura e informe de dominio'], ['seguro_caucion', 'Seguro de caución', 'Alternativa a la garantía'], ['otro', 'Otro documento', 'Cualquier otro comprobante']];

/* ---------- datos ---------- */
async function loadProfile() { const { data, error } = await sb.from('profiles').select('*').eq('id', S.user.id).single(); if (error) throw error; S.profile = data; S.role = data.rol; const pv = await sb.from('profiles_privado').select('dni').eq('id', S.user.id).maybeSingle(); S.profile.dni = pv.data?.dni || ''; }
async function loadAll() {
  const { data: cs, error } = await sb.from('contratos_resumen').select('*').order('creado_en', { ascending: false });
  if (error) throw error;
  S.cs = cs.filter(c => isOwner() ? c.propietario_id === S.user.id : c.inquilino_id === S.user.id);
  const pids = [...new Set(S.cs.map(c => c.propiedad_id))], uids = [...new Set(S.cs.flatMap(c => [c.propietario_id, c.inquilino_id]).filter(Boolean))];
  S.props = {}; S.names = {}; S.tels = {}; S.cuentas = {};
  if (pids.length) { const { data } = await sb.from('propiedades').select('*').in('id', pids); (data || []).forEach(p => S.props[p.id] = p); }
  if (uids.length) { const { data } = await sb.from('profiles').select('*').in('id', uids); (data || []).forEach(u => { S.names[u.id] = u.nombre_completo; S.tels[u.id] = u.celular; S.cuentas[u.id] = u; }); }
  if (!S.cs.find(c => c.id === S.cid)) S.cid = S.cs[0]?.id || null;
  const { count } = await sb.from('notificaciones').select('id', { count: 'exact', head: true }).eq('usuario_id', S.user.id).eq('leida', false);
  S.unread = count || 0;
}
async function boot(session) { S.user = session.user; await loadProfile(); await sb.rpc('vincular_invitaciones'); await loadAll(); go('home'); }

/* ---------- navegación ---------- */
function go(r, p = {}) { S.route = r; S.p = p; history.replaceState(null, '', '#' + r); draw(); window.scrollTo(0, 0); }
async function draw(keep) {
  const app = document.getElementById('app'); const y = window.scrollY;
  try { const f = screens[S.route] || screens.bienvenida; const h = await f(); app.innerHTML = h; mountCaptcha(); if (keep) window.scrollTo(0, y); }
  catch (e) { console.error(e); app.innerHTML = `${bar()}<main>${ttl('', 'Algo salió mal', '')}<div class="card" style="background:var(--red);color:var(--redt)">${esc(errMsg(e))}</div>${btn('Volver al inicio', S.user ? 'home' : 'bienvenida')}</main>`; }
}

/* ---------- pantallas ---------- */
const screens = {};
screens.bienvenida = () => `<main><div class="hero"><b class="logo" style="margin-bottom:auto">habita</b><h1>Tu alquiler,<br>sin vueltas.</h1><p>Propietarios e inquilinos, conectados. Pagos claros y respuestas en un solo lugar.</p></div><div style="padding-top:22px">${btn('Crear mi cuenta', 'registro')}${btn('Ya tengo cuenta', 'login', 'o')}</div></main>`;
screens.registro = () => `${bar(back('bienvenida'))}<main>${ttl('', 'Creá tu cuenta', 'Empezá a gestionar tu alquiler con claridad.')}<form data-act="signup">${fld('Nombre y apellido', 'nombre', 'text', 'required autocomplete="name" placeholder="Ej: Lucía Fernández"')}${fld('Correo electrónico', 'email', 'email', 'required autocomplete="email" placeholder="ejemplo@gmail.com"')}${fld('DNI', 'dni', 'text', 'inputmode="numeric" placeholder="Ej: 35123456 (solo números)"')}${fld('Celular', 'celular', 'tel', 'placeholder="Ej: 11 5555 1234"')}${fld('Contraseña (mínimo 8 caracteres)', 'password', 'password', 'required minlength="8" autocomplete="new-password" placeholder="Mínimo 8 caracteres"')}<div class="f"><label>¿Cómo vas a usar Habita?</label><select name="rol"><option value="inquilino">Soy inquilino</option><option value="propietario">Soy propietario</option></select></div><label class="chk"><input type="checkbox" name="terms" required><span>Acepto los Términos y condiciones y la Política de privacidad de Habita.</span></label>${captchaBox()}<button class="btn" type="submit">Crear cuenta</button></form>${btn('¿Ya tenés cuenta? Iniciá sesión', 'login', 't')}</main>`;
screens.login = () => `${bar(back('bienvenida'))}<main>${ttl('', 'Qué bueno verte', 'Ingresá para seguir con tu alquiler.')}<form data-act="login">${fld('Correo electrónico', 'email', 'email', 'required autocomplete="email" placeholder="ejemplo@gmail.com"')}${fld('Contraseña', 'password', 'password', 'required autocomplete="current-password" placeholder="Tu contraseña"')}${captchaBox()}<button class="btn" type="submit">Iniciar sesión</button></form>${btn('Olvidé mi contraseña', 'recuperar', 'o')}${btn('¿Sos nuevo? Creá tu cuenta', 'registro', 't')}</main>`;

screens.home = async () => {
  await loadAll(); const c = cur();
  const name = (S.profile.nombre_completo || '').split(' ')[0];
  if (isOwner()) {
    const { data: inf } = S.cs.length ? await sb.from('pagos').select('id,contrato_id').eq('estado', 'informado').in('contrato_id', S.cs.map(k => k.id)) : { data: [] };
    const alertInf = (inf || []).length ? `<button class="al" data-go="pagos" data-id="${inf[0].contrato_id}"><span>${I('bell')}</span><span style="text-align:left"><b>Tenés ${inf.length} pago${inf.length > 1 ? 's' : ''} para confirmar.</b><br>Tu inquilino avisó que transfirió. Verificá que lo recibiste.</span></button>` : '';
    const cards = S.cs.map(k => `<button class="card" style="width:100%;display:block" data-go="contrato" data-id="${k.id}"><div class="sp"><b>${addr(k)}</b>${k.estado === 'vigente' ? pill('Vigente', 'g') : pill(esc(k.estado))}</div><div class="mut" style="font-size:13px;margin:4px 0 10px">Inquilino · ${other(k)}</div><div class="sp"><b>${money(k.monto_actual)}</b><span class="mut" style="font-size:13px">${k.proximo_ajuste ? 'Próx. ajuste ' + fd(k.proximo_ajuste) : 'Sin más ajustes'}</span></div></button>`).join('');
    return `${bar(bellB())}<main>${ttl('Propietario', 'Hola, ' + esc(name), 'Tus propiedades, con todo al día.')}${alertInf}${S.cs.length ? cards : noContrato()}${S.cs.length ? btn('Nuevo contrato', 'nuevo', 'o') : ''}</main>${nav(0)}`;
  }
  if (!c) return `${bar(bellB())}<main>${ttl('Inquilino', 'Hola, ' + esc(name), 'Tu casa, tus cuentas claras.')}${noContrato()}</main>${nav(0)}`;
  await sb.rpc('asegurar_pagos', { p_contrato: c.id });
  const { data: pg } = await sb.from('pagos').select('*').eq('contrato_id', c.id).order('periodo', { ascending: false });
  const pend = (pg || []).filter(p => p.estado !== 'pagado').sort((a, b) => a.periodo.localeCompare(b.periodo))[0];
  let aj = null; if (c.proximo_ajuste) { const r = await sb.from('ajustes').select('*').eq('contrato_id', c.id).eq('fecha_aplicacion', c.proximo_ajuste).maybeSingle(); aj = r.data; }
  const alerta = c.proximo_ajuste && days(c.proximo_ajuste) <= 30 ? `<button class="al" data-go="contrato"><span>${I('bell')}</span><span style="text-align:left"><b>El ${fd(c.proximo_ajuste).slice(0, 5)} el alquiler se actualiza por ${esc(c.indice_ajuste)}.</b><br>${aj?.porcentaje_estimado != null ? `Estimado: +${aj.porcentaje_estimado}% · pasarías a pagar ${money(aj.monto_nuevo)}` : 'Te avisamos el porcentaje cuando se publique el dato oficial.'}</span></button>` : '';
  const pagoCard = pend ? `<div class="card navy"><div class="sp"><span>Alquiler · ${per(pend.periodo)}</span>${pend.estado === 'vencido' ? pill('Vencido', 'r') : pend.estado === 'informado' ? pill('Esperando confirmación', 'b') : pill('Pendiente')}</div><div class="big">${money(pend.monto)}</div><div class="mut">${pend.estado === 'informado' ? 'Avisaste que transferiste. Tu propietario lo tiene que confirmar.' : 'Vence el ' + fd(pend.fecha_vencimiento)}</div>${pend.estado === 'informado' ? '' : btn('Pagar alquiler', 'pagar', '', pend.id)}</div>` : `<div class="card navy"><div class="sp"><span>Alquiler</span>${pill('Al día', 'g')}</div><div class="mid">Estás al día</div><div class="mut">No tenés pagos pendientes.</div></div>`;
  return `${bar(bellB())}<main>${ttl('Inquilino', 'Hola, ' + esc(name), 'Tu casa, tus cuentas claras.')}${pagoCard}${alerta}<div class="card"><b>${addr(c)}</b><div class="mut" style="font-size:13px;margin-top:6px">Propietario · ${other(c)}</div></div><div class="sec">Todo a mano</div>${row('cal', 'Mi contrato', 'Vence el ' + fd(c.fecha_fin) + ' · próximo ajuste ' + fd(c.proximo_ajuste), 'contrato')}${row('folder', 'Documentación y garantía', 'Cargá tus comprobantes', 'docs')}${row('rec', 'Mis recibos', 'Historial de pagos', 'pagos')}${row('chat', 'Reclamos', 'Reportá y seguí arreglos', 'reclamos')}</main>${nav(0)}`;
};

screens.contrato = async () => {
  const c = cur(); if (!c) return `${bar(back('home'))}<main>${noContrato()}</main>${nav(0)}`;
  const { data: ajs } = await sb.from('ajustes').select('*').eq('contrato_id', c.id).order('fecha_aplicacion');
  const aj = (ajs || []).find(a => a.fecha_aplicacion === c.proximo_ajuste);
  const total = c.duracion_meses, m = Math.min(c.meses_transcurridos + 1, total), pc = Math.round(m / total * 100), df = days(c.fecha_fin);
  const prox = []; if (c.proximo_ajuste) { let d = c.proximo_ajuste; while (prox.length < 4 && d <= c.fecha_fin) { prox.push(d); d = addM(d, c.frecuencia_ajuste_meses); } }
  const ajCard = c.proximo_ajuste ? `<div class="card navy"><div class="sp"><span>Próximo ajuste · ${fd(c.proximo_ajuste)}</span>${pill(days(c.proximo_ajuste) <= 0 ? 'Hoy' : 'En ' + days(c.proximo_ajuste) + ' días')}</div>${aj?.porcentaje_estimado != null ? `<div class="mut" style="margin-top:12px">${esc(c.indice_ajuste)} estimado para este ajuste</div><div class="big">+${aj.porcentaje_estimado}%</div><div>${isOwner() ? 'Pasarías a cobrar' : 'Pasarías a pagar'} <b>${money(aj.monto_nuevo)}</b> por mes (+${money(aj.monto_nuevo - c.monto_actual)})</div><div class="mut" style="font-size:13px;margin-top:10px">Estimado. Se confirma con el dato oficial del INDEC.</div>` : `<div class="mut" style="margin-top:12px">Todavía no hay porcentaje cargado. Se informa cuando se publique el ${esc(c.indice_ajuste)} oficial.</div>`}</div>` : '';
  const ajForm = isOwner() && c.proximo_ajuste ? `<div class="card"><b>Cargar el porcentaje del ajuste</b><form data-act="ajuste" style="margin-top:10px"><div class="f"><label>Porcentaje estimado u oficial (%)</label><input name="pct" type="number" step="0.01" required inputmode="decimal" placeholder="Ej: 7.5"></div><button class="btn" type="submit">Guardar porcentaje</button></form>${abtn('Calcular con IPC oficial (INDEC)', 'ipcoficial', 'o')}${aj ? abtn('Aplicar ajuste al alquiler', 'aplicar', 'o', aj.id) : ''}</div>` : '';
  return `${bar(back('home'))}<main>${ttl(rolTxt(), 'Contrato', addr(c))}${isOwner() && !c.inquilino_id ? invCard(c) : ''}<div class="card"><div class="sp"><b>Duración del contrato</b>${c.estado === 'vigente' ? pill('Vigente', 'g') : pill(esc(c.estado))}</div><div class="pb"><i style="width:${pc}%"></i></div><div class="sp mut" style="font-size:13px"><span>Mes ${m} de ${total}</span><span>${df > 0 ? 'Faltan ' + df + ' días' : 'Finalizado'}</span></div><div style="height:8px"></div>${kv('Inicio', fd(c.fecha_inicio))}${kv('Vencimiento', fd(c.fecha_fin))}${kv('Alquiler actual', money(c.monto_actual))}${kv('Ajuste', 'Cada ' + c.frecuencia_ajuste_meses + ' meses · ' + esc(c.indice_ajuste))}${kv(isOwner() ? 'Inquilino' : 'Propietario', other(c))}</div>${ajCard}${ajForm}${prox.length ? `<div class="card"><b>Próximos ajustes</b>${prox.map(d => kv(per(d) + ' · según ' + esc(c.indice_ajuste), fd(d))).join('')}</div>` : ''}<div class="card"><div class="sp"><b>Fin del contrato</b>${pill(fd(c.fecha_fin), 'b')}</div><div class="mut" style="font-size:14px;margin-top:8px">Te avisamos 90, 60 y 30 días antes del vencimiento para renovar o cerrar con tiempo.</div></div>${row('folder', 'Documentación y garantía', 'Comprobantes del contrato', 'docs')}${row('chat', 'Reclamos', 'Arreglos y seguimiento', 'reclamos')}${isOwner() ? btn('Volver a mis propiedades', 'home', 'o') : ''}</main>${nav(0)}`;
};

screens.pagos = async () => {
  const c = cur(); if (!c) return `${bar()}<main>${ttl(rolTxt(), 'Pagos', '')}${noContrato()}</main>${nav(1)}`;
  await sb.rpc('asegurar_pagos', { p_contrato: c.id });
  const { data: pg } = await sb.from('pagos').select('*').eq('contrato_id', c.id).order('periodo', { ascending: false });
  const ownerAct = p => isOwner() && p.estado === 'informado' ? `<div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px">${p.comprobante_path ? `<button class="pill b" data-act="vercomp" data-id="${esc(p.comprobante_path)}">Ver comprobante</button>` : ''}<button class="pill g" data-act="confirmar" data-id="${p.id}">Confirmar pago</button><button class="pill r" data-act="norecibido" data-id="${p.id}">No lo recibí</button></div>` : '';
  const wph = p => isOwner() && p.estado !== 'pagado' ? `<a class="pill b" style="text-decoration:none" target="_blank" rel="noopener" href="${waLink(S.tels[c.inquilino_id], 'Hola ' + (S.names[c.inquilino_id] || '').split(' ')[0] + ', te recuerdo que el alquiler de ' + per(p.periodo) + ' (' + money(p.monto) + ') vence el ' + fd(p.fecha_vencimiento) + '. Gracias!')}">Recordar por WhatsApp</a>` : '';
  const list = (pg || []).map(p => { const inner = `<span class="rc"><b>${per(p.periodo)}</b><small>${money(p.monto)} · ${p.estado === 'pagado' ? 'Pagado el ' + fdt(p.fecha_pago) : 'Vence el ' + fd(p.fecha_vencimiento)}${p.nro_operacion ? '<br>Operación ' + esc(p.nro_operacion) : ''}</small><div style="margin-top:6px">${wph(p)}</div>${ownerAct(p)}</span>${estPill(p.estado)}`; return p.estado === 'pagado' ? `<button class="row" data-go="recibo" data-id="${p.id}">${inner}</button>` : `<div class="row">${inner}</div>`; }).join('');
  return `${bar(bellB())}<main>${ttl(rolTxt(), isOwner() ? 'Historial de pagos' : 'Mis recibos', addr(c))}<div class="card" style="padding:6px 20px">${list || '<div class="empty">Todavía no hay pagos.</div>'}</div><p class="note">Tocá un pago realizado para ver o descargar el recibo.</p></main>${nav(1)}`;
};

screens.docs = async () => {
  const c = cur(); if (!c) return `${bar(back('home'))}<main>${noContrato()}</main>${nav(0)}`;
  const { data: ds } = await sb.from('documentos').select('*').eq('contrato_id', c.id).order('subido_en', { ascending: false });
  const rank = { verificado: 3, en_revision: 2, rechazado: 1, pendiente: 0 };
  const rows = DOCS.map(([t, n, s]) => {
    const mine = (ds || []).filter(d => d.tipo === t); const best = mine.sort((a, b) => rank[b.estado] - rank[a.estado])[0];
    let right = '';
    if (best) right = best.estado === 'verificado' ? pill('Verificado', 'g') : best.estado === 'rechazado' ? pill('Rechazado', 'r') : pill('En revisión');
    else right = isOwner() ? pill('Pendiente') : '';
    const up = !isOwner() ? `<label class="pill b">${best ? 'Reemplazar' : 'Subir'}<input type="file" hidden data-up="${t}" accept="image/*,application/pdf"></label>` : '';
    const view = best ? `<button class="pill b" data-act="verdoc" data-id="${esc(best.storage_path)}">Ver</button>` : '';
    const ver = isOwner() && best && best.estado === 'en_revision' ? `<button class="pill b" data-act="estdoc" data-id="${best.id}" data-v="verificado">Verificar</button> <button class="pill r" data-act="estdoc" data-id="${best.id}" data-v="rechazado">Rechazar</button>` : '';
    return `<div class="row" style="align-items:flex-start"><span class="ic">${I(best ? 'folder' : 'plus')}</span><span class="rc"><b>${n}</b><small>${s}</small><div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px">${view} ${up} ${ver}</div></span>${right}</div>`;
  }).join('');
  return `${bar(back('contrato'))}<main>${ttl(rolTxt(), isOwner() ? 'Documentación del inquilino' : 'Documentación y garantía', isOwner() ? other(c) : 'Todo lo del contrato, en un solo lugar.')}<div class="card" style="padding:6px 20px">${rows}</div><p class="note" style="text-align:left">${isOwner() ? 'Revisá cada documento y marcalo como verificado.' : 'Cargá al menos una garantía: propietaria o seguro de caución. Los demás los podés subir cuando quieras.'}</p></main>${nav(0)}`;
};

screens.reclamos = async () => {
  const c = cur(); if (!c) return `${bar()}<main>${ttl(rolTxt(), 'Reclamos', '')}${noContrato()}</main>${nav(2)}`;
  const { data: rs } = await sb.from('reclamos').select('*').eq('contrato_id', c.id).order('creado_en', { ascending: false });
  const card = r => `<button class="card" style="width:100%;display:block" data-go="reclamo" data-id="${r.id}"><div class="sp"><span class="mut" style="font-size:13px">#HB-${r.numero} · ${fd(r.creado_en.slice(0, 10))}</span>${r.estado === 'resuelto' ? pill('Resuelto', 'g') : pill(REST[r.estado])}</div><b style="font-size:17px;display:block;margin:8px 0 4px">${esc(r.titulo)}</b><div class="mut" style="font-size:14px">${esc(CAT[r.categoria])}</div></button>`;
  return `${bar(bellB())}<main>${ttl(rolTxt(), 'Reclamos', 'Lo que pasa en la casa, con seguimiento.')}${(rs || []).length ? rs.map(card).join('') : '<div class="card empty">No hay reclamos.</div>'}${!isOwner() ? btn('Crear reclamo', 'reclamo-nuevo') : ''}</main>${nav(2)}`;
};

screens['reclamo-nuevo'] = () => `${bar(back('reclamos'))}<main>${ttl('Inquilino', 'Crear reclamo', 'Contanos qué pasó. Nos ocupamos de seguirlo.')}<form data-act="reclamo"><div class="f"><label>Categoría</label><select name="categoria">${Object.entries(CAT).map(([k, v]) => `<option value="${k}">${v}</option>`).join('')}</select></div>${fld('Título', 'titulo', 'text', 'required maxlength="80" placeholder="Ej: Pérdida de agua en cocina"')}<div class="f"><label>Descripción</label><textarea name="descripcion" maxlength="1000" placeholder="Ej: Hay una pérdida de agua bajo la bacha. Empezó ayer a la noche."></textarea></div><div class="f"><label>Fotos (hasta 5)</label><input type="file" name="fotos" accept="image/*" multiple></div><button class="btn" type="submit">Enviar reclamo</button></form></main>${nav(2)}`;

screens.reclamo = async () => {
  const id = S.p.id; const c = cur();
  const { data: r } = await sb.from('reclamos').select('*').eq('id', id).single();
  const { data: fs } = await sb.from('reclamo_fotos').select('*').eq('reclamo_id', id);
  const { data: pr } = await sb.from('presupuestos').select('*').eq('reclamo_id', id).order('creado_en', { ascending: false });
  const urls = await Promise.all((fs || []).map(async f => (await sb.storage.from('reclamos').createSignedUrl(f.storage_path, 3600)).data?.signedUrl));
  const orden = ['recibido', 'en_revision', 'en_arreglo', 'resuelto'], idx = orden.indexOf(r.estado);
  const steps = orden.map((e, i) => `<div class="sp" style="justify-content:flex-start;gap:12px;padding:6px 0"><span style="width:20px;height:20px;border-radius:50%;flex:none;border:2px solid ${i <= idx ? 'var(--blue)' : 'var(--line)'};background:${i < idx || (i === idx && e === 'resuelto') ? 'var(--blue)' : i === idx ? 'var(--soft)' : 'transparent'}"></span><b style="color:${i <= idx ? 'var(--ink)' : 'var(--mut)'}">${REST[e]}</b></div>`).join('');
  const est = isOwner() ? `<div class="f" style="margin-top:12px"><label>Cambiar estado</label><select data-est="${r.id}">${orden.map(e => `<option value="${e}" ${e === r.estado ? 'selected' : ''}>${REST[e]}</option>`).join('')}</select></div>` : '';
  const prs = (pr || []).map(p => `<div class="card"><div class="sp"><b>Presupuesto</b>${p.estado === 'aprobado' ? pill('Aprobado', 'g') : p.estado === 'rechazado' ? pill('Rechazado', 'r') : pill('Pendiente de aprobación')}</div>${kv('Técnico', esc(p.tecnico_nombre) + (p.tecnico_matricula ? ' · Mat. ' + esc(p.tecnico_matricula) : ''))}${kv('Mano de obra', money(p.mano_obra))}${kv('Materiales', money(p.materiales))}<div class="tot">${kv('Total', money(p.total))}</div>${p.horas_estimadas ? kv('Tiempo estimado', p.horas_estimadas + ' h') : ''}${p.motivo_rechazo ? `<div class="mut" style="font-size:13px">Motivo: ${esc(p.motivo_rechazo)}</div>` : ''}${isOwner() && p.estado === 'pendiente' ? `<div class="two">${abtn('Rechazar', 'prerech', 'o', p.id)}${abtn('Aprobar', 'preaprob', '', p.id)}</div>` : ''}</div>`).join('');
  const preForm = isOwner() ? `<div class="card"><b>Cargar presupuesto</b><form data-act="presup" data-id="${r.id}" style="margin-top:10px">${fld('Técnico', 'tecnico', 'text', 'required placeholder="Ej: Diego Suárez"')}${fld('Matrícula (opcional)', 'matricula', 'text', 'placeholder="Ej: 18427"')}<div class="two">${fld('Mano de obra (ARS)', 'mo', 'text', 'required inputmode="numeric" data-money placeholder="Ej: 45.000"')}${fld('Materiales (ARS)', 'mat', 'text', 'required inputmode="numeric" data-money placeholder="Ej: 23.000"')}</div>${fld('Horas estimadas', 'horas', 'number', 'min="0" step="0.5" placeholder="Ej: 2"')}<button class="btn" type="submit">Guardar presupuesto</button></form></div>` : '';
  return `${bar(back('reclamos'))}<main>${ttl(rolTxt(), esc(r.titulo), '#HB-' + r.numero + ' · ' + esc(CAT[r.categoria]))}<div class="card"><b>Estado del reclamo</b><div style="margin-top:8px">${steps}</div>${est}</div>${r.descripcion ? `<div class="card"><b>Descripción</b><p style="margin:6px 0 0">${esc(r.descripcion)}</p></div>` : ''}${urls.filter(Boolean).length ? `<div class="card"><b>Fotos</b>${urls.filter(Boolean).map(u => `<img class="ph" src="${u}" alt="Foto del reclamo">`).join('')}</div>` : ''}${waCard(r, c)}${prs}${preForm}</main>${nav(2)}`;
};

screens.nuevo = () => `${bar(back('home'))}<main>${ttl('Propietario', 'Nuevo contrato', 'Si el inquilino todavía no se registró, después le mandás una invitación por WhatsApp.')}<form data-act="nuevo" autocomplete="off"><div class="f"><label>Provincia</label><select name="provincia" data-prov><option value="CABA">CABA (Capital Federal)</option><option value="Buenos Aires">Provincia de Buenos Aires</option><option value="Otra">Otra provincia</option></select></div><div class="f" data-loc hidden><label>Localidad <small class="mut" data-lhint>(escribí 3 letras y elegí de la lista)</small></label><input name="ciudad" list="dl-loc" data-ac="loc" autocomplete="off" placeholder="Ej: Lomas de Zamora"><datalist id="dl-loc"></datalist></div><div class="f"><label>Barrio <small class="mut" data-bhint>(escribí 3 letras y elegí de la lista)</small></label><input name="barrio" list="dl-bar" data-ac="bar" autocomplete="off" placeholder="Ej: Belgrano"><datalist id="dl-bar"></datalist></div>${fld('Dirección', 'direccion', 'text', 'required placeholder="Ej: Av. Cabildo 2450, 3° B"')}${fld('Correo del inquilino', 'email', 'email', 'required placeholder="Ej: inquilino@gmail.com"')}<div class="two">${fld('Inicio del contrato', 'inicio', 'date', 'required')}${fld('Duración (meses)', 'meses', 'number', 'required min="1" max="120" value="24" inputmode="numeric" placeholder="Ej: 24"')}</div>${fld('Alquiler mensual (ARS)', 'monto', 'text', 'required inputmode="numeric" data-money placeholder="Ej: 480.000"')}<div class="two"><div class="f"><label>Ajuste cada</label><select name="freq"><option value="3" selected>3 meses</option><option value="1">1 mes</option><option value="2">2 meses</option><option value="4">4 meses</option><option value="6">6 meses</option><option value="12">12 meses</option></select></div>${fld('Día de vencimiento', 'dia', 'number', 'required min="1" max="28" value="10" inputmode="numeric" placeholder="Ej: 10"')}</div><div class="two">${fld('Comisión propietario %', 'cp', 'number', 'step="0.01" min="0" value="0" placeholder="Ej: 4"')}${fld('Comisión inquilino %', 'ci', 'number', 'step="0.01" min="0" value="0" placeholder="Ej: 0"')}</div><button class="btn" type="submit">Crear contrato</button></form></main>${nav(0)}`;

screens.notif = async () => {
  const { data } = await sb.from('notificaciones').select('*').eq('usuario_id', S.user.id).order('creado_en', { ascending: false }).limit(40);
  const list = (data || []).map(n => `<div class="nt">${n.leida ? '<i style="width:8px;flex:none"></i>' : '<i class="un"></i>'}<div><b>${esc(n.titulo)}</b><div style="font-size:14px">${esc(n.mensaje || '')}</div><small>${fdt(n.creado_en)}</small></div></div>`).join('');
  await sb.from('notificaciones').update({ leida: true }).eq('usuario_id', S.user.id).eq('leida', false); S.unread = 0;
  return `${bar(back('home'))}<main>${ttl(rolTxt(), 'Notificaciones', 'Las novedades de tu alquiler, en un lugar.')}<div class="card" style="padding:6px 20px">${list || '<div class="empty">No tenés notificaciones todavía.</div>'}</div></main>${nav(0)}`;
};

screens.perfil = () => {
  const p = S.profile; const ini = (p.nombre_completo || '?').split(' ').map(x => x[0]).slice(0, 2).join('').toUpperCase();
  return `${bar()}<main>${ttl('Tu cuenta', 'Mi perfil', '')}<div class="sp" style="justify-content:flex-start;gap:16px;margin-bottom:18px"><div class="av">${esc(ini)}</div><div><b style="font-size:18px">${esc(p.nombre_completo)}</b><br>${pill(rolTxt(), 'b')}</div></div><div class="card"><b>Datos personales</b>${kv('Correo electrónico', esc(S.user.email))}${kv('DNI', esc(p.dni || '—'))}${kv('Celular', esc(p.celular || '—'))}</div>${isOwner() ? `<form class="card" data-act="cuenta"><b>Cuenta para cobrar</b><div class="mut" style="font-size:14px;margin:4px 0 12px">Tu inquilino va a ver estos datos para transferirte el alquiler.</div>${fld('Titular de la cuenta', 'titular', 'text', 'placeholder="Ej: Martín Álvarez" value="' + esc(p.cuenta_titular || '') + '"')}${fld('Banco o billetera', 'banco', 'text', 'placeholder="Ej: Banco Galicia o Mercado Pago" value="' + esc(p.cuenta_banco || '') + '"')}${fld('Alias', 'alias', 'text', 'placeholder="Ej: martin.alquileres" value="' + esc(p.cuenta_alias || '') + '"')}${fld('CBU o CVU (22 números)', 'cbu', 'text', 'inputmode="numeric" maxlength="22" placeholder="Ej: 0070000030004123456789" value="' + esc(p.cuenta_cbu || '') + '"')}<button class="btn" type="submit" style="margin-top:0">Guardar datos de cobro</button></form>` : ''}${abtn('Cambiar a ' + (isOwner() ? 'inquilino' : 'propietario'), 'rol', 'o', isOwner() ? 'inquilino' : 'propietario')}${abtn('Cerrar sesión', 'logout', 'o')}<p class="note">Habita · Versión 0.6 (seguridad)</p></main>${nav(3)}`;
};


screens.recuperar = () => `${bar(back('login'))}<main>${ttl('', 'Recuperá tu contraseña', 'Te mandamos un correo con un link para elegir una nueva.')}<form data-act="recuperar">${fld('Correo electrónico', 'email', 'email', 'required placeholder="ejemplo@gmail.com"')}${captchaBox()}<button class="btn" type="submit">Enviar correo</button></form></main>`;
screens['nueva-clave'] = () => `${bar()}<main>${ttl('', 'Elegí tu nueva contraseña', 'Mínimo 8 caracteres.')}<form data-act="nuevaclave">${fld('Nueva contraseña', 'password', 'password', 'required minlength="8" autocomplete="new-password" placeholder="Mínimo 8 caracteres"')}<button class="btn" type="submit">Guardar contraseña</button></form></main>`;
screens.invitar = () => { const c = cur(); if (!c) return screens.bienvenida(); return `${bar()}<main>${ttl('Propietario', '¡Contrato creado!', 'Ahora invitá al inquilino para que vea todo desde su celular.')}${c.inquilino_id ? '<div class="card">El inquilino ya tiene cuenta y ya ve el contrato.</div>' : invCard(c)}${btn('Ir al contrato', 'contrato')}</main>${nav(0)}`; };
screens.recibo = async () => {
  const { data: p } = await sb.from('pagos').select('*').eq('id', S.p.id).single(); const c = cur();
  return `${bar(back('pagos'))}<main>${ttl(rolTxt(), 'Recibo de alquiler', per(p.periodo))}<div class="card"><div class="sp"><span class="eb" style="margin:0">Recibo · ${per(p.periodo)}</span>${pill('Pagado', 'g')}</div><div class="mid">${money(p.monto)}</div>${c ? kv('Propiedad', addr(c)) : ''}${c ? kv('Inquilino', esc(S.names[c.inquilino_id] || c.inquilino_email || '—')) : ''}${c ? kv('Propietario', esc(S.names[c.propietario_id] || '—')) : ''}${kv('Fecha de pago', fdt(p.fecha_pago))}${kv('Medio', esc(p.medio || '—'))}${kv('Operación', esc(p.nro_operacion || '—'))}${p.comision > 0 ? kv('Comisión', money(p.comision)) : ''}<div class="tot">${kv('Total abonado', money(p.monto))}</div></div>${abtn('Descargar o imprimir PDF', 'imprimir')}<p class="note">En el celular elegí "Guardar como PDF" en las opciones de impresión.</p></main>${nav(1)}`;
};


screens.pagar = async () => {
  const c = cur(); if (!c) return screens.home();
  const { data: p } = await sb.from('pagos').select('*').eq('id', S.p.id).single();
  const own = S.cuentas[c.propietario_id] || {};
  const cp = (label, val) => val ? `<div class="row" style="padding:10px 0"><span class="rc"><small>${label}</small><b style="word-break:break-all">${esc(val)}</b></span><button class="pill b" data-act="copiar" data-t="${esc(val)}">Copiar</button></div>` : '';
  const tieneCuenta = own.cuenta_alias || own.cuenta_cbu;
  const cuenta = tieneCuenta ? `<div class="card" style="padding:6px 20px"><div class="eb" style="margin:14px 0 0">Transferí a esta cuenta</div>${cp('Titular', own.cuenta_titular)}${cp('Banco', own.cuenta_banco)}${cp('Alias', own.cuenta_alias)}${cp('CBU / CVU', own.cuenta_cbu)}</div>` : `<div class="card" style="background:var(--amb);color:var(--ambt);border-color:var(--amb)"><b>Tu propietario todavía no cargó los datos de su cuenta.</b><div style="font-size:14px;margin:4px 0 0">Pedíselos por WhatsApp y apenas los cargue los vas a ver acá.</div><a class="btn" target="_blank" rel="noopener" href="${waLink(S.tels[c.propietario_id], 'Hola ' + (S.names[c.propietario_id] || '').split(' ')[0] + ', ¿me pasás los datos de tu cuenta para transferirte el alquiler de ' + per(p.periodo) + '?')}">Pedir datos por WhatsApp</a></div>`;
  const informar = p.estado === 'informado' ? `<div class="card">${pill('Esperando confirmación', 'b')}<p style="margin:8px 0 0">Ya avisaste que transferiste. Cuando tu propietario confirme que recibió la plata, el pago queda como pagado y se genera el recibo.</p></div>` : `<form data-act="informar" data-id="${p.id}" class="card"><b>¿Ya transferiste?</b><div class="mut" style="font-size:14px;margin:4px 0 12px">Adjuntá el comprobante (opcional) y avisale a tu propietario.</div><div class="f"><label>Comprobante</label><input type="file" name="comprobante" accept="image/*,application/pdf"></div><button class="btn" type="submit" style="margin-top:0">Ya transferí, avisar</button></form>`;
  return `${bar(back('home'))}<main>${ttl('Inquilino', 'Pagá tu alquiler', per(p.periodo))}<div class="card navy"><div class="mut">Monto a transferir</div><div class="big" style="margin:4px 0 10px">${money(p.monto)}</div><button class="btn o" style="margin-top:0;color:#fff;border-color:#ffffff55" data-act="copiar" data-t="${Math.round(p.monto)}">Copiar monto</button><div class="mut" style="margin-top:10px;font-size:13px">Vence el ${fd(p.fecha_vencimiento)}</div></div>${cuenta}${informar}</main>${nav(1)}`;
};

/* ---------- acciones ---------- */
const SAFE = [/^Tenés que/, /^No hay ningún/, /^El inquilino/, /^La contraseña/, /^El alias/, /^El CBU/, /^Correo o contraseña/, /^Solo /, /^Sin acceso/, /^Hiciste muchas/, /^No se pudo consultar/, /^El INDEC/, /^No se puede/, /^Falta el correo/];
const ERR_MAP = [[/Invalid login credentials/i, 'Correo o contraseña incorrectos.'], [/already registered|already been registered/i, 'Ese correo ya tiene una cuenta. Probá iniciar sesión.'], [/Email not confirmed/i, 'Todavía tenés que confirmar tu correo. Revisá tu bandeja de entrada.'], [/rate limit|too many requests|over_email_send_rate_limit|429/i, 'Hiciste muchos intentos. Esperá unos minutos y probá de nuevo.'], [/Password should be|weak_password/i, 'La contraseña es muy débil. Usá al menos 8 caracteres.'], [/captcha/i, 'No pudimos verificar que sos una persona. Probá de nuevo.'], [/Failed to fetch|NetworkError|network/i, 'No hay conexión. Revisá tu internet y probá de nuevo.'], [/violates check constraint|invalid input syntax|value too long/i, 'Revisá los datos que ingresaste: hay alguno inválido.'], [/row-level security|permission denied/i, 'No tenés permiso para hacer esto.'], [/duplicate key|unique constraint/i, 'Ese dato ya existe.'], [/mime type|maximum allowed size|payload too large/i, 'El archivo es muy pesado o de un tipo no permitido. Usá una foto o un PDF de hasta 10 MB.']];
const errMsg = e => {
  const m = String(e?.message || e || '');
  if (SAFE.some(r => r.test(m))) return m;
  for (const [r, t] of ERR_MAP) if (r.test(m)) return t;
  console.error(e);
  return 'Algo salió mal. Probá de nuevo en un momento. Si sigue pasando, escribinos.';
};
const acts = {
  async signup(v) {
    if ((v.password || '').length < 8) throw new Error('La contraseña debe tener al menos 8 caracteres.');
    const { data, error } = await sb.auth.signUp({ email: v.email.trim(), password: v.password, options: { captchaToken: captcha(), data: { nombre_completo: v.nombre.trim(), dni: (v.dni || '').trim(), celular: (v.celular || '').trim(), rol: v.rol } } });
    if (error) throw error;
    if (!data.session) { toast('Te enviamos un correo para confirmar tu cuenta. Después iniciá sesión.'); return go('login'); }
    await boot(data.session);
  },
  async login(v) { const { data, error } = await sb.auth.signInWithPassword({ email: v.email.trim(), password: v.password, options: { captchaToken: captcha() } }); if (error) throw new Error(error.message === 'Invalid login credentials' ? 'Correo o contraseña incorrectos.' : error.message); await boot(data.session); },
  async logout() { await sb.auth.signOut(); S.user = null; S.profile = null; S.cs = []; go('bienvenida'); },
  async rol(v, f, id) { const { error } = await sb.from('profiles').update({ rol: id }).eq('id', S.user.id); if (error) throw error; S.role = id; S.profile.rol = id; S.cid = null; await loadAll(); go('home'); },
  async nuevo(v) {
    const { data, error } = await sb.rpc('crear_contrato', { p_direccion: v.direccion.trim(), p_barrio: v.barrio, p_ciudad: v.provincia === 'CABA' ? 'Ciudad Autónoma de Buenos Aires' : v.ciudad, p_provincia: v.provincia, p_email_inquilino: v.email, p_fecha_inicio: v.inicio, p_duracion_meses: +v.meses, p_monto: num(v.monto), p_frecuencia: +v.freq, p_dia_venc: +v.dia, p_com_prop: +v.cp || 0, p_com_inq: +v.ci || 0 });
    if (error) throw error; await loadAll(); S.cid = data; toast('Contrato creado'); go(cur() && !cur().inquilino_id ? 'invitar' : 'contrato');
  },
  async cuenta(v) {
    const cbu = (v.cbu || '').replace(/\D/g, ''); if (cbu && cbu.length !== 22) throw new Error('El CBU o CVU debe tener 22 números.');
    const alias = (v.alias || '').trim(); if (alias && !/^[A-Za-z0-9.\-]{6,20}$/.test(alias)) throw new Error('El alias debe tener entre 6 y 20 caracteres: letras, números, puntos o guiones.');
    const upd = { cuenta_alias: alias || null, cuenta_cbu: cbu || null, cuenta_titular: (v.titular || '').trim() || null, cuenta_banco: (v.banco || '').trim() || null };
    const { error } = await sb.from('profiles').update(upd).eq('id', S.user.id); if (error) throw error;
    Object.assign(S.profile, upd); toast('Datos de cobro guardados'); draw(true);
  },
  async informar(v, f, id) {
    const file = f.elements.comprobante.files[0]; const c = cur(); let path = null;
    if (file) { path = `${c.id}/comprobante-${Date.now()}-${file.name.replace(/[^\w.\-]+/g, '-')}`; const up = await sb.storage.from('documentos').upload(path, file); if (up.error) throw up.error; }
    const { error } = await sb.rpc('informar_pago', { p_pago: id, p_comprobante: path }); if (error) throw error;
    toast('Listo. Le avisamos al propietario.'); go('home');
  },
  async confirmar(v, f, id) { if (!confirm('¿Confirmás que recibiste la transferencia?')) return; const { error } = await sb.rpc('confirmar_pago', { p_pago: id }); if (error) throw error; toast('Pago confirmado. Ya se generó el recibo.'); draw(true); },
  async norecibido(v, f, id) { if (!confirm('¿Marcar que no recibiste la transferencia? El pago vuelve a quedar pendiente.')) return; const { error } = await sb.rpc('rechazar_pago', { p_pago: id }); if (error) throw error; toast('El pago volvió a pendiente'); draw(true); },
  async vercomp(v, f, id) { const { data, error } = await sb.storage.from('documentos').createSignedUrl(id, 120); if (error) throw error; window.open(data.signedUrl, '_blank'); },
  async ajuste(v) {
    const c = cur(); const pct = +v.pct; const nuevo = Math.round(c.monto_actual * (1 + pct / 100));
    const { error } = await sb.from('ajustes').upsert({ contrato_id: c.id, fecha_aplicacion: c.proximo_ajuste, porcentaje_estimado: pct, monto_anterior: c.monto_actual, monto_nuevo: nuevo, estado: 'estimado' }, { onConflict: 'contrato_id,fecha_aplicacion' });
    if (error) throw error; toast('Porcentaje guardado. El inquilino ya lo ve.'); draw(true);
  },
  async aplicar(v, f, id) {
    const c = cur(); const { data: a } = await sb.from('ajustes').select('*').eq('id', id).single();
    if (!confirm('¿Aplicar el ajuste? El alquiler pasará a ' + money(a.monto_nuevo) + ' desde los próximos pagos.')) return;
    const e1 = await sb.from('contratos').update({ monto_actual: a.monto_nuevo }).eq('id', c.id); if (e1.error) throw e1.error;
    const e2 = await sb.from('ajustes').update({ estado: 'aplicado' }).eq('id', id); if (e2.error) throw e2.error;
    await loadAll(); toast('Ajuste aplicado'); draw(true);
  },
  async reclamo(v, f) {
    const c = cur(); const files = [...(f.elements.fotos.files || [])].slice(0, 5);
    const { data: r, error } = await sb.from('reclamos').insert({ contrato_id: c.id, creado_por: S.user.id, categoria: v.categoria, titulo: v.titulo.trim(), descripcion: v.descripcion }).select().single();
    if (error) throw error;
    for (const file of files) {
      const path = `${c.id}/${r.id}-${Date.now()}-${file.name.replace(/[^\w.\-]+/g, '-')}`;
      const up = await sb.storage.from('reclamos').upload(path, file); if (up.error) throw up.error;
      const ins = await sb.from('reclamo_fotos').insert({ reclamo_id: r.id, storage_path: path }); if (ins.error) throw ins.error;
    }
    toast('Reclamo enviado'); go('reclamo', { id: r.id });
  },
  async presup(v, f, id) { const { error } = await sb.from('presupuestos').insert({ reclamo_id: id, tecnico_nombre: v.tecnico.trim(), tecnico_matricula: v.matricula || null, mano_obra: num(v.mo), materiales: num(v.mat), horas_estimadas: v.horas ? +v.horas : null }); if (error) throw error; toast('Presupuesto cargado'); draw(true); },
  async preaprob(v, f, id) { const { error } = await sb.from('presupuestos').update({ estado: 'aprobado', decidido_en: new Date().toISOString() }).eq('id', id); if (error) throw error; await sb.from('reclamos').update({ estado: 'en_arreglo' }).eq('id', S.p.id); toast('Presupuesto aprobado'); draw(true); },
  async prerech(v, f, id) { const m = prompt('Motivo del rechazo (opcional):') ?? ''; const { error } = await sb.from('presupuestos').update({ estado: 'rechazado', motivo_rechazo: m, decidido_en: new Date().toISOString() }).eq('id', id); if (error) throw error; toast('Presupuesto rechazado'); draw(true); },
  async verdoc(v, f, id) { const { data, error } = await sb.storage.from('documentos').createSignedUrl(id, 120); if (error) throw error; window.open(data.signedUrl, '_blank'); },
  async estdoc(v, f, id, el) { const upd = { estado: el.dataset.v, verificado_por: S.user.id, verificado_en: new Date().toISOString() }; const { error } = await sb.from('documentos').update(upd).eq('id', id); if (error) throw error; draw(true); },
  async recuperar(v) { const { error } = await sb.auth.resetPasswordForEmail(v.email.trim(), { redirectTo: location.origin, captchaToken: captcha() }); if (error) throw error; toast('Te enviamos un correo con el link para elegir una nueva contraseña.'); go('login'); },
  async nuevaclave(v) { if ((v.password || '').length < 8) throw new Error('La contraseña debe tener al menos 8 caracteres.'); const { error } = await sb.auth.updateUser({ password: v.password }); if (error) throw error; toast('Contraseña actualizada'); const { data: { session } } = await sb.auth.getSession(); await boot(session); },
  async ipcoficial() {
    const c = cur(); const n = c.frecuencia_ajuste_meses;
    const r = await fetch('https://apis.datos.gob.ar/series/api/series/?ids=148.3_INIVELNAL_DICI_M_26&limit=' + (n + 1) + '&sort=desc&format=json');
    if (!r.ok) throw new Error('No se pudo consultar el IPC oficial. Probá más tarde o cargalo a mano.');
    const d = (await r.json()).data;
    if (!d || d.length < n + 1) throw new Error('El INDEC todavía no publicó datos suficientes.');
    const pct = Math.round((d[0][1] / d[n][1] - 1) * 10000) / 100; const nuevo = Math.round(c.monto_actual * (1 + pct / 100));
    const { error } = await sb.from('ajustes').upsert({ contrato_id: c.id, fecha_aplicacion: c.proximo_ajuste, porcentaje_estimado: pct, monto_anterior: c.monto_actual, monto_nuevo: nuevo, estado: 'estimado' }, { onConflict: 'contrato_id,fecha_aplicacion' });
    if (error) throw error; toast('IPC oficial de los últimos ' + n + ' meses (hasta ' + per(d[0][0]) + '): +' + pct + '%'); draw(true);
  },
  async copiar(v, f, id, el) { await navigator.clipboard.writeText(el.dataset.t); toast('Copiado'); },
  imprimir() { window.print(); },
};


/* ---------- listas para autocompletar ---------- */
const BARRIOS_CABA = ['Agronomía','Almagro','Balvanera','Barracas','Belgrano','Boedo','Caballito','Chacarita','Coghlan','Colegiales','Constitución','Flores','Floresta','La Boca','La Paternal','Liniers','Mataderos','Monte Castro','Montserrat','Nueva Pompeya','Núñez','Palermo','Parque Avellaneda','Parque Chacabuco','Parque Chas','Parque Patricios','Puerto Madero','Recoleta','Retiro','Saavedra','San Cristóbal','San Nicolás','San Telmo','Vélez Sarsfield','Versalles','Villa Crespo','Villa del Parque','Villa Devoto','Villa General Mitre','Villa Lugano','Villa Luro','Villa Ortúzar','Villa Pueyrredón','Villa Real','Villa Riachuelo','Villa Santa Rita','Villa Soldati','Villa Urquiza'];
const LOC_PBA = ['Adrogué','Almirante Brown','Avellaneda','Azul','Bahía Blanca','Banfield','Baradero','Beccar','Bella Vista','Berazategui','Bernal','Berisso','Boulogne','Burzaco','Campana','Cañuelas','Carapachay','Castelar','Caseros','Ciudadela','City Bell','Colón','Del Viso','Don Torcuato','Dock Sud','El Palomar','Ensenada','Escobar','Esteban Echeverría','Ezeiza','Florencio Varela','Florida','Francisco Álvarez','General Pacheco','General Rodríguez','General San Martín','Gerli','Glew','Gonnet','Grand Bourg','Gregorio de Laferrère','Haedo','Hurlingham','Isidro Casanova','Ituzaingó','José C. Paz','José León Suárez','Junín','La Matanza','La Plata','Lanús','Lomas de Zamora','Lomas del Mirador','Luján','Mar del Plata','Marcos Paz','Martínez','Mercedes','Merlo','Monte Grande','Moreno','Morón','Munro','Olavarría','Olivos','Pablo Nogués','Pacheco','Padua','Parque San Martín','Pergamino','Pilar','Piñeyro','Quilmes','Rafael Calzada','Rafael Castillo','Ramos Mejía','Ranelagh','Remedios de Escalada','Ringuelet','San Antonio de Padua','San Fernando','San Isidro','San Justo','San Martín','San Miguel','San Nicolás','San Vicente','Sarandí','Tandil','Temperley','Tigre','Tortuguitas','Tres de Febrero','Valentín Alsina','Vicente López','Victoria','Villa Ballester','Villa Domínico','Villa Gesell','Villa Luzuriaga','Villa Martelli','Villa Sarmiento','Wilde','Zárate'];
const norm = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const titleCase = s => s.toLowerCase().replace(/(^|\s)\S/g, m => m.toUpperCase());
let acT;
document.addEventListener('input', e => {
  const t = e.target;
  if (t.dataset.money !== undefined) { const d = t.value.replace(/\D/g, ''); t.value = d ? Number(d).toLocaleString('es-AR') : ''; return; }
  const k = t.dataset.ac; if (!k) return;
  const dl = document.getElementById(k === 'loc' ? 'dl-loc' : 'dl-bar');
  const prov = document.querySelector('[data-prov]')?.value;
  const raw = t.value.trim(), q = norm(raw);
  const fill = a => { const u = [...new Set(a)].sort((x, y) => (norm(y).startsWith(q) - norm(x).startsWith(q)) || x.localeCompare(y)).slice(0, 12); dl.innerHTML = u.map(x => `<option value="${esc(x)}"></option>`).join(''); };
  if (q.length < 3) { dl.innerHTML = ''; return; }
  const src = k === 'bar' ? (prov === 'CABA' ? BARRIOS_CABA : []) : (prov === 'Buenos Aires' ? LOC_PBA : []);
  const local = src.filter(x => norm(x).includes(q));
  fill(local);
  if (k === 'loc' && prov === 'Buenos Aires') {
    clearTimeout(acT);
    acT = setTimeout(async () => {
      try {
        const r = await fetch('https://apis.datos.gob.ar/georef/api/localidades?provincia=06&campos=nombre&max=10&nombre=' + encodeURIComponent(raw));
        const j = await r.json();
        if (t.value.trim() === raw) fill([...local, ...(j.localidades || []).map(l => titleCase(l.nombre))]);
      } catch (_) { /* si falla, quedan las sugerencias de la lista local */ }
    }, 300);
  }
});

/* ---------- eventos ---------- */
document.addEventListener('submit', async e => {
  const f = e.target; if (!f.dataset.act) return; e.preventDefault();
  const b = f.querySelector('button[type=submit]'); if (b) b.disabled = true;
  try { await acts[f.dataset.act](Object.fromEntries(new FormData(f)), f, f.dataset.id); } catch (er) { toast(errMsg(er)); window.turnstile?.reset?.(); }
  if (b) b.disabled = false;
});
document.addEventListener('click', async e => {
  const g = e.target.closest('[data-go]');
  if (g) { if (g.dataset.id && ['contrato', 'pagos'].includes(g.dataset.go)) S.cid = g.dataset.id; return go(g.dataset.go, g.dataset.id ? { id: g.dataset.id } : {}); }
  const a = e.target.closest('button[data-act]');
  if (a && acts[a.dataset.act]) { a.disabled = true; try { await acts[a.dataset.act]({}, null, a.dataset.id, a); } catch (er) { toast(errMsg(er)); } a.disabled = false; }
});
document.addEventListener('change', async e => {
  const t = e.target;
  try {
    if (t.dataset.prov !== undefined) {
      const caba = t.value === 'CABA', pba = t.value === 'Buenos Aires';
      document.querySelector('[data-loc]').hidden = caba;
      document.querySelector('[data-lhint]').textContent = pba ? '(escribí 3 letras y elegí de la lista)' : '(escribilo a mano)';
      document.querySelector('[data-bhint]').textContent = caba ? '(escribí 3 letras y elegí de la lista)' : '(escribilo a mano)';
      document.getElementById('dl-loc').innerHTML = ''; document.getElementById('dl-bar').innerHTML = '';
    } else if (t.dataset.up) {
      const f = t.files[0]; if (!f) return; const c = cur();
      const path = `${c.id}/${Date.now()}-${f.name.replace(/[^\w.\-]+/g, '-')}`;
      toast('Subiendo…'); const up = await sb.storage.from('documentos').upload(path, f); if (up.error) throw up.error;
      const ins = await sb.from('documentos').insert({ contrato_id: c.id, tipo: t.dataset.up, nombre_archivo: f.name, storage_path: path, subido_por: S.user.id }); if (ins.error) throw ins.error;
      toast('Documento subido'); draw(true);
    } else if (t.dataset.est) {
      const upd = { estado: t.value, resuelto_en: t.value === 'resuelto' ? new Date().toISOString() : null };
      const { error } = await sb.from('reclamos').update(upd).eq('id', t.dataset.est); if (error) throw error; toast('Estado actualizado'); draw(true);
    }
  } catch (er) { toast(errMsg(er)); }
});

/* ---------- inicio ---------- */
(async () => {
  const isRec = location.hash.includes('type=recovery');
  const { data: { session } } = await sb.auth.getSession();
  if (isRec && session) { S.user = session.user; go('nueva-clave'); return; }
  if (session) { try { await boot(session); } catch (e) { console.error(e); go('bienvenida'); } } else go('bienvenida');
})();
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
