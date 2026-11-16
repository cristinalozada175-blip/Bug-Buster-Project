/* Level page: loads a level, runs the code, checks it, saves progress. */
(function () {
  'use strict';

  const PG = window.PG;
  const $ = (id) => document.getElementById(id);
  const code = $('code');
  if (!code) return;

  const gutter = $('gutter'), out = $('console'), scene = $('scene'), win = $('win');
  const btnRun = $('btn-run'), btnCheck = $('btn-check'), btnHint = $('btn-hint'), btnReset = $('btn-reset');
  const btnViewLesson = $('btn-view-lesson'), btnSideLesson = $('btn-side-lesson');
  const btnMaximizeLesson = $('btn-maximize-lesson'), btnIntroMaximize = $('btn-intro-maximize');
  const btnStartCoding = $('btn-start-coding');
  const termStatus = $('term-status'), btnTermClear = $('btn-term-clear'), btnTermCopy = $('btn-term-copy');
  const maxModal = $('maximize-modal'), btnCloseMax = $('btn-close-maximize'), btnMaxStart = $('btn-max-start');
  const hintBox = $('hint');
  const questIntro = $('quest-intro'), levelBody = $('level-body'), levelLoading = $('level-loading');
  const lessonId = parseInt(new URLSearchParams(location.search).get('id'), 10) || 1;

  let lesson = null;
  let tabOff = false;
  let isStreaming = false;

  const CONCEPT_EXPLANATIONS = {
    'Printing': 'The print() function sends information to the screen console. Whatever text you put inside the quotation marks will be shown exactly as written.',
    'Variables': 'Variables are containers for storing data values. In Python, you assign a value to a variable using the = operator, like: water = 4.',
    'Math': 'Python supports standard arithmetic: + for addition, - for subtraction, * for multiplication, and / for division.',
    'Decisions': 'The if and else keywords let your code make decisions based on conditions. If the condition is true, the indented block under if runs; otherwise, else runs.',
    'Loops': 'A for loop executes a block of code repeatedly. Using range(n) allows your loop to run n times, counting from 0 up to n - 1.',
    'Lists': 'A list is an ordered, changeable collection of items written with square brackets []. Python lists are zero-indexed, meaning the first item is accessed with [0].',
    'List Length': 'The len() function returns the number of items in a list or sequence, perfect for counting your garden plants.',
    'Logic and Conditions': 'Combine multiple conditions using logical operators: and requires both conditions to be true, while or requires at least one.',
    'While Loops': 'A while loop repeats as long as a condition remains true. Be sure to update your loop variable inside the loop to avoid infinite loops.',
    'Functions': 'Functions are reusable blocks of code defined with def. They take parameters and can return values using the return statement.',
    'Dictionaries': 'Dictionaries store data in key: value pairs inside curly braces {}. You access values using their key name: dict[key].',
    'F-Strings': 'F-strings let you embed variables directly inside strings by prefixing the string with f and putting variables inside {braces}.',
    'List Filtering': 'By combining a for loop with an if statement, you can filter through a list and process only the items you want.',
    'Nested Loops': 'A loop inside another loop generates multidimensional coordinates, perfect for planting a 2D garden grid matrix.',
    'Capstone Project': 'Put all your garden skills together: variables, lists, accumulation, loops, and output formatting in one master script!'
  };

  function renderGutter(errLine) {
    const n = code.value.split('\n').length;
    gutter.textContent = '';
    for (let i = 1; i <= n; i++) {
      gutter.appendChild(PG.el('span', 'ln' + (i === errLine ? ' is-error' : ''), String(i)));
    }
    gutter.scrollTop = code.scrollTop;
  }

  function setTerminalStatus(type, text) {
    if (!termStatus) return;
    termStatus.className = 'term-status status-' + type;
    termStatus.textContent = text;
  }

  /* Dynamic typewriter terminal output stream */
  async function streamToTerminal(lines, errorMsg, verificationReport) {
    if (isStreaming) return;
    isStreaming = true;
    out.textContent = '';
    setTerminalStatus('running', '● RUNNING');

    // Prompt header line
    const promptLine = PG.el('span', 'term-line term-prompt', '>>> python solution.py');
    out.appendChild(promptLine);

    // Blinking cursor
    const cursor = PG.el('span', 'term-cursor', '');
    out.appendChild(cursor);

    // Stream regular stdout lines
    for (let i = 0; i < lines.length; i++) {
      cursor.remove();
      const lineEl = PG.el('span', 'term-line term-stdout', lines[i]);
      out.appendChild(lineEl);
      out.appendChild(cursor);
      out.scrollTop = out.scrollHeight;
      await new Promise(r => setTimeout(r, 40));
    }

    if (!lines.length && !errorMsg) {
      cursor.remove();
      const emptyEl = PG.el('span', 'term-line term-note', '(Process finished with no printed output)');
      out.appendChild(emptyEl);
      out.appendChild(cursor);
    }

    // Error message
    if (errorMsg) {
      cursor.remove();
      const errEl = PG.el('span', 'term-line term-stderr', errorMsg);
      out.appendChild(errEl);
      out.appendChild(cursor);
      setTerminalStatus('error', '● ERROR');
    } else {
      setTerminalStatus('success', '● SUCCESS');
    }

    // Verification Report
    if (verificationReport) {
      cursor.remove();
      const reportBox = PG.el('div', 'term-verification-box');
      reportBox.innerHTML = verificationReport;
      out.appendChild(reportBox);
      out.appendChild(cursor);
    }

    cursor.remove();
    isStreaming = false;
    out.scrollTop = out.scrollHeight;
  }

  function run() {
    if (isStreaming) return;
    const res = PyRunner.run(code.value);
    const e = res.error;
    renderGutter(e ? e.line : 0);
    const errMsg = e ? 'Traceback (Line ' + e.line + '): ' + e.message : '';
    streamToTerminal(res.output || [], errMsg, null);

    if (e) {
      hintBox.textContent = 'Notice the error in the console. Check line ' + e.line + ' and try again.';
      hintBox.classList.remove('is-hidden');
    } else {
      hintBox.textContent = 'Code ran smoothly! Click "Verify & Check" when you meet all goals to complete this level.';
      hintBox.classList.remove('is-hidden');
    }
  }

  async function check() {
    if (isStreaming) return;
    const rules = { ...(lesson.rules || {}), expected_output: lesson.expected_output };
    const c = PyRunner.check(code.value, rules);
    renderGutter(c.result.error ? c.result.error.line : 0);
    const errMsg = c.result.error ? 'Traceback (Line ' + c.result.error.line + '): ' + c.result.error.message : '';

    // Build Verification Report
    let reportHtml = '<div class="term-verification-title">🌱 VERIFICATION REPORT:</div>';
    if (!c.result.error) {
      reportHtml += '<div class="term-verification-pass">[✓] Syntax & Execution: Passed without errors</div>';
    } else {
      reportHtml += '<div class="term-verification-fail">[✗] Syntax & Execution: Error on line ' + c.result.error.line + '</div>';
    }

    (lesson.goals || []).forEach((g, idx) => {
      if (c.passed) {
        reportHtml += '<div class="term-verification-pass">[✓] Goal ' + (idx + 1) + ': ' + escapeHtml(g) + ' &mdash; VERIFIED</div>';
      } else {
        const msg = (c.messages && c.messages[idx]) || 'Pending verification';
        reportHtml += '<div class="term-verification-fail">[✗] Goal ' + (idx + 1) + ': ' + escapeHtml(msg) + '</div>';
      }
    });

    if (c.passed) {
      reportHtml += '<div class="term-verification-pass" style="margin-top:6px; font-weight:800;">🎉 ALL GOALS VERIFIED! Level Complete!</div>';
    }

    await streamToTerminal(c.result.output || [], errMsg, reportHtml);

    if (!c.passed) {
      hintBox.textContent = (c.messages && c.messages.join(' ')) || 'Some goals are not yet met. Check the goals list above!';
      hintBox.classList.remove('is-hidden');
      return;
    }

    hintBox.classList.add('is-hidden');
    btnCheck.disabled = true;
    scene.classList.add('is-bloom');

    // Add verified badges to goals
    document.querySelectorAll('#goals li').forEach((li) => {
      li.classList.add('is-done');
      if (!li.querySelector('.goal-verified-tag')) {
        const tag = PG.el('span', 'goal-verified-tag', '✓ VERIFIED');
        li.appendChild(tag);
      }
    });

    try {
      const r = await PG.api('/api/progress.php', {
        body: {
          lesson_id: lesson.id,
          code: code.value
        }
      });

      PG.setStats({
        seeds: r.seeds,
        xp: r.xp,
        streak: r.streak
      });

      showWin(r);
    } catch (err) {
      PG.toast(err.message, true);
      btnCheck.disabled = false;
    }
  }

  function escapeHtml(s) {
    const d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  function showWin(r) {
    win.classList.remove('is-hidden');
    const rewards = $('win-rewards');
    rewards.textContent = '';

    if (r.awarded) {
      $('win-title').textContent = '🌻 Level Complete!';
      $('win-text').textContent = 'Your garden is blooming! Here is what your code earned:';

      const s = PG.el('span', 'px-chip');
      s.appendChild(PG.spriteEl('seed', 'spr--sm'));
      s.appendChild(document.createTextNode('+' + r.reward_seeds + ' seeds'));

      const x = PG.el('span', 'px-chip');
      x.appendChild(PG.spriteEl('star', 'spr--sm'));
      x.appendChild(document.createTextNode('+' + r.reward_xp + ' XP'));

      rewards.appendChild(s);
      rewards.appendChild(x);
    } else {
      $('win-title').textContent = '🌿 Level Completed Again!';
      $('win-text').textContent = 'Your code is saved and verified. Great practice!';
    }

    const next = $('next-link');
    if (r.next_id) {
      next.href = '/level.html?id=' + r.next_id;
      next.textContent = 'Next level ›';
    } else {
      next.href = '/adventure.html';
      next.textContent = 'Back to the map';
    }

    $('win-title').focus();
    btnCheck.disabled = false;
  }

  function showHint() {
    const h = (lesson.rules && lesson.rules.hint) ||
      'Read each quest goal again, then run your code and compare the console with what the goal asks for.';
    hintBox.textContent = '💡 Hint: ' + h;
    hintBox.classList.remove('is-hidden');
  }

  let lessonMaterials = [];
  const loadMaterials = async () => {
    try {
      let r = await fetch('../data/lesson_materials.json?t=' + Date.now()).catch(() => null);
      if (!r || !r.ok) r = await fetch('/data/lesson_materials.json?t=' + Date.now()).catch(() => null);
      if (r && r.ok) {
        const d = await r.json();
        if (d && Array.isArray(d.lessons)) {
          lessonMaterials = d.lessons;
          if (lesson) fill(lesson);
        }
      }
    } catch (_) {}
  };
  loadMaterials();

  function findMaterial(l) {
    if (!l || !lessonMaterials.length) return null;
    return lessonMaterials.find(m => 
      m.id === l.id || 
      (m.title && l.title && m.title.toLowerCase().trim() === l.title.toLowerCase().trim()) || 
      (m.concept && l.concept && m.concept.toLowerCase().trim() === l.concept.toLowerCase().trim())
    );
  }

  function openMaximizeModal() {
    if (!lesson) return;
    $('max-chapter').textContent = (lesson.chapter_title || 'Chapter') + ' · Level ' + (lesson.sort_order || lesson.id);
    $('max-lesson-title').textContent = lesson.title;

    const body = $('max-content');
    body.innerHTML = '';

    const mat = findMaterial(lesson);

    if (mat) {
      // 1. Topic & Introduction
      const introBox = PG.el('div', 'lesson-teaching-box');
      introBox.innerHTML = '<h3>📖 ' + escapeHtml(mat.topic || mat.concept || lesson.concept || '') + '</h3><p>' + escapeHtml(mat.introduction || '') + '</p>';
      body.appendChild(introBox);

      // 2. Full Discussion Subsections
      if (Array.isArray(mat.discussion) && mat.discussion.length) {
        mat.discussion.forEach(sec => {
          const secTitle = PG.el('h4', null, sec.heading || '');
          secTitle.style.marginTop = '16px';
          secTitle.style.marginBottom = '6px';
          secTitle.style.color = '#224a3a';
          body.appendChild(secTitle);
          const p = PG.el('p', null, sec.text || '');
          p.style.whiteSpace = 'pre-line';
          p.style.lineHeight = '1.6';
          body.appendChild(p);
        });
      }

      // 3. Syntax Reference
      if (mat.syntax) {
        const synTitle = PG.el('h4', null, '📌 Syntax');
        synTitle.style.marginTop = '16px';
        synTitle.style.color = '#224a3a';
        body.appendChild(synTitle);
        const preSyn = PG.el('pre', null, mat.syntax);
        body.appendChild(preSyn);
      }

      // 4. Code Examples
      if (Array.isArray(mat.code_examples) && mat.code_examples.length) {
        const exTitle = PG.el('h4', null, '💡 Code Examples');
        exTitle.style.marginTop = '16px';
        exTitle.style.color = '#224a3a';
        body.appendChild(exTitle);
        mat.code_examples.forEach(ex => {
          if (ex.explanation) {
            const expP = PG.el('p', null, ex.explanation);
            expP.style.margin = '4px 0';
            body.appendChild(expP);
          }
          if (ex.code) {
            const exPre = PG.el('pre', null, ex.code);
            body.appendChild(exPre);
          }
        });
      }

      // 5. Common Mistakes
      if (Array.isArray(mat.common_mistakes) && mat.common_mistakes.length) {
        const misTitle = PG.el('h4', null, '⚠️ Common Mistakes to Avoid');
        misTitle.style.marginTop = '16px';
        misTitle.style.color = '#a03525';
        body.appendChild(misTitle);
        const misUl = PG.el('ul', 'goal-list');
        mat.common_mistakes.forEach(m => {
          const li = PG.el('li', null, m);
          misUl.appendChild(li);
        });
        body.appendChild(misUl);
      }

      // 6. Knowledge Check Questions
      if (Array.isArray(mat.knowledge_check) && mat.knowledge_check.length) {
        const kcTitle = PG.el('h4', null, '🧠 Quick Knowledge Check');
        kcTitle.style.marginTop = '16px';
        kcTitle.style.color = '#224a3a';
        body.appendChild(kcTitle);
        const kcUl = PG.el('ol', null);
        kcUl.style.paddingLeft = '20px';
        mat.knowledge_check.forEach(q => {
          const li = PG.el('li', null, q);
          li.style.marginBottom = '6px';
          kcUl.appendChild(li);
        });
        body.appendChild(kcUl);
      }
    } else {
      // Fallback to brief explanation if not in lesson_materials.json
      const conceptText = CONCEPT_EXPLANATIONS[lesson.concept] || lesson.concept || '';
      const expBox = PG.el('div', 'lesson-teaching-box');
      expBox.innerHTML = '<h3>📖 Concept: ' + escapeHtml(lesson.concept || '') + '</h3><p>' + escapeHtml(conceptText) + '</p>';
      body.appendChild(expBox);
    }

    // Goals
    const h2 = PG.el('h3', null, '🎯 Quest Goals');
    h2.style.marginTop = '20px';
    body.appendChild(h2);
    const ul = PG.el('ul', 'goal-list');
    (lesson.goals || []).forEach(g => {
      ul.appendChild(PG.el('li', null, g));
    });
    body.appendChild(ul);

    // Starter code preview
    const h3 = PG.el('h3', null, '💻 Code Reference & Starter');
    body.appendChild(h3);
    const pre = PG.el('pre', null, lesson.starter_code || '# Write your Python code here\n');
    body.appendChild(pre);

    // Hint
    if (lesson.rules && lesson.rules.hint) {
      const hintPara = PG.el('p', 'px-help', '💡 Tip: ' + lesson.rules.hint);
      body.appendChild(hintPara);
    }

    maxModal.classList.remove('is-hidden');
  }

  function closeMaximizeModal() {
    maxModal.classList.add('is-hidden');
  }

  function showLessonIntro() {
    levelBody.classList.add('is-hidden');
    questIntro.classList.remove('is-hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function startCoding() {
    questIntro.classList.add('is-hidden');
    levelBody.classList.remove('is-hidden');
    renderGutter(0);
    code.focus();
  }

  function fill(l) {
    lesson = l;
    document.title = l.title + ' | Python Garden';

    // 1. Populate Lesson Before the Game (Quest Intro Paper)
    const mat = findMaterial(l);
    $('intro-level').textContent = (l.chapter_title || 'Chapter') + ' · Level ' + (l.sort_order || l.id);
    $('intro-title').textContent = l.title;
    $('intro-concept').textContent = 'Concept: ' + ((mat && (mat.topic || mat.concept)) || l.concept || 'Python Basics');

    const teachBox = $('intro-teaching-text');
    teachBox.innerHTML = '';
    if (mat) {
      if (mat.simple_explanation) {
        const lead = PG.el('p', 'concept-summary', mat.simple_explanation);
        teachBox.appendChild(lead);
      }
      const cards = PG.el('div', 'concept-cards');

      // Card 1: The Big Idea
      const bigIdeaText = (mat.discussion && mat.discussion[0] && mat.discussion[0].text) || mat.simple_explanation || '';
      const card1 = PG.el('div', 'concept-card');
      card1.innerHTML = '<strong>🌟 The Big Idea</strong><p>' + escapeHtml(bigIdeaText) + '</p>';
      cards.appendChild(card1);

      // Card 2: How It Works / Syntax
      if (mat.syntax) {
        const card2 = PG.el('div', 'concept-card');
        card2.innerHTML = '<strong>🔍 How It Works (Syntax)</strong><p><code>' + escapeHtml(mat.syntax) + '</code></p>';
        cards.appendChild(card2);
      }

      // Card 3: Secret Tip / Hint
      const hintText = (l.rules && l.rules.hint) || (mat.common_mistakes && mat.common_mistakes[0]) || '';
      if (hintText) {
        const card3 = PG.el('div', 'concept-card concept-card--tip');
        card3.innerHTML = '<strong>🎯 Quick Tip</strong><p>' + escapeHtml(hintText) + '</p>';
        cards.appendChild(card3);
      }
      teachBox.appendChild(cards);
    } else {
      teachBox.textContent = CONCEPT_EXPLANATIONS[l.concept] || l.concept || 'Practice your Python skills to grow this plant.';
    }

    $('intro-code').textContent = l.starter_code || '# Write code here\n';

    const introGoals = $('intro-goals');
    introGoals.textContent = '';
    (l.goals || []).forEach(g => {
      introGoals.appendChild(PG.el('li', null, g));
    });

    const sproutLines = [
      'Every line of code helps your garden sprout!',
      'Take your time to understand the concept first.',
      'A great coder reads the instructions like a map!',
      'Water, sunlight, and clean code &mdash; let’s grow!'
    ];
    $('intro-sprout-line').innerHTML = sproutLines[(l.id || 1) % sproutLines.length];

    // 2. Populate Workspace Sidebar
    $('chapter-name').textContent = l.chapter_title;
    $('lesson-title').textContent = l.title;
    $('concept').textContent = l.concept ? 'Concept: ' + l.concept : '';

    const ul = $('goals');
    ul.textContent = '';
    (l.goals || []).forEach((g) => {
      const li = PG.el('li', l.status === 'done' ? 'is-done' : '', g);
      if (l.status === 'done') {
        const tag = PG.el('span', 'goal-verified-tag', '✓ VERIFIED');
        li.appendChild(tag);
      }
      ul.appendChild(li);
    });

    code.value = l.best_code || l.starter_code || '';
    renderGutter(0);

    // Initial console text
    out.textContent = 'Press Run to execute your code in the dynamic Python terminal.';
    setTerminalStatus('idle', '● IDLE');

    levelLoading.classList.add('is-hidden');

    // SHOW LESSON FIRST BEFORE THE GAME!
    showLessonIntro();

    if (l.status === 'done') {
      scene.classList.add('is-bloom');
    }
  }

  // Event Listeners
  btnStartCoding?.addEventListener('click', startCoding);
  btnViewLesson?.addEventListener('click', showLessonIntro);
  btnSideLesson?.addEventListener('click', showLessonIntro);
  btnMaximizeLesson?.addEventListener('click', openMaximizeModal);
  btnIntroMaximize?.addEventListener('click', openMaximizeModal);
  btnCloseMax?.addEventListener('click', closeMaximizeModal);
  btnMaxStart?.addEventListener('click', () => { closeMaximizeModal(); startCoding(); });

  btnTermClear?.addEventListener('click', () => {
    out.textContent = 'Terminal cleared. Ready for execution.';
    setTerminalStatus('idle', '● IDLE');
  });

  btnTermCopy?.addEventListener('click', () => {
    navigator.clipboard?.writeText(out.textContent).then(() => {
      PG.toast('Terminal output copied!');
    }).catch(() => {});
  });

  code.addEventListener('input', () => renderGutter(0));
  code.addEventListener('scroll', () => { gutter.scrollTop = code.scrollTop; });
  code.addEventListener('blur', () => { tabOff = false; });
  code.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { tabOff = true; return; }
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      run();
      return;
    }
    if (e.key === 'Tab' && !tabOff && !e.shiftKey) {
      e.preventDefault();
      const s = code.selectionStart;
      code.setRangeText('    ', s, code.selectionEnd, 'end');
      renderGutter(0);
    } else if (e.key !== 'Tab') {
      tabOff = false;
    }
  });

  btnRun.addEventListener('click', run);
  btnCheck.addEventListener('click', check);
  btnHint.addEventListener('click', showHint);
  btnReset.addEventListener('click', () => {
    if (!lesson || !confirm('Reset to starter code? Your edits will be replaced.')) return;
    code.value = lesson.starter_code || '';
    renderGutter(0);
    out.textContent = 'Starter code restored.';
    setTerminalStatus('idle', '● IDLE');
  });

  PG.ready.then((me) => {
    if (!me) return;
    PG.api('/api/lessons.php?id=' + lessonId)
      .then((data) => fill(data.lesson))
      .catch((err) => {
        if (err.status === 403 || err.status === 404) {
          PG.toast(err.message, true);
          setTimeout(() => location.replace('/adventure.html'), 900);
        } else {
          PG.toast(err.message, true);
        }
      });
  });
})();
