export const maskSecret = (value: string): string => {
  if (value.length <= 4) {
    return '••••';
  }
  return `${value.slice(0, 2)}••••${value.slice(-2)}`;
};

export const safeMessage = (value: unknown): string => {
  if (typeof value !== 'string') {
    return 'Unexpected operation failure.';
  }
  return value.replace(/[\r\n\t]+/g, ' ').slice(0, 240);
};
