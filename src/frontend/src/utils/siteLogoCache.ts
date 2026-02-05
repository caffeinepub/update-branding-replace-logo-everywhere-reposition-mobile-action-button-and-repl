const CACHE_KEY = 'site_logo_url';

/**
 * Read the cached site logo URL from localStorage.
 * Returns null if no cached logo exists.
 */
export function getCachedSiteLogoUrl(): string | null {
  try {
    return localStorage.getItem(CACHE_KEY);
  } catch (error) {
    console.warn('Failed to read cached site logo:', error);
    return null;
  }
}

/**
 * Write the site logo URL to localStorage cache.
 */
export function setCachedSiteLogoUrl(url: string): void {
  try {
    localStorage.setItem(CACHE_KEY, url);
  } catch (error) {
    console.warn('Failed to cache site logo:', error);
  }
}

/**
 * Clear the cached site logo URL from localStorage.
 */
export function clearCachedSiteLogoUrl(): void {
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch (error) {
    console.warn('Failed to clear cached site logo:', error);
  }
}

/**
 * Preload an image URL into the browser cache.
 * Returns a promise that resolves when the image is loaded.
 */
export function preloadImage(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => reject(new Error(`Failed to preload image: ${url}`));
    img.src = url;
  });
}
