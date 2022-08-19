import { OrgFeatureFlagResponse } from './types';
import { Options } from '../types';
export declare function isFeatureFlagSupportedForOrg(featureFlag: string, org: any): Promise<OrgFeatureFlagResponse>;
export declare function hasFeatureFlag(featureFlag: string, options: Options): Promise<boolean | undefined>;
