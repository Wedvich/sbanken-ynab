import { Options } from '../types';
import { ScanResult } from '../ecosystems/types';
import { ResolveAndTestFactsResponse } from './types';
import { TestDependenciesResult } from '../snyk-test/legacy';
export declare function requestTestPollingToken(options: Options, isAsync: boolean, scanResult: ScanResult): Promise<ResolveAndTestFactsResponse>;
export declare function pollingTestWithTokenUntilDone(token: string, type: string, options: Options, pollInterval: number, attemptsCount: number, maxAttempts?: number): Promise<TestDependenciesResult>;
