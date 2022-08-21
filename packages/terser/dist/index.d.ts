import t from 'terser';
import { TWorker } from '@lollygag/core';
export interface IOptions {
    newExtname?: string | false;
    targetExtnames?: string[];
    keepOriginal?: boolean;
    minifyOptions?: t.MinifyOptions;
}
export default function terser(options?: IOptions): TWorker;
