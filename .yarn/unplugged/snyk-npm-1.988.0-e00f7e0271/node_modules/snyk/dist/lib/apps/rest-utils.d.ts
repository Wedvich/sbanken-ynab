/**
 * Collection of utility function for the
 * $snyk apps commands
 */
import { EAppsURL, ICreateAppResponse, IGetAppsURLOpts } from '.';
export declare function getAppsURL(selection: EAppsURL, opts?: IGetAppsURLOpts): string;
export declare function handleRestError(error: any): void;
export declare function handleCreateAppRes(res: ICreateAppResponse): string;
