import MStore from './mstore';
import { TDefProps, TId } from './types';

const stores = new (class Stores {
  map = new Map<TId, MStore>();

  get<StoreType extends TDefProps = TDefProps>(name: TId) {
    return this.map.get(name) as unknown as MStore<StoreType>;
  }

  set<StoreType extends TDefProps = TDefProps>(
    name: TId,
    store: MStore<StoreType>,
  ) {
    this.map.set(name, store as unknown as MStore);
  }
})();

export default stores;
