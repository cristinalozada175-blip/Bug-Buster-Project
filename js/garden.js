/* Dynamic Garden: 12 plots, interactive growth stages, watering, harvesting, seasons and seed shop. */
(function () {
  'use strict';
  const PG = window.PG;
  const plotsEl = document.getElementById('plots');
  if (!plotsEl) return;

  const shopEl = document.getElementById('shop');
  const msg = document.getElementById('garden-msg');
  const landscape = document.getElementById('garden-landscape');
  const seasonNameEl = document.getElementById('season-name');
  const seasonWeatherEl = document.getElementById('season-weather');
  const seasonIconEl = document.getElementById('season-icon');
  const healthPctEl = document.getElementById('health-pct');
  const healthBarFill = document.getElementById('health-bar-fill');
  const statPlotsUsed = document.getElementById('stat-plots-used');
  const statWateredCount = document.getElementById('stat-watered-count');
  const statHarvestCount = document.getElementById('stat-harvest-count');

  // Modal elements
  const plotModal = document.getElementById('plot-modal');
  const btnClosePlotModal = document.getElementById('btn-close-plot-modal');
  const modalPlotSprite = document.getElementById('modal-plot-sprite');
  const modalPlotName = document.getElementById('modal-plot-name');
  const modalPlotStage = document.getElementById('modal-plot-stage');
  const modalPlotStatus = document.getElementById('modal-plot-status');
  const modalPlotDesc = document.getElementById('modal-plot-desc');
  const btnPlotWater = document.getElementById('btn-plot-water');
  const btnPlotHarvest = document.getElementById('btn-plot-harvest');
  const btnPlotDig = document.getElementById('btn-plot-dig');

  let items = [];
  let plots = {}; // slot -> { item_id, stage, watered, planted_at }
  let seeds = 0;
  let legacyGrowthMode = false;
  let selected = null;
  let activeModalSlot = null;
  let isNight = false;

  const SEASONS = {
    spring: { name: 'Spring', weather: 'Gentle spring showers & fresh blossoms', icon: '🌦️', class: 'season-spring', bonus: '+3 harvest seeds' },
    summer: { name: 'Summer', weather: 'Warm sunny breeze and vibrant rays', icon: '☀️', class: 'season-summer', bonus: '+3 harvest XP' },
    autumn: { name: 'Autumn', weather: 'Crisp golden breeze with falling leaves', icon: '🍂', class: 'season-autumn', bonus: '+5 harvest seeds' },
    winter: { name: 'Winter', weather: 'Cool frosted calm and light flurries', icon: '❄️', class: 'season-winter', bonus: '+5 harvest XP' }
  };
  let currentSeasonKey = 'summer';

  const byId = (id) => items.find((i) => i.id === id);
  const stageName = (growthStage) => ['sprout', 'growing', 'blooming'][Math.max(0, Math.min(2, growthStage))];
  function getGrowthStage(plot) {
    if (Number.isInteger(plot.growth_stage)) return Math.max(0, Math.min(2, plot.growth_stage));
    if (plot.stage === 'growing') return 1;
    if (plot.stage === 'blooming') return 2;
    if (plot.watered) return 1;
    return 0;
  }

  function setSeason(seasonKey) {
    currentSeasonKey = seasonKey;
    const s = SEASONS[seasonKey];
    if (!s) return;

    landscape.classList.remove('season-spring', 'season-summer', 'season-autumn', 'season-winter');
    landscape.classList.add(s.class);

    if (seasonNameEl) seasonNameEl.textContent = s.name;
    if (seasonWeatherEl) seasonWeatherEl.textContent = s.weather + ' · ' + s.bonus;
    if (seasonIconEl) seasonIconEl.textContent = s.icon;

    document.querySelectorAll('.season-btn').forEach(b => {
      if (b.id === 'btn-season-' + seasonKey) b.classList.add('active');
      else if (b.id !== 'btn-toggle-night') b.classList.remove('active');
    });
  }

  function toggleNightMode() {
    isNight = !isNight;
    const btn = document.getElementById('btn-toggle-night');
    if (isNight) {
      landscape.classList.add('garden-night');
      if (btn) { btn.classList.add('active'); btn.textContent = '☀️ Day Mode'; }
    } else {
      landscape.classList.remove('garden-night');
      if (btn) { btn.classList.remove('active'); btn.textContent = '🌙 Night Mode'; }
    }
  }

  function updateGardenHealth() {
    let plantedCount = 0;
    let bloomingCount = 0;
    let wateredCount = 0;

    for (let s = 0; s < 12; s++) {
      const p = plots[s];
      if (p) {
        plantedCount++;
        if (p.stage === 'blooming') bloomingCount++;
        if (p.watered) wateredCount++;
      }
    }

    const bloomPct = Math.round((bloomingCount / 12) * 100);
    if (healthPctEl) healthPctEl.textContent = bloomPct + '% Blooming';
    if (healthBarFill) healthBarFill.style.width = bloomPct + '%';

    if (statPlotsUsed) statPlotsUsed.textContent = plantedCount + ' / 12 plots planted';
    if (statWateredCount) statWateredCount.textContent = '💧 ' + wateredCount + ' watered';
    if (statHarvestCount) statHarvestCount.textContent = '🌾 ' + bloomingCount + ' ready to harvest';
  }

  function renderPlots() {
    plotsEl.textContent = '';
    for (let s = 0; s < 12; s++) {
      const plotData = plots[s];
      const filled = plotData ? byId(plotData.item_id) : null;

      if (filled) {
        const growthStage = getGrowthStage(plotData);
        const stage = stageName(growthStage);
        const d = PG.el('div', 'plot plot-stage--' + stage);
        d.setAttribute('role', 'button');
        d.setAttribute('tabindex', '0');
        d.setAttribute('aria-label', 'Plot ' + (s + 1) + ': ' + filled.name + ' (' + stage + ')');

        const wrapper = PG.el('div', 'plot-plant-wrapper');
        // If sprout stage, show sprout sprite or small sprite
        if (stage === 'sprout') {
          wrapper.appendChild(PG.spriteEl('sprout'));
        } else {
          wrapper.appendChild(PG.spriteEl(filled.sprite));
        }
        d.appendChild(wrapper);

        if (growthStage > 0 && growthStage < 2) {
          const wBadge = PG.el('span', 'plot-water-badge', '💧 ' + growthStage + '/2');
          wBadge.title = 'Waterings until bloom';
          d.appendChild(wBadge);
        }

        // Ready to harvest badge if blooming
        if (stage === 'blooming') {
          const hBadge = PG.el('span', 'plot-harvest-badge', 'HARVEST');
          d.appendChild(hBadge);
        }

        d.addEventListener('click', () => openPlotModal(s));
        d.addEventListener('keydown', (e) => { if (e.key === 'Enter') openPlotModal(s); });
        plotsEl.appendChild(d);
      } else {
        const b = PG.el('button', 'plot is-empty');
        b.type = 'button';
        b.setAttribute('aria-label', 'Plot ' + (s + 1) + ', empty. Tap to plant.');
        b.appendChild(PG.el('span', 'plot-plus', '+'));
        b.addEventListener('click', () => plant(s));
        plotsEl.appendChild(b);
      }
    }
    updateGardenHealth();
  }

  function renderShop() {
    shopEl.textContent = '';
    items.forEach((it) => {
      const poor = seeds < it.cost_seeds;
      const card = PG.el('div', 'px-card shop-item' + (selected === it.id ? ' is-selected' : '') + (poor ? ' is-poor' : ''));
      card.appendChild(PG.spriteEl(it.sprite));
      const text = PG.el('div');
      text.appendChild(PG.el('h3', null, it.name));
      text.appendChild(PG.el('p', 'muted', it.cost_seeds + ' seeds · ' + it.kind));
      card.appendChild(text);
      const b = PG.el('button', 'px-btn px-btn--small ' + (selected === it.id ? 'px-btn--sun' : 'px-btn--ghost'), selected === it.id ? 'Chosen' : 'Choose');
      b.type = 'button';
      b.setAttribute('aria-pressed', selected === it.id ? 'true' : 'false');
      b.setAttribute('aria-label', (selected === it.id ? 'Chosen: ' : 'Choose ') + it.name);
      b.disabled = poor;
      b.addEventListener('click', () => {
        selected = selected === it.id ? null : it.id;
        hint();
        renderShop();
      });
      card.appendChild(b);
      shopEl.appendChild(card);
    });
  }

  function hint() {
    const it = selected ? byId(selected) : null;
    const compatibilityHint = legacyGrowthMode
      ? ' Compatibility mode is active: watering progress is not saved, so water once to bloom. Run sql/upgrade_garden_growth.sql to enable saved two-stage growth.'
      : '';
    msg.textContent = it ?
      'Selected ' + it.name + '! Now pick an empty plot to plant it.' + compatibilityHint :
      (legacyGrowthMode
        ? 'Compatibility mode is active: watering progress is not saved, so water once to bloom. Run sql/upgrade_garden_growth.sql to enable saved two-stage growth.'
        : 'Choose an item to plant, then water twice to grow it before harvesting. Seasons add harvest bonuses.');
  }

  async function plant(slot) {
    if (!selected) {
      PG.toast('Choose an item from the shop first, then tap an empty plot.', true);
      return;
    }
    const it = byId(selected);
    try {
      const r = await PG.api('/api/garden.php', {
        body: {
          item_id: it.id,
          slot,
          action: 'plant'
        }
      });
      if (r.growth_mode) legacyGrowthMode = r.growth_mode === 'legacy';
      const growthStage = Number.isInteger(r.growth_stage) ? r.growth_stage : 0;
      plots[slot] = {
        item_id: it.id,
        stage: r.stage || stageName(growthStage),
        growth_stage: growthStage,
        watered: growthStage > 0,
        planted_at: Date.now()
      };
      seeds = r.seeds;
      PG.setStats({ seeds });
      if (seeds < it.cost_seeds) selected = null;
      renderPlots();
      renderShop();
      hint();
      PG.toast('Planted ' + it.name + ' in Plot ' + (slot + 1) + '! 🌱');
    } catch (e) {
      PG.toast(e.message, true);
    }
  }

  function openPlotModal(slot) {
    const plotData = plots[slot];
    if (!plotData) return;
    activeModalSlot = slot;
    const item = byId(plotData.item_id);
    if (!item) return;

    modalPlotName.textContent = item.name;
    modalPlotSprite.innerHTML = '';
    modalPlotSprite.appendChild(PG.spriteEl(item.sprite));

    const growthStage = getGrowthStage(plotData);
    const stage = stageName(growthStage);
    const stageNames = { sprout: '🌱 Sprout (0/2 waterings)', growing: '🌿 Growing (1/2 waterings)', blooming: '🌸 Full Bloom (2/2 waterings)' };
    modalPlotStage.textContent = stageNames[stage];
    modalPlotStatus.textContent = growthStage < 2 ? '💧 Water this plant to help it grow' : '🌻 Ready to harvest';
    modalPlotStatus.style.background = growthStage < 2 ? '#fcf0cd' : '#d8f1d8';
    btnPlotWater.disabled = growthStage >= 2;
    btnPlotWater.textContent = growthStage >= 2 ? '✓ Fully Grown' : '💧 Water Plant';

    if (growthStage >= 2) {
      btnPlotHarvest.disabled = false;
      modalPlotDesc.textContent = 'This ' + item.name + ' has fully bloomed! Harvest it for seeds and XP, plus the ' + SEASONS[currentSeasonKey].bonus + ' seasonal bonus.';
    } else {
      btnPlotHarvest.disabled = true;
      modalPlotDesc.textContent = 'This plant is still growing. Water it to accelerate its bloom!';
    }

    plotModal.classList.remove('is-hidden');
  }

  function closePlotModal() {
    plotModal.classList.add('is-hidden');
    activeModalSlot = null;
  }

  async function waterCurrentPlot() {
    if (activeModalSlot === null) return;
    const slot = activeModalSlot;
    try {
      const result = await PG.api('/api/garden.php', {
        body: { action: 'water', slot }
      });
      if (result.growth_mode) legacyGrowthMode = result.growth_mode === 'legacy';
      if (plots[slot]) {
        plots[slot].growth_stage = result.growth_stage;
        plots[slot].stage = result.stage;
        plots[slot].watered = result.growth_stage > 0;
      }
      closePlotModal();
      renderPlots();
      PG.toast(result.stage === 'blooming'
        ? '🌸 Plot ' + (slot + 1) + ' is in full bloom! Harvest when ready.'
        : '💧 Watered plot ' + (slot + 1) + '! It is now growing.');
    } catch (e) {
      PG.toast(e.message, true);
    }
  }

  async function harvestCurrentPlot() {
    if (activeModalSlot === null) return;
    const slot = activeModalSlot;
    try {
      const res = await PG.api('/api/garden.php', {
        body: { action: 'harvest', slot, season: currentSeasonKey }
      });
      if (res.growth_mode) legacyGrowthMode = res.growth_mode === 'legacy';
      delete plots[slot];
      if (res.seeds !== undefined) {
        seeds = res.seeds;
        PG.setStats({ seeds: res.seeds, xp: res.xp });
      }
      closePlotModal();
      renderPlots();
      renderShop();
      PG.toast('🌾 Harvested! +' + res.reward_seeds + ' seeds and +' + res.reward_xp + ' XP.');
    } catch (e) {
      PG.toast(e.message, true);
    }
  }

  async function digCurrentPlot() {
    if (activeModalSlot === null) return;
    const slot = activeModalSlot;
    if (!confirm('Dig up this plot? The planted item will be cleared.')) return;
    try {
      await PG.api('/api/garden.php', {
        body: { action: 'dig', slot }
      });
      delete plots[slot];
      closePlotModal();
      renderPlots();
      PG.toast('Plot cleared.');
    } catch (e) {
      PG.toast(e.message, true);
    }
  }

  // Setup Event Listeners
  document.getElementById('btn-season-spring')?.addEventListener('click', () => setSeason('spring'));
  document.getElementById('btn-season-summer')?.addEventListener('click', () => setSeason('summer'));
  document.getElementById('btn-season-autumn')?.addEventListener('click', () => setSeason('autumn'));
  document.getElementById('btn-season-winter')?.addEventListener('click', () => setSeason('winter'));
  document.getElementById('btn-toggle-night')?.addEventListener('click', toggleNightMode);

  btnClosePlotModal?.addEventListener('click', closePlotModal);
  btnPlotWater?.addEventListener('click', waterCurrentPlot);
  btnPlotHarvest?.addEventListener('click', harvestCurrentPlot);
  btnPlotDig?.addEventListener('click', digCurrentPlot);

  PG.ready.then((me) => {
    if (!me) return;
    PG.api('/api/garden.php').then((d) => {
      items = d.items || [];
      seeds = d.seeds || 0;
      legacyGrowthMode = d.growth_mode === 'legacy';
      (d.plots || []).forEach((p) => {
        plots[p.slot] = {
          item_id: p.item_id,
          growth_stage: getGrowthStage(p),
          stage: stageName(getGrowthStage(p)),
          watered: getGrowthStage(p) > 0,
          planted_at: p.planted_at || Date.now()
        };
      });
      setSeason('summer');
      renderPlots();
      renderShop();
      hint();
    }).catch((e) => PG.toast(e.message, true));
  });
})();
