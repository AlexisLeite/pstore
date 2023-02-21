import { TId, TSuscriptor, TNewProps, TUpdateConfiguration } from './types.js';

/**
 * PStore is designed to handle the state of multiple components with the same structure, example:
 *
 * - Validation fields
 * - Table rows/cells
 *
 * Thats the reason because the type of the props requires an id to work, that id will be used to distinguish the props of each component.
 *
 * If you are looking for a store that enables for single state, you can use SStore instead.
 */
declare class MStore<PropsType extends {
    id: TId;
} & object = {
    id: TId;
} & object> {
    #private;
    get fields(): Map<TId, PropsType>;
    /** ************************************************************ */
    constructor(initialFields?: PropsType[]);
    /**
     * Puts the store in batch mode, which means that no update will be fired until batchFinish is called.
     *
     * Each update called between batchInit and batchFinish will be merged in a temporary state and when batchFinish is called, every udpate field will be dispatched once, with the final version of the props.
     */
    batchInit(): void;
    /**
     * Ends the batch mode, emitting all batched updates at once. Notice that if multiple updates were called on the same field, only one update will be called, including the result of the secuence of updates.
     */
    batchFinish(): void;
    delete(field: TId): void;
    getProps(field: TId): PropsType | undefined;
    /**
     * Allows the suscription to the props change of a specific field.
     *
     * @param field The id of the field which you want to suscribe.
     * @param suscriptor A callback that will be called every time an update is applied in the field's state.
     *
     * @returns Unsuscriptor, a callback that when called, will remove this suscription from the store.
     */
    suscribe(field: TId, suscriptor: TSuscriptor<PropsType>): () => void;
    /**
     * Updates the state of a field.
     *
     * @param configuration.emitUpdates If passed false, the update will not be triggered immediatelly.
     *
     * @param field The id of the field whoose props will be updated.
     * @param newProps The props to update on the field.
     * @param configuration An object containing some configurations relative to this update.
     */
    update(field: TId, newProps: Omit<TNewProps<PropsType>, 'id'>, configuration?: TUpdateConfiguration): void;
}

export { MStore as default };
