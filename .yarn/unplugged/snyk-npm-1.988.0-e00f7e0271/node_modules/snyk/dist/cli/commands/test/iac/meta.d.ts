import { IacOutputMeta } from '../../../../lib/types';
import { IacOrgSettings } from './local-execution/types';
export interface GitRepository {
    readonly path: string;
    readRemoteUrl(): Promise<string | undefined>;
}
export interface GitRepositoryFinder {
    findRepositoryForPath(path: string): Promise<GitRepository | undefined>;
}
export declare function buildMeta(repositoryFinder: GitRepositoryFinder, orgSettings: IacOrgSettings, projectRoot: string, remoteRepoUrl?: string, targetName?: string): Promise<IacOutputMeta>;
export declare function getProjectNameFromGitUrl(url: string): string;
