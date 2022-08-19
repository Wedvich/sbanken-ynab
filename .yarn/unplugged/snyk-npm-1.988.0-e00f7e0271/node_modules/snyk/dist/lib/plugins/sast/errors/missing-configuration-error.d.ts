import { CustomError } from '../../../errors/custom-error';
export declare class MissingConfigurationError extends CustomError {
    readonly action: string;
    constructor(action: string, additionalUserHelp?: string);
}
