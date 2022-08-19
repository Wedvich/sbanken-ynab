import { CustomError } from '../errors';
export declare const services2resources: Map<string, string[]>;
export declare function verifyServiceMappingExists(services: string[]): void;
export declare function findServiceMappingForType(type: string): string;
export declare function createIgnorePattern(services: string[]): string;
export declare function createIgnorePatternWithMap(services: string[], serviceMap: Map<string, Array<string>>): string;
export declare class InvalidServiceError extends CustomError {
    constructor(msg: string);
}
