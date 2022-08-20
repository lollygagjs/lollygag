import { TWorker } from '@lollygag/core';
export interface IOptions {
    newExtname?: string | false;
    targetExtnames?: string[];
    keepOriginal?: boolean;
}
export default function terser(options?: IOptions): TWorker;
