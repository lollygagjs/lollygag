/// <reference types="node" />
import { Stats } from 'fs';
import { IBuildOptions } from './helpers/build';
export * from './helpers/general';
export declare type RaggedyAny = any;
export declare type RaggedyObject = Record<string, RaggedyAny>;
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
export interface IMeta {
    year?: number;
    [prop: string]: RaggedyAny;
}
export declare type FileHandler = (content: string, options?: unknown, data?: IMeta) => string;
export interface IConfig {
    generator?: string;
    prettyUrls?: boolean;
    generateTimestamp?: boolean;
    subdir?: string;
    templatingHandler?: FileHandler;
    templatingHandlerOptions?: unknown;
}
export declare type Worker = (files: IFile[], lollygag: Lollygag) => void | Promise<void>;
export declare class Lollygag {
    private __config;
    private __meta;
    private __in;
    private __out;
    private __files;
    private __workers;
    constructor(__config?: IConfig, __meta?: IMeta, __in?: string, __out?: string, __files?: IFile[], __workers?: Worker[]);
    config(config: IConfig): this;
    get _config(): IConfig;
    meta(meta: IMeta): this;
    get _meta(): IMeta;
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
export default Lollygag;
