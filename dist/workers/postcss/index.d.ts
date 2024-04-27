import { AcceptedPlugin, ProcessOptions } from 'postcss';
import { Worker } from '../..';
export interface IPostCSSWorkerOptions {
    newExtname?: string | false;
    targetExtnames?: string[];
    keepOriginal?: boolean;
    plugins?: AcceptedPlugin[];
    processOptions?: ProcessOptions;
}
export declare function postcss(options?: IPostCSSWorkerOptions): Worker;
export default postcss;
