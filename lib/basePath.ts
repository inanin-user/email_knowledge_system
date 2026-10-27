
const basePath = (process.env.NEXT_PUBLIC_BASE_PATH ?? '').replace(/\/+$/, '');

export function withBasePath(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  // Avoid adding the prefix twice.
  if (
    basePath &&
    (normalizedPath === basePath ||
      normalizedPath.startsWith(`${basePath}/`))
  ) {
    return normalizedPath;
  }

  return `${basePath}${normalizedPath}`;
}
