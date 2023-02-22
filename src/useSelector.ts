import React from 'react';
import MStore from './mstore';
import { TId } from './types';

export type Selector<P, T = unknown> = (props: P) => T;

export type Comparator<P> = (propsA: P, propsB: P) => boolean;

export type MapType<T> = T extends Map<TId, infer Type> ? Type : never;

function useLatest<T>(props: T): React.MutableRefObject<T> {
  const ref = React.useRef<T>(props);

  ref.current = props;

  return ref;
}

export default function useSelector<
  StoreType extends MStore,
  SelectorType extends Selector<
    Parameters<Parameters<StoreType['suscribe']>[1]>[0]
  >,
  ComparatorType extends Comparator<ReturnType<SelectorType>>,
>(
  fieldId: TId,
  store: StoreType,
  selector: SelectorType,
  comparator?: ComparatorType,
): ReturnType<SelectorType> {
  const [props, setProps] = React.useState<ReturnType<SelectorType>>(
    selector(
      store.getProps(fieldId) as MapType<StoreType['fields']>,
    ) as ReturnType<SelectorType>,
  );
  const previousProps = useLatest<ReturnType<SelectorType>>(props);

  React.useEffect(
    () =>
      store.suscribe(fieldId, (newProps) => {
        const selectedNewProps = selector(newProps) as ReturnType<SelectorType>;
        if (!comparator?.(previousProps.current, selectedNewProps)) {
          setProps(selectedNewProps);
        }
      }),
    [comparator, fieldId, previousProps, selector, store],
  );

  return props;
}
