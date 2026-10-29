import { publicHttpsUrl } from './urls';

function requiredElement<T extends Element>(selector: string): T {
  const element = document.querySelector<T>(selector);
  if (!element) throw new Error(`Missing page element: ${selector}`);
  return element;
}

function setupRelease(): void {
  const downloadUrl = publicHttpsUrl(import.meta.env.VITE_EZPEN_DOWNLOAD_URL, 'VITE_EZPEN_DOWNLOAD_URL');
  const releasesUrl = publicHttpsUrl(import.meta.env.VITE_EZPEN_RELEASES_URL, 'VITE_EZPEN_RELEASES_URL');
  if (downloadUrl) {
    const action = requiredElement<HTMLElement>('#download-action');
    const link = document.createElement('a');
    link.className = 'button button-primary';
    link.href = downloadUrl;
    link.textContent = 'Download ezPen for Windows ↗';
    const note = document.createElement('p');
    note.className = 'download-note';
    note.textContent = 'One executable. Open it and draw.';
    action.replaceChildren(link, note);
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

setupRelease();
