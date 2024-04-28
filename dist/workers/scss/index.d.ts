import { Options } from 'sass';
import { Worker } from '../..';
export interface ISassOptions {
    newExtname?: string | false;
    targetExtnames?: string[];
    sassOptions?: Options<'sync'>;
}
export declare function worker(options?: ISassOptions): Worker;
export default worker;
