import MStore from './mstore.js';
import SStore from './sstore.js';
import { TId } from './types.js';

type TComparator<SelectedType = unknown> = (prevProps: SelectedType, newProps: SelectedType) => boolean;
interface TUseSelectorProps<SelectedType extends object> {
    comparator?: TComparator<SelectedType>;
}
type TSelector<Selected = Partial<object>, PropsType = object> = (newProps: PropsType) => Selected;
declare function useSelector<PropsType extends object & {
    id: string;
} = object & {
    id: string;
}, SelectedType extends object = object>(selector: TSelector<SelectedType, PropsType>, store: SStore<PropsType>, configuration: TUseSelectorProps<SelectedType>): SelectedType;
declare function useSelector<PropsType extends object & {
    id: string;
} = object & {
    id: string;
}, SelectedType extends object = object>(field: TId, selector: TSelector<SelectedType, PropsType>, store: MStore<PropsType>, configuration: TUseSelectorProps<SelectedType>): SelectedType;

export { TComparator, TSelector, TUseSelectorProps, useSelector as default };
