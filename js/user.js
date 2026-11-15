/* Gardeners page: searchable admin view of accounts and learning progress. */
(() => {
  'use strict';
  const PG = window.PG;
  if (!PG) return;
  const $ = (id) => document.getElementById(id);
  let users = [];
  let myId = '';
  let loading = false;

  function makeEmpty(message) {
    const row = document.createElement('tr');
    row.className = 'empty-state';
    const cell = document.createElement('td');
    cell.colSpan = 6;
    cell.className = 'empty-cell';
    const box = PG.el('div', 'empty-content');
    box.appendChild(PG.el('span', 'empty-icon', '🌱'));
    box.appendChild(PG.el('h3', null, message));
    box.appendChild(PG.el('p', null, 'Try changing your search or filters.'));
    cell.appendChild(box);
    row.appendChild(cell);
    return row;
  }

  function matches(user) {
    const term = $('user-search').value.trim().toLowerCase();
    const role = $('role-filter').value;
    const status = $('status-filter').value;
    const roleMatches = role === 'all' || (role === 'admin' ? user.role === 'admin' : user.role === 'user');
    const statusMatches = status === 'all' || (status === 'suspended' ? user.is_suspended : !user.is_suspended);
    return user.username.toLowerCase().includes(term) && roleMatches && statusMatches;
  }

  function showDetails(user, detailRow, button) {
    const expanded = detailRow.classList.toggle('is-hidden') === false;
    button.textContent = expanded ? 'Hide details' : 'View details';
    button.setAttribute('aria-expanded', String(expanded));
    if (!expanded) return;
    const cell = detailRow.firstElementChild;
    cell.textContent = ${user.username} · ${user.completed_levels} of ${user.total_levels} published levels · ${user.xp} XP · ${user.seeds} seeds · ${user.streak}-day streak · Joined ${new Date(user.created_at).toLocaleDateString()};
  }

  function render() {
    const body = $('user-rows');
    const shown = users.filter(matches);
    body.replaceChildren();
    if (!shown.length) {
      body.appendChild(makeEmpty(users.length ? 'No gardeners match these filters' : 'No gardeners yet'));
    } else {
      shown.forEach((user) => {
        const row = document.createElement('tr');
        const name = PG.el('td');
        const nameText = PG.el('strong', null, user.username + (user.id === myId ? ' (you)' : ''));
        name.appendChild(nameText);
        row.appendChild(name);

        const roleCell = PG.el('td');
        roleCell.appendChild(PG.el('span', 'badge ' + (user.role === 'admin' ? 'badge--admin' : 'badge--gardener'), user.role === 'admin' ? 'Admin' : 'Gardener'));
        row.appendChild(roleCell);

        const progressCell = PG.el('td');
        const progress = PG.el('div', 'progress-cell');
        const track = PG.el('div', 'progress-bar-inline');
        const fill = PG.el('div', 'progress-fill-inline');
        fill.style.width = ${user.progress_percent}%;
        track.appendChild(fill);
        progress.appendChild(track);
        progress.appendChild(PG.el('span', 'progress-pct', ${user.completed_levels}/${user.total_levels} (${user.progress_percent}%)));
        progressCell.appendChild(progress);
        row.appendChild(progressCell);

        const statusCell = PG.el('td');
        const status = PG.el('span', 'status-cell ' + (user.is_suspended ? 'status--inactive' : 'status--active'));
        status.appendChild(PG.el('span', 'status-dot'));
        status.appendChild(document.createTextNode(user.is_suspended ? 'Suspended' : 'Active'));
        statusCell.appendChild(status);
        row.appendChild(statusCell);

        row.appendChild(PG.el('td', null, new Date(user.created_at).toLocaleDateString()));
        const actions = PG.el('td');
        const details = PG.el('button', 'px-btn px-btn--ghost px-btn--small', 'View details');
        details.type = 'button';
        details.setAttribute('aria-expanded', 'false');
        details.setAttribute('aria-label', View details for ${user.username});
        actions.appendChild(details);
        row.appendChild(actions);

        const detailRow = document.createElement('tr');
        detailRow.className = 'user-detail-row is-hidden';
        const detailCell = document.createElement('td');
        detailCell.colSpan = 6;
        detailRow.appendChild(detailCell);
        details.addEventListener('click', () => showDetails(user, detailRow, details));
        body.append(row, detailRow);
      });
    }
    $('count-shown').textContent = String(shown.length);
    $('count-total').textContent = String(users.length);
  }

  async function load() {
    if (loading) return;
    loading = true;
    const refresh = $('btn-refresh-users');
    if (refresh) refresh.disabled = true;
    try {
      const me = await PG.api('/api/me.php');
      if (me.role !== 'admin') {
        location.replace('/adventure.html');
        return;
      }
      const result = await PG.api('/api/admin/users.php');
      users = result.users;
      myId = result.me;
      render();
    } catch (error) {
      $('user-rows').replaceChildren(makeEmpty('Could not load gardeners'));
      PG.toast(error.message, true);
    } finally {
      loading = false;
      if (refresh) refresh.disabled = false;
    }
  }

  ['user-search', 'role-filter', 'status-filter'].forEach((id) => $(id).addEventListener('input', render));
  $('btn-refresh-users')?.addEventListener('click', load);
  $('btn-logout')?.addEventListener('click', async (event) => {
    event.preventDefault();
    try { await PG.api('/api/logout.php', { method: 'POST' }); } catch (_) { /* Continue to login if the session already expired. */ }
    location.href = '/login.html';
  });
  $('current-date').textContent = new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  load();
})();