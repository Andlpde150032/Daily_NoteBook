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
    }
    // ↓ Add new entries below ↓
    // {
    //   date: '2026-05-14',
    //   title: 'Blue Team Defense & Event Viewer',
    //   tags: ['blueteam', 'defense', 'event-viewer'],
    //   file: 'posts/2026-05-14.md'
    // }
  ];

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

    // 7. Render tags
    renderTags();

    // 8. Load initial post (from URL hash or latest)
    const hash = window.location.hash.replace('#/', '');
    if (hash && POST_REGISTRY.find(p => p.date === hash)) {
      DateNavigator.navigateTo(hash);
    } else if (POST_REGISTRY.length > 0) {
      const sorted = [...POST_REGISTRY].sort((a, b) => b.date.localeCompare(a.date));
      DateNavigator.navigateTo(sorted[0].date);
    } else {
      showWelcome();
    }

    // 9. Listen hash changes
    window.addEventListener('hashchange', () => {
      const date = window.location.hash.replace('#/', '');
      if (date && POST_REGISTRY.find(p => p.date === date)) {
        DateNavigator.navigateTo(date);
      }
    });
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
