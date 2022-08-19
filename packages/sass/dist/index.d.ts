import { Options } from 'sass';
import { TWorker } from '@lollygag/core';
export interface ISassOptions {
    newExtname?: string | false;
    targetExtnames?: string[];
    sassOptions?: Options<'sync'>;
}
export declare function sass(options?: ISassOptions): TWorker;
export default sass;
