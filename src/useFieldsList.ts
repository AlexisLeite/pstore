import React from 'react';
import stores from './stores';
import { TId } from './types';

export default function useFieldsList(storeName: string) {
  const store = React.useMemo(() => stores.get(storeName), [storeName]);

  const [fieldsList, setFieldsList] = React.useState<TId[]>([
    ...store.fields.keys(),
  ]);

  React.useEffect(() => {
    const unsuscribe = store.suscribeToFieldsList((list) =>
      setFieldsList(list.map((current) => current.id)),
    );

    return unsuscribe;
  }, [store]);

  return fieldsList;
}
