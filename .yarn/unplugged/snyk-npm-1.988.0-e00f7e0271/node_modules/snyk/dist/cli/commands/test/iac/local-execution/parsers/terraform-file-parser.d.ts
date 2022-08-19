import { CustomError } from '../../../../../../lib/errors';
export declare class FailedToParseTerraformFileError extends CustomError {
    filename: string;
    constructor(filename: string);
}
