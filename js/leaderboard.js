/* Leaderboard page: displays global user rankings, podium, filters, and current position. */
(function () {
  'use strict';
  const PG = window.PG;
  if (!PG) return;

  const rowsEl = document.getElementById('leaderboard-rows');
  const podiumEl = document.getElementById('podium-cards');
  const searchInput = document.getElementById('rank-search');
  const myRankPosEl = document.getElementById('my-rank-pos');
  const sortTabs = document.querySelectorAll('.sort-tab');

  let currentSort = 'xp';
  let searchTerm = '';
  let fullList = [];
  let myRank = null;

  async function loadData() {
    try {
      const data = await PG.api('/api/leaderboard.php?sort=' + currentSort);
      fullList = data.leaderboard || [];
      myRank = data.my_rank;

      if (myRankPosEl) {
        myRankPosEl.textContent = myRank ? '#' + myRank : '#--';
      }

      renderPodium();
      renderTable();
    } catch (e) {
      if (rowsEl) {
        rowsEl.innerHTML = '<tr><td colspan="7" class="text-center" style="padding:24px; color:var(--danger);">Could not load rankings. ' + e.message + '</td></tr>';
      }
    }
  }

  function renderPodium() {
    if (!podiumEl) return;
    podiumEl.innerHTML = '';
    const top3 = fullList.slice(0, 3);
    if (!top3.length) return;

    // Arrange order: [2nd, 1st, 3rd] for classic podium display
    const podiumOrder = [];
    if (top3[1]) podiumOrder.push({ item: top3[1], place: 2, icon: '🥈', cls: 'podium-2', rankLabel: '2ND PLACE' });
    if (top3[0]) podiumOrder.push({ item: top3[0], place: 1, icon: '👑', cls: 'podium-1', rankLabel: '1ST PLACE' });
    if (top3[2]) podiumOrder.push({ item: top3[2], place: 3, icon: '🥉', cls: 'podium-3', rankLabel: '3RD PLACE' });

    podiumOrder.forEach(({ item, place, icon, cls, rankLabel }) => {
      const card = PG.el('div', 'podium-card ' + cls);
      card.innerHTML = `
        <div class="podium-badge">${icon}</div>
        <div class="podium-rank">${rankLabel}</div>
        <h3 class="podium-name">${escapeHtml(item.username)} ${item.is_verified ? '<span class="badge-verified" title="Verified Gardener" style="font-size:0.65rem; padding:1px 5px; border-radius:3px;">✓</span>' : ''}</h3>
        <p class="podium-title">${item.rank_badge} ${item.rank_title}</p>
        <div class="podium-xp">⭐ ${item.xp} XP</div>
        <p class="muted" style="margin:4px 0 0; font-size:0.8rem;">${item.levels_done} levels · 🔥 ${item.streak}d streak</p>
      `;
      podiumEl.appendChild(card);
    });
  }

  function renderTable() {
    if (!rowsEl) return;
    rowsEl.innerHTML = '';

    const term = searchTerm.trim().toLowerCase();
    const filtered = fullList.filter(u => u.username.toLowerCase().includes(term));

    if (!filtered.length) {
      rowsEl.innerHTML = '<tr><td colspan="7" class="text-center muted" style="padding: 24px;">No gardeners found matching "' + escapeHtml(searchTerm) + '"</td></tr>';
      return;
    }

    filtered.forEach((user) => {
      const tr = PG.el('tr', user.is_me ? 'rank-is-me' : '');

      // Rank position
      const pos = user.rank_position;
      let badgeCls = '';
      let badgeTxt = '#' + pos;
      if (pos === 1) { badgeCls = 'gold'; badgeTxt = '🥇 #1'; }
      else if (pos === 2) { badgeCls = 'silver'; badgeTxt = '🥈 #2'; }
      else if (pos === 3) { badgeCls = 'bronze'; badgeTxt = '🥉 #3'; }

      const tdRank = PG.el('td');
      tdRank.innerHTML = `<span class="rank-badge-num ${badgeCls}">${badgeTxt}</span>`;
      tr.appendChild(tdRank);

      // Gardener
      const tdUser = PG.el('td');
      let userHtml = `
        <div class="rank-gardener-cell">
          <strong>${escapeHtml(user.username)}</strong>
          ${user.is_me ? '<span class="you-pill">YOU</span>' : ''}
          ${user.is_verified ? '<span class="badge-verified" title="Verified Account" style="font-size:0.7rem; padding:2px 6px; border-radius:3px;">✓ Verified</span>' : ''}
        </div>
      `;
      tdUser.innerHTML = userHtml;
      tr.appendChild(tdUser);

      // Rank Tier
      const tdTier = PG.el('td');
      tdTier.innerHTML = `<span>${user.rank_badge} ${escapeHtml(user.rank_title)}</span>`;
      tr.appendChild(tdTier);

      // Levels done
      const tdLevels = PG.el('td', 'text-center');
      tdLevels.textContent = user.levels_done;
      tr.appendChild(tdLevels);

      // Streak
      const tdStreak = PG.el('td', 'text-center');
      tdStreak.innerHTML = `<span>🔥 ${user.streak}d</span>`;
      tr.appendChild(tdStreak);

      // Seeds
      const tdSeeds = PG.el('td', 'text-right');
      tdSeeds.innerHTML = `<span>🌱 ${user.seeds}</span>`;
      tr.appendChild(tdSeeds);

      // XP
      const tdXp = PG.el('td', 'text-right');
      tdXp.innerHTML = `<strong>⭐ ${user.xp}</strong>`;
      tr.appendChild(tdXp);

      rowsEl.appendChild(tr);
    });
  }

  function escapeHtml(s) {
    const d = document.createElement('div');
    d.textContent = s || '';
    return d.innerHTML;
  }

  // Setup Event Listeners
  sortTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      sortTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentSort = tab.dataset.sort;
      loadData();
    });
  });

  searchInput?.addEventListener('input', (e) => {
    searchTerm = e.target.value;
    renderTable();
  });

  PG.ready.then((me) => {
    if (!me) return;
    loadData();
  });
})();
