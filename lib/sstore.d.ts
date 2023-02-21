import { TSuscriptor, TNewProps } from './types.js';

declare class SStore<State extends object = object> {
    #private;
    constructor(initialState?: State);
    getProps(): (State & {
        id: string;
    }) | undefined;
    /**
     * @param suscriptor A function that will be called each time the store is updated.
     * @returns An unsuscriptor function that, when called, deletes the current suscription from the store.
     */
    suscribe(suscriptor: TSuscriptor<State>): () => void;
    update(props: TNewProps<State>): void;
}

export { SStore as default };
