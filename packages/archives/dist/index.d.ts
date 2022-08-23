import { TWorker } from '@lollygag/core';
export interface IArchivesOptions {
    dir: string;
    pageLimit?: number;
    renameToTitle?: boolean;
}
export declare const slugify: (s: string) => string;
export declare function archives(options: IArchivesOptions): TWorker;
export default archives;
