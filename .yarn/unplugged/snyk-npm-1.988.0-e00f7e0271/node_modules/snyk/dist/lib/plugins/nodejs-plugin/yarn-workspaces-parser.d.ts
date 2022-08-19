import { MultiProjectResultCustom } from '../get-multi-plugin-result';
export declare function processYarnWorkspaces(root: string, settings: {
    strictOutOfSync?: boolean;
    dev?: boolean;
    yarnWorkspaces?: boolean;
}, targetFiles: string[]): Promise<MultiProjectResultCustom>;
interface YarnWorkspacesMap {
    [packageJsonName: string]: {
        workspaces: string[];
    };
}
export declare function getWorkspacesMap(file: {
    content: string;
    fileName: string;
}): YarnWorkspacesMap;
export declare function packageJsonBelongsToWorkspace(packageJsonFileName: string, yarnWorkspacesMap: YarnWorkspacesMap, workspaceRoot: string): boolean;
export {};
