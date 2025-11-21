// ====== MANTIDO TODO O JAVASCRIPT ORIGINAL ======
// ====== CONSTS / HELPERS (INTEGRAÇÃO API) ======
const qs = (s, el = document) => el.querySelector(s);
const qsa = (s, el = document) => Array.from(el.querySelectorAll(s));
function toast(msg) {
  const el = qs('#toast'); el.textContent = msg; el.classList.add('show');
  clearTimeout(el._t); el._t = setTimeout(() => el.classList.remove('show'), 2200);
}

const BASE_URL = "https://wbhk.joaoavelar.space/webhook";
const ENDPOINT = `${BASE_URL}/api/sync`;

async function apiRequest(path, method = 'GET', data = null) {
  try {
    const config = { method, headers: { 'Content-Type': 'application/json' } };
    if (data && method !== 'GET') config.body = JSON.stringify(data);
    const url = path.startsWith('http') ? path : `${BASE_URL}${path}`;
    const response = await fetch(url, config);
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    toast('Erro de conexão');
    return { success: false, error: error.message };
  }
}

function buildPayload() {
  return {
    ui: {
      theme: document.documentElement.classList.contains('light') ? 'light' : 'dark',
      sidebarCollapsed: !document.querySelector('#sidebar')?.classList.contains('open') && document.querySelector('#sidebar')?.classList.contains('collapsed'),
      currentSection: (location.hash || '#dashboard').replace('#','') || 'dashboard',
    },
    rangeDays: state.rangeDays,
    metrics: state.metrics,
    hourly: state.hourly,
    leads: state.leads,
    activeLeadId: state.activeLead?.id ?? null,
    history: state.history,
    whatsapp: state.whatsapp,
    memoria: state.memoria,
    timestamp: new Date().toISOString()
  }
}
async function sendAll(endpoint = ENDPOINT) {
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(buildPayload())
    });
    // mantém estrutura; sem logs extras de disparo
  } catch (err) {
    console.warn('sendAll error', err);
  }
}

// ====== THEME / SIDEBAR ======
const html = document.documentElement;
function applyTheme(saved) {
  const theme = saved ?? localStorage.getItem('theme') ?? 'dark';
  html.classList.toggle('light', theme === 'light');
  localStorage.setItem('theme', theme);
}
function toggleTheme() { applyTheme(html.classList.contains('light') ? 'dark' : 'light'); }

const sidebar = qs('#sidebar');
function setSidebarCollapsed(collapsed) {
  if (window.innerWidth <= 900) {
    sidebar.classList.toggle('open', !collapsed);
  } else {
    sidebar.classList.toggle('collapsed', collapsed);
    localStorage.setItem('sidebar-collapsed', collapsed ? '1' : '0');
  }
}
function toggleSidebar() {
  if (window.innerWidth <= 900) sidebar.classList.toggle('open');
  else setSidebarCollapsed(!sidebar.classList.contains('collapsed'));
}

// ====== STATE ======
const state = {
  rangeDays: 1,
  metrics: { leads: 0, leadsHint: "", sent: 0, sentHint: "", responseTime: 0, responseHint: "" },
  hourly: Array.from({length: 24}, () => 0),
  leads: [],
  activeLead: null,
  history: [],
  whatsapp: { status: "offline", qrSeed: 0, qr: null },
  memoria: [],
  memEdit: null,
};

// ====== UTILITIES / GENERATORS (mantidos p/ UI) ======
function baseHourValue(h, factor=1) {
  const work = (h >= 9 && h <= 18) ? 1 : 0.35;
  const lunch = (h === 12 || h === 13) ? -0.25 : 0;
  const v = Math.max(0, work + lunch) + (Math.sin(h/2)+1)/6;
  return Math.round((v * 12 * factor));
}
function computePie() {
  const todayStart = new Date(); todayStart.setHours(0,0,0,0);
  const total = state.leads.length || 1;
  const newLeads = state.leads.filter(l => new Date(l.primeiroContato) >= todayStart).length;
  const pctNew = Math.round(newLeads / total * 100);
  const pctOld = 100 - pctNew;
  return { pctNew, pctOld };
}
const CHART_HEIGHT = 380;
function sizeCanvasToDevice(canvas, cssW, cssH) {
  const dpr = Math.max(1, window.devicePixelRatio || 1);
  canvas.style.width = cssW + 'px';
  canvas.style.height = cssH + 'px';
  canvas.width = Math.floor(cssW * dpr);
  canvas.height = Math.floor(cssH * dpr);
  return dpr;
}

