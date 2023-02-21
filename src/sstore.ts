import MStore from './mstore';
import { TNewProps, TSuscriptor } from './types';

export default class SStore<State extends object = object> {
  #store = new MStore<State & { id: string }>([
    { id: 'state' } as State & { id: string },
  ]);

  constructor(initialState?: State) {
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
