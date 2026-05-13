# 🛡️ Daily NoteBook

> A cybersecurity learning journal — documenting my daily study progress in Network, CCNA, and OSCP+ preparation.

## 🌐 Live Site

Visit: [Daily NoteBook](https://andlpde150032.github.io/Daily_NoteBook/)

## 📝 Adding New Entries

1. Create a new file in `posts/` with the naming format `YYYY-MM-DD.md`
2. Add YAML frontmatter at the top:

```yaml
---
title: Your Entry Title
date: YYYY-MM-DD
target: Target system info
role: Red Team / Blue Team / Learner
tags: [tag1, tag2, tag3]
---
```

3. Register the post in `js/app.js` → `POST_REGISTRY` array:

```javascript
{
  date: 'YYYY-MM-DD',
  title: 'Your Entry Title',
  tags: ['tag1', 'tag2'],
  file: 'posts/YYYY-MM-DD.md'
}
```

4. Commit and push:

```bash
git add .
git commit -m "📝 Day X: Entry Title"
git push
```

## ✨ Features

- 🌙 **Auto Dark/Light Theme** — switches based on time of day (6AM-6PM light, rest dark)
- 📊 **Mermaid Diagrams** — use \`\`\`mermaid code blocks
- 🔍 **Search** — Ctrl+K to search entries
- ⌨️ **Keyboard Navigation** — ← → to browse entries
- 📱 **Responsive** — works on mobile
- 🎨 **Hacker Theme** — terminal green, matrix rain, scanlines

## 🛠️ Tech Stack

- Pure HTML + CSS + Vanilla JS
- No build step required
- CDN: marked.js, highlight.js, mermaid.js
- Hosted on GitHub Pages

## 📜 License

MIT — Built with 💚 by An
