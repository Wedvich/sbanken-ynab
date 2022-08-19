import { CloudConfigFileTypes, MapsDocIdToTree } from '@snyk/cloud-config-parser';
export declare function getFileTypeForParser(fileType: string): CloudConfigFileTypes;
export declare function extractLineNumber(cloudConfigPath: string[], fileType: CloudConfigFileTypes, treeByDocId: MapsDocIdToTree): number;
