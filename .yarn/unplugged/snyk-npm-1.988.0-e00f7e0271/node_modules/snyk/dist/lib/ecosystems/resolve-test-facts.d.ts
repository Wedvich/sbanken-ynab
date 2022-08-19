import { Options, PolicyOptions } from '../types';
import { Ecosystem, ScanResult, TestResult } from './types';
export declare function resolveAndTestFacts(ecosystem: Ecosystem, scans: {
    [dir: string]: ScanResult[];
}, options: Options & PolicyOptions): Promise<[TestResult[], string[]]>;
