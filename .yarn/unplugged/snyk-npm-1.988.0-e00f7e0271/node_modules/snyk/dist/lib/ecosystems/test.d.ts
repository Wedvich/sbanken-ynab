import { Options, PolicyOptions } from '../types';
import { TestCommandResult } from '../../cli/commands/types';
import { Ecosystem, ScanResult, TestResult } from './types';
export declare function testEcosystem(ecosystem: Ecosystem, paths: string[], options: Options & PolicyOptions): Promise<TestCommandResult>;
export declare function selectAndExecuteTestStrategy(ecosystem: Ecosystem, scanResultsByPath: {
    [dir: string]: ScanResult[];
}, options: Options & PolicyOptions): Promise<[TestResult[], string[]]>;
