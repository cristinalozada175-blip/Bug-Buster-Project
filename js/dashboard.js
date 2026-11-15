/* Live admin dashboard: metrics, filters, activity, and weekly chart. */
(() => {
  'use strict';
  const PG = window.PG;
  if (!PG) return;
  const $ = (id) => document.getElementById(id);
  const number = (value) => new Intl.NumberFormat().format(Number(value || 0));
  let data = null;
  let loading = false;

  function setText(id, value) {
    const node = $(id);
    if (node) node.textContent = value;
  }

  function drawSpark(id, values, color) {
    const host = $(id);
    const canvas = host?.querySelector('canvas') || host;
    if (!canvas || typeof canvas.getContext !== 'function') return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const width = canvas.clientWidth || 60;
    const height = canvas.clientHeight || 40;
    const ratio = window.devicePixelRatio || 1;
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.clearRect(0, 0, width, height);
    const max = Math.max(1, ...values);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    values.forEach((value, index) => {
      const x = values.length < 2 ? width / 2 : 2 + (index / (values.length - 1)) * (width - 4);
      const y = height - 3 - ((value / max) * (height - 8));
      if (index === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.stroke();
  }

  function renderMetrics() {
    const weeklyDone = data.weekly.reduce((sum, day) => sum + day.completions, 0);
    setText('val-users', number(data.users));
    setText('change-users', ${number(data.new_users_7d)} new this week);
    setText('val-plays', number(weeklyDone));
    setText('change-plays', 'Completed levels in the last 7 days');
    setText('val-seeds', number(data.seeds_held));
    setText('change-seeds', 'Combined current gardener balance');
    setText('val-completions', number(data.completions));
    setText('change-completions', ${number(data.active_30d)} active in 30 days);
    setText('val-active', number(data.active_today));
    setText('val-rate', ${data.completion_rate}%);
    setText('val-new-users', number(data.new_users_7d));
    setText('val-active-month', number(data.active_30d));
    setText('val-suspended', number(data.suspended));
    drawSpark('trend-users', data.weekly.map((day) => day.signups), '#24865f');
    drawSpark('trend-plays', data.weekly.map((day) => day.completions), '#e9a43b');
    drawSpark('trend-completions', data.weekly.map((day) => day.completions), '#c4503c');
  }

  function renderChapterFilter() {
    const select = $('filter-chapter');
    if (!select) return;
    const current = select.value;
    select.replaceChildren(new Option('All Chapters', 'all'));
    data.chapters.forEach((chapter) => select.add(new Option(chapter.title, String(chapter.id))));
    select.value = [...select.options].some((option) => option.value === current) ? current : 'all';
  }

  function renderLevels() {
    const list = $('per-level');
    const selected = $('filter-chapter')?.value || 'all';
    const levels = data.per_lesson.filter((item) => selected === 'all' || String(item.chapter_id) === selected);
    list.replaceChildren();
    if (!levels.length) {
      list.appendChild(PG.el('p', 'empty', 'No levels match this chapter.'));
      return;
    }
    const max = Math.max(1, ...levels.map((item) => item.done));
    levels.forEach((item) => {
      const row = PG.el('div', 'bar-item');
      const label = PG.el('div', 'bar-label');
      label.appendChild(PG.el('span', null, item.title));
      label.appendChild(PG.el('span', null, ${number(item.done)} ${item.done === 1 ? 'completion' : 'completions'}));
      const track = PG.el('div', 'bar-track');
      track.setAttribute('role', 'img');
      track.setAttribute('aria-label', ${item.title}: ${item.done} completions);
      const fill = PG.el('div', 'bar-fill');
      fill.style.width = ${(item.done / max) * 100}%;
      track.appendChild(fill);
      row.append(label, track);
      list.appendChild(row);
    });
  }

  function renderActivity() {
    const list = $('recent-activity');
    const filter = $('filter-activity')?.value || 'all';
    const items = data.activity.filter((item) => filter === 'all' || item.type === filter);
    list.replaceChildren();
    if (!items.length) {
      list.appendChild(PG.el('li', 'empty', 'No recent activity for this filter.'));
      return;
    }
    items.forEach((item) => {
      const li = PG.el('li', 'activity-item');
      li.appendChild(document.createTextNode(item.message));
      const time = PG.el('div', 'activity-time', new Date(item.created_at).toLocaleString());
      li.appendChild(time);
      list.appendChild(li);
    });
  }

  function drawWeekly() {
    const canvas = $('growth-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.style.width = '100%';
    const width = canvas.parentElement?.clientWidth || canvas.clientWidth || 600;
    const height = 160;
    const ratio = window.devicePixelRatio || 1;
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    canvas.style.width = '100%';
    canvas.style.height = ${height}px;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.clearRect(0, 0, width, height);
    const pad = { top: 12, right: 12, bottom: 30, left: 12 };
    const chartH = height - pad.top - pad.bottom;
    const max = Math.max(1, ...data.weekly.flatMap((day) => [day.signups, day.completions]));
    ctx.strokeStyle = 'rgba(36,75,72,.14)';
    ctx.lineWidth = 1;
    for (let row = 0; row < 4; row++) {
      const y = pad.top + (chartH / 3) * row;
      ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(width - pad.right, y); ctx.stroke();
    }
    const slot = (width - pad.left - pad.right) / data.weekly.length;
    const barW = Math.min(18, slot * .28);
    data.weekly.forEach((day, index) => {
      const center = pad.left + slot * index + slot / 2;
      const values = [day.signups, day.completions];
      const colors = ['#24865f', '#e9a43b'];
      values.forEach((value, itemIndex) => {
        const barH = (value / max) * chartH;
        ctx.fillStyle = colors[itemIndex];
        ctx.fillRect(center + (itemIndex ? 1 : -barW - 1), pad.top + chartH - barH, barW, Math.max(2, barH));
      });
      ctx.fillStyle = '#55716a';
      ctx.font = '11px Nunito, sans-serif';
      ctx.textAlign = 'center';
      const date = new Date(${day.date}T12:00:00Z);
      ctx.fillText(date.toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' }), center, height - 8);
    });
  }

  function renderAlerts() {
    const list = $('system-alerts');
    const alerts = [];
    if (data.suspended > 0) alerts.push(${number(data.suspended)} gardener account${data.suspended === 1 ? ' is' : 's are'} suspended.);
    if (data.published_lessons === 0) alerts.push('No levels are currently published for learners.');
    if (!alerts.length) alerts.push('All systems are running smoothly. Dashboard data is up to date.');
    list.replaceChildren();
    alerts.forEach((message) => list.appendChild(PG.el('li', 'alert-item', message)));
    setText('alert-count', String(alerts.length));
  }

  function render() {
    renderMetrics();
    renderChapterFilter();
    renderLevels();
    renderActivity();
    drawWeekly();
    renderAlerts();
  }

  async function load() {
    if (loading) return;
    loading = true;
    const refresh = $('btn-refresh');
    const sync = $('btn-sync');
    if (refresh) refresh.disabled = true;
    if (sync) sync.disabled = true;
    setText('server-status', 'Syncing…');
    try {
      const me = await PG.api('/api/me.php');
      if (me.role !== 'admin') {
        location.replace('/adventure.html');
        return;
      }
      data = await PG.api('/api/admin/stats.php');
      render();
      setText('server-status', 'Connected');
      setText('last-sync', new Date().toLocaleTimeString());
    } catch (error) {
      setText('server-status', 'Unavailable');
      PG.toast(error.message, true);
    } finally {
      loading = false;
      if (refresh) refresh.disabled = false;
      if (sync) sync.disabled = false;
    }
  }

  $('filter-chapter')?.addEventListener('change', renderLevels);
  $('filter-activity')?.addEventListener('change', renderActivity);
  $('btn-refresh')?.addEventListener('click', load);
  $('btn-sync')?.addEventListener('click', load);
  $('btn-clear-cache')?.addEventListener('click', () => {
    if ($('filter-chapter')) $('filter-chapter').value = 'all';
    if ($('filter-activity')) $('filter-activity').value = 'all';
    if (data) render(); else load();
  });
  $('btn-logout')?.addEventListener('click', async (event) => {
    event.preventDefault();
    try { await PG.api('/api/logout.php', { method: 'POST' }); } catch (_) { /* Continue to login if the session already expired. */ }
    location.href = '/login.html';
  });
  setText('current-date', new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
  $('growth-canvas')?.setAttribute('aria-label', 'Bar chart of gardener signups and level completions over the last seven days');
  load();
})();
