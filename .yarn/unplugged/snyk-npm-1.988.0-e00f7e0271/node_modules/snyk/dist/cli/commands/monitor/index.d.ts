import { ProjectAttributes, Tag } from '../../../lib/types';
import { MethodArgs } from '../../args';
export default function monitor(...args0: MethodArgs): Promise<any>;
export declare function validateProjectAttributes(options: any): void;
export declare function generateProjectAttributes(options: any): ProjectAttributes;
/**
 * Parse CLI --tags options into an internal data structure.
 *
 * If this returns undefined, it means "do not touch the existing tags on the project".
 *
 * Anything else means "replace existing tags on the project with this list" even if empty.
 *
 * @param options CLI options
 * @returns List of parsed tags or undefined if they are to be left untouched.
 */
export declare function generateTags(options: any): Tag[] | undefined;
export declare function validateTags(options: any): void;
