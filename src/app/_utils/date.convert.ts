export function fixTimeGap(
  input: string | undefined,
  utc?: boolean
): string | undefined {
  if (!input) {
    return undefined;
  }
  const date = new Date(input);
  let offset = 0;
  if (utc) {
    offset = date.getTimezoneOffset() * 60_000;
  }
  return new Date(Number(date) + offset).toISOString();
}
