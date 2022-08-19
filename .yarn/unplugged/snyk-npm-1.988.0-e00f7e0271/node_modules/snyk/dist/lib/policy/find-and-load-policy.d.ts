import { PackageExpanded } from 'snyk-resolve-deps';
import { SupportedPackageManagers } from '../package-managers';
import { PolicyOptions } from '../types';
export declare function findAndLoadPolicy(root: string, scanType: SupportedPackageManagers | 'docker' | 'iac' | 'cpp', options: PolicyOptions, pkg?: PackageExpanded, scannedProjectFolder?: string): Promise<Policy | undefined>;
export interface Policy {
    filter(vulns: any, root?: string, matchStrategy?: string): any;
    exclude?: {
        [key: string]: string[];
    };
    ignore?: any;
}
