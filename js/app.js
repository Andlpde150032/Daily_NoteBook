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

    // 9. Glitch Overlay
    setupGlitchOverlay();

    // 10. Listen hash changes
    window.addEventListener('hashchange', route);
  }

  function setupGlitchOverlay() {
    if (document.querySelector('.glitch-overlay')) return;
    const overlay = document.createElement('div');
    overlay.className = 'glitch-overlay';
    document.body.appendChild(overlay);
  }

  function triggerGlitch(duration = 300) {
    const overlay = document.querySelector('.glitch-overlay');
    if (overlay) {
      overlay.classList.add('glitch-overlay--active');
      setTimeout(() => {
        overlay.classList.remove('glitch-overlay--active');
      }, duration);
    }
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
    } else if (hash === '#/about' || hash === '#/') {
      // Default: Show the About / Landing page
      showAboutPage();
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
          <span>Decoding stream...</span>
        </div>`;
      
      triggerGlitch(300);

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

      // Render Matrix effects for Blue vs Red themes
      renderMatrixEffects();

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
        <span>Intercepting packet...</span>
      </div>`;
    
    triggerGlitch(300);

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
        
        // Glitch effect
        btn.classList.add('copy-glitch');
        const originalText = btn.textContent;
        const targetText = 'COPIED!';
        const chars = '01<>/_#X*';
        let iterations = 0;

        const scrambleInterval = setInterval(() => {
          btn.textContent = targetText
            .split('')
            .map((char, index) => {
              if (index < iterations) return targetText[index];
              return chars[Math.floor(Math.random() * chars.length)];
            })
            .join('');
          
          if (iterations >= targetText.length) {
            clearInterval(scrambleInterval);
            btn.classList.add('copied');
            btn.classList.remove('copy-glitch');
          }
          iterations += 0.5;
        }, 3000 / targetText.length / 10); // Rapid scramble

        navigator.clipboard.writeText(code).then(() => {
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
        const targetTop = target.getBoundingClientRect().top + window.scrollY;

        window.scrollTo({
          top: targetTop - headerHeight - 20,
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
    const scrollPos = window.scrollY + headerHeight + 100; // Increased buffer for better UX

    let activeId = '';

    // Check if we are at the bottom of the page
    const isAtBottom = (window.innerHeight + window.scrollY) >= (document.documentElement.scrollHeight - 50);

    if (isAtBottom && headings.length > 0) {
      activeId = headings[headings.length - 1].id;
    } else {
      for (let i = headings.length - 1; i >= 0; i--) {
        const targetTop = headings[i].getBoundingClientRect().top + window.scrollY;
        if (scrollPos >= targetTop) {
          activeId = headings[i].id;
          break;
        }
      }
    }

    tocLinks.forEach(link => {
      const href = link.getAttribute('href');
      const isActive = href === `#${activeId}`;
      link.classList.toggle('active', isActive);
      
      // Optional: scroll the TOC sidebar to keep the active item visible if TOC is long
      if (isActive && activeId) {
        // link.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
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

  function showAboutPage() {
    const contentEl = document.getElementById('post-content');
    if (!contentEl) return;

    // Update page title
    document.title = 'About — Daily NoteBook';

    // Hide TOC since this is a static page
    const toc = document.getElementById('toc');
    if (toc) toc.style.display = 'none';

    triggerGlitch(300);

    const latestPost = [...POST_REGISTRY].sort((a, b) => b.date.localeCompare(a.date))[0];

    contentEl.innerHTML = `
      <div class="about-page animate-fade-in">

        <!-- Hero -->
        <div class="about-hero">
          <div class="about-hero__avatar">
            <div class="about-hero__avatar-inner">💻</div>
          </div>
          <div class="about-hero__text">
            <h1 class="about-hero__name">Dương Lê Phú An</h1>
            <p class="about-hero__title">Software Engineer → Network / Security Engineer</p>
            <p class="about-hero__location">📍 Hồ Chí Minh, Việt Nam</p>
          </div>
        </div>

        <div class="about-grid">

          <!-- Left Column -->
          <div class="about-col">

            <!-- Về tôi -->
            <div class="about-card">
              <h2 class="about-card__title"><span class="about-card__icon">👤</span> Về tôi</h2>
              <p class="about-card__text">
                Tôi là một <strong>Software Engineer</strong> đang trên hành trình chuyển hướng sang lĩnh vực <strong>Network Engineering</strong> và <strong>Cybersecurity</strong>.
                Nền tảng lập trình giúp tôi hiểu sâu hơn về cách hệ thống vận hành — và đó chính là lợi thế khi bước chân vào Security.
              </p>
              <p class="about-card__text">
                Blog này là nhật ký học tập thực chiến hàng ngày của tôi — ghi lại từng buổi lab, từng lỗi sảy, từng ánh đèn "eureka" trên con đường chuyển ngành.
              </p>
              <p class="about-card__text">
                Tôi tin rằng: <em>"Một lập trình viên hiểu mạng — và một kỹ sư mạng biết code — sẽ là vũ khí đáng sợ nhất."</em>
              </p>
            </div>

            <!-- Mục tiêu Blog -->
            <div class="about-card">
              <h2 class="about-card__title"><span class="about-card__icon">🎯</span> Mục tiêu của Blog</h2>
              <ul class="about-list">
                <li>📝 Ghi lại hành trình chuyển ngành từ Software sang Network / Security</li>
                <li>🌐 Nắm vững kiến thức CCNA — nền tảng bắt buộc của mọi Network Engineer</li>
                <li>🔴 Thực hành các kỹ thuật Pentesting / Security trong môi trường lab an toàn</li>
                <li>📈 Theo dõi tiến độ học tập cá nhân mỗi ngày — có chứng cứ, có kết quả</li>
                <li>💡 Đóng góp trải nghiệm thực tế cho cộng đồng đang có cùng định hướng</li>
              </ul>
            </div>

          </div>

          <!-- Right Column -->
          <div class="about-col">

            <!-- Kỹ năng -->
            <div class="about-card">
              <h2 class="about-card__title"><span class="about-card__icon">⚡</span> Kỹ năng &amp; Công cụ</h2>
              <div class="about-skills">
                <div class="about-skill-group">
                  <span class="about-skill-label">Software (Nền tảng)</span>
                  <div class="about-skill-tags">
                    <span class="tag">Python</span>
                    <span class="tag">JavaScript</span>
                    <span class="tag">SQL</span>
                    <span class="tag">Git</span>
                    <span class="tag">Linux CLI</span>
                  </div>
                </div>
                <div class="about-skill-group">
                  <span class="about-skill-label">Network (Đang học)</span>
                  <div class="about-skill-tags">
                    <span class="tag tag--secondary">CCNA</span>
                    <span class="tag tag--secondary">TCP/IP</span>
                    <span class="tag tag--secondary">Active Directory</span>
                    <span class="tag tag--secondary">WinRM / SMB</span>
                  </div>
                </div>
                <div class="about-skill-group">
                  <span class="about-skill-label">Security (Lab thực chiến)</span>
                  <div class="about-skill-tags">
                    <span class="tag tag--accent">Nmap</span>
                    <span class="tag tag--accent">Evil-WinRM</span>
                    <span class="tag tag--accent">Mimikatz</span>
                    <span class="tag tag--accent">Event Viewer</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Hành trình gần đây -->
            <div class="about-card">
              <h2 class="about-card__title"><span class="about-card__icon">🗓️</span> Hành trình gần đây</h2>
              <div class="about-timeline">
                <div class="about-timeline__item">
                  <span class="about-timeline__date">15/05</span>
                  <div>
                    <div class="about-timeline__title">Chiến Ký Red vs Blue</div>
                    <div class="about-timeline__desc">Pass-the-Hash, Golden Ticket &amp; Blue Team Defense</div>
                  </div>
                </div>
                <div class="about-timeline__item">
                  <span class="about-timeline__date">14/05</span>
                  <div>
                    <div class="about-timeline__title">Incident Response &amp; Forensics</div>
                    <div class="about-timeline__desc">Điều tra sự cố AD qua Event Viewer</div>
                  </div>
                </div>
                <div class="about-timeline__item">
                  <span class="about-timeline__date">13/05</span>
                  <div>
                    <div class="about-timeline__title">AD Penetration Testing</div>
                    <div class="about-timeline__desc">Full Kill Chain từ Recon đến Domain Compromise</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Lộ trình học tập -->
            <div class="about-card">
              <h2 class="about-card__title"><span class="about-card__icon">🗺️</span> Lộ trình chuyển ngành</h2>
              <div class="about-roadmap">

                <div class="about-roadmap__item about-roadmap__item--done">
                  <div class="about-roadmap__badge">✓</div>
                  <div class="about-roadmap__body">
                    <div class="about-roadmap__title">Software Engineering</div>
                    <div class="about-roadmap__desc">Nền tảng lập trình — Python, JS, SQL, Git</div>
                  </div>
                </div>

                <div class="about-roadmap__item about-roadmap__item--active">
                  <div class="about-roadmap__badge">▶</div>
                  <div class="about-roadmap__body">
                    <div class="about-roadmap__title">Network Fundamentals (CCNA)</div>
                    <div class="about-roadmap__desc">TCP/IP, Routing, Active Directory, Lab thực chiến</div>
                    <div class="about-roadmap__progress">
                      <div class="about-roadmap__bar" style="width: 35%"></div>
                    </div>
                  </div>
                </div>

                <div class="about-roadmap__item about-roadmap__item--pending">
                  <div class="about-roadmap__badge">○</div>
                  <div class="about-roadmap__body">
                    <div class="about-roadmap__title">CompTIA Network+ / Security+</div>
                    <div class="about-roadmap__desc">Chứng chỉ quốc tế cho Network/Security Engineer</div>
                  </div>
                </div>

                <div class="about-roadmap__item about-roadmap__item--pending">
                  <div class="about-roadmap__badge">○</div>
                  <div class="about-roadmap__body">
                    <div class="about-roadmap__title">OSCP / Offensive Security</div>
                    <div class="about-roadmap__desc">Mục tiêu dài hạn — Penetration Testing chuyên nghiệp</div>
                  </div>
                </div>

              </div>
            </div>


          </div>
        </div>

        <!-- CTA -->
        <div class="about-cta">
          <p class="about-cta__text">Sẵn sàng vào trận?</p>
          <button class="about-cta__btn" onclick="window.location.hash='#/${latestPost.date}'">
            📖 Đọc bài mới nhất — ${latestPost.date}
          </button>
        </div>

      </div>`;

    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  function renderMatrixEffects() {
    const containers = document.querySelectorAll('[data-matrix-bg]');
    if (containers.length === 0) return;

    // Track active theme sections
    let activeTheme = null;

    // Auto-switch global theme based on scroll position
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const type = entry.target.getAttribute('data-matrix-bg');
          activeTheme = type;
          if (type === 'blue') {
            ThemeManager.apply('light');
          } else if (type === 'red') {
            ThemeManager.apply('dark');
          }
        } else {
          // If the one that was active is now hidden, restore default
          if (activeTheme === entry.target.getAttribute('data-matrix-bg')) {
            activeTheme = null;
            ThemeManager.apply(ThemeManager.getSavedTheme());
          }
        }
      });
    }, { threshold: 0.2 });

    containers.forEach(container => {
      observer.observe(container);

      if (container.querySelector('canvas.matrix-bg')) return;
      
      const colorType = container.getAttribute('data-matrix-bg');
      const isRed = colorType === 'red';
      
      container.style.position = 'relative';
      container.style.overflow = 'hidden';
      
      const contentWrapper = document.createElement('div');
      contentWrapper.style.position = 'relative';
      contentWrapper.style.zIndex = '2'; // High z-index to stay above canvas
      
      while (container.firstChild) {
        contentWrapper.appendChild(container.firstChild);
      }
      
      const canvas = document.createElement('canvas');
      canvas.className = 'matrix-bg';
      canvas.style.position = 'absolute';
      canvas.style.top = '0';
      canvas.style.left = '0';
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      canvas.style.zIndex = '1';
      canvas.style.pointerEvents = 'none';
      canvas.style.opacity = isRed ? '0.4' : '0.2';
      
      container.appendChild(canvas);
      container.appendChild(contentWrapper);
      
      const ctx = canvas.getContext('2d');
      const fontSize = 14;
      let columns = 0;
      let drops = [];

      function resize() {
        canvas.width = container.offsetWidth;
        canvas.height = container.offsetHeight;
        columns = Math.floor(canvas.width / fontSize);
        drops = [];
        for (let i = 0; i < columns; i++) {
          drops[i] = Math.random() * -100;
        }
      }

      window.addEventListener('resize', debounce(resize, 200));
      resize();
      
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()_+-=[]{}|;:,.<>/?~'.split('');
      const color = isRed ? '#ef4444' : '#3b82f6';
      
      function draw() {
        // Use colors that match the theme backgrounds set in CSS
        ctx.fillStyle = isRed ? 'rgba(17, 24, 39, 0.15)' : 'rgba(255, 255, 255, 0.15)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = color;
        ctx.font = `bold ${fontSize}px monospace`;
        
        for (let i = 0; i < drops.length; i++) {
          if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
            drops[i] = 0;
          }
          
          if (drops[i] >= 0) {
            const text = chars[Math.floor(Math.random() * chars.length)];
            ctx.fillText(text, i * fontSize, drops[i] * fontSize);
          }
          drops[i]++;
        }
      }
      
      let lastTime = 0;
      function animate(time) {
        if (time - lastTime > 40) {
          draw();
          lastTime = time;
        }
        if (document.body.contains(canvas)) {
          requestAnimationFrame(animate);
        }
      }
      requestAnimationFrame(animate);
    });
  }

  return { init };
})();

// ── Boot ──
document.addEventListener('DOMContentLoaded', App.init);
