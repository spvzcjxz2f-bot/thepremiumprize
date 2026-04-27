/**
 * Navigation utilities that ALWAYS preserve URL parameters (UTMs, etc.)
 * across redirects. All redirects use window.location.href and force the
 * passage of window.location.search to the next page.
 */

const STORAGE_KEY = "__url_params__";

/**
 * Persist current URL params to sessionStorage on first load so they survive
 * SPA navigations and can be re-applied to outbound links even if the URL
 * gets cleaned later.
 */
export const persistUrlParams = (): void => {
  if (typeof window === "undefined") return;
  const search = window.location.search || "";
  if (search && search !== "?") {
    try {
      sessionStorage.setItem(STORAGE_KEY, search);
    } catch {
      // ignore storage errors (private mode, etc.)
    }
  }
};

/**
 * Force the persisted URL params back into the address bar if they're missing.
 * This is critical for third-party scripts (VTURB, pixels) that read
 * window.location.search to build outbound checkout URLs.
 */
export const restoreUrlParams = (): void => {
  if (typeof window === "undefined") return;
  const live = window.location.search || "";
  if (live && live !== "?") return; // already present, nothing to do
  let stored = "";
  try {
    stored = sessionStorage.getItem(STORAGE_KEY) || "";
  } catch {
    return;
  }
  if (!stored || stored === "?") return;
  const newUrl =
    window.location.pathname + stored + window.location.hash;
  try {
    window.history.replaceState(window.history.state, "", newUrl);
  } catch {
    // ignore
  }
};

/**
 * Get the current URL parameters as a string (e.g. "?utm_source=fb&utm_medium=cpc")
 * Falls back to sessionStorage if the URL has been cleared.
 */
export const getCurrentParams = (): string => {
  if (typeof window === "undefined") return "";
  const live = window.location.search || "";
  if (live && live !== "?") return live;
  try {
    return sessionStorage.getItem(STORAGE_KEY) || "";
  } catch {
    return "";
  }
};

/**
 * Get URL parameters as URLSearchParams object
 */
export const getUrlParams = (): URLSearchParams => {
  if (typeof window === "undefined") return new URLSearchParams();
  return new URLSearchParams(window.location.search);
};

/**
 * Build a URL with the current URL parameters merged in.
 * Current params (UTMs, gclid, fbclid, etc.) ALWAYS take precedence and are
 * forced onto the destination URL.
 */
export const buildUrlWithParams = (path: string): string => {
  if (typeof window === "undefined") return path;

  const currentSearch = getCurrentParams();
  const currentParams = new URLSearchParams(currentSearch);

  // No current params → return path as-is
  if (!currentSearch || currentSearch === "?") {
    return path;
  }

  try {
    const url = new URL(path, window.location.origin);

    // Force every current param onto the destination (overrides duplicates).
    currentParams.forEach((value, key) => {
      url.searchParams.set(key, value);
    });

    // External → full URL. Internal → path + search + hash.
    if (url.origin !== window.location.origin) {
      return url.toString();
    }
    return url.pathname + url.search + url.hash;
  } catch {
    // Fallback for malformed URLs: append search string directly.
    const search = currentSearch.startsWith("?") ? currentSearch.slice(1) : currentSearch;
    const separator = path.includes("?") ? "&" : "?";
    return `${path}${separator}${search}`;
  }
};

/**
 * Redirect the current tab to a URL, ALWAYS preserving current URL params.
 * Uses window.location.href for a full-page navigation.
 */
export const navigateWithParams = (path: string): void => {
  if (typeof window === "undefined") return;
  window.location.href = buildUrlWithParams(path);
};

/**
 * Open a URL in a new tab, ALWAYS preserving current URL params.
 */
export const openWithParams = (path: string): void => {
  if (typeof window === "undefined") return;
  window.open(buildUrlWithParams(path), "_blank", "noopener,noreferrer");
};

/**
 * Build an onClick handler that redirects (same tab) preserving params.
 */
export const createNavigateHandler = (path: string) => {
  return (e?: React.MouseEvent) => {
    e?.preventDefault();
    navigateWithParams(path);
  };
};

/**
 * Build an onClick handler that opens a new tab preserving params.
 */
export const createOpenHandler = (path: string) => {
  return (e?: React.MouseEvent) => {
    e?.preventDefault();
    openWithParams(path);
  };
};
