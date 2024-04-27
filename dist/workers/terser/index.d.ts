import t from 'terser';
import { Worker } from '../..';
export interface ITerserWorkerOptions {
    newExtname?: string | false;
    targetExtnames?: string[];
    keepOriginal?: boolean;
    minifyOptions?: t.MinifyOptions;
}
export default function terser(options?: ITerserWorkerOptions): Worker;
