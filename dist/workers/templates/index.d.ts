import { FileHandler, Worker } from '../..';
export interface ITemplatesOptions {
    newExtname?: string | false;
    targetExtnames?: string[];
    templatesDirectory?: string;
    partialsDirectory?: string;
    defaultTemplate?: string;
    templatingHandler?: FileHandler;
    templatingHandlerOptions?: unknown;
}
export declare const registerPartials: (dir: string) => void;
export declare function worker(options?: ITemplatesOptions): Worker;
export default worker;
