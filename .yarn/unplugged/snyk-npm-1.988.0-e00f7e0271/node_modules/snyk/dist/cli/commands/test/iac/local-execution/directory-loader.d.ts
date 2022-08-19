/**
 * Gets all nested directories for the path that we ran a scan.
 * @param pathToScan - the path to scan provided by the user
 * @param maxDepth? - An optional `maxDepth` argument can be provided to limit how deep in the file tree the search will go.
 * @returns {string[]} An array with all the non-empty nested directories in this path
 */
export declare function getAllDirectoriesForPath(pathToScan: string, maxDepth?: number): string[];
/**
 * Gets all file paths for the specific directory
 * @param pathToScan - the path to scan provided by the user
 * @param currentDirectory - the directory which we want to return files for
 * @returns {string[]} An array with all the Terraform filePaths for this directory
 */
export declare function getFilesForDirectory(pathToScan: string, currentDirectory: string): string[];
/**
 * Iterates through the makeFileAndDirectoryGenerator function and gets all the Terraform files in the specified directory
 * @param pathToScan - the pathToScan to scan provided by the user
 * @returns {Generator<string>} - a generator which holds all the filepaths
 */
export declare function getFilesForDirectoryGenerator(pathToScan: string): Generator<string>;
export declare const shouldBeParsed: (pathToScan: string) => boolean;
export declare const getFileType: (pathToScan: string) => string;
