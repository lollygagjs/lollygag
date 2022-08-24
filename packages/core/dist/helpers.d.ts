export * from './workers/handlebars';
export declare function fullExtname(filePath: string): string;
export declare function changeExtname(filePath: string, newExtension: string): string;
export declare function changeFullExtname(filePath: string, newExtension: string): string;
export declare function addParentToPath(parent: string, path: string): string;
export declare function removeParentFromPath(parent: string, path: string): string;
export declare function deleteEmptyDirs(dir: string): Promise<void>;
export declare function deleteFiles(files: string[]): Promise<void[]>;
export declare function deepCopy<T>(original: T): T;
