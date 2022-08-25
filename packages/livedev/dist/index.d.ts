import { Worker } from '@lollygag/core';
/**
 * Glob path of files to watch.
 */
export declare type ToWatch = string;
/**
 * Boolean or glob path of files to rebuild. Glob path is
 * relative to the `Lollygag` instance's `__in` directory. When
 * set to true, only the edited/added file will get rebuilt.
 */
export declare type ToRebuild = string | boolean;
export interface IWatchPatterns {
    [prop: string]: ToRebuild;
}
export interface IWatchOptions {
    serverPort?: number;
    livereloadPort?: number;
    injectLivereloadScript?: boolean;
    patterns: IWatchPatterns;
    fullBuild?: boolean;
}
export declare function livedev(options: IWatchOptions): Worker;
export default livedev;