// ====== RENDER: MÉTRICAS / CHARTS / DONUT ======
function renderMetrics() {
  qs('#m-leads').textContent = state.metrics.leads?.toLocaleString?.('pt-BR') ?? '0';
  qs('#m-sent').textContent = state.metrics.sent?.toLocaleString?.('pt-BR') ?? '0';
  qs('#m-response').textContent = (state.metrics.responseTime ?? 0) + 'seg';
  qs('#m-leads-hint').textContent = state.metrics.leadsHint || '';
  qs('#m-sent-hint').textContent = state.metrics.sentHint || '';
  qs('#m-response-hint').textContent = state.metrics.responseHint || '';
}

function renderHourlyChart() {
  const canvas = qs('#hourlyChart');
  const wrap = qs('#hourly-wrap');
  const tip = qs('#chart-tooltip');
  const rect = wrap.getBoundingClientRect();
  const dpr = sizeCanvasToDevice(canvas, Math.max(600, Math.floor(rect.width)), CHART_HEIGHT);
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const w = canvas.width / dpr, h = canvas.height / dpr;
  const pad = 32;

  // Clear
  ctx.clearRect(0,0,w,h);

  // Enhanced Grid
  ctx.strokeStyle = 'rgba(102, 126, 234, 0.1)';
  ctx.lineWidth = 1;
  for (let i=0;i<=5;i++) {
    const y = pad + ((h - pad*2) * i / 5);
    ctx.beginPath(); ctx.moveTo(pad, y); ctx.lineTo(w - pad, y); ctx.stroke();
  }
  for (let i=0;i<=8;i++) {
    const x = pad + ((w - pad*2) * i / 8);
    ctx.beginPath(); ctx.moveTo(x, pad); ctx.lineTo(x, h - pad); ctx.stroke();
  }

  // Enhanced Labels
  ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--muted');
  ctx.font = '11px Inter, sans-serif';
  ctx.textAlign = 'center';
  for (let i=0;i<=8;i++) {
    const hour = i * 3;
    const x = pad + ((w - pad*2) * i / 8);
    ctx.fillText(hour + 'h', x, h - 10);
  }

  // Enhanced Bars with gradients
  const max = Math.max(1, ...state.hourly);
  const innerW = w - pad*2;
  const barW = innerW / 24 * 0.8;
  const step = innerW / 24;

  for (let i=0;i<24;i++) {
    const x = pad + i * step + (step - barW)/2;
    const val = state.hourly[i];
    const barH = (val/max) * (h - pad*2);
    const y = h - pad - barH;

    const isBiz = i >= 9 && i <= 18;
    const grd = ctx.createLinearGradient(0, y, 0, y + barH);
    if (isBiz) { 
      grd.addColorStop(0, 'rgba(102, 126, 234, 0.9)'); 
      grd.addColorStop(1, 'rgba(118, 75, 162, 0.4)'); 
    }
    else { 
      grd.addColorStop(0, 'rgba(148, 163, 184, 0.7)'); 
      grd.addColorStop(1, 'rgba(100, 116, 139, 0.3)'); 
    }

    ctx.fillStyle = grd;
    ctx.fillRect(x, y, barW, barH);
    
    // Enhanced glow effect
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.fillRect(x, y, barW, 3);
    
    // Add subtle shadow
    ctx.fillStyle = 'rgba(0,0,0,0.1)';
    ctx.fillRect(x, y + barH - 2, barW, 2);
  }

  // Enhanced Tooltip
  wrap.onmousemove = (evt) => {
    const r = canvas.getBoundingClientRect();
    const mx = (evt.clientX - r.left);
    const my = (evt.clientY - r.top);
    if (mx < pad || mx > w - pad || my < pad || my > h - pad) { 
      tip.style.display = 'none'; 
      canvas.style.cursor = 'default';
      return; 
    }
    const relX = mx - pad;
    let idx = Math.floor(relX / step);
    if (idx < 0) idx = 0; if (idx > 23) idx = 23;
    const val = state.hourly[idx];
    tip.innerHTML = `<strong>${idx}h</strong><br/>${val} mensagens`;
    tip.style.display = 'block';
    tip.style.left = `${evt.clientX}px`;
    tip.style.top = `${evt.clientY - 10}px`;
    canvas.style.cursor = 'pointer';
  };
  wrap.onmouseleave = () => { 
    tip.style.display = 'none'; 
    canvas.style.cursor = 'default';
  };
}

