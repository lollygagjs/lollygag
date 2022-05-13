import { TWorker } from '@lollygag/core';
/**
 * Glob path of files to watch.
 */
export declare type TToWatch = string;
/**
 * Boolean or glob path of files to rebuild. Glob path is
 * relative to the `Lollygag` instance's `__in` directory. When
 * set to true, only the edited/added file will get rebuilt.
 */
export declare type TToRebuild = string | boolean;
export interface IWatchPatterns {
    [prop: string]: TToRebuild;
}
export interface IWatchOptions {
    serverPort?: number;
    livereloadPort?: number;
    injectLivereloadScript?: boolean;
    patterns: IWatchPatterns;
    fullBuild?: boolean;
}
export default function livedev(options: IWatchOptions): TWorker;
