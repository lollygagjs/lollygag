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
    [prop: string]: RaggedyAny;
}
export interface ISitemeta {
    year?: number;
    [prop: string]: RaggedyAny;
}
export type FileHandler = (content: string, options?: unknown, data?: ISitemeta) => string;
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
    private __in;
    private __out;
    private __files;
    private __workers;
    constructor(__config?: IConfig, __sitemeta?: ISitemeta, __in?: string, __out?: string, __files?: IFile[], __workers?: Worker[]);
    config(config: IConfig): this;
    get _config(): IConfig;
    sitemeta(sitemeta: ISitemeta): this;
    get _sitemeta(): ISitemeta;
    in(dir: string): this;
    get _in(): string;
    out(dir: string): this;
    get _out(): string;
    files(files: IFile[]): this;
    get _files(): IFile[];
    do(worker: Worker): this;
    get _workers(): Worker[];
    protected handleTemplating: FileHandler;
    build: (options: IBuildOptions) => Promise<void>;
}
