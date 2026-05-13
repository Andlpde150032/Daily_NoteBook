/* ============================================
   Matrix Rain Effect — Canvas-based
   ============================================ */

const MatrixEffect = (() => {
  let canvas, ctx, columns, drops;
  let animationId = null;
  const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEF<>/\\{}[]|:;';
  const fontSize = 14;

  function init() {
    canvas = document.getElementById('matrix-canvas');
    if (!canvas) return;

    ctx = canvas.getContext('2d');
    resize();
    window.addEventListener('resize', resize);
    animate();
  }

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    columns = Math.floor(canvas.width / fontSize);
    drops = new Array(columns).fill(1);
  }

  function animate() {
    const theme = document.documentElement.getAttribute('data-theme');
    const color = theme === 'dark' ? '#00ff88' : '#059669';

    ctx.fillStyle = theme === 'dark'
      ? 'rgba(10, 14, 23, 0.05)'
      : 'rgba(240, 244, 248, 0.08)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = color;
    ctx.font = `${fontSize}px monospace`;

    for (let i = 0; i < drops.length; i++) {
      const char = chars[Math.floor(Math.random() * chars.length)];
      ctx.fillText(char, i * fontSize, drops[i] * fontSize);

      if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i]++;
    }

    animationId = requestAnimationFrame(animate);
  }

  function destroy() {
    if (animationId) cancelAnimationFrame(animationId);
    window.removeEventListener('resize', resize);
  }

  return { init, destroy };
})();
