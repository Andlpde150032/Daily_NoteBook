/* ============================================
   App — Main Application Controller
   ============================================ */

const App = (() => {
  // ── Post Registry ──
  // Add new posts here. Order doesn't matter, they'll be sorted by date.
  const POST_REGISTRY = [
    {
      date: '2026-05-13',
      title: 'AD Penetration Testing (Red Team)',
      tags: ['redteam', 'active-directory', 'pentest', 'smb', 'winrm'],
      file: 'posts/2026-05-13.md'
    },
    {
      date: '2026-05-14',
      title: 'AD Incident Response & Forensics (Blue Team)',
      tags: ['blueteam', 'forensics', 'event-viewer', 'powershell', 'active-directory'],
      file: 'posts/2026-05-14.md'
    },
    {
      date: '2026-05-15',
      title: 'CHIẾN KÝ RED VS BLUE: Trận Chiến Tại AnDLP',
      tags: ['blueteam', 'redteam', 'ad-pentest', 'incident-response', 'kerberos'],
      file: 'posts/2026-05-15.md'
    }
  ];

  // ── Cheatsheet Registry ──
  const CHEATSHEET_REGISTRY = [
    {
      id: 'linux-base',
      category: 'Linux',
      title: 'Linux Essentials',
      icon: '🐧',
      file: 'cheatsheets/linux.md'
    },
    {
      id: 'redteam-ad',
      category: 'Red Team',
      title: 'AD Pentest Cheatsheet',
      icon: '⚔️',
      file: 'cheatsheets/redteam.md'
    },
    {
      id: 'blueteam-defense',
      category: 'Blue Team',
      title: 'Defense & Hardening',
      icon: '🛡️',
      file: 'cheatsheets/blueteam.md'
    }
  ];

  let viewMode = 'journal'; // 'journal' or 'notebook'

  async function init() {
    // 1. Theme
    ThemeManager.init();

    // 2. Matrix Effect
    MatrixEffect.init();

    // 3. Date Navigator
    DateNavigator.init(POST_REGISTRY, loadPost);

    // 4. Search
    Search.init(POST_REGISTRY);

    // 5. Mobile menu
    setupMobileMenu();

    // 6. Navigation buttons
    setupNavButtons();

    // Initialize Tabs
    setupTabs();

    // Route initial hash
    route();

    // 7. Render tags
    renderTags();

    // 8. TOC Active State on Scroll
    window.addEventListener('scroll', throttle(updateTOCActiveState, 100));

    // 9. Listen hash changes
    window.addEventListener('hashchange', route);
  }

  function route() {
    const hash = window.location.hash || '#/';
    
    // Handle Notebook routes: #/notebook/id
    if (hash.startsWith('#/notebook/')) {
      const id = hash.replace('#/notebook/', '');
      const sheet = CHEATSHEET_REGISTRY.find(s => s.id === id);
      if (sheet) {
        switchViewMode('notebook', false);
        loadContent(sheet.file, 'notebook', id);
        return;
      }
    }

    // Handle Journal routes: #/yyyy-mm-dd
    const datePattern = /^#\/(\d{4}-\d{2}-\d{2})$/;
    const match = hash.match(datePattern);

    if (match) {
      const date = match[1];
      if (POST_REGISTRY.find(p => p.date === date)) {
        switchViewMode('journal', false);
        DateNavigator.navigateTo(date);
      }
    } else if (hash === '#/') {
      // Default: Load latest journal post
      if (POST_REGISTRY.length > 0) {
        const latest = [...POST_REGISTRY].sort((a, b) => b.date.localeCompare(a.date))[0];
        window.location.hash = `#/${latest.date}`;
      }
    }
  }

  function setupTabs() {
    const tabJournal = document.getElementById('tab-journal');
    const tabNotebook = document.getElementById('tab-notebook');

    if (tabJournal) {
      tabJournal.addEventListener('click', () => {
        if (viewMode === 'journal') return;
        switchViewMode('journal');
        // Load latest journal
        const latest = [...POST_REGISTRY].sort((a, b) => b.date.localeCompare(a.date))[0];
        window.location.hash = `#/${latest.date}`;
      });
    }
    if (tabNotebook) {
      tabNotebook.addEventListener('click', () => {
        if (viewMode === 'notebook') return;
        switchViewMode('notebook');
        // Load first notebook
        if (CHEATSHEET_REGISTRY.length > 0) {
          window.location.hash = `#/notebook/${CHEATSHEET_REGISTRY[0].id}`;
        }
      });
    }
  }

  function switchViewMode(mode, triggerRender = true) {
    if (viewMode === mode && !triggerRender) return;
    viewMode = mode;

    // Update UI
    const tabJournal = document.getElementById('tab-journal');
    const tabNotebook = document.getElementById('tab-notebook');
    
    if (tabJournal) tabJournal.classList.toggle('sidebar__tab--active', mode === 'journal');
    if (tabNotebook) tabNotebook.classList.toggle('sidebar__tab--active', mode === 'notebook');

    if (triggerRender) {
      if (mode === 'journal') {
        DateNavigator.renderSidebar();
      } else {
        renderNotebookList();
      }
    }
  }

  function renderNotebookList() {
    const container = document.getElementById('date-list');
    if (!container) return;

    container.innerHTML = '';

    const groups = {};
    CHEATSHEET_REGISTRY.forEach(sheet => {
      if (!groups[sheet.category]) groups[sheet.category] = [];
      groups[sheet.category].push(sheet);
    });

    Object.keys(groups).forEach(cat => {
      const catTitle = document.createElement('div');
      catTitle.className = 'notebook-category';
      catTitle.textContent = cat;
      container.appendChild(catTitle);

      groups[cat].forEach(sheet => {
        const entry = document.createElement('div');
        const isActive = window.location.hash === `#/notebook/${sheet.id}`;
        entry.className = `notebook-entry ${isActive ? 'active' : ''}`;
        entry.innerHTML = `
          <span class="notebook-entry__icon">${sheet.icon}</span>
          <span class="notebook-entry__title">${sheet.title}</span>
        `;
        entry.onclick = () => {
          window.location.hash = `#/notebook/${sheet.id}`;
        };
        container.appendChild(entry);
      });
    });
  }

  async function loadContent(filePath, type, id) {
    try {
      const contentEl = document.getElementById('post-content');
      contentEl.innerHTML = `
        <div class="loading">
          <div class="loading__spinner"></div>
          <span>Loading content...</span>
        </div>`;

      const response = await fetch(filePath);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const rawMd = await response.text();
      
      // Cheatsheets usually don't have frontmatter, but we check anyway
      const { body } = MarkdownRenderer.parseFrontmatter(rawMd);
      
      contentEl.innerHTML = `
        <div class="markdown-body animate-fade-in" style="padding-top: var(--space-8);">
          ${MarkdownRenderer.render(body)}
        </div>`;

      // Post-render
      generateTOC();
      setupImageModal();
      hljs.highlightAll();
      
      if (window.mermaid) {
        mermaid.run();
      }

      window.scrollTo({ top: 0, behavior: 'smooth' });

      if (type === 'notebook') {
        renderNotebookList(); // Refresh active state
      }
    } catch (err) {
      console.error(err);
      contentEl.innerHTML = `<div class="error">Error loading content: ${err.message}</div>`;
    }
  }

  async function loadPost(date) {
    const post = POST_REGISTRY.find(p => p.date === date);
    if (!post) return;

    const contentEl = document.getElementById('post-content');
    if (!contentEl) return;

    // Show loading
    contentEl.innerHTML = `
      <div class="loading">
        <div class="loading__spinner"></div>
        <span>Loading entry...</span>
      </div>`;

    try {
      const response = await fetch(post.file);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const rawMd = await response.text();
      const { meta, body } = MarkdownRenderer.parseFrontmatter(rawMd);

      // Update Title & Meta for SEO
      document.title = `${post.title} — Daily NoteBook`;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', `Bài viết ngày ${post.date}: ${post.title}. Lộ trình học tập Cybersecurity hàng ngày.`);
      }

      // Build post header
      const d = new Date(post.date);
      const dateStr = d.toLocaleDateString('vi-VN', {
        weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric'
      });

      const tagsHtml = (post.tags || []).map(t =>
        `<span class="tag">#${t}</span>`
      ).join('');

      const headerHtml = `
        <div class="post-header animate-fade-in">
          <div class="post-header__meta">
            <span class="post-header__meta-item">📅 ${dateStr}</span>
            <span class="post-header__meta-item">🎯 ${meta.target || 'Lab Exercise'}</span>
            <span class="post-header__meta-item">👤 ${meta.role || 'Learner'}</span>
          </div>
          <h1 class="post-header__title">${post.title}</h1>
          <div class="tags-container" style="margin-top: var(--space-3);">
            ${tagsHtml}
          </div>
        </div>`;

      // Render markdown body
      const bodyHtml = MarkdownRenderer.render(body);

      // Navigation buttons
      const navHtml = `
        <div class="post-nav">
          <button class="post-nav__btn" id="prev-post" onclick="DateNavigator.goPrev()">
            ◂ Previous
          </button>
          <button class="post-nav__btn" id="next-post" onclick="DateNavigator.goNext()">
            Next ▸
          </button>
        </div>`;

      contentEl.innerHTML = headerHtml +
        `<div class="markdown-body animate-fade-in">${bodyHtml}</div>` +
        navHtml;

      // Initialize mermaid diagrams
      initMermaid();

      // Setup Copy Buttons
      setupCopyButtons();

      // Generate TOC
      generateTOC();

      // Setup Image Modal
      setupImageModal();

      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (err) {
      contentEl.innerHTML = `
        <div class="empty-state">
          <div class="empty-state__icon">⚠️</div>
          <p>Failed to load entry: ${err.message}</p>
          <p style="margin-top: var(--space-2); font-size: var(--text-sm);">
            Make sure the file exists: <code>${post.file}</code>
          </p>
        </div>`;
    }
  }

  function initMermaid() {
    if (typeof mermaid !== 'undefined') {
      const theme = document.documentElement.getAttribute('data-theme');
      mermaid.initialize({
        startOnLoad: false,
        theme: theme === 'dark' ? 'dark' : 'default',
        securityLevel: 'loose',
        fontFamily: 'JetBrains Mono, monospace'
      });

      document.querySelectorAll('.mermaid').forEach((el, i) => {
        const id = `mermaid-${Date.now()}-${i}`;
        try {
          mermaid.render(id, el.textContent.trim()).then(({ svg }) => {
            el.innerHTML = svg;
          }).catch(() => {
            // If render fails, leave the text
          });
        } catch (e) {
          // Mermaid v9 style
          try {
            el.removeAttribute('data-processed');
            mermaid.init(undefined, el);
          } catch (e2) { /* ignore */ }
        }
      });
    }
  }

  function setupCopyButtons() {
    const codeBlocks = document.querySelectorAll('.markdown-body pre');
    codeBlocks.forEach(pre => {
      // Wrap pre in code-wrapper
      const wrapper = document.createElement('div');
      wrapper.className = 'code-wrapper animate-fade-in';
      pre.parentNode.insertBefore(wrapper, pre);
      wrapper.appendChild(pre);

      // Add copy button
      const btn = document.createElement('button');
      btn.className = 'copy-btn';
      btn.textContent = 'Copy';
      wrapper.appendChild(btn);

      btn.addEventListener('click', () => {
        const code = pre.querySelector('code').innerText;
        navigator.clipboard.writeText(code).then(() => {
          btn.textContent = 'Copied!';
          btn.classList.add('copied');
          setTimeout(() => {
            btn.textContent = 'Copy';
            btn.classList.remove('copied');
          }, 2000);
        });
      });
    });
  }

  function generateTOC() {
    const content = document.querySelector('.markdown-body');
    const tocList = document.getElementById('toc-list');
    if (!content || !tocList) return;

    tocList.innerHTML = '';
    const headings = content.querySelectorAll('h2, h3');

    if (headings.length === 0) {
      document.getElementById('toc').style.display = 'none';
      return;
    } else {
      // Show TOC if on desktop (handled by CSS, but ensure it's not force-hidden)
      document.getElementById('toc').style.display = '';
    }

    headings.forEach((heading, i) => {
      // Add ID if not present
      if (!heading.id) {
        heading.id = `heading-${i}`;
      }

      const li = document.createElement('li');
      li.className = `toc__item toc__item--${heading.tagName.toLowerCase()}`;

      const a = document.createElement('a');
      a.href = `#${heading.id}`;
      a.className = 'toc__link';
      a.textContent = heading.innerText.replace(/^#+\s*/, ''); // Strip markdown chars if any

      a.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.getElementById(heading.id);
        const headerHeight = document.getElementById('header').offsetHeight;
        window.scrollTo({
          top: target.offsetTop - headerHeight - 20,
          behavior: 'smooth'
        });
        // Update URL without jump
        history.pushState(null, null, `#${heading.id}`);
      });

      li.appendChild(a);
      tocList.appendChild(li);
    });
  }

  function setupImageModal() {
    const modal = document.getElementById('image-modal');
    const modalImg = document.getElementById('modal-img');
    const modalCaption = document.getElementById('modal-caption');
    const modalCounter = document.getElementById('modal-counter');
    const modalPrev = document.getElementById('modal-prev');
    const modalNext = document.getElementById('modal-next');

    if (!modal || !modalImg) return;

    let currentImages = [];
    let currentIndex = 0;

    // Find all images in markdown content
    const images = document.querySelectorAll('.markdown-body img');
    currentImages = Array.from(images);

    images.forEach((img, index) => {
      img.addEventListener('click', () => {
        currentIndex = index;
        updateModal();
        modal.classList.add('image-modal--active');
        document.body.style.overflow = 'hidden'; // Lock scroll
      });
    });

    function updateModal(direction = 'next') {
      const img = currentImages[currentIndex];
      
      // Add animation classes
      modalImg.classList.remove('slide-in-right', 'slide-in-left');
      void modalImg.offsetWidth; // Force reflow
      
      modalImg.src = img.src;
      modalCaption.textContent = `Ảnh ${currentIndex + 1}: ${img.alt || 'No caption'}`;
      modalCounter.textContent = `${currentIndex + 1} / ${currentImages.length}`;
      
      modalImg.classList.add(direction === 'next' ? 'slide-in-right' : 'slide-in-left');
    }

    function prev() {
      if (currentImages.length === 0) return;
      currentIndex = (currentIndex - 1 + currentImages.length) % currentImages.length;
      updateModal('prev');
    }

    function next() {
      if (currentImages.length === 0) return;
      currentIndex = (currentIndex + 1) % currentImages.length;
      updateModal('next');
    }

    modalPrev.onclick = (e) => { e.stopPropagation(); prev(); };
    modalNext.onclick = (e) => { e.stopPropagation(); next(); };

    modal.onclick = () => {
      modal.classList.remove('image-modal--active');
      document.body.style.overflow = ''; // Unlock scroll
    };

    // Global keyboard listener for modal
    document.addEventListener('keydown', (e) => {
      if (!modal.classList.contains('image-modal--active')) return;

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prev();
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        next();
      }
      if (e.key === 'Escape') {
        modal.classList.remove('image-modal--active');
        document.body.style.overflow = '';
      }
    });
  }

  function updateTOCActiveState() {
    const headings = Array.from(document.querySelectorAll('.markdown-body h2, .markdown-body h3'));
    const tocLinks = document.querySelectorAll('.toc__link');
    const headerHeight = document.getElementById('header').offsetHeight;
    const scrollPos = window.scrollY + headerHeight + 50;

    let activeId = '';
    for (let i = headings.length - 1; i >= 0; i--) {
      if (scrollPos >= headings[i].offsetTop) {
        activeId = headings[i].id;
        break;
      }
    }

    tocLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === `#${activeId}`);
    });
  }

  function throttle(fn, wait) {
    let time = Date.now();
    return function() {
      if ((time + wait - Date.now()) < 0) {
        fn();
        time = Date.now();
      }
    }
  }

  function showWelcome() {
    const contentEl = document.getElementById('post-content');
    if (!contentEl) return;

    contentEl.innerHTML = `
      <div class="welcome animate-fade-in">
        <div class="welcome__icon">🛡️</div>
        <h2 class="welcome__title">Daily NoteBook</h2>
        <p class="welcome__text">
          Welcome to my cybersecurity learning journal.<br>
          Select a date from the sidebar to start reading,<br>
          or use <kbd>←</kbd> <kbd>→</kbd> to navigate.
        </p>
      </div>`;
  }

  function setupMobileMenu() {
    const toggle = document.getElementById('menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.sidebar-overlay');

    if (toggle && sidebar) {
      toggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
        if (overlay) overlay.classList.toggle('active');
      });
    }

    if (overlay) {
      overlay.addEventListener('click', () => {
        sidebar.classList.remove('open');
        overlay.classList.remove('active');
      });
    }
  }

  function setupNavButtons() {
    // Delegated via onclick in HTML
  }

  function renderTags() {
    const container = document.getElementById('tags-cloud');
    if (!container) return;

    const allTags = {};
    POST_REGISTRY.forEach(post => {
      (post.tags || []).forEach(tag => {
        allTags[tag] = (allTags[tag] || 0) + 1;
      });
    });

    const tagStyles = ['', 'tag--secondary', 'tag--accent'];
    const tagHtml = Object.entries(allTags)
      .sort((a, b) => b[1] - a[1])
      .map((entry, i) => {
        const [tag, count] = entry;
        const style = tagStyles[i % tagStyles.length];
        return `<span class="tag ${style}" data-tag="${tag}">#${tag}</span>`;
      })
      .join('');

    container.innerHTML = tagHtml;

    // Click tag to search
    container.querySelectorAll('.tag').forEach(el => {
      el.addEventListener('click', () => {
        const input = document.getElementById('search-input');
        if (input) {
          input.value = el.dataset.tag;
          input.dispatchEvent(new Event('input'));
        }
      });
    });
  }

  return { init };
})();

// ── Boot ──
document.addEventListener('DOMContentLoaded', App.init);
