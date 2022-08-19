/// <reference types="node" />
export declare function isExe(path: string): Promise<boolean>;
export declare function isExists(path: string): Promise<boolean>;
export declare function createDirIfNotExists(path: string): Promise<void>;
export declare function isFile(path: string): Promise<boolean>;
export declare function isArchive(path: string): Promise<boolean>;
export declare function saveFile(dataBuffer: Buffer, savePath: string): Promise<void>;
