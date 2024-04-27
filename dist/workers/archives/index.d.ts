import Lollygag, { IFile } from '../..';
export interface IArchivesOptions {
    dir: string;
    pageLimit?: number;
    renameToTitle?: boolean;
}
export declare const slugify: (s: string) => string;
export declare function archives(options: IArchivesOptions): (files: IFile[], lollygag: Lollygag) => void;
export default archives;
