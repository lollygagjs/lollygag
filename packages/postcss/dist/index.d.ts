import { AcceptedPlugin, ProcessOptions } from 'postcss';
import { Worker } from '@lollygag/core';
export interface IOptions {
    newExtname?: string | false;
    targetExtnames?: string[];
    keepOriginal?: boolean;
    plugins?: AcceptedPlugin[];
    processOptions?: ProcessOptions;
}
export declare function postcss(options?: IOptions): Worker;
export default postcss;
