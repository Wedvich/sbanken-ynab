import { CustomError } from './custom-error';
export declare class NestedCustomError extends CustomError {
    constructor(message: string, innerError?: any);
    get nestedName(): string;
    get nestedStack(): string | undefined;
    get nestedMessage(): string;
    get nestedUserMessage(): string | undefined;
    get nestedCode(): number | undefined;
    get nestedStrCode(): string | undefined;
    toString(): string;
}
