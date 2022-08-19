/// <reference types="node" />
export declare function createIacDir(): void;
export declare function extractBundle(response: NodeJS.ReadableStream): Promise<void>;
export declare function isValidBundle(wasmPath: string, dataPath: string): boolean;
export declare function computeCustomRulesBundleChecksum(): string | undefined;
/**
 * makeFileAndDirectoryGenerator is a generator function that helps walking the directory and file structure of this pathToScan
 * @param root
 * @param maxDepth? - An optional `maxDepth` argument can be provided to limit how deep in the file tree the search will go.
 * @returns {Generator<object>} - a generator which yields an object with directories or paths for the path to scan
 */
export declare function makeFileAndDirectoryGenerator(root?: string, maxDepth?: number): Generator<any, void, any>;
