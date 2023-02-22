import MStore from './mstore';
import { TNewProps, TSuscriptor } from './types';

export default class SStore<State extends object = object> {
  #store: MStore<State & { id: string }>;

  constructor(name: string, initialState?: State) {
    this.#store = new MStore<State & { id: string }>(name, [
      { id: 'state' } as State & { id: string },
    ]);
    if (initialState) this.#store.update('state', initialState);
  }

  getProps() {
    return this.#store.getProps('state');
  }

  /**
   * @param suscriptor A function that will be called each time the store is updated.
   * @returns An unsuscriptor function that, when called, deletes the current suscription from the store.
   */
  suscribe(suscriptor: TSuscriptor<State>) {
    return this.#store.suscribe('state', suscriptor);
  }

  update(props: TNewProps<State>) {
    this.#store.update('state', props);
  }
}
