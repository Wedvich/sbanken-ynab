import { Contributor, Options } from '../types';
import { ScanResult, EcosystemMonitorError, EcosystemMonitorResult } from './types';
export declare function resolveAndMonitorFacts(scans: {
    [dir: string]: ScanResult[];
}, options: Options, contributors?: Contributor[]): Promise<[EcosystemMonitorResult[], EcosystemMonitorError[]]>;