function renderDonut({ pctNew, pctOld }) {
  const c = 2 * Math.PI * 64;
  const s1 = qs('#slice1'), s2 = qs('#slice2');
  const d1 = (pctNew/100) * c;
  const d2 = (pctOld/100) * c;
  
  // Animação suave do donut
  s1.style.transition = 'stroke-dasharray 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
  s2.style.transition = 'stroke-dasharray 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
  
  s1.setAttribute('stroke-dasharray', `${d1} ${c - d1}`);
  s1.setAttribute('stroke-dashoffset', '0');
  s2.setAttribute('stroke-dasharray', `${d2} ${c - d2}`);
  s2.setAttribute('stroke-dashoffset', `${-d1}`);
  qs('#donut-center').textContent = `${pctNew}%`;
  qs('#lg-new').textContent = `${pctNew}%`;
  qs('#lg-old').textContent = `${pctOld}%`;
}

// ====== LEADS ======
async function renderLeads() {
  const term = (qs("#lead-search").value || "").toLowerCase();
  
  if (state.leads.length === 0) {
    const res = await apiRequest(`/leads?search=${encodeURIComponent(term)}&page=1&limit=50`);
    if (res?.success) {
      state.leads = res.data || res.items || [];
    }
  }
  
  const filteredLeads = state.leads.filter(l => {
    if (!term) return true;
    const searchText = `${l.nome} ${l.telefone}`.toLowerCase();
    return searchText.includes(term);
  });
  
  const prevActive = state.activeLead?.id || null;
  const tbody = qs("#leads-body");
  tbody.innerHTML = filteredLeads.map(l => `
    <tr data-id="${l.id}" tabindex="0" role="button" style="animation: slideInRight 0.3s ease both; animation-delay: ${Math.random() * 0.2}s;">
      <td><strong>${l.nome}</strong></td>
      <td>${l.telefone}</td>
      <td>${fmtDateTime(l.primeiroContato)}</td>
      <td>${fmtDateTime(l.ultimaMensagem)}</td>
    </tr>
  `).join("");
  
  // Update leads count
  const leadsCount = qs('#leads-count');
  if (leadsCount) leadsCount.textContent = `${filteredLeads.length} leads`;
  
  qsa("#leads-body tr").forEach(tr => {
    tr.addEventListener("click", () => selectLead(tr.getAttribute("data-id")));
    tr.addEventListener("keydown", (e) => { if (e.key === "Enter") selectLead(tr.getAttribute("data-id")); });
  });
  
  if (prevActive && state.leads.some(l => l.id == prevActive)) {
    selectLead(prevActive);
  }
  renderDonut(computePie());
}

