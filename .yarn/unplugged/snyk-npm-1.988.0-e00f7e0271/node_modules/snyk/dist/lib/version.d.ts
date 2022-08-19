export declare function getVersion(): string;
/**
 * We use pkg to create standalone builds (binaries).
 * pkg uses `process.pkg` to identify itself at runtime so we can do the same.
 * https://github.com/vercel/pkg
 */
export declare function isStandaloneBuild(): boolean;
