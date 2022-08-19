import { SastSettings, TrackUsageResponse } from './types';
export declare function getSastSettingsForOrg(org: any): Promise<SastSettings>;
export declare function trackUsage(org: any): Promise<TrackUsageResponse>;