function selectLead(id) {
  const lead = state.leads.find(l => l.id == id);
  if (!lead) return;
  state.activeLead = lead;
  
  qsa("#leads-body tr").forEach(tr => tr.classList.remove("selected"));
  const selectedRow = qs(`#leads-body tr[data-id="${id}"]`);
  if (selectedRow) selectedRow.classList.add("selected");
  
  qs("#lead-profile-name").textContent = lead.nome || "Nome não disponível";
  qs("#lead-profile-phone").textContent = lead.telefone || "Telefone não disponível";
  qs("#lead-profile-first").textContent = `📅 Primeiro contato: ${fmtDateTime(lead.primeiroContato)}`;
  qs("#lead-profile-last").textContent = `💬 Última mensagem: ${fmtDateTime(lead.ultimaMensagem)}`;
  const img = qs("#lead-avatar-img");
  const ph = qs("#lead-avatar-ph");
  if (lead.foto) { 
    img.src = lead.foto; 
    img.style.display = "block"; 
    ph.style.display = "none"; 
  } else { 
    img.style.display = "none"; 
    ph.style.display = "block"; 
  }
  qs("#lead-edit").style.display = "inline-flex";
}

function fmtDateTime(iso) {
  if (!iso) return '-';
  const d = new Date(iso);
  return d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'});
}

// Lead modal
let activeLeadId = null;
function openLeadModal() {
  if (!state.activeLead) return;
  activeLeadId = state.activeLead.id;
  const lead = state.activeLead;
  qs('#lead-name').value = lead.nome || '';
  qs('#lead-phone').value = lead.telefone || '';
  qs('#lead-first').value = toLocalInput(lead.primeiroContato);
  qs('#lead-modal').classList.add('open');
}
function toLocalInput(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const off = d.getTimezoneOffset();
  const local = new Date(d.getTime() - off*60000);
  return local.toISOString().slice(0,16);
}
function closeLeadModal() { qs('#lead-modal').classList.remove('open'); activeLeadId = null; }

async function saveLeadModal() {
  if (!activeLeadId) return;
  const body = {
    id: activeLeadId,
    nome: qs('#lead-name').value.trim(),
    telefone: qs('#lead-phone').value.trim(),
    primeiroContato: (() => {
      const dt = qs('#lead-first').value;
      if (!dt) return null;
      const d = new Date(dt);
      return new Date(d.getTime() - d.getTimezoneOffset()*60000).toISOString();
    })()
  };
  const res = await apiRequest(`/leads/update`, 'PUT', body);
  if (res?.success) {
    const updated = res.data || { id: activeLeadId, ...body };
    const idx = state.leads.findIndex(l => l.id === activeLeadId);
    if (idx > -1) state.leads[idx] = { ...state.leads[idx], ...updated };
    await renderLeads();
    selectLead(updated.id);
    closeLeadModal();
    toast('✅ Lead salvo com sucesso');
  } else {
    toast('❌ Erro ao salvar lead');
  }
}

// ====== DISPARO ======
function renderDisparoChecklist() {
  const filter = (qs('#lead-filter').value || '').toLowerCase();
  const list = state.leads.filter(l => (l.nome + ' ' + l.telefone).toLowerCase().includes(filter));
  const wrap = qs('#lead-checklist');
  wrap.innerHTML = list.map(l => `
      <label style="display:flex;align-items:center;gap:12px;padding:8px;border-radius:8px;transition:background 0.2s ease;cursor:pointer;" class="checklist-item">
        <input type="checkbox" value="${l.id}" style="accent-color: var(--accent-solid);" />
        <div>
          <div style="font-weight:600">${l.nome}</div>
          <div style="color:var(--muted);font-size:12px">${l.telefone}</div>
        </div>
      </label>
    `).join('');
  qsa('#lead-checklist input[type="checkbox"]:checked').forEach(cb => cb.checked = false);
  
  // Add hover effects
  qsa('.checklist-item').forEach(item => {
    item.addEventListener('mouseenter', () => {
      item.style.background = 'var(--bg-soft)';
    });
    item.addEventListener('mouseleave', () => {
      item.style.background = 'transparent';
    });
  });
}

