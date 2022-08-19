import { OCIRegistryURLComponents } from '../types';
import { CustomError } from '../../../../../../lib/errors';
import { OciRegistry } from './oci-registry';
export declare const CUSTOM_RULES_TARBALL = "custom-bundle.tar.gz";
export declare function extractOCIRegistryURLComponents(OCIRegistryURL: string): OCIRegistryURLComponents;
/**
 * Downloads an OCI Artifact from a remote OCI Registry and writes it to the
 * disk. The artifact here is a custom rules bundle stored in a remote registry.
 * In order to do that, it calls an external docker registry v2 client to get
 * the manifests, the layers and then builds the artifact. Example:
 * https://github.com/opencontainers/image-spec/blob/main/manifest.md#example-image-manifest
 *
 * @param registry The client for accessing an OCI registry.
 * @param repository The name of an OCI repository.
 * @param tag The tag of an image in an OCI repository.
 **/
export declare function pull(registry: OciRegistry, repository: string, tag: string): Promise<string>;
export declare class FailedToBuildOCIArtifactError extends CustomError {
    constructor(message?: string);
}
export declare class InvalidManifestSchemaVersionError extends CustomError {
    constructor(message?: string);
}
export declare class InvalidRemoteRegistryURLError extends CustomError {
    constructor(url?: string);
}
export declare class UnsupportedEntitlementPullError extends CustomError {
    constructor(entitlement: string);
}
