const publicPaths = new Set([
  "/",
  "/home",
  "/about",
  "/stories",
  "/pricing",
  "/jobs",
  "/companies",
  "/verify-certificate",
  "/verify-email",
  "/reset-password",
  "/reset-password/confirm",
]);

export function isPublicPath(pathname: string) {
  const normalized = pathname.length > 1 ? pathname.replace(/\/$/, "") : pathname;
  return (
    publicPaths.has(normalized) ||
    /^\/jobs\/[^/]+$/.test(normalized) ||
    /^\/companies\/[^/]+$/.test(normalized) ||
    /^\/profile\/(?!view$|cv-generator$)[^/]+$/.test(normalized) ||
    /^\/verify-certificate\/[^/]+$/.test(normalized)
  );
}

export function navigateAfterLogout(pathname = window.location.pathname) {
  if (!isPublicPath(pathname)) window.location.assign("/");
}
