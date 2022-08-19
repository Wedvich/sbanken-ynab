import { CustomError } from '../../../../../lib/errors';
import { IacFileData } from './types';
export declare function parseYAMLOrJSONFileData(fileData: IacFileData): any[];
export declare class InvalidJsonFileError extends CustomError {
    filename: string;
    constructor(filename: string);
}
export declare class InvalidYamlFileError extends CustomError {
    filename: string;
    constructor(filename: string);
}
