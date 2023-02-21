import Logger from '@aluy/logger';
import cloneDeep from 'lodash.clonedeep';
import {
  TId,
  TNewProps,
  TStoredUpdate,
  TSuscriptor,
  TUpdateConfiguration,
} from './types';

const logger = new Logger(
  { enabled: true, level: 3 },
  { consoleConfig: 'pstoreLoggerConfig', getReport: 'getPStoreReport' },
);

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
export default class MStore<
  PropsType extends { id: TId } & object = { id: TId } & object,
> {
  #fields: Map<TId, PropsType>;

  #suscriptors = new Map<TId, TSuscriptor<PropsType>[]>();

  get fields() {
    logger.log(1, 'Got fields');
    return cloneDeep(this.#fields);
  }

  #isBatching = false;

  #isHolding = false;

  #batchedUpdates = new Map<TId, PropsType>();

  #heldUpdates: TStoredUpdate<PropsType>[] = [];

  #batchUpdate(
    field: TId,
    newProps: TNewProps<PropsType>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _configuration?: TUpdateConfiguration,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!this.#batchedUpdates.has(field)) {
      const props = this.fields.get(field) ?? ({ id: field } as PropsType);
      this.#batchedUpdates.set(field, cloneDeep(props));
    }

    this.#batchedUpdates.set(
      field,
      this.#mergeProps(field, newProps, this.#batchedUpdates.get(field)),
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
    field: TId,
    newProps: TNewProps<PropsType>,
    prevProps: PropsType = this.#fields.get(field) ??
      ({ id: field } as PropsType),
  ) {
    return {
      ...prevProps,
      ...(newProps instanceof Function
        ? newProps(this.#fields.get(field) as PropsType)
        : newProps),
    };
  }

  #notify(field: TId, props: PropsType) {
    this.#suscriptors.get(field)?.forEach((current) => current(props));
  }

  /** ************************************************************ */
  /*
   *                          PUBLIC API
   *
  /************************************************************** */

  constructor(initialFields: PropsType[] = []) {
    this.#fields = new Map();
    initialFields.forEach((current) => this.#fields.set(current.id, current));
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

  delete(field: TId) {
    this.#fields.delete(field);
    this.#suscriptors.delete(field);
  }

  getProps(field: TId) {
    if (!this.#fields.get(field)) return undefined;

    return cloneDeep(this.#fields.get(field) as PropsType);
  }

  /**
   * Allows the suscription to the props change of a specific field.
   *
   * @param field The id of the field which you want to suscribe.
   * @param suscriptor A callback that will be called every time an update is applied in the field's state.
   *
   * @returns Unsuscriptor, a callback that when called, will remove this suscription from the store.
   */
  suscribe(field: TId, suscriptor: TSuscriptor<PropsType>) {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!this.#suscriptors.get(field)) this.#suscriptors.set(field, []);
    this.#suscriptors.get(field)?.push(suscriptor);

    return () => {
      this.#suscriptors.set(
        field,
        (this.#suscriptors.get(field) ?? []).filter(
          (current) => current !== suscriptor,
        ),
      );
    };
  }

  /**
   * Updates the state of a field.
   *
   * @param configuration.emitUpdates If passed false, the update will not be triggered immediatelly.
   *
   * @param field The id of the field whoose props will be updated.
   * @param newProps The props to update on the field.
   * @param configuration An object containing some configurations relative to this update.
   */
  update(
    field: TId,
    newProps: Omit<TNewProps<PropsType>, 'id'>,
    configuration?: TUpdateConfiguration,
  ) {
    if (this.#isBatching) {
      this.#batchUpdate(field, newProps, configuration);
    } else if (configuration?.emitUpdates === false) {
      this.#isHolding = true;
      this.#heldUpdates.push({ configuration, field, newProps });
    } else {
      if (this.#isHolding) {
        this.#isHolding = false;
        this.#emitHeldUpdates();
      }

      this.#fields.set(field, this.#mergeProps(field, newProps));
      this.#notify(field, this.#fields.get(field) as PropsType);
    }
  }
}
