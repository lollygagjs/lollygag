/// <reference types="node" />
import { Stats } from 'fs';
export * from './helpers';
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
export declare type TFileHandler = (content: string, options?: unknown, data?: IMeta) => string;
export interface IConfig {
    generator?: string;
    prettyUrls?: boolean;
    subdir?: string;
    templatingHandler?: TFileHandler;
    templatingHandlerOptions?: unknown;
}
export interface IBuildOptions {
    fullBuild?: boolean;
    allowExternalDirectories?: boolean;
    allowWorkingDirectoryOutput?: boolean;
    globPattern?: string | null;
}
export declare type TWorker = (files: IFile[], lollygag: Lollygag) => void | Promise<void>;
export declare class Lollygag {
    private __config;
    private __meta;
    private __in;
    private __out;
    private __files;
    private __workers;
    constructor(__config?: IConfig, __meta?: IMeta, __in?: string, __out?: string, __files?: IFile[], __workers?: TWorker[]);
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
    do(worker: TWorker): this;
    get _workers(): TWorker[];
    private getFileMimetype;
    private getFiles;
    private handleTemplating;
    private parseFiles;
    private generatePrettyUrls;
    private write;
    private validate;
    build(options?: IBuildOptions): Promise<void>;
}
export default Lollygag;
