import { Contributor, Options } from '../types';
import { MonitorDependenciesResponse, ScanResult } from '../ecosystems/types';
import { ResolutionMeta, ResolveFactsState } from './types';
export declare function requestMonitorPollingToken(options: Options, isAsync: boolean, scanResult: ScanResult): Promise<ResolveFactsState>;
export declare function pollingMonitorWithTokenUntilDone(token: string, isAsync: boolean, options: Options, pollInterval: number, attemptsCount: number, maxAttempts: number | undefined, resolutionMeta: ResolutionMeta | undefined, contributors?: Contributor[]): Promise<MonitorDependenciesResponse>;
