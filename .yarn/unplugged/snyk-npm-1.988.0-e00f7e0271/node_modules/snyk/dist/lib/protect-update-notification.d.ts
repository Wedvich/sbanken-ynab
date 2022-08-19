export declare function getProtectUpgradeWarningForPaths(packageJsonPaths: string[]): string;
export declare function packageJsonFileExistsInDirectory(directoryPath: string): boolean;
export declare function checkPackageJsonForSnykDependency(packageJsonPath: string): boolean;
export declare function getPackageJsonPathsContainingSnykDependency(fileOption: string | undefined, paths: string[]): string[];
