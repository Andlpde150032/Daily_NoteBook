/* ============================================
   Date Navigator — Smart Date Browsing
   ============================================ */

const DateNavigator = (() => {
  let posts = [];
  let currentIndex = -1;
  let onNavigate = null;

  function init(postList, callback) {
    posts = postList.sort((a, b) => b.date.localeCompare(a.date)); // newest first
    onNavigate = callback;
    renderSidebar();
    setupKeyboard();
  }

  function renderSidebar() {
    const container = document.getElementById('date-list');
    if (!container) return;

    container.innerHTML = '';

    if (posts.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state__icon">📭</div>
          <p>No entries yet</p>
        </div>`;
      return;
    }

    // Group by month
    const groups = {};
    posts.forEach(post => {
      const d = new Date(post.date);
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const monthName = d.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' });
      if (!groups[monthKey]) groups[monthKey] = { name: monthName, entries: [] };
      groups[monthKey].entries.push(post);
    });

    Object.values(groups).forEach(group => {
      const section = document.createElement('div');
      section.className = 'sidebar__section animate-fade-in';

      const title = document.createElement('div');
      title.className = 'sidebar__title';
      title.innerHTML = `📅 ${group.name}`;
      section.appendChild(title);

      group.entries.forEach(post => {
        const entry = document.createElement('div');
        entry.className = 'date-entry';
        entry.dataset.date = post.date;

        const d = new Date(post.date);
        const dayStr = d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });

        entry.innerHTML = `
          <span class="date-entry__icon">📝</span>
          <div class="date-entry__info">
            <div class="date-entry__date">${dayStr}</div>
            <div class="date-entry__title">${post.title || 'Untitled'}</div>
          </div>`;

        entry.addEventListener('click', () => {
          navigateTo(post.date);
        });

        section.appendChild(entry);
      });

      container.appendChild(section);
    });
  }

  function navigateTo(date) {
    const index = posts.findIndex(p => p.date === date);
    if (index === -1) return;

    currentIndex = index;
    highlightActive(date);
    updateNavButtons();

    if (onNavigate) onNavigate(date);

    // Update URL hash
    window.location.hash = `/${date}`;

    // Close mobile sidebar
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    if (sidebar) sidebar.classList.remove('open');
    if (overlay) overlay.classList.remove('active');
  }

  function highlightActive(date) {
    document.querySelectorAll('.date-entry').forEach(el => {
      el.classList.toggle('active', el.dataset.date === date);
    });
  }

  function updateNavButtons() {
    const prevBtn = document.getElementById('prev-post');
    const nextBtn = document.getElementById('next-post');

    if (prevBtn) {
      prevBtn.disabled = currentIndex >= posts.length - 1;
    }
    if (nextBtn) {
      nextBtn.disabled = currentIndex <= 0;
    }
  }

  function goNext() {
    if (currentIndex > 0) {
      navigateTo(posts[currentIndex - 1].date);
    }
  }

  function goPrev() {
    if (currentIndex < posts.length - 1) {
      navigateTo(posts[currentIndex + 1].date);
    }
  }

  function setupKeyboard() {
    document.addEventListener('keydown', (e) => {
      // Don't trigger if user is typing in search
      if (e.target.tagName === 'INPUT') return;

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goPrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        goNext();
      }
    });
  }

  function getCurrentDate() {
    if (currentIndex >= 0 && currentIndex < posts.length) {
      return posts[currentIndex].date;
    }
    return null;
  }

  return { init, navigateTo, goNext, goPrev, getCurrentDate, renderSidebar };
})();
