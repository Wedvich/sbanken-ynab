import { validInput } from './input-validator';
/**
 * Prompts for $snyk apps create command
 */
export declare const createAppPrompts: {
    name: string;
    type: string;
    message: string;
    validate: typeof validInput;
}[];
