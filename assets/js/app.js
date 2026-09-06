/* ============================================================
   ezra-guiao / portfolio.sys, workspace runtime
   Vanilla JS, no dependencies. Progressive enhancement:
   nothing here is required to READ the page, only to navigate it.
   ============================================================ */
(function () {
  'use strict';

  var root = document.documentElement;
  root.classList.add('js-ready');

  /* ---------- the "filesystem" ---------- */
  var FILES = {
    'readme':       { name: 'README.md',        plain: 'Start here',        ic: '▤', dir: '',          lang: 'MD'   },
    'about':        { name: 'about.md',         plain: 'About',             ic: '▤', dir: 'portfolio', lang: 'MD'   },
    'resume':       { name: 'resume.pdf',       plain: 'Résumé',            ic: '●',      dir: 'portfolio', lang: 'PDF'  },
    'projects':     { name: 'projects.ipynb',   plain: 'Projects',          ic: '{}',     dir: 'portfolio', lang: 'PY'   },
    'experience':   { name: 'experience.log',   plain: 'Experience',        ic: '▤', dir: 'portfolio', lang: 'LOG'  },
    'skills':       { name: 'skills.json',      plain: 'Skills',            ic: '{}',     dir: 'portfolio', lang: 'JSON' },
    'contact':      { name: 'contact.sh',       plain: 'Contact',           ic: '>_',     dir: 'portfolio', lang: 'SH'   },
    'archive-data': { name: 'data-projects.md', plain: 'Earlier data work', ic: '▤', dir: 'archive',   lang: 'MD'   },
    'archive-web':  { name: 'web-projects.md',  plain: 'Earlier web work',  ic: '▤', dir: 'archive',   lang: 'MD'   }
  };
  var ORDER = ['readme', 'about', 'resume', 'projects', 'experience', 'skills', 'contact', 'archive-data', 'archive-web'];

  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var RESUME = 'Ezra_Guiao_Resume.pdf';

  var tabbar     = $('#tabbar');
  var editorBody = $('#editorBody');
  var sidebar    = $('#sidebar');
  var scrim      = $('#scrim');

  var openTabs = ['about'];
  var current  = 'about';

  /* ============================================================
     TABS + PANES
     ============================================================ */
  function renderTabs() {
    tabbar.innerHTML = '';
    openTabs.forEach(function (id) {
      var f = FILES[id];
      var tab = document.createElement('button');
      tab.className = 'tab';
      tab.id = 'tab-' + id;
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-selected', id === current ? 'true' : 'false');
      tab.setAttribute('aria-controls', 'pane-' + id);
      /* roving tabindex: the tablist is one stop, arrows move within it */
      tab.tabIndex = id === current ? 0 : -1;
      tab.dataset.file = id;

      var ic = document.createElement('span');
      ic.className = 'ic';
      ic.setAttribute('aria-hidden', 'true');
      ic.textContent = f.ic;

      var label = document.createElement('span');
      label.innerHTML = '<span class="code"></span><span class="plain"></span>';
      $('.code', label).textContent = f.name;
      $('.plain', label).textContent = f.plain;

      tab.appendChild(ic);
      tab.appendChild(label);

      if (openTabs.length > 1) {
        var x = document.createElement('span');
        x.className = 'tab-close';
        x.setAttribute('role', 'button');
        x.setAttribute('aria-label', 'Close ' + f.name);
        x.textContent = '×';
        x.addEventListener('click', function (e) { e.stopPropagation(); closeTab(id); });
        tab.appendChild(x);
      }

      tab.addEventListener('click', function () { open(id); });
      tab.addEventListener('keydown', function (e) {
        var i = openTabs.indexOf(id), next = null;
        if (e.key === 'ArrowRight') next = openTabs[(i + 1) % openTabs.length];
        else if (e.key === 'ArrowLeft') next = openTabs[(i - 1 + openTabs.length) % openTabs.length];
        else if (e.key === 'Home') next = openTabs[0];
        else if (e.key === 'End') next = openTabs[openTabs.length - 1];
        else if (e.key === 'Delete') { e.preventDefault(); closeTab(id); return; }
        if (next) {
          e.preventDefault();
          open(next);
          var el = document.getElementById('tab-' + next);
          if (el) el.focus();
        }
      });
      tabbar.appendChild(tab);
    });

    /* Tabs only exist while they're open, so a pane's aria-labelledby would
       otherwise dangle at a missing id for every closed file. Point it at the
       tab only when that tab is really on screen; each pane keeps its own
       aria-label as the fallback name. */
    ORDER.forEach(function (id) {
      var pane = document.getElementById('pane-' + id);
      if (!pane) return;
      if (openTabs.indexOf(id) !== -1) pane.setAttribute('aria-labelledby', 'tab-' + id);
      else pane.removeAttribute('aria-labelledby');
    });
  }

  function closeTab(id) {
    if (openTabs.length < 2) return;
    var i = openTabs.indexOf(id);
    openTabs.splice(i, 1);
    if (current === id) open(openTabs[Math.max(0, i - 1)]);
    else renderTabs();
  }

  function open(id, opts) {
    if (!FILES[id]) return;
    opts = opts || {};
    current = id;
    if (openTabs.indexOf(id) === -1) openTabs.push(id);

    $$('.pane').forEach(function (p) {
      p.setAttribute('data-active', p.id === 'pane-' + id ? 'true' : 'false');
    });
    $$('.tree-file').forEach(function (b) {
      b.setAttribute('aria-current', b.dataset.file === id ? 'true' : 'false');
    });

    var f = FILES[id];
    $('#crumbFile').textContent = f.name;
    $('#statusLang').textContent = f.lang;
    document.title = 'Ezra Guiao, ' + f.plain;

    renderTabs();
    renderPager();
    if (id === 'resume') mountPdf();

    if (!opts.silent) {
      var hash = '#' + id;
      if (location.hash !== hash) history.pushState({ file: id }, '', hash);
    }
    if (!opts.keepScroll) { editorBody.scrollTop = 0; if (toTop) toTop.hidden = true; }
    closeDrawer();
  }

  function renderPager() {
    var i = ORDER.indexOf(current);
    var next = ORDER[(i + 1) % ORDER.length];
    $('#pagerCurrent').textContent = FILES[current].name;
    var btn = $('#pagerNext');
    btn.innerHTML = 'next: <b></b> →';
    $('b', btn).textContent = FILES[next].name;
    btn.dataset.file = next;
  }

  $('#pagerNext').addEventListener('click', function () { open(this.dataset.file); });

  $$('.tree-file').forEach(function (b) {
    b.addEventListener('click', function () { open(b.dataset.file); });
  });
  $$('.tree-folder').forEach(function (b) {
    b.addEventListener('click', function () {
      b.setAttribute('aria-expanded', b.getAttribute('aria-expanded') === 'true' ? 'false' : 'true');
    });
  });
  $$('[data-open]').forEach(function (b) {
    b.addEventListener('click', function () { open(b.dataset.open); });
  });

  /* skills.json evidence lines jump to the work that backs the claim */
  $$('[data-goto]').forEach(function (b) {
    /* The visible text is the evidence; the accessible name should also say
       what activating it does and where it lands. */
    var skill = b.parentElement && $('.n', b.parentElement);
    var destFile = FILES[b.dataset.goto.split('#')[0]];
    if (skill && destFile) {
      b.setAttribute('aria-label',
        skill.textContent.trim() + ': ' + b.textContent.trim() +
        '. Open ' + destFile.name + '.');
    }
    b.addEventListener('click', function () {
      var parts = b.dataset.goto.split('#');
      open(parts[0]);
      if (parts[1]) {
        setTimeout(function () {
          var el = document.getElementById(parts[1]);
          if (!el) return;
          el.scrollIntoView({ block: 'center', behavior: prefersReduce() ? 'auto' : 'smooth' });
          el.classList.add('flash');
          setTimeout(function () { el.classList.remove('flash'); }, 1400);
        }, 90);
      }
    });
  });

  function prefersReduce() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  window.addEventListener('popstate', function () {
    /* Landing with no hash still has to be a real history destination,
       otherwise Back from the first click appears to do nothing. */
    var id = location.hash.replace('#', '') || 'about';
    if (FILES[id]) open(id, { silent: true });
  });

  /* ============================================================
     ARCHIVE ACCORDIONS
     ============================================================ */
  $$('.arch-head').forEach(function (h) {
    h.addEventListener('click', function () {
      var isOpen = h.getAttribute('aria-expanded') === 'true';
      h.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
      $('.arch-chev', h).textContent = isOpen ? '+' : '−';
    });
  });

  /* ============================================================
     MOBILE DRAWER
     ============================================================ */
  function openDrawer() {
    sidebar.setAttribute('data-open', 'true');
    scrim.hidden = false;
    $('#menuBtn').setAttribute('aria-expanded', 'true');
  }
  function closeDrawer() {
    sidebar.removeAttribute('data-open');
    scrim.hidden = true;
    $('#menuBtn').setAttribute('aria-expanded', 'false');
  }
  $('#menuBtn').addEventListener('click', function () {
    sidebar.getAttribute('data-open') === 'true' ? closeDrawer() : openDrawer();
  });
  $('#sideClose').addEventListener('click', closeDrawer);
  scrim.addEventListener('click', closeDrawer);

  $('#railExplorer').addEventListener('click', function () {
    var hidden = sidebar.style.display === 'none';
    sidebar.style.display = hidden ? '' : 'none';
    this.setAttribute('aria-pressed', hidden ? 'true' : 'false');
  });

  /* ============================================================
     COPY EMAIL, so nobody has to select the address by hand
     ============================================================ */
  var EMAIL = 'guiaomikhail@gmail.com';
  function copyEmail(btn) {
    var done = function (ok) {
      if (!btn) return;
      var label = $('.copy-label', btn);
      var was = label.textContent;
      label.textContent = ok ? 'Copied' : EMAIL;
      btn.classList.add('is-done');
      setTimeout(function () { label.textContent = was; btn.classList.remove('is-done'); }, 1800);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(EMAIL).then(function () { done(true); }, function () { done(false); });
    } else {
      /* older Safari / non-secure contexts */
      var ta = document.createElement('textarea');
      ta.value = EMAIL;
      ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:absolute;left:-9999px';
      document.body.appendChild(ta);
      ta.select();
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (e) {}
      document.body.removeChild(ta);
      done(ok);
    }
  }
  /* Bound by class, not id: the About hero and the Contact pane each carry
     one, and a recruiter reading contact.sh shouldn't have to go back. */
  $$('.copy-email').forEach(function (b) {
    b.addEventListener('click', function () { copyEmail(b); });
  });

  /* ============================================================
     THEME
     ============================================================ */
  var themeMeta = $('#themeColor');

  function setTheme(t) {
    root.setAttribute('data-theme', t);
    $('#themeState').textContent = t;
    /* Keep the browser chrome in step with the page, not with the OS. */
    if (themeMeta) themeMeta.setAttribute('content', t === 'light' ? '#f7f5f0' : '#0a0a0b');
    try { localStorage.setItem('theme', t); } catch (e) {}
  }
  /* The inline head script already set data-theme before first paint.
     Dark is the default for every visitor regardless of their OS setting;
     light is opt-in through the toggle and only then remembered. Only sync
     the visible label here so the two never disagree. */
  (function initTheme() {
    $('#themeState').textContent = root.getAttribute('data-theme') || 'dark';
  })();
  $('#themeBtn').addEventListener('click', function () {
    setTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
  });

  /* ============================================================
     RECRUITER MODE
     ============================================================ */
  function setMode(m) {
    root.setAttribute('data-mode', m);
    var on = m === 'recruiter';
    $('#modeState').textContent = on ? 'on' : 'off';
    $('#modeBtn').setAttribute('aria-pressed', on ? 'true' : 'false');
    if (on) hideTerm();
    try { localStorage.setItem('mode', m); } catch (e) {}
  }
  (function initMode() {
    setMode(root.getAttribute('data-mode') === 'recruiter' ? 'recruiter' : 'dev');
  })();
  $('#modeBtn').addEventListener('click', function () {
    setMode(root.getAttribute('data-mode') === 'recruiter' ? 'dev' : 'recruiter');
  });

  /* ============================================================
     TERMINAL
     ============================================================ */
  var term      = $('#terminal');
  var termBody  = $('#termBody');
  var termInput = $('#termInput');
  var termRow   = $('.term-input-row');
  var history_  = [];
  var histIdx   = -1;
  var cwd       = '~';

  function showTerm() {
    term.hidden = false;
    $('#railTerm').setAttribute('aria-pressed', 'true');
    termInput.focus();
  }
  function hideTerm() {
    term.hidden = true;
    $('#railTerm').setAttribute('aria-pressed', 'false');
  }
  function toggleTerm() { term.hidden ? showTerm() : hideTerm(); }

  $('#railTerm').addEventListener('click', toggleTerm);
  $('#termClose').addEventListener('click', hideTerm);
  $('.term-body').addEventListener('click', function (e) {
    if (window.getSelection().toString() === '') termInput.focus();
  });

  function print(html, cls) {
    var p = document.createElement('p');
    p.className = cls || 'term-out';
    p.innerHTML = html;
    termBody.insertBefore(p, termRow);
    termBody.scrollTop = termBody.scrollHeight;
  }
  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  var COMMANDS = {
    help: function () {
      print(
        '<b>available commands</b>\n' +
        '  help                 this list\n' +
        '  ls [dir]             list files\n' +
        '  cd &lt;dir&gt;             change directory\n' +
        '  cat &lt;file&gt;           print a file summary\n' +
        '  open &lt;file&gt;          open a file in the editor\n' +
        '  whoami               short bio\n' +
        '  skills               skills by category\n' +
        '  stack                the full tech stack\n' +
        '  find &lt;tech&gt;          which projects used a technology\n' +
        '  projects             featured projects\n' +
        '  git log              commit history\n' +
        '  resume [--download]  read the résumé, or save it\n' +
        '  contact              how to reach me\n' +
        '  theme [dark|light]   switch theme\n' +
        '  clear                clear the terminal'
      );
    },

    ls: function (args) {
      var dir = args[0] ? args[0].replace(/\/$/, '') : cwd;
      if (dir === '~' || dir === '.' || dir === '') {
        print('<b>README.md</b>\n<b>portfolio/</b>\n<b>archive/</b>');
      } else if (dir === 'portfolio' || dir === 'archive') {
        var out = ORDER.filter(function (id) { return FILES[id].dir === dir; })
          .map(function (id) { return '<b>' + FILES[id].name + '</b>'; }).join('\n');
        print(out);
      } else {
        print('<span class="warn">ls: ' + esc(dir) + ': no such directory</span>');
      }
    },

    cd: function (args) {
      var d = (args[0] || '~').replace(/\/$/, '');
      if (d === '~' || d === '..' || d === '/') { cwd = '~'; print('now in ~'); }
      else if (d === 'portfolio' || d === 'archive') { cwd = d; print('now in ~/' + d); }
      else print('<span class="warn">cd: ' + esc(d) + ': no such directory</span>');
    },

    cat: function (args) {
      var id = resolve(args[0]);
      if (!id) { print('<span class="warn">cat: ' + esc(args[0] || '') + ': no such file</span>'); return; }
      var body = {
        readme:         'My portfolio, laid out like the editor I work in.',
        about:          'Ezra Guiao, Data Quality Analyst at Citibank. CS grad, UP Diliman.\nMostly SQL, Python and Power BI, on the finance side of data.',
        projects:       'PSEye · Acoustify · Flood Modeling & Visualization · Bank Fraud Risk Scoring · HIV Perception Mapping',
        experience:     'Citibank (2025–) · Pointwest (2024) · HealthNow/Ayala Health (2022) · Bit Create (2022)',
        skills:         'Python, SQL, Pandas, Power BI, Next.js, TypeScript, Django, AI workflow automation.',
        contact:        'guiaomikhail@gmail.com · linkedin.com/in/ezra-guiao · github.com/Cytical',
        'archive-data': 'NBA Playoff Prediction · xv6 BF Scheduler · flood model supplementary output',
        'archive-web':  'PSE Terminal · Ugnayan'
      }[id];
      print(body + '\n\n<span class="ok">tip:</span> run <b>open ' + id + '</b> to see the full page.');
    },

    open: function (args) {
      var id = resolve(args[0]);
      if (!id) { print('<span class="warn">open: ' + esc(args[0] || '') + ': no such file</span>'); return; }
      print('<span class="ok">opening</span> ' + FILES[id].name + '...');
      setTimeout(function () { open(id); }, 160);
    },

    find: function (args) {
      var qs = (args || []).join(' ').toLowerCase().trim();
      if (!qs) { print('usage: <b>find &lt;technology or keyword&gt;</b>   e.g. <b>find power bi</b>'); return; }
      var hits = WORK.filter(function (w) {
        return (w.name + ' ' + w.tech + ' ' + w.blurb).toLowerCase().indexOf(qs) !== -1;
      });
      if (!hits.length) {
        print('<span class="warn">no project matches "' + esc(qs) + '"</span>\nTry: python, sql, power bi, next.js, django, react, c');
        return;
      }
      print(hits.map(function (w) {
        return '<b>' + esc(w.name) + '</b>' + (w.year ? '  <span class="ok">' + w.year + '</span>' : '') +
               '\n  ' + esc(w.blurb) +
               '\n  in <b>' + FILES[w.file].name + '</b>';
      }).join('\n\n'));
      print('\nrun <b>open ' + hits[0].file + '</b> to jump there.');
    },

    stack: function () {
      print(
        '<b>languages</b>       Python, SQL, JavaScript, TypeScript, C\n' +
        '<b>data</b>            Pandas, NumPy, Power BI, Tableau, PostgreSQL, MySQL, Numba, QGIS\n' +
        '<b>web</b>             React, Next.js, Angular, Vue.js, Node.js, Django, Firebase\n' +
        '<b>tooling</b>         Git, Vercel, Jupyter, BeautifulSoup\n' +
        '<b>ai</b>              prompt engineering, agent orchestration, workflow automation\n\n' +
        'run <b>find &lt;tech&gt;</b> to see where any of these were used.'
      );
    },

    whoami: function () {
      print(
        '<b>Mikhail Ezra Guiao</b>\n' +
        'Data Quality Analyst at Citibank. BS Computer Science, UP Diliman (<i>cum laude</i>).\n' +
        'MS Analytics at Georgia Tech, 2026–28. Based in Manila, PH.\n' +
        '<span class="ok">status:</span> open to data analyst and data scientist roles.'
      );
    },

    skills: function () {
      print(
        '<b>data-analytics/</b>  Python, SQL, Pandas, NumPy, Power BI, Tableau, PostgreSQL, MySQL, Numba, QGIS\n' +
        '<b>web-fullstack/</b>   TypeScript, React, Next.js, Angular, Vue.js, Node.js, Django, Firebase, Vercel\n' +
        '<b>ai-automation/</b>   prompt engineering, AI workflow automation, agent orchestration, scikit-learn'
      );
    },

    projects: function () {
      print(
        '<b>PSEye</b>                  Next.js · Postgres · <span class="ok">live</span> at pseye.site · 2,500 monthly visitors\n' +
        '<b>Acoustify</b>              Vue.js · Node · Spotify Web API, OAuth and audio analysis\n' +
        '<b>Flood Modeling</b>         Python · Numba · QGIS · NCTS-funded thesis\n' +
        '<b>Bank Fraud Risk</b>        Python · Power BI · 1M+ applications, 6.56% top-tier fraud rate\n' +
        '<b>HIV Perception Mapping</b> Python · Plotly · 35k+ households (NDHS 2022)\n\n' +
        'run <b>open projects</b> for the longer write-ups.'
      );
    },

    resume: function (args) {
      if (args && (args[0] === '--download' || args[0] === '-d')) {
        print('<span class="ok">fetching</span> ' + RESUME + '...');
        window.open(RESUME, '_blank', 'noopener');
        return;
      }
      print('<span class="ok">opening</span> resume.pdf... <span class="term-out">(<b>resume --download</b> to save it)</span>');
      setTimeout(function () { open('resume'); }, 160);
    },

    contact: function () {
      print(
        'email     <b>guiaomikhail@gmail.com</b>\n' +
        'linkedin  <b>linkedin.com/in/ezra-guiao</b>\n' +
        'github    <b>github.com/Cytical</b>\n' +
        'location  <b>Manila, Philippines</b>\n' +
        'timezone  <b>PHT · UTC+8</b>'
      );
    },

    theme: function (args) {
      var t = args[0];
      if (t !== 'dark' && t !== 'light') t = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      setTheme(t);
      print('theme → <b>' + t + '</b>');
    },

    clear: function () {
      $$('p', termBody).forEach(function (p) { p.remove(); });
    },

    sudo: function () {
      print('<span class="warn">ezra is not in the sudoers file. This incident will be reported.</span>');
    },

    exit: function () { print('nice try. use the × in the panel header.'); }
  };

  function resolve(arg) {
    if (!arg) return null;
    var q = arg.toLowerCase().replace(/^\.\//, '').replace(/^(portfolio|archive)\//, '');
    for (var i = 0; i < ORDER.length; i++) {
      var id = ORDER[i];
      if (q === id || q === FILES[id].name.toLowerCase() || q === FILES[id].name.split('.')[0].toLowerCase()) return id;
    }
    return null;
  }

  function run(raw) {
    var line = raw.trim();
    print('<span class="ps1">$</span>' + esc(line), 'term-cmd');
    if (!line) return;
    history_.push(line);
    histIdx = history_.length;

    var parts = line.split(/\s+/);
    var cmd = parts[0].toLowerCase();
    var args = parts.slice(1);

    if (cmd === 'git') {
      if (args[0] === 'log') return gitLog();
      return print('<span class="warn">git: \'' + esc(args[0] || '') + '\' is not a portfolio.sh command</span>');
    }
    if (COMMANDS[cmd]) return COMMANDS[cmd](args);
    print('<span class="warn">' + esc(cmd) + ': command not found.</span> Type <b>help</b>.');
  }

  function gitLog() {
    print(
      '<span class="ok">c1a7f30</span> (HEAD -> main) feat: PSEye ships, 282 companies on daily ingestion\n' +
      '<span class="ok">9b2e14c</span> feat: joined Citibank as Data Quality Analyst\n' +
      '<span class="ok">4f88a1d</span> feat: BS Computer Science, UP Diliman, cum laude\n' +
      '<span class="ok">7d3c092</span> feat: flood model thesis under NCTS research grant\n' +
      '<span class="ok">2ea56b8</span> feat: fraud risk scoring over 1M+ applications\n' +
      '<span class="ok">15b9c47</span> init: first commit'
    );
  }

  termInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      run(termInput.value);
      termInput.value = '';
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (histIdx > 0) termInput.value = history_[--histIdx];
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (histIdx < history_.length - 1) termInput.value = history_[++histIdx];
      else { histIdx = history_.length; termInput.value = ''; }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      var parts = termInput.value.split(/\s+/);
      var frag = (parts[parts.length - 1] || '').toLowerCase();
      var pool = parts.length > 1
        ? ORDER.map(function (id) { return FILES[id].name; })
        : Object.keys(COMMANDS).concat(['git log']);
      var hit = pool.filter(function (n) { return n.toLowerCase().indexOf(frag) === 0; });
      if (hit.length === 1) {
        parts[parts.length - 1] = hit[0];
        termInput.value = parts.join(' ');
      } else if (hit.length > 1) {
        print(hit.map(function (h) { return '<b>' + h + '</b>'; }).join('  '));
      }
    }
  });

  /* ============================================================
     RESUME VIEWER, mounted on first open rather than on page load, so the
     PDF costs nothing to visitors who never open the tab.
     ============================================================ */
  var pdfMounted = false;
  function mountPdf() {
    if (pdfMounted) return;
    var host = $('#pdfFrame');
    if (!host) return;
    pdfMounted = true;

    /* Most mobile browsers ignore inline PDF embedding and render an empty
       box, so offer the download there instead of a blank frame. */
    var narrow = window.matchMedia && window.matchMedia('(max-width: 900px)').matches;
    if (narrow) {
      host.innerHTML =
        '<p class="pdf-fallback">Inline PDF preview is not supported on most mobile browsers.<br>' +
        '<a class="btn btn--primary" href="' + RESUME + '" target="_blank" rel="noopener">Open résumé (PDF)</a></p>';
      return;
    }
    var obj = document.createElement('object');
    obj.data = host.dataset.src + '#view=FitH';
    obj.type = 'application/pdf';
    obj.setAttribute('aria-label', 'Résumé of Mikhail Ezra Guiao');
    obj.innerHTML =
      '<p class="pdf-fallback">Your browser cannot display PDFs inline.<br>' +
      '<a class="btn btn--primary" href="' + RESUME + '" target="_blank" rel="noopener">Open résumé (PDF)</a></p>';
    host.innerHTML = '';
    host.appendChild(obj);
  }

  /* ============================================================
     BACK TO TOP, because the projects and experience panes run long
     ============================================================ */
  var toTop = $('#toTop');
  editorBody.addEventListener('scroll', function () {
    toTop.hidden = editorBody.scrollTop < 400;
  }, { passive: true });
  toTop.addEventListener('click', function () {
    editorBody.scrollTo({ top: 0, behavior: prefersReduce() ? 'auto' : 'smooth' });
    var head = $('#pane-' + current + ' .pane-title, #pane-' + current + ' .hero-name, #pane-' + current + ' .readme-title');
    if (head) { head.setAttribute('tabindex', '-1'); head.focus({ preventScroll: true }); }
  });

  /* ============================================================
     LIGHTBOX. Click any screenshot to see it at full size.
     Groups by the figure's container so arrows walk one project.
     ============================================================ */
  var lb      = $('#lightbox');
  var lbImg   = $('#lbImg');
  var lbFrame = $('#lbFrame');
  var lbGroup = [];
  var lbIdx   = 0;
  var lbReturn = null;

  function figureData(fig) {
    var img = $('img', fig);
    var cap = $('figcaption', fig);
    return {
      src: img.currentSrc || img.src,
      alt: img.getAttribute('alt') || '',
      cap: cap ? cap.textContent.trim() : (img.getAttribute('alt') || ''),
      chart: fig.classList.contains('is-chart')
    };
  }

  function lbShow(i) {
    lbIdx = (i + lbGroup.length) % lbGroup.length;
    var d = lbGroup[lbIdx];
    lbImg.src = d.src;
    lbImg.alt = d.alt;
    lbImg.hidden = false;
    lbFrame.classList.toggle('is-chart', d.chart);
    $('#lbCap').textContent = d.cap;
    $('#lbCount').textContent = lbGroup.length > 1 ? (lbIdx + 1) + ' / ' + lbGroup.length : '';
    var single = lbGroup.length < 2;
    $('#lbPrev').disabled = single;
    $('#lbNext').disabled = single;
  }

  function lbOpen(fig) {
    /* Group by the strip the figure lives in, so the arrows walk one
       project's screenshots and stop there. */
    var container = fig.closest('.arch-shots') || fig.closest('.proj-shots');
    var figs = container ? $$('figure', container) : [fig];
    lbGroup = figs.map(figureData);
    lbReturn = document.activeElement;
    lb.hidden = false;
    lbShow(figs.indexOf(fig));
    $('#lbClose').focus();
  }

  function lbClose() {
    lb.hidden = true;
    lbImg.hidden = true;
    lbImg.removeAttribute('src');
    if (lbReturn && lbReturn.focus) lbReturn.focus();
  }

  $$('.arch-shots figure, .proj-shots figure').forEach(function (fig) {
    if (!$('img', fig)) return;
    fig.setAttribute('tabindex', '0');
    fig.setAttribute('role', 'button');
    fig.setAttribute('aria-label', 'View screenshot full size');
    fig.addEventListener('click', function () { lbOpen(fig); });
    fig.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); lbOpen(fig); }
    });
  });

  $('#lbScrim').addEventListener('click', lbClose);
  $('#lbClose').addEventListener('click', lbClose);
  $('#lbPrev').addEventListener('click', function () { lbShow(lbIdx - 1); });
  $('#lbNext').addEventListener('click', function () { lbShow(lbIdx + 1); });

  /* ============================================================
     WORK INDEX, one source of truth for ⌘K project entries and the
     terminal's `find`, so a recruiter can search by technology.
     ============================================================ */
  var WORK = [
    { name: 'PSEye', file: 'projects', anchor: 'proj-pseye', year: '2025',
      tech: 'nextjs next.js typescript postgres neon vercel react sql',
      blurb: 'Live market intelligence platform, 282 PSE-listed companies' },
    { name: 'Flood Modeling & Visualization System', file: 'projects', anchor: 'proj-flood', year: '2024',
      tech: 'python numpy numba qgis matplotlib simulation geospatial',
      blurb: 'NCTS-funded thesis: shallow water equations, RK2 integration' },
    { name: 'Bank Fraud Risk Scoring', file: 'projects', anchor: 'proj-fraud', year: '2024',
      tech: 'python pandas powerbi power bi fraud risk sql analytics',
      blurb: 'Composite risk score over 1M+ applications, Power BI dashboard' },
    { name: 'Perception Mapping of HIV Awareness', file: 'projects', anchor: 'proj-hiv', year: '2023',
      tech: 'python pandas plotly jupyter eda survey statistics',
      blurb: 'NDHS 2022, 35,000+ households, composite perception metric' },
    { name: 'NBA Playoff Prediction', file: 'archive-data', year: '2023',
      tech: 'python numpy matplotlib scikit-learn sklearn logistic regression random forest machine learning',
      blurb: 'Logistic regression, linear regression and random forest classifiers' },
    { name: 'BF Scheduler Variant in xv6', file: 'archive-data', year: '2023',
      tech: 'c x86 operating systems kernel scheduler skiplist',
      blurb: 'Skiplist-backed scheduler with virtual deadlines' },
    { name: 'Global Development Indicators', file: 'archive-data',
      tech: 'python matplotlib pandas visualization dataviz',
      blurb: 'GDP per capita against population, 2018' },
    { name: 'Acoustify', file: 'projects', anchor: 'proj-acoustify', year: '2023',
      tech: 'vue vuejs node nodejs python rest api oauth spotify',
      blurb: 'Spotify Web API app with OAuth via a Node server' },
    { name: 'Philippine Stock Exchange Terminal', file: 'archive-web', year: '2022',
      tech: 'django python beautifulsoup scraping finance tradingview',
      blurb: 'PSE API plus scraped Marketwatch data' },
    { name: 'Ugnayan', file: 'archive-web', year: '2023',
      tech: 'react reactjs typescript firebase bootstrap agile',
      blurb: 'Student-org matching platform, 4-person Agile team' }
  ];

  function gotoWork(w) {
    open(w.file);
    if (!w.anchor) return;
    setTimeout(function () {
      var el = document.getElementById(w.anchor);
      if (!el) return;
      el.scrollIntoView({ block: 'center', behavior: prefersReduce() ? 'auto' : 'smooth' });
      el.classList.add('flash');
      setTimeout(function () { el.classList.remove('flash'); }, 1400);
    }, 90);
  }

  /* ============================================================
     COMMAND PALETTE
     ============================================================ */
  var palette      = $('#palette');
  var paletteInput = $('#paletteInput');
  var paletteList  = $('#paletteList');
  var lastFocus    = null;
  var results      = [];
  var selIdx       = 0;

  function actions() {
    var list = ORDER.map(function (id) {
      return {
        group: 'Files',
        ic: FILES[id].ic,
        label: 'Open ' + FILES[id].name,
        alt: FILES[id].plain,
        hint: FILES[id].dir ? FILES[id].dir + '/' : '',
        go: function () { open(id); }
      };
    });

    WORK.forEach(function (w) {
      list.push({
        group: 'Projects', ic: '◆', label: 'Go to ' + w.name,
        alt: w.tech + ' ' + w.blurb + ' project ' + (w.year || ''),
        hint: FILES[w.file].name,
        go: function () { gotoWork(w); }
      });
    });

    list.push(
      { group: 'Actions', ic: '↓', label: 'Download résumé (PDF)', alt: 'cv resume',
        go: function () { window.open(RESUME, '_blank', 'noopener'); } },
      { group: 'Actions', ic: '▤', label: 'Read résumé in page', alt: 'cv resume view preview',
        go: function () { open('resume'); } },
      { group: 'Actions', ic: '>_', label: 'Toggle terminal', alt: 'shell console', hint: 'Ctrl+`',
        go: toggleTerm },
      { group: 'Actions', ic: '○', label: 'Toggle recruiter mode', alt: 'plain english',
        go: function () { setMode(root.getAttribute('data-mode') === 'recruiter' ? 'dev' : 'recruiter'); } },
      { group: 'Actions', ic: '◐', label: 'Toggle theme', alt: 'dark light',
        go: function () { setTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'); } },
      { group: 'Links', ic: '↗', label: 'Email guiaomikhail@gmail.com', alt: 'contact mail',
        go: function () { location.href = 'mailto:guiaomikhail@gmail.com'; } },
      { group: 'Links', ic: '⧉', label: 'Copy email address', alt: 'clipboard contact',
        go: function () { copyEmail($('#copyEmail')); } },
      { group: 'Links', ic: '↗', label: 'GitHub, github.com/Cytical', alt: 'code repos',
        go: function () { window.open('https://github.com/Cytical', '_blank', 'noopener'); } },
      { group: 'Links', ic: '↗', label: 'LinkedIn, linkedin.com/in/ezra-guiao', alt: 'profile',
        go: function () { window.open('https://www.linkedin.com/in/ezra-guiao/', '_blank', 'noopener'); } },
      { group: 'Links', ic: '↗', label: 'PSEye, pseye.site', alt: 'live project demo',
        go: function () { window.open('https://pseye.site', '_blank', 'noopener'); } }
    );
    return list;
  }
  var ALL = actions();

  /* Fold case and accents so "resume" matches "résumé" and vice versa. */
  function norm(s) {
    s = String(s).toLowerCase();
    return s.normalize ? s.normalize('NFD').replace(/[̀-ͯ]/g, '') : s;
  }

  /* subsequence match, so "dlrs" finds "Download résumé" */
  function fuzzy(q, s) {
    if (!q) return true;
    var i = 0;
    for (var j = 0; j < s.length && i < q.length; j++) if (s[j] === q[i]) i++;
    return i === q.length;
  }

  function renderPalette() {
    var q = norm(paletteInput.value.trim());
    if (!q) {
      results = ALL.slice();
    } else {
      /* Literal substring hits are what people actually mean. Subsequence
         matching alone is far too loose. It let "flood" pull in three
         unrelated projects and pushed the résumé actions below them for
         the query "resume". Fall back to it only when nothing matches
         literally, so shorthand like "dlrs" still works. */
      results = ALL.filter(function (a) {
        return norm(a.label + ' ' + (a.alt || '')).indexOf(q) !== -1;
      });
      if (!results.length) {
        results = ALL.filter(function (a) { return fuzzy(q, norm(a.label)); });
      }
    }
    selIdx = 0;
    paletteList.innerHTML = '';

    if (!results.length) {
      paletteList.innerHTML = '<p class="palette-empty">no matches</p>';
      return;
    }
    var group = null;
    results.forEach(function (a, i) {
      if (a.group !== group) {
        group = a.group;
        var g = document.createElement('div');
        g.className = 'palette-group';
        g.textContent = group;
        paletteList.appendChild(g);
      }
      var b = document.createElement('button');
      b.className = 'palette-item';
      b.dataset.idx = i;
      b.setAttribute('data-sel', i === 0 ? 'true' : 'false');
      b.innerHTML = '<span class="ic"></span><span class="lbl"></span>' + (a.hint ? '<span class="hint"></span>' : '');
      $('.ic', b).textContent = a.ic;
      $('.lbl', b).textContent = a.label;
      if (a.hint) $('.hint', b).textContent = a.hint;
      b.addEventListener('click', function () { closePalette(); a.go(); });
      b.addEventListener('mousemove', function () { select(i); });
      paletteList.appendChild(b);
    });
  }

  function select(i) {
    if (!results.length) return;
    selIdx = (i + results.length) % results.length;
    $$('.palette-item', paletteList).forEach(function (el) {
      var on = +el.dataset.idx === selIdx;
      el.setAttribute('data-sel', on ? 'true' : 'false');
      if (on) el.scrollIntoView({ block: 'nearest' });
    });
  }

  function openPalette() {
    lastFocus = document.activeElement;
    palette.hidden = false;
    paletteInput.value = '';
    renderPalette();
    paletteInput.focus();
  }
  function closePalette() {
    palette.hidden = true;
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  paletteInput.addEventListener('input', renderPalette);
  paletteInput.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowDown')      { e.preventDefault(); select(selIdx + 1); }
    else if (e.key === 'ArrowUp')   { e.preventDefault(); select(selIdx - 1); }
    else if (e.key === 'Enter')     { e.preventDefault(); var a = results[selIdx]; if (a) { closePalette(); a.go(); } }
    else if (e.key === 'Escape')    { e.preventDefault(); closePalette(); }
    else if (e.key === 'Tab')       { e.preventDefault(); select(selIdx + (e.shiftKey ? -1 : 1)); }
  });
  $('#paletteScrim').addEventListener('click', closePalette);
  $('#paletteBtn').addEventListener('click', openPalette);
  $('#railSearch').addEventListener('click', openPalette);

  /* ============================================================
     GLOBAL KEYS
     ============================================================ */
  document.addEventListener('keydown', function (e) {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      palette.hidden ? openPalette() : closePalette();
      return;
    }
    if (e.ctrlKey && e.key === '`') { e.preventDefault(); toggleTerm(); return; }
    if (!lb.hidden) {
      if (e.key === 'Escape')     { e.preventDefault(); lbClose(); return; }
      if (e.key === 'ArrowLeft')  { e.preventDefault(); lbShow(lbIdx - 1); return; }
      if (e.key === 'ArrowRight') { e.preventDefault(); lbShow(lbIdx + 1); return; }
    }
    if (e.key === 'Escape') {
      if (!palette.hidden) closePalette();
      else if (sidebar.getAttribute('data-open') === 'true') closeDrawer();
    }
  });

  /* ============================================================
     BOOT
     ============================================================ */
  (function boot() {
    var id = location.hash.replace('#', '');
    if (FILES[id] && id !== 'about') openTabs = ['about', id];
    var start = FILES[id] ? id : 'about';
    open(start, { silent: true });
    /* Anchor the entry the user landed on so Back has somewhere to return to. */
    try { history.replaceState({ file: start }, '', location.hash || '#' + start); } catch (e) {}
  })();
})();
