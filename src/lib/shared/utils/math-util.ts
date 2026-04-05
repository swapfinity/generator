export const roundTo = (num: number, decimals: number) =>
    Math.round(num * 10 ** decimals) / 10 ** decimals;

export const floorTo = (num: number, decimals: number) =>
    Math.floor(num * 10 ** decimals) / 10 ** decimals;