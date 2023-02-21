import React from 'react';
import MStore from './mstore';
import SStore from './sstore';
import { TId } from './types';

export type TComparator<SelectedType = unknown> = (
  prevProps: SelectedType,
  newProps: SelectedType,
) => boolean;

export interface TUseSelectorProps<SelectedType extends object> {
  comparator?: TComparator<SelectedType>;
}

export type TSelector<Selected = Partial<object>, PropsType = object> = (
  newProps: PropsType,
) => Selected;

function defaultComparator<PropsType>(
  prevProps: PropsType,
  newProps: PropsType,
) {
  return prevProps === newProps;
}

export default function useSelector<
  PropsType extends object & { id: string } = object & { id: string },
  SelectedType extends object = object,
>(
  selector: TSelector<SelectedType, PropsType>,
  store: SStore<PropsType>,
  configuration: TUseSelectorProps<SelectedType>,
): SelectedType;
export default function useSelector<
  PropsType extends object & { id: string } = object & { id: string },
  SelectedType extends object = object,
>(
  field: TId,
  selector: TSelector<SelectedType, PropsType>,
  store: MStore<PropsType>,
  configuration: TUseSelectorProps<SelectedType>,
): SelectedType;
/**
 * Allows to trigger render when a store's field props are updated, applying selector and comparator function in order to determine when to update and when to not update.
 *
 * @param selector
 * @param store
 * @param configuration
 * @returns
 */
export default function useSelector<
  PropsType extends object & { id: string } = object & { id: string },
  SelectedType extends object = object,
>(
  par1: TId | TSelector<SelectedType, PropsType>,
  par2: TSelector<SelectedType, PropsType> | SStore<PropsType>,
  par3: MStore<PropsType> | TUseSelectorProps<SelectedType>,
  par4?: TUseSelectorProps<SelectedType>,
) {
  const selector = (par2 instanceof SStore ? par1 : par2) as TSelector<
    SelectedType,
    PropsType
  >;
  const store = (par2 instanceof SStore ? par3 : par2) as
    | SStore<PropsType>
    | MStore<PropsType>;

  const field = (par2 instanceof SStore ? '' : par1) as TId;

  const configuration = (
    par2 instanceof SStore ? par3 : par4
  ) as TUseSelectorProps<SelectedType>;

  const [state, setState] = React.useState<SelectedType>(
    selector(
      (store instanceof SStore
        ? store.getProps()
        : store.getProps(field)) as PropsType,
    ) as SelectedType,
  );
  const prevSelected = React.useRef<SelectedType>(state);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const memoizedSelector = React.useCallback(selector, []);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const memoizedComparator = React.useCallback(
    configuration.comparator ?? defaultComparator,
    [],
  );

  React.useEffect(() => {
    let unsuscribe: () => unknown;

    function compareAndUpdate(newProps: PropsType) {
      const newSelectedProps = memoizedSelector(newProps);

      if (memoizedComparator(prevSelected.current, newSelectedProps)) {
        setState(newSelectedProps);
      }
    }

    if (store instanceof SStore) {
      unsuscribe = store.suscribe(compareAndUpdate);
    } else {
      unsuscribe = store.suscribe(field, compareAndUpdate);
    }

    return () => {
      unsuscribe();
    };
  }, [memoizedComparator, store, field, memoizedSelector]);

  return state;
}
