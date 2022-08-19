import { DepTree } from '../../types';
import { ContainerTarget } from '../types';
import { ScannedProject } from '@snyk/cli-interface/legacy/common';
export declare function getInfo({ isFromContainer, scannedProject, packageInfo, }: {
    isFromContainer: boolean;
    scannedProject: ScannedProject;
    packageInfo?: DepTree;
}): Promise<ContainerTarget | null>;
