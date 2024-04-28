/// <reference types="node" />
import { Stats } from 'fs';
import { IBuildOptions } from './utils/build';
export * from './utils/general';
export type RaggedyAny = any;
export type RaggedyObject = Record<string, RaggedyAny>;
export interface IFile {
    path: string;
    mimetype: string;
    stats?: Stats;
    name?: string;
    title?: string;
    content?: string;
    template?: string;
    status?: 'published' | 'draft' | string;
    exclude?: boolean;
    [prop: string]: RaggedyAny;
}
export interface ISitemeta {
    year?: number;
    [prop: string]: RaggedyAny;
}
export type FileHandler = (content: string, options?: unknown, sitemeta?: ISitemeta) => string;
export interface IConfig {
    generator?: string;
    prettyUrls?: boolean;
    generateTimestamp?: boolean;
    subdir?: string;
    templatingHandler?: FileHandler;
    templatingHandlerOptions?: unknown;
}
export type Worker = (files: IFile[], lollygag: Lollygag) => void | Promise<void>;
export default class Lollygag {
    private __config;
    private __sitemeta;
    private __contentDir;
    private __staticDir;
    private __outputDir;
    private __workers;
    constructor(__config?: IConfig, __sitemeta?: ISitemeta, __contentDir?: string, __staticDir?: string, __outputDir?: string, __workers?: Worker[]);
    config(config: IConfig): this;
    get _config(): IConfig;
    sitemeta(sitemeta: ISitemeta): this;
    get _sitemeta(): ISitemeta;
    contentDir(dir: string): this;
    get _contentDir(): string;
    staticDir(dir: string): this;
    get _staticDir(): string;
    outputDir(dir: string): this;
    get _outputDir(): string;
    do(worker: Worker): this;
    get _workers(): Worker[];
    protected handleTemplating: FileHandler;
    build: (options: IBuildOptions) => Promise<void>;
}
