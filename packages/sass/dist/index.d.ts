import { SyncOptions } from 'node-sass';
import { TWorker } from '@lollygag/core';
export interface ISassOptions {
    newExtname?: string | false;
    targetExtnames?: string[];
    nodeSassOptions?: SyncOptions;
}
export default function sass(options?: ISassOptions): TWorker;
