import { Worker } from '@lollygag/core';
export interface IArchivesOptions {
    dir: string;
    pageLimit?: number;
    renameToTitle?: boolean;
}
export declare const slugify: (s: string) => string;
export declare function archives(options: IArchivesOptions): Worker;
export default archives;
