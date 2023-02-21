export type TId = string | number;

export type TDefProps = object & { id: string };

export type TSuscriptor<T extends object = object> = (newProps: T) => unknown;

export interface TUpdateConfiguration {
  /**
   * If passed in false, this update will be stored and not dispatched.
   *
   * All stored updates will be applied and dispatched when one of the following situation occurs:
   *
   * - A update without emitUpdates=false is triggered.
   */
  emitUpdates?: boolean;
}

export type TPropsUpdater<T extends object> = (currentProps: T) => T;

export type TNewProps<T extends object> = TPropsUpdater<T> | Partial<T>;

export interface TStoredUpdate<T extends object> {
  field: TId;
  newProps: TNewProps<T>;
  configuration: TUpdateConfiguration;
}
