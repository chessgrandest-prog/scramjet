import { codecDecode, codecEncode } from "@/shared";
import { config } from "@/shared";
import { rewriteJs } from "@rewriters/js";

export type URLMeta = {
  origin: URL;
  base: URL;
  topFrameName?: string;
  parentFrameName?: string;
};

// --- Production-grade URL sanitizer for Cloudflare Workers ---

const DISALLOWED_SCHEMES = [
  "javascript:",
  "data:",
  "mailto:",
  "tel:",
  "about:",
  "blob:",
  "chrome-error:",
  "file:",
];

function hasDisallowedScheme(raw: string): boolean {
  const trimmed = raw.trim().toLowerCase();
  return DISALLOWED_SCHEMES.some((s) => trimmed.startsWith(s));
}

export function sanitizeUrl(raw: string, base: URL): string | null {
  if (!raw) return null;

  const trimmed = raw.trim();

  // Skip dangerous or non-HTTP schemes
  if (hasDisallowedScheme(trimmed)) {
    return raw;
  }

  // Relative URLs
  if (
    trimmed.startsWith("/") ||
    trimmed.startsWith("./") ||
    trimmed.startsWith("../") ||
    trimmed.startsWith("#") ||
    trimmed.startsWith("?")
  ) {
    try {
      return new URL(trimmed, base).toString();
    } catch {
      return raw;
    }
  }

  // Absolute URLs
  try {
    const url = new URL(trimmed);
    if (url.protocol === "http:" || url.protocol === "https:") {
      return url.toString();
    }
    return raw;
  } catch {
    return raw;
  }
}

// --- Core helpers ---

function tryCanParseURL(url: string, origin?: string | URL): URL | null {
  try {
    return new URL(url, origin);
  } catch {
    return null;
  }
}

// These two are inherently browser-only; keep them but don’t call them in the worker.

export function rewriteBlob(url: string, meta: URLMeta) {
  const raw = url.substring("blob:".length).trim();

  try {
    const blob = new URL(raw);
    return "blob:" + meta.origin.origin + blob.pathname;
  } catch {
    // If it's malformed, don't rewrite it — just return original
    return url;
  }
}


export function unrewriteBlob(url: string) {
  const raw = url.substring("blob:".length).trim();

  try {
    const blob = new URL(raw);
    return "blob:" + location.origin + blob.pathname;
  } catch {
    return url;
  }
}

// --- Main rewrite / unrewrite logic ---

export function rewriteUrl(url: string | URL, meta: URLMeta) {
  if (url instanceof URL) url = url.toString();

  if (url.startsWith("javascript:")) {
    return (
      "javascript:" +
      rewriteJs(url.slice("javascript:".length), "(javascript: url)", meta)
    );
  } else if (url.startsWith("blob:")) {
    return location.origin + config.prefix + url;
  } else if (url.startsWith("data:")) {
    return location.origin + config.prefix + url;
  } else if (url.startsWith("mailto:") || url.startsWith("about:")) {
    return url;
  } else {
    let base = meta.base.href;

    if (base.startsWith("about:")) {
      // jank!!!!! weird jank!!!
      base = unrewriteUrl(self.location.href);
    }

    // Sanitize before parsing to avoid Invalid URL string in Workers
    const safe = sanitizeUrl(url, meta.base);
    if (!safe) return url;

    const realUrl = tryCanParseURL(safe, base);
    if (!realUrl) return url;

    const encodedHash = codecEncode(realUrl.hash.slice(1));
    const realHash = encodedHash ? "#" + encodedHash : "";
    realUrl.hash = "";

    return (
      location.origin + config.prefix + codecEncode(realUrl.href) + realHash
    );
  }
}

export function unrewriteUrl(url: string | URL) {
  if (url instanceof URL) url = url.toString();

  const prefixed = location.origin + config.prefix;

  if (url.startsWith("javascript:")) {
    // TODO: handle if needed
    return url;
  } else if (url.startsWith("blob:")) {
    // realistically this shouldn't happen
    return url;
  } else if (url.startsWith(prefixed + "blob:")) {
    return url.substring(prefixed.length);
  } else if (url.startsWith(prefixed + "data:")) {
    return url.substring(prefixed.length);
  } else if (url.startsWith("mailto:") || url.startsWith("about:")) {
    return url;
  } else {
    // Sanitize before parsing to avoid Invalid URL string in Workers
    const safe = sanitizeUrl(url, new URL(prefixed));
    if (!safe) return url;

    const realUrl = tryCanParseURL(safe);
    if (!realUrl) return url;

    const decodedHash = codecDecode(realUrl.hash.slice(1));
    const realHash = decodedHash ? "#" + decodedHash : "";
    realUrl.hash = "";

    return codecDecode(realUrl.href.slice(prefixed.length) + realHash);
  }
}
