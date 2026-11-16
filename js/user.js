/* Gardeners page: searchable admin view of accounts, verification, learning progress, and actions. */
(() => {
  'use strict';
  const PG = window.PG;
  if (!PG) return;
  const $ = (id) => document.getElementById(id);
  let users = [];
  let myId = '';
  let loading = false;

  const modalAdd = $('modal-add-user');
  const btnAdd = $('btn-add-user');
  const btnCloseAdd = $('btn-close-add-user');
  const btnCancelAdd = $('btn-cancel-add-user');
  const formAdd = $('form-add-user');

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
    const term = ($('user-search')?.value || '').trim().toLowerCase();
    const role = $('role-filter')?.value || 'all';
    const status = $('status-filter')?.value || 'all';

    const roleMatches = role === 'all' || (role === 'admin' ? user.role === 'admin' : user.role === 'user');
    
    let statusMatches = true;
    if (status === 'active') statusMatches = !user.is_suspended;
    else if (status === 'suspended') statusMatches = !!user.is_suspended;
    else if (status === 'verified') statusMatches = !!user.is_verified;
    else if (status === 'unverified') statusMatches = !user.is_verified;

    return user.username.toLowerCase().includes(term) && roleMatches && statusMatches;
  }

  async function handleAction(user, action) {
    const actionNames = {
      verify: 'Verify ' + user.username,
      unverify: 'Remove verification from ' + user.username,
      promote: 'Promote ' + user.username + ' to Admin',
      demote: 'Demote ' + user.username + ' to Gardener',
      suspend: 'Suspend account ' + user.username,
      unsuspend: 'Reactivate account ' + user.username,
      reset: 'Reset all progress for ' + user.username
    };

    if (action === 'reset' && !confirm('Are you sure you want to reset all progress for ' + user.username + '? This cannot be undone.')) {
      return;
    }

    try {
      await PG.api('/api/admin/users.php', {
        body: { id: user.id, action }
      });
      PG.toast('Action completed: ' + (actionNames[action] || action));
      load();
    } catch (e) {
      PG.toast(e.message, true);
    }
  }

  function showDetails(user, detailRow, button) {
    const expanded = detailRow.classList.toggle('is-hidden') === false;
    button.textContent = expanded ? '▲ Hide' : '▼ Actions & Details';
    button.setAttribute('aria-expanded', String(expanded));
    if (!expanded) return;

    const cell = detailRow.firstElementChild;
    cell.innerHTML = `
      <div style="padding: 12px 14px; background: #fffcf0; border: 2px solid #dfd2ad; border-radius: 6px; margin: 6px 0;">
        <div style="margin-bottom: 10px; font-size: 0.92rem; color: #355745; line-height: 1.5;">
          <strong>${user.username}</strong> · ${user.completed_levels || 0} of ${user.total_levels || 15} levels done · 
          <strong>${user.xp} XP</strong> · <strong>${user.seeds} Seeds</strong> · 
          🔥 ${user.streak}-day streak · Joined ${new Date(user.created_at).toLocaleDateString()} · 
          Status: <strong>${user.is_suspended ? 'Suspended' : 'Active'}</strong> · 
          Verification: <strong>${user.is_verified ? 'Verified ✓' : 'Unverified'}</strong>
        </div>
        <div class="row" style="gap: 8px; flex-wrap: wrap;">
          ${user.is_verified ? 
            `<button class="px-btn px-btn--ghost px-btn--small btn-act-unverify" type="button">✕ Unverify</button>` : 
            `<button class="px-btn px-btn--sun px-btn--small btn-act-verify" type="button">✓ Verify Account</button>`}
          
          ${user.role === 'admin' ? 
            (user.id !== myId ? `<button class="px-btn px-btn--ghost px-btn--small btn-act-demote" type="button">Demote to Gardener</button>` : '') : 
            `<button class="px-btn px-btn--primary px-btn--small btn-act-promote" type="button">👑 Promote to Admin</button>`}

          ${user.id !== myId ? (user.is_suspended ? 
            `<button class="px-btn px-btn--ghost px-btn--small btn-act-unsuspend" type="button">🔓 Unsuspend</button>` : 
            `<button class="px-btn px-btn--ghost px-btn--small btn-act-suspend" type="button" style="color:var(--danger);">🔒 Suspend</button>`) : ''}

          ${user.id !== myId ? `<button class="px-btn px-btn--ghost px-btn--small btn-act-reset" type="button">↺ Reset Progress</button>` : ''}
        </div>
      </div>
    `;

    cell.querySelector('.btn-act-verify')?.addEventListener('click', () => handleAction(user, 'verify'));
    cell.querySelector('.btn-act-unverify')?.addEventListener('click', () => handleAction(user, 'unverify'));
    cell.querySelector('.btn-act-promote')?.addEventListener('click', () => handleAction(user, 'promote'));
    cell.querySelector('.btn-act-demote')?.addEventListener('click', () => handleAction(user, 'demote'));
    cell.querySelector('.btn-act-suspend')?.addEventListener('click', () => handleAction(user, 'suspend'));
    cell.querySelector('.btn-act-unsuspend')?.addEventListener('click', () => handleAction(user, 'unsuspend'));
    cell.querySelector('.btn-act-reset')?.addEventListener('click', () => handleAction(user, 'reset'));
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

        // Username
        const name = PG.el('td');
        const nameText = PG.el('strong', null, user.username + (user.id === myId ? ' (you)' : ''));
        name.appendChild(nameText);
        row.appendChild(name);

        // Role
        const roleCell = PG.el('td');
        roleCell.appendChild(PG.el('span', 'badge ' + (user.role === 'admin' ? 'badge--admin' : 'badge--gardener'), user.role === 'admin' ? '👑 Admin' : '🌱 Gardener'));
        row.appendChild(roleCell);

        // Verification
        const verCell = PG.el('td');
        if (user.is_verified) {
          verCell.innerHTML = '<span class="badge-verified" style="font-size:0.75rem; padding:2px 8px; border-radius:4px;">✓ Verified</span>';
        } else {
          verCell.innerHTML = '<span class="badge-unverified" style="font-size:0.75rem; padding:2px 8px; border-radius:4px;">Unverified</span>';
        }
        row.appendChild(verCell);

        // Progress
        const progressCell = PG.el('td');
        const progress = PG.el('div', 'progress-cell');
        const track = PG.el('div', 'progress-bar-inline');
        const fill = PG.el('div', 'progress-fill-inline');
        fill.style.width = `${user.progress_percent || 0}%`;
        track.appendChild(fill);
        progress.appendChild(track);
        progress.appendChild(PG.el('span', 'progress-pct', `${user.completed_levels || 0}/${user.total_levels || 15} (${user.progress_percent || 0}%)`));
        progressCell.appendChild(progress);
        row.appendChild(progressCell);

        // Status
        const statusCell = PG.el('td');
        const status = PG.el('span', 'status-cell ' + (user.is_suspended ? 'status--inactive' : 'status--active'));
        status.appendChild(PG.el('span', 'status-dot'));
        status.appendChild(document.createTextNode(user.is_suspended ? 'Suspended' : 'Active'));
        statusCell.appendChild(status);
        row.appendChild(statusCell);

        // Actions
        const actions = PG.el('td');
        const details = PG.el('button', 'px-btn px-btn--ghost px-btn--small', '▼ Actions & Details');
        details.type = 'button';
        details.setAttribute('aria-expanded', 'false');
        details.setAttribute('aria-label', `Actions for ${user.username}`);
        actions.appendChild(details);
        row.appendChild(actions);

        // Detail row
        const detailRow = document.createElement('tr');
        detailRow.className = 'user-detail-row is-hidden';
        const detailCell = document.createElement('td');
        detailCell.colSpan = 6;
        detailRow.appendChild(detailCell);
        details.addEventListener('click', () => showDetails(user, detailRow, details));
        body.append(row, detailRow);
      });
    }

    if ($('count-shown')) $('count-shown').textContent = String(shown.length);
    if ($('count-total')) $('count-total').textContent = String(users.length);
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
      users = result.users || [];
      myId = result.me;
      render();
    } catch (error) {
      if ($('user-rows')) $('user-rows').replaceChildren(makeEmpty('Could not load gardeners: ' + error.message));
      PG.toast(error.message, true);
    } finally {
      loading = false;
      if (refresh) refresh.disabled = false;
    }
  }

  // Add User Modal Handlers
  btnAdd?.addEventListener('click', () => {
    if (modalAdd) {
      modalAdd.classList.remove('is-hidden');
      $('new-username')?.focus();
    }
  });

  const closeAddModal = () => { if (modalAdd) modalAdd.classList.add('is-hidden'); };
  btnCloseAdd?.addEventListener('click', closeAddModal);
  btnCancelAdd?.addEventListener('click', closeAddModal);

  formAdd?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btnSubmit = $('btn-submit-add-user');
    if (btnSubmit) btnSubmit.disabled = true;
    try {
      const payload = {
        action: 'create',
        username: $('new-username').value.trim(),
        email: $('new-email').value.trim(),
        password: $('new-password').value,
        role: $('new-role').value,
        seeds: parseInt($('new-seeds').value, 10) || 15,
        xp: 0,
        is_verified: $('new-verified').checked
      };
      await PG.api('/api/admin/users.php', { body: payload });
      PG.toast('Gardener ' + payload.username + ' created successfully! 🌱');
      formAdd.reset();
      closeAddModal();
      load();
    } catch (err) {
      PG.toast(err.message, true);
    } finally {
      if (btnSubmit) btnSubmit.disabled = false;
    }
  });

  ['user-search', 'role-filter', 'status-filter'].forEach((id) => $(id)?.addEventListener('input', render));
  $('btn-refresh-users')?.addEventListener('click', load);
  $('btn-logout')?.addEventListener('click', async (event) => {
    event.preventDefault();
    try { await PG.api('/api/logout.php', { method: 'POST' }); } catch (_) {}
    location.href = '/login.html';
  });

  load();
})();
