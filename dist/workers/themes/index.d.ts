import { FileHandler, Worker } from '../..';
export interface IThemesOptions {
    newExtname?: string | false;
    targetExtnames?: string[];
    themesDirectory?: string;
    partialsDirectory?: string;
    defaultTheme?: string;
    templatingHandler?: FileHandler;
    templatingHandlerOptions?: unknown;
}
export declare const registerPartials: (dir: string) => void;
export declare function worker(options?: IThemesOptions): Worker;
export default worker;
