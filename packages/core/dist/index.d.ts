import { IMarkdownOptions, ITemplatesOptions } from './helpers';
export * from './helpers';
export declare type RaggedyAny = any;
export declare type RaggedyObject = Record<string, RaggedyAny>;
export interface IFile {
    path: string;
    mimetype: string;
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
    disableBuiltins?: boolean;
    subdir?: string;
    templatingHandler?: TFileHandler;
    templatingHandlerOptions?: unknown;
    markdownOptions?: IMarkdownOptions;
    templatesOptions?: ITemplatesOptions;
}
export interface IBuildOptions {
    fullBuild?: boolean;
    globPattern?: string;
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
    private parseFiles;
    private handleTemplating;
    private generatePrettyUrls;
    private write;
    build(options?: IBuildOptions): Promise<void>;
}
export default Lollygag;
