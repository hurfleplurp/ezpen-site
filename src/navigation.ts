const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const body = document.body;
const previous = document.referrer ? new URL(document.referrer) : null;
const previousIsGame = previous?.hostname === 'gg.ezpen.ink' || previous?.pathname === '/ggezpen.html';
const fromProduct = previous && (previous.origin === window.location.origin ||
  ['ezpen.ink', 'gg.ezpen.ink'].includes(previous.hostname));
if (fromProduct && previousIsGame !== document.documentElement.classList.contains('game-page') && !reducedMotion.matches) {
  body.classList.add('page-enter');
  body.addEventListener('animationend', event => {
    if (event.target === body) body.classList.remove('page-enter');
  });
}

let navigating = false;
document.addEventListener('click', event => {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey ||
      reducedMotion.matches || !(event.target instanceof Element)) return;
  const link = event.target.closest<HTMLAnchorElement>('.product-nav a, .game-back');
  if (!link || link.hasAttribute('aria-current') || link.target || link.hasAttribute('download')) return;
  event.preventDefault();
  if (navigating) return;
  navigating = true;
  body.classList.remove('page-enter');
  body.classList.add('page-exit');
  let timer: number;
  let completed = false;
  const navigate = (): void => {
    if (completed) return;
    completed = true;
    window.clearTimeout(timer);
    window.location.assign(link.href);
  };
  body.addEventListener('animationend', event => {
    if (event.target === body) navigate();
  }, { once: true });
  // Navigation must still complete if an animation is cancelled or disabled mid-flight.
  timer = window.setTimeout(navigate, 300);
});

window.addEventListener('pageshow', () => {
  navigating = false;
  body.classList.remove('page-exit');
});