async function enviarDisparo() {
  const txt = qs('#msg').value.trim();
  if (!txt) { toast('❌ Digite uma mensagem'); return; }
  const mode = qsa('input[name="destino"]').find(r => r.checked)?.value || 'todos';
  let ids = [];
  if (mode === 'selecionar') {
    ids = qsa('#lead-checklist input[type="checkbox"]:checked').map(i => i.value);
    if (ids.length === 0) { toast('❌ Selecione pelo menos um lead'); return; }
  } else {
    ids = state.leads.map(l => l.id);
  }
  const isScheduled = qs('#schedule-check').checked;
  let scheduleDate = null;
  if (isScheduled) {
    const date = qs('#schedule-date').value;
    const time = qs('#schedule-time').value;
    if (!date || !time) { toast('❌ Defina data e hora para agendamento'); return; }
    scheduleDate = new Date(`${date}T${time}`);
    if (isNaN(scheduleDate.getTime()) || scheduleDate <= new Date()) { toast('❌ Data de agendamento inválida'); return; }
  }

  const payload = {
    message: txt,
    mode,
    leadIds: ids,
    scheduled: isScheduled ? scheduleDate.toISOString() : null
  };
  const res = await apiRequest(`/whatsapp/send-bulk`, 'POST', payload);
  if (res?.success) {
    const count = mode === 'todos' ? state.leads.length : ids.length;
    const item = res.data || {
      id: crypto.randomUUID(),
      when: isScheduled ? scheduleDate.toISOString() : new Date().toISOString(),
      ok: isScheduled ? null : true,
      message: txt,
      count,
      scheduled: isScheduled
    };
    state.history.unshift(item);
    renderHistory();

    qs('#msg').value = '';
    qsa('#lead-checklist input[type="checkbox"]').forEach(cb => cb.checked = false);
    qs('#schedule-check').checked = false;
    qs('#schedule-options').style.display = 'none';
    toast(isScheduled ? `⏰ Disparo agendado para ${scheduleDate.toLocaleString('pt-BR')}` :
        `✅ Mensagem enviada para ${count} lead(s)!`);
  } else {
    toast('❌ Falha ao enviar disparo');
  }
}

async function loadHistory(page = 1, limit = 50) {
  const res = await apiRequest(`/whatsapp/history?page=${page}&limit=${limit}`);
  if (res?.success) {
    state.history = res.data || res.items || [];
    renderHistory();
  }
}

function renderHistory() {
  const box = qs('#send-history');
  const historyCount = qs('#history-count');
  if (historyCount) historyCount.textContent = `${state.history.length} disparos`;
  
  box.innerHTML = state.history.map((h, index) => {
    const isPending = h.scheduled && new Date(h.when) > new Date();
    const statusDot = isPending ? '<span class="dot" style="background:linear-gradient(135deg, #ed8936, #dd6b20);"></span>' :
        `<span class="dot" style="background:${h.ok ? 'linear-gradient(135deg, #48bb78, #38a169)' : 'linear-gradient(135deg, #f56565, #e53e3e)'};"></span>`;
    const statusText = isPending ? '⏰ Agendado' : (h.ok ? '✅ Enviado' : '❌ Falha');
    const statusIcon = isPending ? '⏰' : (h.ok ? '✅' : '❌');
    return `
        <div class="card" style="animation: fadeUp 0.3s ease both; animation-delay: ${index * 0.05}s;">
          <div class="card-body">
            <div style="display:flex; justify-content:space-between; gap:12px; align-items:center; margin-bottom:8px;">
              <div style="display:flex; gap:10px; align-items:center;">
                ${statusDot}
                <strong>${statusText}</strong>
                <span class="badge">${new Date(h.when).toLocaleString('pt-BR')}</span>
              </div>
              <span class="badge">${statusIcon} ${h.count} destinatário(s)</span>
            </div>
            <div style="white-space:pre-wrap; font-size:13px; color:var(--text-soft); line-height:1.4; padding:8px 0;">${escapeHTML(h.message)}</div>
          </div>
        </div>
      `;
  }).join('');
}
function escapeHTML(s) { return s.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }

