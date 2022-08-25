import { Options } from 'sass';
import { Worker } from '@lollygag/core';
export interface ISassOptions {
    newExtname?: string | false;
    targetExtnames?: string[];
    sassOptions?: Options<'sync'>;
}
export declare function sass(options?: ISassOptions): Worker;
export default sass;
