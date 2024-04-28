import { AcceptedPlugin, ProcessOptions } from 'postcss';
import { Worker } from '../..';
export interface IPostCSSWorkerOptions {
    newExtname?: string | false;
    targetExtnames?: string[];
    keepOriginal?: boolean;
    plugins?: AcceptedPlugin[];
    processOptions?: ProcessOptions;
}
export declare function worker(options?: IPostCSSWorkerOptions): Worker;
export default worker;