// ====== WHATSAPP ======
function renderWhatsApp() {
  const ind = qs('#wa-ind');
  const lab = qs('#wa-label');
  const qrElement = qs('#qr');
  const connectedElement = qs('#wa-connected');
  const refreshBtn = qs('#wa-refresh');
  
  ind.classList.toggle('on', state.whatsapp.status === 'online');
  lab.textContent = state.whatsapp.status === 'online' ? '✅ Online' : '⚫ Offline';
  
  if (state.whatsapp.status === 'online') {
    qrElement.style.display = 'none';
    connectedElement.style.display = 'flex';
    refreshBtn.style.display = 'none';
  } else {
    qrElement.style.display = 'block';
    connectedElement.style.display = 'none';
    refreshBtn.style.display = 'inline-flex';
    
    qrElement.style.backgroundPosition = `${(state.whatsapp.qrSeed%32)}px ${(state.whatsapp.qrSeed%32)}px, ${(state.whatsapp.qrSeed%32)}px ${(state.whatsapp.qrSeed%32)}px, 0 0`;
    if (state.whatsapp.qr) {
      qrElement.style.backgroundImage = `url('${state.whatsapp.qr}')`;
      qrElement.style.backgroundSize = 'cover';
    }
  }
}

async function checkWhatsAppStatus() {
  const res = await apiRequest(`/whatsapp/status`);
  if (res?.success) {
    state.whatsapp.status = res.data?.status || res.status || state.whatsapp.status;
    renderWhatsApp();
  }
}

let waInterval = null;
function startWaPolling() {
  stopWaPolling();
  waInterval = setInterval(async () => {
    if (document.hidden) return;
    await checkWhatsAppStatus();
  }, 30 * 60 * 1000);
}
function stopWaPolling() {
  if (waInterval) { clearInterval(waInterval); waInterval = null; }
}

async function refreshQR() {
  const btn = qs('#wa-refresh');
  btn.disabled = true;
  btn.innerHTML = '🔄 Atualizando...';
  
  const res = await apiRequest(`/whatsapp/refresh-qr`, 'POST');
  if (res?.success) {
    state.whatsapp.qrSeed++;
    if (res.data?.qr) state.whatsapp.qr = res.data.qr;
    renderWhatsApp();
    toast('✅ QR Code atualizado');
  } else {
    toast('❌ Falha ao atualizar QR Code');
  }
  
  btn.disabled = false;
  btn.innerHTML = '🔄 Atualizar QR Code';
}

// ====== MEMÓRIA ======
async function renderMemList() {
  const term = (qs("#mem-filter").value || "").toLowerCase();
  
  const res = await apiRequest(`/memoria?search=${encodeURIComponent(term)}`);
  if (res?.success) {
    state.memoria = res.data || res.items || [];
  } else {
    toast("❌ Falha ao carregar memórias");
    state.memoria = [];
  }
  
  const filteredMem = state.memoria.filter(m => {
    if (!term) return true;
    const searchText = `${m.pergunta} ${m.resposta}`.toLowerCase();
    return searchText.includes(term);
  });
  
  // Update memory count
  const memoryCount = qs('#memory-count');
  if (memoryCount) memoryCount.textContent = `${filteredMem.length} memórias`;
  
  const el = qs("#mem-list");
  el.innerHTML = filteredMem.map((m, index) => `
    <div class="card" style="animation: slideInRight 0.3s ease both; animation-delay: ${index * 0.05}s;">
      <div class="card-body">
        <div style="font-size:14px;font-weight:700;margin-bottom:8px;color:var(--text);">❓ ${escapeHTML(m.pergunta)}</div>
        <div style="font-size:13px;color:var(--text-soft);margin-bottom:16px;white-space:pre-wrap;line-height:1.5;padding:8px 12px;background:var(--bg-soft);border-radius:8px;border:1px solid var(--card-border);">💡 ${escapeHTML(m.resposta)}</div>
        <div style="display:flex;gap:10px;">
          <button class="btn secondary" data-edit="${m.id}">✏️ Editar</button>
          <button class="btn" data-del="${m.id}">🗑️ Apagar</button>
        </div>
      </div>
    </div>
  `).join("");
  
  qsa("[data-edit]").forEach(b => b.onclick = () => openMemEdit(b.getAttribute("data-edit")));
  qsa("[data-del]").forEach(b => b.onclick = () => delMem(b.getAttribute("data-del")));
}

