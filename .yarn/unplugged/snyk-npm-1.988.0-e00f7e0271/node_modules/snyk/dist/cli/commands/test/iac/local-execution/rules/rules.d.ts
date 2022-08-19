import { IacOrgSettings, IaCTestFlags, RulesOrigin } from '../types';
import { CustomError } from '../../../../../../lib/errors';
import { OciRegistry } from './oci-registry';
export declare function initRules(buildOciRegistry: () => OciRegistry, iacOrgSettings: IacOrgSettings, options: IaCTestFlags, orgPublicId: string): Promise<RulesOrigin>;
export declare function buildDefaultOciRegistry(settings: IacOrgSettings): OciRegistry;
/**
 * Pull and store the IaC custom-rules bundle from the remote OCI Registry.
 */
export declare function pullIaCCustomRules(buildOciRegistry: () => OciRegistry, iacOrgSettings: IacOrgSettings): Promise<string>;
export declare class FailedToPullCustomBundleError extends CustomError {
    constructor(message?: string);
}
export declare class FailedToExecuteCustomRulesError extends CustomError {
    constructor(message?: string);
}
