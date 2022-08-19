import { ParserFileType } from '@snyk/cloud-config-parser';
export declare type IacProjectTypes = 'k8sconfig' | 'terraformconfig' | 'cloudformationconfig' | 'armconfig' | 'customconfig' | 'multiiacconfig';
export declare type IacFileTypes = ParserFileType | 'tf' | 'tfvars';
export declare enum IacProjectType {
    K8S = "k8sconfig",
    TERRAFORM = "terraformconfig",
    CLOUDFORMATION = "cloudformationconfig",
    ARM = "armconfig",
    CUSTOM = "customconfig",
    MULTI_IAC = "multiiacconfig"
}
export declare const TEST_SUPPORTED_IAC_PROJECTS: IacProjectTypes[];
export declare const iacRemediationTypes: {
    [k in IacProjectTypes]?: string;
};
