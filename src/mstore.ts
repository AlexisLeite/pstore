import cloneDeep from 'lodash.clonedeep';
import stores from './stores';
import {
  TDefProps,
  TId,
  TNewProps,
  TSort,
  TStoredUpdate,
  TSuscriptor,
  TUpdateConfiguration,
} from './types';

/*
const logger = new Logger(
  { enabled: true, level: 3 },
  { consoleConfig: 'pstoreLoggerConfig', getReport: 'getPStoreReport' },
); */

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
export default class MStore<PropsType extends TDefProps = TDefProps> {
  #fields: Map<TId, PropsType>;

  #suscriptors = new Map<TId, TSuscriptor<PropsType>[]>();

  #listSuscriptors: TSuscriptor<PropsType[]>[] = [];

  get fields() {
    return cloneDeep(this.#fields);
  }

  #isBatching = false;

  #isHolding = false;

  #batchedUpdates = new Map<TId, PropsType>();

  #heldUpdates: TStoredUpdate<PropsType>[] = [];

  #batchUpdate(fieldId: TId, newProps: TNewProps<PropsType>) {
    if (!this.#batchedUpdates.has(fieldId)) {
      const props = this.fields.get(fieldId) ?? ({ id: fieldId } as PropsType);
      this.#batchedUpdates.set(fieldId, cloneDeep(props));
    }

    this.#batchedUpdates.set(
      fieldId,
      this.#mergeProps(fieldId, newProps, this.#batchedUpdates.get(fieldId)),
    );
  }

  /**
   * All stored updates will be triggered and the cache will be emptied.
   */
  #emitHeldUpdates() {
    this.#heldUpdates.forEach((current) =>
      this.#notify(
        current.field,
        this.#mergeProps(current.field, current.newProps),
      ),
    );
  }

  #mergeProps(
    fieldId: TId,
    newProps: TNewProps<PropsType>,
    prevProps: PropsType = this.#fields.get(fieldId) ??
      ({ id: fieldId } as PropsType),
  ) {
    return {
      ...prevProps,
      ...(newProps instanceof Function
        ? newProps(this.#fields.get(fieldId) as PropsType)
        : newProps),
    };
  }

  #notify(fieldId: TId, props: PropsType) {
    this.#suscriptors.get(fieldId)?.forEach((current) => current(props));
  }

  #notifyChangesToList() {
    this.#listSuscriptors.forEach((current) =>
      current([...this.#fields].map(([, props]) => props)),
    );
  }

  /** ************************************************************ */
  /*
   *                          PUBLIC API
   *
  /************************************************************** */

  /**
   *
   * @param name **Required** it will be used to build a map of all running stores, in order to allow them to be obtained from any part of the application.
   * @param initialFields **Optional** if passed, the
   */
  constructor(public name: string, initialFields: PropsType[] = []) {
    this.#fields = new Map<TId, PropsType>(
      initialFields.map((current) => [current.id, current]),
    );
    stores.set(name, this);
  }

  get length() {
    return this.#fields.size;
  }

  /**
   * Puts the store in batch mode, which means that no update will be fired until batchFinish is called.
   *
   * Each update called between batchInit and batchFinish will be merged in a temporary state and when batchFinish is called, every udpate field will be dispatched once, with the final version of the props.
   */
  batchInit() {
    this.#isBatching = true;
  }

  /**
   * Ends the batch mode, emitting all batched updates at once. Notice that if multiple updates were called on the same field, only one update will be called, including the result of the secuence of updates.
   */
  batchFinish() {
    this.#isBatching = false;
    this.#batchedUpdates.forEach((props) => {
      this.#fields.set(props.id, props);
    });
  }

  /**
   * Deletes the props of a field from the store
   *
   * @param fieldId
   */
  delete(fieldId: TId) {
    this.#fields.delete(fieldId);
    this.#suscriptors.delete(fieldId);
  }

  getProps(fieldId: TId) {
    if (!this.#fields.get(fieldId)) return undefined;

    return cloneDeep(this.#fields.get(fieldId) as PropsType);
  }

  /**
   * The store keeps the fields in the order they were inserted in the store, it is possible to store them with this method, which will affect the order in which the suscriptorsToList receive this list.
   */
  sortFields(sortMethod: TSort<PropsType>) {
    this.#fields = new Map(
      [...this.#fields].sort(([, propsA], [, propsB]) =>
        sortMethod(propsA, propsB),
      ),
    );
  }

  /**
   * Allows the suscription to the props change of a specific field.
   *
   * @param fieldId The id of the field which you want to suscribe.
   * @param suscriptor A callback that will be called every time an update is applied in the field's state.
   *
   * @returns **unsuscriber**, a function that when called, removes this suscription from the list.
   */
  suscribe(fieldId: TId, suscriptor: TSuscriptor<PropsType>) {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!this.#suscriptors.get(fieldId)) this.#suscriptors.set(fieldId, []);
    this.#suscriptors.get(fieldId)?.push(suscriptor);

    return () => {
      this.#suscriptors.set(
        fieldId,
        (this.#suscriptors.get(fieldId) ?? []).filter(
          (current) => current !== suscriptor,
        ),
      );
    };
  }

  /**
   * Allows to suscribe to the fields list of the store. This is, each time a field is added or removed, the listener will be called.
   *
   * @param suscriptor The callback to be called each time a change occurs in the list.
   * @returns **unsuscriber**, a function that when called, removes this suscription from the list.
   */
  suscribeToFieldsList(suscriptor: TSuscriptor<PropsType[]>) {
    this.#listSuscriptors.push(suscriptor);

    return () => {
      this.#listSuscriptors = this.#listSuscriptors.filter(
        (current) => current !== suscriptor,
      );
    };
  }

  /**
   * Updates the state of a field.
   *
   * @param configuration.emitUpdates If passed false, the update will not be triggered immediatelly.
   *
   * @param fieldId The id of the field whoose props will be updated.
   * @param newProps The props to update on the field.
   * @param configuration An object containing some configurations relative to this update.
   */
  update(
    fieldId: TId,
    newProps: Omit<TNewProps<PropsType>, 'id'>,
    configuration?: TUpdateConfiguration,
  ) {
    if (this.#isBatching) {
      this.#batchUpdate(fieldId, newProps);
    } else if (configuration?.emitUpdates === false) {
      this.#isHolding = true;
      this.#heldUpdates.push({ configuration, field: fieldId, newProps });
    } else {
      if (this.#isHolding) {
        this.#isHolding = false;
        this.#emitHeldUpdates();
      }

      this.#fields.set(fieldId, this.#mergeProps(fieldId, newProps));
      this.#notify(fieldId, this.#fields.get(fieldId) as PropsType);
    }
  }
}
