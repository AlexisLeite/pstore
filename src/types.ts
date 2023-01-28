export type TId = string | number;

export type TMap<T = string> = Record<TId, T>;

export type TSuscriptor<T extends TMap = TMap> = (newProps: T) => unknown;
