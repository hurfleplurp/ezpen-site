import { publicHttpsUrl } from './urls';
import './navigation';

function requiredElement<T extends Element>(selector: string): T {
  const element = document.querySelector<T>(selector);
  if (!element) throw new Error(`Missing page element: ${selector}`);
  return element;
}

function setupRelease(): void {
  const downloadUrl = publicHttpsUrl(import.meta.env.VITE_EZPEN_DOWNLOAD_URL, 'VITE_EZPEN_DOWNLOAD_URL');
  const checksumUrl = publicHttpsUrl(import.meta.env.VITE_EZPEN_CHECKSUM_URL, 'VITE_EZPEN_CHECKSUM_URL');
  const releasesUrl = publicHttpsUrl(import.meta.env.VITE_EZPEN_RELEASES_URL, 'VITE_EZPEN_RELEASES_URL');
  if (downloadUrl) {
    requiredElement<HTMLAnchorElement>('#download-link').href = downloadUrl;
    requiredElement<HTMLElement>('#download-size').remove();
  }
  const checksumLink = requiredElement<HTMLAnchorElement>('#checksum-link');
  if (checksumUrl) {
    checksumLink.href = checksumUrl;
  } else if (downloadUrl) {
    checksumLink.remove();
  }
  if (releasesUrl) {
    const link = document.createElement('a');
    link.className = 'release-link';
    link.href = releasesUrl;
    link.textContent = 'Release notes ↗';
    requiredElement<HTMLElement>('#download-action').append(link);
  }
  const siteUrl = publicHttpsUrl(import.meta.env.VITE_SITE_URL, 'VITE_SITE_URL');
  if (siteUrl) {
    const canonical = document.createElement('link');
    canonical.rel = 'canonical';
    canonical.href = new URL('/', siteUrl).href;
    const ogUrl = document.createElement('meta');
    ogUrl.setAttribute('property', 'og:url');
    ogUrl.content = canonical.href;
    document.head.append(canonical, ogUrl);
  }
}

function setupPenShelf(): void {
  const shelf = requiredElement<HTMLUListElement>('.pen-shelf');
  const items = Array.from(shelf.querySelectorAll<HTMLLIElement>('.pen-item'));
  const choices = items.map(item => {
    const button = item.querySelector<HTMLButtonElement>('.pen-choice');
    const stroke = item.querySelector<HTMLElement>('.pen-stroke');
    if (!button || !stroke) throw new Error('Missing pen choice or stroke preview.');
    return { item, button, stroke };
  });
  let active: HTMLLIElement | null = null;
  let keyboardSelection = false;

  const select = (selected: HTMLLIElement | null): void => {
    active = selected;
    shelf.toggleAttribute('data-active', selected !== null);
    for (const { item, button, stroke } of choices) {
      const expanded = item === selected;
      item.classList.toggle('is-active', expanded);
      button.setAttribute('aria-expanded', String(expanded));
      stroke.setAttribute('aria-hidden', String(!expanded));
    }
  };

  // Track actual pointer movement, not enter/leave events caused by the shelf reflowing.
  shelf.addEventListener('pointermove', event => {
    if (event.pointerType === 'touch') return;
    keyboardSelection = false;
    if (!(event.target instanceof Element)) return;
    const item = event.target.closest<HTMLLIElement>('.pen-item');
    if (item && items.includes(item) && item !== active) select(item);
  });
  shelf.addEventListener('pointerleave', event => {
    if (event.pointerType !== 'touch' && !keyboardSelection) select(null);
  });
  shelf.addEventListener('focusout', event => {
    if (!(event.relatedTarget instanceof Node) || !shelf.contains(event.relatedTarget)) {
      keyboardSelection = false;
      select(null);
    }
  });
  shelf.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      keyboardSelection = false;
      select(null);
    }
  });
  for (const { item, button } of choices) {
    button.addEventListener('focus', () => {
      if (button.matches(':focus-visible')) {
        keyboardSelection = true;
        select(item);
      }
    });
    button.addEventListener('click', event => {
      if (event.detail === 0) {
        keyboardSelection = true;
        select(item);
      } else {
        select(active === item ? null : item);
      }
    });
  }
}

setupRelease();
setupPenShelf();
