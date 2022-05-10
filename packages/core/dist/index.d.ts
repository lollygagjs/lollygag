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
export interface IConfig {
    generator?: string;
    year?: number;
    permalinks?: boolean;
    subdir?: string;
    [prop: string]: RaggedyAny;
}
export interface IBuildOptions {
    fullBuild?: boolean;
    globPattern?: string;
}
export declare type TWorker = (files: IFile[], lollygag: Lollygag) => void | Promise<void>;
declare class Lollygag {
    private __config;
    private __in;
    private __out;
    private __files;
    private __workers;
    constructor(__config?: IConfig, __in?: string, __out?: string, __files?: IFile[], __workers?: TWorker[]);
    config(config: IConfig): this;
    get _config(): IConfig;
    in(dir: string): this;
    get _in(): string;
    out(dir: string): this;
    get _out(): string;
    subdir(dir: string): this;
    get _subdir(): string;
    files(files: IFile[]): this;
    get _files(): IFile[];
    do(worker: TWorker): this;
    get _workers(): TWorker[];
    private getFileMimetype;
    private getFiles;
    private parseFiles;
    private write;
    private permalinks;
    build(options?: IBuildOptions): Promise<void>;
}
export default Lollygag;
