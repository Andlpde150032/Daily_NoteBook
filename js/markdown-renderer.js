/* ============================================
   Markdown Renderer — Parse .md to HTML
   ============================================ */

const MarkdownRenderer = (() => {

  // Parse frontmatter (YAML-like) from markdown
  function parseFrontmatter(content) {
    const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    if (!match) return { meta: {}, body: content };

    const metaStr = match[1];
    const body = match[2];
    const meta = {};

    metaStr.split('\n').forEach(line => {
      const colonIdx = line.indexOf(':');
      if (colonIdx > 0) {
        const key = line.slice(0, colonIdx).trim();
        let value = line.slice(colonIdx + 1).trim();
        // Handle arrays
        if (value.startsWith('[') && value.endsWith(']')) {
          value = value.slice(1, -1).split(',').map(v => v.trim().replace(/['"]/g, ''));
        }
        meta[key] = value;
      }
    });

    return { meta, body };
  }

  // Render markdown to HTML using marked.js
  function render(markdown) {
    if (typeof marked === 'undefined') {
      return fallbackRender(markdown);
    }

    // Configure marked
    marked.setOptions({
      gfm: true,
      breaks: true,
      highlight: function(code, lang) {
        if (typeof hljs !== 'undefined' && lang && hljs.getLanguage(lang)) {
          try {
            return hljs.highlight(code, { language: lang }).value;
          } catch (e) { /* fallback */ }
        }
        if (typeof hljs !== 'undefined') {
          try {
            return hljs.highlightAuto(code).value;
          } catch (e) { /* fallback */ }
        }
        return code;
      }
    });

    // Custom renderer for code blocks — mermaid support
    const renderer = new marked.Renderer();
    const originalCode = renderer.code.bind(renderer);

    renderer.code = function(code, language) {
      // Handle marked v12+ where code is an object
      let codeText = code;
      let lang = language;
      if (typeof code === 'object' && code !== null) {
        lang = code.lang;
        codeText = code.text;
      }

      if (lang === 'mermaid') {
        return `<div class="mermaid">${codeText}</div>`;
      }
      const escaped = codeText
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

      let highlighted = escaped;
      if (typeof hljs !== 'undefined' && lang && hljs.getLanguage(lang)) {
        try {
          highlighted = hljs.highlight(codeText, { language: lang }).value;
        } catch (e) { /* fallback */ }
      }
      return `<pre data-lang="${lang || 'code'}"><code class="language-${lang || ''}">${highlighted}</code></pre>`;
    };

    return marked.parse(markdown, { renderer });
  }

  // Fallback renderer if marked.js isn't loaded
  function fallbackRender(md) {
    let html = md;
    // Basic heading support
    html = html.replace(/^### (.*$)/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gm, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gm, '<h1>$1</h1>');
    // Bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Italic
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
    // Line breaks
    html = html.replace(/\n\n/g, '</p><p>');
    html = '<p>' + html + '</p>';
    return html;
  }

  return { render, parseFrontmatter };
})();
