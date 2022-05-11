import { TWorker } from '@lollygag/core';
import { AcceptedPlugin, ProcessOptions } from 'postcss';
export interface IOptions {
    newExtname?: string | false;
    targetExtnames?: string[];
    keepOriginal?: boolean;
    plugins?: AcceptedPlugin[];
    processOptions?: ProcessOptions;
}
export default function postcss(options?: IOptions): TWorker;