async function addMem() {
  const pergunta = (qs("#q").value || "").trim();
  const resposta = (qs("#a").value || "").trim();
  if (!pergunta || !resposta) { toast("❌ Preencha pergunta e resposta"); return; }
  
  const btn = qs('#mem-add');
  btn.disabled = true;
  btn.innerHTML = '⏳ Salvando...';
  
  const res = await apiRequest(`/memoria`, "POST", { pergunta, resposta });
  if (res?.success) {
    qs("#q").value = ""; qs("#a").value = "";
    await renderMemList();
    toast("✅ Memória adicionada com sucesso");
  } else {
    toast("❌ Erro ao adicionar memória");
  }
  
  btn.disabled = false;
  btn.innerHTML = '➕ Adicionar Memória';
}

function openMemEdit(id) {
  const item = state.memoria.find(m => m.id === id);
  if (!item) return;
  state.memEdit = { ...item };
  qs('#mem-edit-q').value = item.pergunta;
  qs('#mem-edit-a').value = item.resposta;
  qs('#mem-modal').classList.add('open');
}
function closeMemEdit() {
  qs('#mem-modal').classList.remove('open');
  state.memEdit = null;
}
async function saveMemEdit() {
  if (!state.memEdit?.id) return;
  const pergunta = (qs("#mem-edit-q").value || "").trim();
  const resposta = (qs("#mem-edit-a").value || "").trim();
  const body = {
    id: state.memEdit.id,
    pergunta,
    resposta
  };
  const res = await apiRequest(`/memoria/update`, "PUT", body);
  if (res?.success) {
    await renderMemList();
    closeMemEdit();
    toast("✅ Memória atualizada");
  } else {
    toast("❌ Erro ao atualizar memória");
  }
}
async function delMem(id) {
  if (!confirm("🗑️ Confirmar exclusão desta memória?")) return;
  const res = await apiRequest(`/memoria/delete`, "DELETE", { id });
  if (res?.success) {
    await renderMemList();
    toast("✅ Memória removida");
  } else {
    toast("❌ Erro ao remover memória");
  }
}

// ====== MÉTRICAS / RANGE ======
async function setRange(days) {
  state.rangeDays = days;
  qsa(".segmented button").forEach(b => {
    const isActive = b.getAttribute("data-range") === String(days);
    b.classList.toggle("active", isActive);
    b.setAttribute("aria-selected", isActive);
  });
  const res = await apiRequest(`/dashboard/metrics?rangeDays=${days}`);
  if (res?.success) {
    const d = res.data || res;
    if (d.metrics) state.metrics = d.metrics;
    if (d.hourly) state.hourly = d.hourly;
    renderMetrics();
    renderHourlyChart();
    toast(`📊 Métricas atualizadas para ${days === 1 ? 'hoje' : days + ' dias'}`);
  } else {
    toast("❌ Falha ao atualizar métricas");
  }
}

// ====== LOAD INITIAL ======
async function loadInitialData() {
  const res = await apiRequest(`/api/sync`);
  if (res?.success) {
    const d = res.data || res;
    state.metrics = d.metrics ?? state.metrics;
    state.hourly = d.hourly ?? state.hourly;
    state.leads = d.leads ?? state.leads;
    state.activeLead = null;
    state.whatsapp = d.whatsapp ?? state.whatsapp;
    renderMetrics();
    renderHourlyChart();
    renderDonut(computePie());
    renderLeads();
    renderWhatsApp();
    renderMemList();
    await loadHistory();
    toast("✅ Dados carregados com sucesso");
  } else {
    toast("⚠️ Falha ao carregar dados iniciais");
  }
}

