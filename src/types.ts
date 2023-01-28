export type TId = string | number;

export type TMap<T = unknown> = Record<TId, T>;

export type TSuscriptor<T extends TMap = TMap> = (newProps: T) => unknown;

export type TStoreDefinition = TMap;
