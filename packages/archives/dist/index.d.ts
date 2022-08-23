import { TWorker } from '@lollygag/core';
export interface IArchivesOptions {
    newExtname?: string | false;
    targetExtnames?: string[];
    pageLimit?: number;
    dir: string;
    renameToTitle?: boolean;
}
export declare const slugify: (s: string) => string;
export declare function archives(options: IArchivesOptions): TWorker;
export default archives;
