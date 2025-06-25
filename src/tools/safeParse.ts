export function safeParse<T>(
  str: string,
  validator: (x: any) => x is T,
): T | null {
  try {
    const data = JSON.parse(str);
    return validator(data) ? data : null;
  } catch {
    return null;
  }
}
