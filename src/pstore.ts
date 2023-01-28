import cloneDeep from 'lodash.clonedeep';
import { TId, TMap, TSuscriptor } from './types';

export default class PStore<PropsType extends TMap = TMap> {
  #fields: TMap<PropsType> = {};

  #suscriptors: TMap<TSuscriptor<PropsType>[]> = {};

  get fields() {
    return cloneDeep(this.#fields);
  }

  suscribe(fieldId: TId, suscriptor: TSuscriptor<PropsType>) {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!this.#suscriptors[fieldId]) this.#suscriptors[fieldId] = [];
    this.#suscriptors[fieldId].push(suscriptor);
  }

  update(fieldId: TId, props: Partial<PropsType>) {
    this.#fields[fieldId] = { ...this.#fields[fieldId], ...props };
    this.#suscriptors[fieldId].forEach((current) => current(this.#fields[fieldId]));
  }
}
