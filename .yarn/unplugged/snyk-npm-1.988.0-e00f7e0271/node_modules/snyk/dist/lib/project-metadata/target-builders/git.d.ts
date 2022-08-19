import { GitTarget } from '../types';
export declare function getInfo({ isFromContainer, cwd, }: {
    isFromContainer: boolean;
    cwd?: string;
}): Promise<GitTarget | null>;
