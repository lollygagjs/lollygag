import Lollygag, { IFile } from '..';
export declare function parseFiles(this: Lollygag, files: string[]): Promise<IFile[]>;
export declare function getFiles(this: Lollygag, globPatterns?: string[]): Promise<string[]>;
export declare function generatePrettyUrls(files: IFile[]): IFile[];
export declare function writeFiles(this: Lollygag, files: IFile[]): Promise<void[]>;
export declare function validateBuild(this: Lollygag, { allowExternalDirectories, allowWorkingDirectoryOutput }: {
    allowExternalDirectories?: boolean | undefined;
    allowWorkingDirectoryOutput?: boolean | undefined;
}): void;
