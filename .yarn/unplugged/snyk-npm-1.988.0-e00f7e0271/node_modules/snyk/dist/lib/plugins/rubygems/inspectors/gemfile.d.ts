import { Spec } from './index';
import * as types from '../../types';
export declare function canHandle(file: string): boolean;
export declare function gatherSpecs(root: string, target: string, options: types.Options): Promise<Spec>;
