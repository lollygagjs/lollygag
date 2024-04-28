import { Options } from 'markdown-it';
import { FileHandler, Worker } from '../..';
export interface IMarkdownWorkerOptions {
    newExtname?: string | false;
    targetExtnames?: string[];
    markdownOptions?: Options;
    templatingHandler?: FileHandler;
    templatingHandlerOptions?: unknown;
}
export declare const handler: FileHandler;
export declare function worker(options?: IMarkdownWorkerOptions): Worker;
export default worker;