// ====== INIT / EVENTS ======
function init() {
  applyTheme();
  
  // Restore sidebar state
  if (window.innerWidth > 900) {
    const collapsed = localStorage.getItem('sidebar-collapsed') === '1';
    setSidebarCollapsed(collapsed);
  }
  
  // Theme / Sidebar controls
  qs("#toggleTheme").onclick = () => { 
    toggleTheme(); 
    toast(html.classList.contains('light') ? '☀️ Tema claro ativado' : '🌙 Tema escuro ativado');
  };
  qs("#toggleSidebar").onclick = () => { toggleSidebar(); };

  // Enhanced Navigation
  qsa("a[data-link]").forEach(a => {
    a.onclick = async (e) => {
      e.preventDefault();
      const target = a.getAttribute("href") || "#dashboard";
      const sectionName = target.replace('#', '');
      
      qsa("a[data-link]").forEach(x => {
        const isActive = x === a;
        x.classList.toggle("active", isActive);
        x.setAttribute("aria-selected", isActive);
      });
      
      qsa("main > section").forEach(sec => {
        const isActive = "#" + sec.id === target;
        sec.classList.toggle("active", isActive);
      });
      
      history.replaceState(null, "", target);
      
      // Section-specific loading
      if (target === "#disparo") {
        await loadHistory();
        renderDisparoChecklist();
      } else if (target === "#leads") {
        await renderLeads();
      } else if (target === "#memoria") {
        await renderMemList();
      } else if (target === "#whatsapp") {
        await checkWhatsAppStatus();
      }
      
      // Close mobile sidebar
      if (window.innerWidth <= 900) {
        sidebar.classList.remove('open');
      }
      
      toast(`📍 Navegando para ${sectionName.charAt(0).toUpperCase() + sectionName.slice(1)}`);
    };
  });

  // Enhanced Range controls
  qsa(".segmented button").forEach(b => {
    b.onclick = async () => { await setRange(Number(b.getAttribute("data-range") || "1")); }
  });

  // Enhanced Lead controls
  qs('#lead-search').addEventListener('input', debounce(() => renderLeads(), 300));
  qs('#lead-edit').onclick = openLeadModal;
  qs('#lead-save').onclick = saveLeadModal;
  qs('#lead-cancel').onclick = closeLeadModal;

  // Enhanced Disparo controls
  qsa('input[name="destino"]').forEach(r => r.onchange = () => {
    const sel = qs('#select-leads');
    const mode = qsa('input[name="destino"]').find(x => x.checked)?.value;
    sel.style.display = mode === 'selecionar' ? 'block' : 'none';
    if (mode === 'selecionar') renderDisparoChecklist();
  });
  qs('#lead-filter').addEventListener('input', debounce(renderDisparoChecklist, 300));
  qs('#schedule-check').onchange = () => {
    const options = qs('#schedule-options');
    options.style.display = qs('#schedule-check').checked ? 'grid' : 'none';
    if (qs('#schedule-check').checked) {
      // Set default date to tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      qs('#schedule-date').value = tomorrow.toISOString().split('T')[0];
      qs('#schedule-time').value = '09:00';
    }
  };
  qs('#send').onclick = enviarDisparo;

  // Enhanced WhatsApp controls
  qs('#wa-refresh').onclick = refreshQR;
  startWaPolling();
  
  // Enhanced Memory controls
  qs('#mem-add').onclick = addMem;
  qs('#mem-filter').addEventListener('input', debounce(() => renderMemList(), 300));
  qs('#mem-save').onclick = saveMemEdit;
  qs('#mem-cancel').onclick = closeMemEdit;

  // Enhanced Modal controls
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeLeadModal();
      closeMemEdit();
      if (window.innerWidth <= 900) {
        sidebar.classList.remove('open');
      }
    }
  });

  // Enhanced Responsive handling
  window.addEventListener('resize', () => {
    if (window.innerWidth > 900) {
      sidebar.classList.remove('open');
    }
  });

  // Initial load with enhanced error handling
  loadInitialData().catch(() => {
    toast("⚠️ Alguns dados podem não ter carregado completamente");
  });
}

// Utility function for debouncing
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

window.addEventListener('load', init);
