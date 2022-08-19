import { IacFileParsed, IacFileScanResult } from './types';
import { CustomError } from '../../../../../lib/errors';
import { IacFileInDirectory } from '../../../../../lib/types';
export declare function scanFiles(parsedFiles: Array<IacFileParsed>): Promise<{
    scannedFiles: IacFileScanResult[];
    failedScans: IacFileInDirectory[];
}>;
export declare function validateResultFromCustomRules(result: IacFileScanResult): {
    validatedResult: IacFileScanResult;
    invalidIssues: IacFileInDirectory[];
};
export declare function clearPolicyEngineCache(): void;
export declare class FailedToBuildPolicyEngine extends CustomError {
    constructor(message?: string);
}
export declare class FailedToExecutePolicyEngine extends CustomError {
    constructor(message?: string);
}
