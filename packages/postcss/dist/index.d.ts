import { AcceptedPlugin, ProcessOptions } from 'postcss';
import { TWorker } from '@lollygag/core';
export interface IOptions {
    newExtname?: string | false;
    targetExtnames?: string[];
    keepOriginal?: boolean;
    plugins?: AcceptedPlugin[];
    processOptions?: ProcessOptions;
}
export declare function postcss(options?: IOptions): TWorker;
export default postcss;
