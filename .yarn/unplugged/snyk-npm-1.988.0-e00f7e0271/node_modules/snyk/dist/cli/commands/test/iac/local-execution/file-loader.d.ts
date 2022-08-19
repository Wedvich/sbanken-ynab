import { IacFileData } from './types';
import { CustomError } from '../../../../../lib/errors';
export declare function loadContentForFiles(filePaths: string[]): Promise<IacFileData[]>;
export declare function tryLoadFileData(pathToScan: string): Promise<IacFileData>;
export declare class NoFilesToScanError extends CustomError {
    constructor(message?: string);
}
export declare class FailedToLoadFileError extends CustomError {
    filename: string;
    constructor(filename: string);
}
