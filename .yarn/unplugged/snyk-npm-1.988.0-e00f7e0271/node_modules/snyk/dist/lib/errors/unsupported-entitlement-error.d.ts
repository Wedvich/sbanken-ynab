import { CustomError } from './custom-error';
export declare class UnsupportedEntitlementError extends CustomError {
    readonly entitlement: string;
    private static ERROR_CODE;
    constructor(entitlement: string, userMessage?: string);
}
