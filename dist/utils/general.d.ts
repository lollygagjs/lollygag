export * as archives from '../workers/archives';
export * as handlebars from '../workers/handlebars';
export * as images from '../workers/images';
export * as livedev from '../workers/livedev';
export * as markdown from '../workers/markdown';
export * as postcss from '../workers/postcss';
export * as scss from '../workers/scss';
export * as templates from '../workers/templates';
export * as terser from '../workers/terser';
export * as typescript from '../workers/typescript';
/**
 * Returns the full extension of a file path.
 *
 * @param filePath - The file path.
 * @example
 * fullExtname('path/to/file.ext1.ext2') // '.ext1.ext2'
 * @returns The full extension of the file path.
 */
export declare function fullExtname(filePath: string): string;
/**
 * Changes the extension of a file path to a new extension.
 *
 * @param filePath - The original file path.
 * @param newExtension - The new extension to replace the current extension.
 * @example
 * changeExtname('path/to/file.ext1.ext2', '.new') // 'path/to/file.ext1.new'
 * @returns The modified file path with the new extension.
 */
export declare function changeExtname(filePath: string, newExtension: string): string;
/**
 * Changes the full extension of a file path to a new extension.
 *
 * @param filePath - The original file path.
 * @param newExtension - The new extension to replace the existing extension.
 * @example
 * changeFullExtname('path/to/file.ext1.ext2', '.new') // 'path/to/file.new'
 * @returns The modified file path with the new extension.
 */
export declare function changeFullExtname(filePath: string, newExtension: string): string;
export declare function addParentToPath(parent: string, path: string): string;
export declare function removeParentFromPath(parent: string, path: string): string;
export declare function removeUpToParentFromPath(parent: string, path: string): string;
export declare function deleteEmptyDirs(dir: string): Promise<void>;
export declare function deleteFiles(files: string[]): Promise<void[]>;
export declare function deepCopy<T>(original: T): T;
export declare function deepEqual<T>(a: T, b: T): boolean;
export declare function getFileMimetype(filePath: string): Promise<string>;
