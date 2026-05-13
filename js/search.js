/* ============================================
   Search — Full-text search across entries
   ============================================ */

const Search = (() => {
  let posts = [];
  let onResult = null;

  function init(postList, callback) {
    posts = postList;
    onResult = callback;

    const input = document.getElementById('search-input');
    if (input) {
      input.addEventListener('input', debounce(handleSearch, 300));
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          input.value = '';
          handleSearch();
          input.blur();
        }
      });
    }

    // Ctrl+K / Cmd+K shortcut
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (input) input.focus();
      }
    });
  }

  function handleSearch() {
    const input = document.getElementById('search-input');
    const query = input ? input.value.trim().toLowerCase() : '';

    if (!query) {
      // Reset — show all entries
      DateNavigator.renderSidebar();
      return;
    }

    const results = posts.filter(post => {
      const titleMatch = (post.title || '').toLowerCase().includes(query);
      const tagsMatch = (post.tags || []).some(t => t.toLowerCase().includes(query));
      const dateMatch = post.date.includes(query);
      return titleMatch || tagsMatch || dateMatch;
    });

    renderResults(results, query);
  }

  function renderResults(results, query) {
    const container = document.getElementById('date-list');
    if (!container) return;

    container.innerHTML = '';

    if (results.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state__icon">🔍</div>
          <p>No results for "${query}"</p>
        </div>`;
      return;
    }

    const section = document.createElement('div');
    section.className = 'sidebar__section';

    const title = document.createElement('div');
    title.className = 'sidebar__title';
    title.innerHTML = `🔍 ${results.length} result${results.length > 1 ? 's' : ''}`;
    section.appendChild(title);

    results.forEach(post => {
      const entry = document.createElement('div');
      entry.className = 'date-entry animate-fade-in';
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
        DateNavigator.navigateTo(post.date);
      });

      section.appendChild(entry);
    });

    container.appendChild(section);
  }

  function debounce(fn, delay) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  }

  return { init };
})();
