export type Selector<P, T = unknown> = (props: P) => T;

export interface Store<T = unknown> {
  props: T;
}

export function getProp<ST extends Store, SE extends Selector<ST['props']>>(
  selector: SE,
  store: ST,
): ReturnType<SE> {
  return selector(store.props) as ReturnType<SE>;
}
