export function publicHttpsUrl(value: string | undefined, name: string): string | null {
  if (!value?.trim()) return null;
  const url = new URL(value.trim());
  if (url.protocol !== 'https:' || url.username || url.password) {
    throw new Error(`${name} must be a public HTTPS URL without credentials.`);
  }
  return url.href;
}
