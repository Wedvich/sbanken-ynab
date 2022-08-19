declare type FilePath = string;
declare type FileContent = string;
declare type MapOfFiles = Record<FilePath, FileContent>;
declare type ParsedResults = {
    parsedFiles: MapOfFiles;
    failedFiles: MapOfFiles;
    debugLogs: MapOfFiles;
};
export default function hclToJsonV2(files: MapOfFiles): ParsedResults;
export {};
