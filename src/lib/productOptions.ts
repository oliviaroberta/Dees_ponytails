export const parseProductOptions = (value?: string) =>
  (value ?? "")
    .split(/[,/|]/)
    .map((item) => item.trim())
    .filter(Boolean);

export const getPrimaryProductOption = (value: string, fallback: string) => {
  const options = parseProductOptions(value);
  return options[0] ?? fallback;
};
