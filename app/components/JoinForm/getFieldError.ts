export function getFieldError(
  errors: Array<unknown>,
  isTouched: boolean,
): string | undefined {
  if (!isTouched || errors.length === 0) return undefined;
  const first = errors.find((e): e is NonNullable<typeof e> => e != null);
  if (!first) return undefined;
  if (typeof first === "string") return first;
  if (typeof first === "object" && "message" in first)
    return String(first.message);
  return undefined;
}
