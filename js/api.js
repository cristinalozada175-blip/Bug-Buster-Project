/* Shared helpers: API wrapper, pixel sprites, DOM, mock engine and toast helpers. */
(function () {
  'use strict';
  const PG = (window.PG = window.PG || {});

  /* 8x8 pixel sprites. Letters map to .c-* classes in pixel.css; "." is empty. */
  const SPRITES = {
    sunflower: ['..yyyy..', '.yyssyy.', '.yyssyy.', '..yyyy..', '...gg...', '.g.gg.g.', '..gggg..', '...gg...'],
    tulip:     ['..r..r..', '..rrrr..', '..rrrr..', '...rr...', '...gg...', '.g.gg...', '..gggg..', '...gg...'],
    mushroom:  ['..rrrr..', '.rwrrwr.', 'rrrrrrrr', 'rwrrrrwr', '..wwww..', '..wwww..', '..wwww..', '........'],
    cactus:    ['...ff...', '...ff...', '.f.ff.f.', '.f.ff.f.', '.ffffff.', '...ff...', '...ff...', '...ff...'],
    can:       ['......bb', '.bbbb.bb', 'bbbbbbb.', 'bbbbbb..', 'bbbbbb..', 'bbbbbb..', '.bbbbb..', '........'],
    fence:     ['s..s..s.', 'sssssss.', 's..s..s.', 's..s..s.', 'sssssss.', 's..s..s.', 's..s..s.', '........'],
    pond:      ['........', '..bbbb..', '.bbwbbb.', 'bbbbbbbb', 'bbbbbwbb', '.bbbbbb.', '..bbbb..', '........'],
    lantern:   ['...yy...', '..tttt..', '..tyyt..', '..tyyt..', '..tttt..', '...ss...', '...ss...', '..ssss..'],
    seed:      ['........', '........', '...ss...', '..ssss..', '..ssss..', '...ss...', '........', '........'],
    star:      ['...yy...', '...yy...', 'yyyyyyyy', '.yyyyyy.', '..yyyy..', '..yyyy..', '.yy..yy.', '.y....y.'],
    leaf:      ['......gg', '....gggg', '...ggfgg', '..ggfgg.', '.ggfgg..', 'gfgg....', 'fg......', 'f.......'],
    flame:     ['...r....', '...rr...', '..rrry..', '.rrryyr.', '.rryyyr.', '.rryyyr.', '..rrrr..', '........'],
    trophy:    ['yyyyyyyy', 'y.yyyy.y', 'y.yyyy.y', '.yyyyyy.', '..yyyy..', '...yy...', '..yyyy..', '.yyyyyy.'],
    sprout:    ['...gg...', '..gggg..', '.g.gg.g.', '...gg...', '...gg...', '...gg...', '..ssss..', '.ssssss.'],
    droplet:   ['...bb...', '..bbbb..', '.bbbbbb.', 'bbbbbbbb', 'bbbbbbbb', '.bbbbbb.', '..bbbb..', '...bb...'],
    sparkle:   ['...yy...', '..yyyy..', '.yyyyyy.', 'yyyyyyyy', '.yyyyyy.', '..yyyy..', '...yy...', '........'],
    check:     ['.......g', '......gg', '.....gg.', 'g...gg..', 'gg.gg...', '.ggg....', '..g.....', '........'],
    lock:      ['..wwww..', '.w....w.', '.w....w.', '.ssssss.', '.s.ss.s.', '.ssssss.', '.ssssss.', '........'],
    medal:     ['.yyyyyy.', 'yyyyyyyy', 'y.yyyy.y', '.yyyyyy.', '...rr...', '..r..r..', '.r....r.', '........'],
  };

  const TURTLE = [
    '<rect class="c-o" x="2" y="0" width="10" height="1"/>',
    '<rect class="c-f" x="3" y="1" width="8" height="1"/>',
    '<rect class="c-f" x="2" y="2" width="10" height="6"/>',
    '<rect class="c-g" x="4" y="3" width="2" height="2"/>',
    '<rect class="c-g" x="8" y="3" width="2" height="2"/>',
    '<rect class="c-g" x="6" y="5" width="2" height="2"/>',
    '<rect class="c-g" x="12" y="4" width="3" height="3"/>',
    '<rect class="c-o" x="14" y="5" width="1" height="1"/>',
    '<rect class="c-g" x="3" y="8" width="3" height="3"/>',
    '<rect class="c-g" x="9" y="8" width="3" height="3"/>',
    '<rect class="c-g" x="0" y="6" width="2" height="1"/>',
  ].join('');

  PG.SPRITE_NAMES = Object.keys(SPRITES);

  PG.sprite = function (name) {
    const rows = SPRITES[name];
    if (!rows) return '';
    let r = '';
    rows.forEach((row, y) => {
      Array.from(row).forEach((ch, x) => {
        if (ch !== '.') r += '<rect class="c-' + ch + '" x="' + x + '" y="' + y + '" width="1" height="1"/>';
      });
    });
    return '<svg viewBox="0 0 8 8" shape-rendering="crispEdges" aria-hidden="true" focusable="false">' + r + '</svg>';
  };

  PG.turtle = function () {
    return '<svg viewBox="0 0 16 12" shape-rendering="crispEdges" aria-hidden="true" focusable="false">' + TURTLE + '</svg>';
  };

  PG.hydrate = function (root) {
    (root || document).querySelectorAll('[data-sprite]').forEach((el) => {
      el.innerHTML = el.dataset.sprite === 'turtle' ? PG.turtle() : PG.sprite(el.dataset.sprite);
    });
  };
  document.addEventListener('DOMContentLoaded', () => PG.hydrate());

  /* Make an element with text (textContent only, so user data is never parsed as HTML). */
  PG.el = function (tag, cls, text) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined && text !== null) e.textContent = text;
    return e;
  };

  PG.spriteEl = function (name, extraClass) {
    const s = PG.el('span', 'spr' + (extraClass ? ' ' + extraClass : ''));
    s.innerHTML = PG.sprite(name);
    return s;
  };

  /* ---------------- MOCK DATABASE & OFFLINE ENGINE ---------------- */
  const DEFAULT_ME = {
    id: 'a000000a-0000-0000-0000-00000000000a',
    username: 'admin_rose',
    role: 'admin',
    xp: 480,
    seeds: 165,
    streak: 6,
    is_verified: true,
    is_suspended: false,
    created_at: new Date(Date.now() - 30 * 86400000).toISOString()
  };

  const DEFAULT_USERS = [
    { id: 'a0000001-0000-0000-0000-000000000001', username: 'flora_coder', role: 'user', xp: 1420, seeds: 420, streak: 14, is_verified: true, is_suspended: false, created_at: new Date(Date.now() - 30 * 86400000).toISOString(), completed_levels: 10, total_levels: 10, progress_percent: 100 },
    { id: 'a0000002-0000-0000-0000-000000000002', username: 'python_sprout', role: 'user', xp: 1150, seeds: 310, streak: 10, is_verified: true, is_suspended: false, created_at: new Date(Date.now() - 24 * 86400000).toISOString(), completed_levels: 9, total_levels: 10, progress_percent: 90 },
    { id: 'a0000003-0000-0000-0000-000000000003', username: 'botanist_bob', role: 'user', xp: 890, seeds: 240, streak: 7, is_verified: true, is_suspended: false, created_at: new Date(Date.now() - 18 * 86400000).toISOString(), completed_levels: 7, total_levels: 10, progress_percent: 70 },
    { id: 'a0000004-0000-0000-0000-000000000004', username: 'green_thumb_max', role: 'user', xp: 680, seeds: 180, streak: 6, is_verified: false, is_suspended: false, created_at: new Date(Date.now() - 14 * 86400000).toISOString(), completed_levels: 5, total_levels: 10, progress_percent: 50 },
    { id: 'a0000005-0000-0000-0000-000000000005', username: 'leafy_luna', role: 'user', xp: 520, seeds: 135, streak: 5, is_verified: true, is_suspended: false, created_at: new Date(Date.now() - 12 * 86400000).toISOString(), completed_levels: 4, total_levels: 10, progress_percent: 40 },
    { id: 'a000000a-0000-0000-0000-00000000000a', username: 'admin_rose', role: 'admin', xp: 480, seeds: 165, streak: 6, is_verified: true, is_suspended: false, created_at: new Date(Date.now() - 30 * 86400000).toISOString(), completed_levels: 4, total_levels: 10, progress_percent: 40 },
    { id: 'a0000006-0000-0000-0000-000000000006', username: 'clover_clara', role: 'user', xp: 380, seeds: 95, streak: 4, is_verified: false, is_suspended: false, created_at: new Date(Date.now() - 9 * 86400000).toISOString(), completed_levels: 3, total_levels: 10, progress_percent: 30 },
    { id: 'a0000007-0000-0000-0000-000000000007', username: 'seedling_sam', role: 'user', xp: 240, seeds: 60, streak: 3, is_verified: true, is_suspended: false, created_at: new Date(Date.now() - 6 * 86400000).toISOString(), completed_levels: 2, total_levels: 10, progress_percent: 20 },
    { id: 'a0000008-0000-0000-0000-000000000008', username: 'blossom_bee', role: 'user', xp: 140, seeds: 35, streak: 2, is_verified: false, is_suspended: false, created_at: new Date(Date.now() - 4 * 86400000).toISOString(), completed_levels: 1, total_levels: 10, progress_percent: 10 },
    { id: 'a0000009-0000-0000-0000-000000000009', username: 'sunflower_sid', role: 'user', xp: 80, seeds: 20, streak: 1, is_verified: false, is_suspended: false, created_at: new Date(Date.now() - 2 * 86400000).toISOString(), completed_levels: 1, total_levels: 10, progress_percent: 10 }
  ];

  const DEFAULT_ITEMS = [
    { id: 1, name: 'Sunflower seed', kind: 'seed', cost_seeds: 20, sprite: 'sunflower' },
    { id: 2, name: 'Tulip bulb', kind: 'seed', cost_seeds: 30, sprite: 'tulip' },
    { id: 3, name: 'Mushroom spore', kind: 'seed', cost_seeds: 25, sprite: 'mushroom' },
    { id: 4, name: 'Cactus sprout', kind: 'seed', cost_seeds: 35, sprite: 'cactus' },
    { id: 5, name: 'Watering can', kind: 'tool', cost_seeds: 40, sprite: 'can' },
    { id: 6, name: 'Picket fence', kind: 'decor', cost_seeds: 50, sprite: 'fence' },
    { id: 7, name: 'Garden lantern', kind: 'decor', cost_seeds: 60, sprite: 'lantern' },
    { id: 8, name: 'Lily pond', kind: 'decor', cost_seeds: 80, sprite: 'pond' },
  ];

  function getStore(k, def) {
    try {
      const v = localStorage.getItem('pg_' + k);
      return v ? JSON.parse(v) : def;
    } catch (_) { return def; }
  }
  function setStore(k, val) {
    try { localStorage.setItem('pg_' + k, JSON.stringify(val)); } catch (_) {}
  }

  function validateLessonData(data) {
    if (!data || !Array.isArray(data.chapters) || data.chapters.length === 0) {
      throw new Error('Lesson catalog must contain at least one chapter.');
    }

    const slugs = new Set();
    const lessonIds = new Set();
    const goalCheckTypes = new Set(['contains', 'contains_all', 'contains_any', 'output', 'output_and_contains', 'tests']);
    let lessonCount = 0;
    data.chapters.forEach((chapter, chapterIndex) => {
      if (!chapter || typeof chapter.slug !== 'string' || !chapter.slug.trim() ||
          typeof chapter.title !== 'string' || !chapter.title.trim() ||
          !Array.isArray(chapter.lessons) || slugs.has(chapter.slug)) {
        throw new Error('Lesson catalog has an invalid or duplicate chapter at position ' + (chapterIndex + 1) + '.');
      }
      slugs.add(chapter.slug);
      chapter.lessons.forEach((lesson) => {
        if (!lesson || !Number.isInteger(lesson.id) || lesson.id < 1 || lessonIds.has(lesson.id) ||
            typeof lesson.title !== 'string' || !lesson.title.trim() ||
            !Array.isArray(lesson.goals) || typeof lesson.starter_code !== 'string' ||
            typeof lesson.expected_output !== 'string' ||
            !lesson.rules || typeof lesson.rules !== 'object' || Array.isArray(lesson.rules)) {
          throw new Error('Lesson catalog has an invalid or duplicate lesson in "' + chapter.title + '".');
        }
        if (lesson.rules.goal_checks !== undefined &&
            (!Array.isArray(lesson.rules.goal_checks) || lesson.rules.goal_checks.length !== lesson.goals.length)) {
          throw new Error('Lesson "' + lesson.title + '" must define one verification check per goal.');
        }
        if (lesson.rules.goal_checks && lesson.rules.goal_checks.some((check) =>
          !check || !goalCheckTypes.has(check.type) ||
          ((check.type === 'contains' || check.type === 'output_and_contains') && typeof check.value !== 'string') ||
          ((check.type === 'contains_all' || check.type === 'contains_any') &&
            (!Array.isArray(check.values) || check.values.length === 0)))) {
          throw new Error('Lesson "' + lesson.title + '" has an unsupported goal check.');
        }
        if (lesson.rules.test_cases !== undefined &&
            (!Array.isArray(lesson.rules.test_cases) || lesson.rules.test_cases.length === 0 ||
             lesson.rules.test_cases.some((testCase) => !testCase || typeof testCase.expected_output !== 'string' ||
               (testCase.variables !== undefined &&
                (!testCase.variables || typeof testCase.variables !== 'object' || Array.isArray(testCase.variables)))))) {
          throw new Error('Lesson "' + lesson.title + '" has invalid practice tests.');
        }
        if (lesson.rules.initial_variables !== undefined &&
            (!lesson.rules.initial_variables || typeof lesson.rules.initial_variables !== 'object' ||
             Array.isArray(lesson.rules.initial_variables))) {
          throw new Error('Lesson "' + lesson.title + '" has invalid initial variables.');
        }
        lessonIds.add(lesson.id);
        lessonCount++;
      });
    });

    if (lessonCount === 0) throw new Error('Lesson catalog must contain at least one lesson.');
    return data;
  }

  // Cache version enforcement - auto-bust stale cache
  const DATA_VERSION = 'v6_validated-growth';
  if (getStore('data_version', null) !== DATA_VERSION) {
    try {
      localStorage.removeItem('pg_lessons_cache');
      localStorage.removeItem('pg_toolbox_cache');
      setStore('data_version', DATA_VERSION);
    } catch (_) {}
  }

  /* Mock database handler when live PHP backend is not reachable */
  async function mockApi(path, opts) {
    opts = opts || {};
    const body = opts.body || {};
    const cleanPath = path.split('?')[0];
    const urlParams = new URLSearchParams(path.includes('?') ? path.split('?')[1] : '');

    let me = getStore('me', DEFAULT_ME);
    let users = getStore('users', DEFAULT_USERS);
    let plots = getStore('plots', [
      { slot: 0, item_id: 1, stage: 'blooming', growth_stage: 2, watered: true, planted_at: Date.now() - 86400000 },
      { slot: 1, item_id: 2, stage: 'growing', growth_stage: 1, watered: true, planted_at: Date.now() - 36000000 },
      { slot: 2, item_id: 3, stage: 'sprout', growth_stage: 0, watered: false, planted_at: Date.now() - 10000000 }
    ]);
    let progress = getStore('progress', { 1: 'open' });
    let bestCodes = getStore('best_codes', {});

    // Validate cached and downloaded curriculum before it reaches lesson pages.
    let lessonData = getStore('lessons_cache', null);
    let lessonDataError = null;
    if (lessonData) {
      try {
        lessonData = validateLessonData(lessonData);
      } catch (e) {
        lessonData = null;
        lessonDataError = e;
      }
    }
    const isStale = !lessonData || !lessonData.chapters || lessonData.chapters.length !== 3 || lessonData.chapters[0].slug !== 'getting-started';
    if (isStale) {
      try {
        let resp = await fetch('/data/lessons.json?t=' + Date.now()).catch(() => null);
        if (!resp || !resp.ok) {
          resp = await fetch('../data/lessons.json?t=' + Date.now()).catch(() => null);
        }
        if (resp && resp.ok) {
          lessonData = validateLessonData(await resp.json());
          setStore('lessons_cache', lessonData);
          lessonDataError = null;
        }
      } catch (e) {
        lessonData = null;
        lessonDataError = e;
        console.error('Unable to load the lesson catalog:', e);
      }
    }
    if (!lessonData && !lessonDataError) {
      lessonDataError = new Error('Lesson catalog could not be loaded.');
    }

    // 1. Current user
    if (cleanPath.endsWith('/api/me.php')) {
      return {
        id: me.id,
        username: me.username,
        role: me.role,
        xp: me.xp,
        seeds: me.seeds,
        streak: me.streak,
        is_verified: !!me.is_verified
      };
    }

    // 2. Auth: login, register, logout
    if (cleanPath.endsWith('/api/login.php')) {
      const u = (body.username || '').toLowerCase();
      const existing = users.find(x => x.username.toLowerCase() === u);
      if (existing) {
        me = { ...existing };
      } else {
        me.username = u || 'gardener';
      }
      setStore('me', me);
      return { ok: true, role: me.role };
    }
    if (cleanPath.endsWith('/api/register.php')) {
      const u = (body.username || '').toLowerCase();
      me = {
        id: 'u-' + Date.now(),
        username: u || 'new_gardener',
        role: 'user',
        xp: 0,
        seeds: 15,
        streak: 1,
        is_verified: false,
        created_at: new Date().toISOString()
      };
      users.unshift({ ...me, completed_levels: 0, total_levels: 15, progress_percent: 0 });
      setStore('users', users);
      setStore('me', me);
      return { ok: true, needs_verification: true, role: 'user', message: 'Verification email sent' };
    }
    if (cleanPath.endsWith('/api/logout.php')) {
      return { ok: true };
    }

    // Forgot password OTP
    if (cleanPath.includes('/api/forgot-password.php') || cleanPath.includes('/api/forgot_password.php')) {
      return { ok: true, message: 'Password reset code sent. (Demo code: 123456)' };
    }

    // 3. Verification
    if (cleanPath.endsWith('/api/verify.php')) {
      me.is_verified = true;
      setStore('me', me);
      const uIdx = users.findIndex(x => x.id === me.id);
      if (uIdx !== -1) { users[uIdx].is_verified = true; setStore('users', users); }
      return { ok: true, is_verified: true, message: 'Account verified!' };
    }

    // 4. Leaderboard / Rankings
    if (cleanPath.endsWith('/api/leaderboard.php')) {
      const sort = urlParams.get('sort') || 'xp';
      // Sync me into users list
      const meIdx = users.findIndex(x => x.id === me.id);
      const myCompleted = Object.values(progress).filter(v => v === 'done').length;
      const myEntry = {
        id: me.id,
        username: me.username,
        role: me.role,
        xp: me.xp,
        seeds: me.seeds,
        streak: me.streak,
        is_verified: !!me.is_verified,
        completed_levels: myCompleted,
        levels_done: myCompleted
      };
      if (meIdx !== -1) users[meIdx] = { ...users[meIdx], ...myEntry };
      else users.push(myEntry);

      let list = users.map(u => ({
        id: u.id,
        username: u.username,
        role: u.role,
        xp: u.xp,
        seeds: u.seeds,
        streak: u.streak,
        is_verified: !!u.is_verified,
        levels_done: u.completed_levels !== undefined ? u.completed_levels : (u.levels_done || 0),
        rank_title: PG.rankFor(u.xp).rank.name,
        rank_badge: u.xp >= 1000 ? '🏆' : (u.xp >= 500 ? '🌸' : (u.xp >= 250 ? '🌿' : (u.xp >= 100 ? '🌱' : '🌰'))),
        is_me: u.id === me.id
      }));

      list.sort((a, b) => {
        if (sort === 'levels') return b.levels_done - a.levels_done || b.xp - a.xp;
        if (sort === 'streak') return b.streak - a.streak || b.xp - a.xp;
        if (sort === 'seeds') return b.seeds - a.seeds || b.xp - a.xp;
        return b.xp - a.xp || a.username.localeCompare(b.username);
      });

      let myRank = 1;
      list.forEach((item, idx) => {
        item.rank_position = idx + 1;
        if (item.is_me) myRank = idx + 1;
      });

      return {
        leaderboard: list,
        my_rank: myRank,
        total_gardeners: list.length,
        sort
      };
    }

    // 5. Lessons & Progress
    if (cleanPath.endsWith('/api/lessons.php')) {
      if (lessonDataError) throw lessonDataError;
      const idParam = urlParams.get('id');
      const allLessons = [];
      const chapters = (lessonData && lessonData.chapters) || [];
      let counter = 1;
      chapters.forEach(c => {
        (c.lessons || []).forEach(l => {
          allLessons.push({
            ...l,
            id: l.id || counter,
            chapter_id: c.sort_order,
            chapter_title: c.title,
            sort_order: l.sort_order || counter
          });
          counter++;
        });
      });

      if (idParam) {
        const lid = parseInt(idParam, 10);
        const l = allLessons.find(x => x.id === lid) || allLessons[0];
        const status = progress[lid] || (lid === 1 || progress[lid - 1] === 'done' ? 'open' : 'locked');
        return {
          lesson: {
            ...l,
            status,
            best_code: bestCodes[lid] || l.starter_code
          }
        };
      }

      // Return list for adventure map
      let foundOpen = false;
      let nextLesson = null;
      const mapped = allLessons.map(l => {
        let status = 'locked';
        if (progress[l.id] === 'done') status = 'done';
        else if (!foundOpen) { status = 'open'; foundOpen = true; nextLesson = l; }
        return { ...l, status };
      });

      const formattedChapters = chapters.map(ch => ({
        ...ch,
        lessons: mapped.filter(l => l.chapter_id === ch.sort_order)
      }));

      return {
        chapters: formattedChapters,
        lessons: mapped,
        next: nextLesson,
        done: progress,
        me: { xp: me.xp, seeds: me.seeds, streak: me.streak }
      };
    }

    if (cleanPath.endsWith('/api/progress.php')) {
      if (opts.method === 'POST') {
        const lid = body.lesson_id;
        const isNew = progress[lid] !== 'done';
        progress[lid] = 'done';
        bestCodes[lid] = body.code || '';
        setStore('progress', progress);
        setStore('best_codes', bestCodes);

        const rSeeds = isNew ? 25 : 0;
        const rXp = isNew ? 50 : 0;
        me.seeds += rSeeds;
        me.xp += rXp;
        setStore('me', me);

        const allCount = 10;
        const nextId = lid < allCount ? lid + 1 : null;
        return {
          awarded: isNew,
          reward_seeds: rSeeds,
          reward_xp: rXp,
          seeds: me.seeds,
          xp: me.xp,
          streak: me.streak,
          next_id: nextId
        };
      }
      return {
        xp: me.xp,
        seeds: me.seeds,
        streak: me.streak,
        levels_done: Object.values(progress).filter(v => v === 'done').length,
        concepts: {
          Printing: 1, Variables: 1, Math: 1, Decisions: 1, Loops: 1, Lists: 1
        },
        milestones: [
          { title: 'First sprout', done: true, desc: 'Finished your first level' },
          { title: 'Green thumb', done: true, desc: 'Finished 5 levels' },
          { title: 'Master Harvester', done: false, desc: 'Finish 10 levels' }
        ]
      };
    }

    // 6. Garden & Shop
    if (cleanPath.endsWith('/api/garden.php')) {
      if (opts.method === 'POST') {
        const action = body.action || 'plant';
        const slot = Number(body.slot);
        if (!Number.isInteger(slot) || slot < 0 || slot > 11) throw new Error('Pick a plot from 1 to 12.');
        const stageFor = (plot) => Number.isInteger(plot.growth_stage)
          ? plot.growth_stage
          : plot.stage === 'blooming' ? 2 : plot.stage === 'growing' || plot.watered ? 1 : 0;
        const stageName = (stage) => ['sprout', 'growing', 'blooming'][stage];

        if (action === 'water') {
          const plot = plots.find(p => p.slot === slot);
          if (!plot) throw new Error('There is no plant in that plot.');
          const growthStage = stageFor(plot);
          if (growthStage >= 2) throw new Error('That plant is already in full bloom.');
          plot.growth_stage = growthStage + 1;
          plot.stage = stageName(plot.growth_stage);
          plot.watered = true;
          plot.watered_at = Date.now();
          setStore('plots', plots);
          return { ok: true, slot, stage: plot.stage, growth_stage: plot.growth_stage, watered: true };
        }

        if (action === 'harvest') {
          const plotIdx = plots.findIndex(p => p.slot === slot);
          if (plotIdx === -1) throw new Error('There is no plant in that plot.');
          if (stageFor(plots[plotIdx]) < 2) throw new Error('Water this plant twice before harvesting it.');
          const season = body.season || 'summer';
          const seasonalBonus = {
            spring: { seeds: 3, xp: 0 },
            summer: { seeds: 0, xp: 3 },
            autumn: { seeds: 5, xp: 0 },
            winter: { seeds: 0, xp: 5 }
          }[season];
          if (!seasonalBonus) throw new Error('Choose a valid season.');
          const rewardSeeds = 10 + seasonalBonus.seeds;
          const rewardXp = 15 + seasonalBonus.xp;
          plots.splice(plotIdx, 1);
          me.seeds += rewardSeeds;
          me.xp += rewardXp;
          setStore('me', me);
          setStore('plots', plots);
          return {
            ok: true, slot, seeds: me.seeds, xp: me.xp,
            reward_seeds: rewardSeeds, reward_xp: rewardXp, seasonal_bonus: seasonalBonus
          };
        }

        if (action === 'dig') {
          if (!plots.some(p => p.slot === slot)) throw new Error('There is no plant in that plot.');
          plots = plots.filter(p => p.slot !== slot);
          setStore('plots', plots);
          return { ok: true, slot };
        }

        // Standard Plant
        if (action !== 'plant') throw new Error('Unknown garden action.');
        if (plots.some(p => p.slot === slot)) throw new Error('That plot is already planted.');
        const itemId = parseInt(body.item_id, 10);
        const item = DEFAULT_ITEMS.find(i => i.id === itemId);
        if (item && me.seeds >= item.cost_seeds) {
          me.seeds -= item.cost_seeds;
          setStore('me', me);
          plots.push({
            slot,
            item_id: itemId,
            stage: 'sprout',
            growth_stage: 0,
            watered: false,
            planted_at: Date.now()
          });
          setStore('plots', plots);
          return { ok: true, slot, seeds: me.seeds, item_id: itemId, stage: 'sprout', growth_stage: 0 };
        }
        if (item) throw new Error('Not enough seeds.');
        throw new Error('That item is not available.');
      }

      return {
        items: DEFAULT_ITEMS,
        plots: plots.map((plot) => {
          const growthStage = Number.isInteger(plot.growth_stage)
            ? plot.growth_stage
            : plot.stage === 'blooming' ? 2 : plot.stage === 'growing' || plot.watered ? 1 : 0;
          return {
            ...plot,
            growth_stage: growthStage,
            stage: ['sprout', 'growing', 'blooming'][growthStage]
          };
        }),
        seeds: me.seeds
      };
    }

    // 7. Admin endpoints
    if (cleanPath.includes('/api/admin/stats.php') || cleanPath.endsWith('/api/stats.php')) {
      return {
        users: users.length,
        new_users_7d: 4,
        admins: users.filter(u => u.role === 'admin').length,
        suspended: users.filter(u => u.is_suspended).length,
        seeds_held: users.reduce((acc, u) => acc + (u.seeds || 0), 0),
        lessons: 10,
        completions: 68,
        completions_7d: 22,
        active_today: 5,
        active_month: users.length,
        completion_rate: 65,
        per_lesson: [
          { id: 1, title: 'Say hello', done: 10, is_published: true },
          { id: 2, title: 'Name your water', done: 9, is_published: true },
          { id: 3, title: 'Count the seeds', done: 8, is_published: true },
          { id: 4, title: 'Sunny or not', done: 7, is_published: true },
          { id: 5, title: 'Water every plant', done: 6, is_published: true },
          { id: 6, title: 'Gather the Harvest', done: 5, is_published: true },
          { id: 7, title: 'Count the Petals', done: 4, is_published: true }
        ],
        activity: [
          { type: 'completion', user: 'flora_coder', level: 'Gather the Harvest', time: new Date().toISOString() },
          { type: 'signup', user: 'sunflower_sid', time: new Date(Date.now() - 3600000).toISOString() },
          { type: 'completion', user: 'python_sprout', level: 'Count the Petals', time: new Date(Date.now() - 7200000).toISOString() }
        ],
        weekly: [
          { date: '2026-11-10', signups: 1, completions: 4 },
          { date: '2026-11-11', signups: 0, completions: 6 },
          { date: '2026-11-12', signups: 2, completions: 5 },
          { date: '2026-11-13', signups: 1, completions: 8 },
          { date: '2026-11-14', signups: 0, completions: 7 },
          { date: '2026-11-15', signups: 3, completions: 12 },
          { date: '2026-11-16', signups: 2, completions: 9 }
        ],
        chapters: [
          { id: 1, title: 'First sprouts', is_published: true },
          { id: 2, title: 'Sprouting Logic & Data', is_published: true },
          { id: 3, title: 'Master Garden Algorithms', is_published: true }
        ]
      };
    }

    if (cleanPath.includes('/api/admin/users.php')) {
      if (opts.method === 'POST') {
        const action = body.action;
        if (action === 'create') {
          const newUser = {
            id: 'u-' + Date.now(),
            username: (body.username || '').toLowerCase(),
            role: body.role || 'user',
            xp: parseInt(body.xp, 10) || 0,
            seeds: parseInt(body.seeds, 10) || 15,
            streak: 1,
            is_verified: !!body.is_verified,
            is_suspended: false,
            completed_levels: 0,
            total_levels: 15,
            progress_percent: 0,
            created_at: new Date().toISOString()
          };
          users.unshift(newUser);
          setStore('users', users);
          return { ok: true, user: newUser };
        }

        const targetId = body.id;
        const target = users.find(u => u.id === targetId);
        if (target) {
          if (action === 'promote') target.role = 'admin';
          if (action === 'demote') target.role = 'user';
          if (action === 'suspend') target.is_suspended = true;
          if (action === 'unsuspend') target.is_suspended = false;
          if (action === 'verify') target.is_verified = true;
          if (action === 'unverify') target.is_verified = false;
          if (action === 'reset') { target.xp = 0; target.seeds = 0; target.completed_levels = 0; }
          setStore('users', users);
        }
        return { ok: true, user: target };
      }
      return { users: users, me: me.id };
    }

    if (cleanPath.includes('/api/admin/lessons.php')) {
      if (lessonDataError) throw lessonDataError;
      return {
        chapters: (lessonData && lessonData.chapters) || [],
        lessons: (lessonData && lessonData.chapters && lessonData.chapters.flatMap(c => c.lessons)) || []
      };
    }

    if (cleanPath.endsWith('/api/toolbox.php')) {
      let tbData = getStore('toolbox_cache', null);
      const isTbStale = !tbData || !tbData.topics || tbData.topics.length !== 10;
      if (isTbStale) {
        try {
          let resp = await fetch('/data/toolbox.json?t=' + Date.now()).catch(() => null);
          if (!resp || !resp.ok) {
            resp = await fetch('../data/toolbox.json?t=' + Date.now()).catch(() => null);
          }
          if (resp && resp.ok) {
            tbData = await resp.json();
            setStore('toolbox_cache', tbData);
          }
        } catch (_) {}
      }

      const rawTopics = (tbData && tbData.topics) || [];
      const topics = rawTopics.map((t, idx) => {
        let unlocked = true;
        if (t.unlock_lesson_title) {
          const completedCount = Object.values(progress).filter(v => v === 'done').length;
          unlocked = completedCount >= idx;
        }
        return {
          id: t.id || (idx + 1),
          title: t.title,
          unlocked: unlocked,
          summary: t.summary,
          example_code: t.example_code,
          unlock_hint: t.unlock_lesson_title ? 'Finish level "' + t.unlock_lesson_title + '" to unlock this.' : 'Available now'
        };
      });

      return { topics: topics };
    }

    return { ok: true };
  }

  PG.api = async function (path, opts) {
    opts = { ...(opts || {}) };
    opts.method = opts.method || (opts.body !== undefined ? 'POST' : 'GET');
    const init = { method: opts.method, headers: {}, credentials: 'same-origin' };

    // Transmit session Bearer token from localStorage for bulletproof dual auth
    const savedToken = localStorage.getItem('pg_token');
    if (savedToken) {
      init.headers['Authorization'] = 'Bearer ' + savedToken;
      init.headers['X-Session-Token'] = savedToken;
    }

    if (opts.body !== undefined) {
      init.method = opts.method || 'POST';
      init.headers['Content-Type'] = 'application/json';
      init.body = JSON.stringify(opts.body);
    }
    let res;
    let failedToReach = false;
    try {
      res = await fetch(path, init);
      // Only fall back to mock for static-asset 404s or truly unreachable endpoints
      // Auth, session, and data endpoints must surface real errors — no mock fallback
      const isAuthEndpoint = /\/(login|register|logout|verify|me|forgot.?password|magic.?link|change.?email|reauthenticate)\.php/.test(path);
      if (!isAuthEndpoint && (res.status === 404 || res.status === 405)) {
        // Fall back to local mock engine if PHP endpoint is not served
        return await mockApi(path, opts);
      }
    } catch (e) {
      failedToReach = true;
    }

    if (failedToReach || !res) {
      return await mockApi(path, opts);
    }

    let data = null;
    try { data = await res.json(); } catch (e) { /* not JSON */ }

    // Store returned session token
    if (data && data.token) {
      localStorage.setItem('pg_token', data.token);
    }
    if (path.includes('logout.php')) {
      localStorage.removeItem('pg_token');
    }

    if (res.status === 401 && !opts.noRedirect) {
      if (!location.pathname.endsWith('/login.html')) location.href = '/login.html';
    }
    if (!res.ok) {
      const err = new Error((data && data.error) || 'Something went wrong');
      err.status = res.status;
      throw err;
    }
    return data;
  };

  let toastTimer = null;
  PG.toast = function (msg, isError) {
    let t = document.getElementById('toast');
    if (!t) {
      t = PG.el('div', 'px-toast');
      t.id = 'toast';
      t.setAttribute('role', 'status');
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.className = 'px-toast' + (isError ? ' px-toast--error' : '');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      if (t && t.parentNode) t.remove();
    }, 3500);
  };

  PG.RANKS = [
    { xp: 0, name: 'Seedling', icon: '🌰' },
    { xp: 100, name: 'Sprout', icon: '🌱' },
    { xp: 250, name: 'Gardener', icon: '🌿' },
    { xp: 500, name: 'Botanist', icon: '🌸' },
    { xp: 1000, name: 'Master gardener', icon: '🏆' },
  ];
  PG.rankFor = function (xp) {
    let i = 0;
    PG.RANKS.forEach((r, k) => { if (xp >= r.xp) i = k; });
    return { rank: PG.RANKS[i], next: PG.RANKS[i + 1] || null };
  };

  PG.setStats = function (s) {
    if (!s) return;
    Object.keys(s).forEach((k) => {
      document.querySelectorAll('[data-bind="' + k + '"]').forEach((el) => { el.textContent = s[k]; });
    });
  };
})();
