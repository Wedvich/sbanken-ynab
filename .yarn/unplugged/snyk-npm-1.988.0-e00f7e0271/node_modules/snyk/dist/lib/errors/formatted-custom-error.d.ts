import { CustomError } from '.';
export declare class FormattedCustomError extends CustomError {
    formattedUserMessage: string;
    constructor(message: string, formattedUserMessage: string, userMessage?: string);
}
