import { ScanResult } from '../ecosystems/types';
import { ResolutionMeta, ResolveAndMonitorFactsResponse, ResolveAndTestFactsResponse } from './types';
export declare function delayNextStep(attemptsCount: number, maxAttempts: number, pollInterval: number): Promise<void>;
export declare function extractResolutionMetaFromScanResult({ name, target, identity, policy, targetReference, }: ScanResult): ResolutionMeta;
export declare function handleProcessingStatus(response: ResolveAndMonitorFactsResponse | ResolveAndTestFactsResponse): void;
