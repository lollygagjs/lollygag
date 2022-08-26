import {Stats} from 'fs';
import {log, error} from 'console';
import {join} from 'path';
import {red} from 'chalk';
import {handleHandlebars} from './helpers/general';
import build, {IBuildOptions} from './helpers/build';

export * from './helpers/general';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
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

export interface IMeta {
    year?: number;
    [prop: string]: RaggedyAny;
}

export type FileHandler = (
    content: string,
    options?: unknown,
    data?: IMeta
) => string;

export interface IConfig {
    generator?: string;
    prettyUrls?: boolean;
    generateTimestamp?: boolean;
    subdir?: string;
    templatingHandler?: FileHandler;
    templatingHandlerOptions?: unknown;
}

export type Worker = (
    files: IFile[],
    // eslint-disable-next-line no-use-before-define
    lollygag: Lollygag
) => void | Promise<void>;

export default class Lollygag {
    constructor(
        private __config: IConfig = {
            generator: 'Lollygag',
            prettyUrls: true,
            generateTimestamp: true,
        },
        private __meta: IMeta = {
            year: new Date().getFullYear(),
        },
        private __in: string = 'files',
        private __out: string = 'public',
        private __files: IFile[] = [],
        private __workers: Worker[] = []
    ) {
        log('Hello from Lollygag!');
    }

    config(config: IConfig): this {
        const c = config;
        // add leading and remove trailing slash
        if(c.subdir) c.subdir = join('/', c.subdir).replace(/\/$/, '');
        this.__config = {...this._config, subdir: c.subdir};
        return this;
    }

    get _config(): IConfig {
        return this.__config;
    }

    meta(meta: IMeta): this {
        this.__meta = {...this._meta, ...meta};
        return this;
    }

    get _meta(): IMeta {
        return this.__meta;
    }

    in(dir: string): this {
        this.__in = join(dir);
        return this;
    }

    get _in(): string {
        return this.__in;
    }

    out(dir: string): this {
        this.__out = join(dir);
        return this;
    }

    get _out(): string {
        return this.__out;
    }

    files(files: IFile[]): this {
        this.__files = files;
        return this;
    }

    get _files(): IFile[] {
        return this.__files;
    }

    do(worker: Worker): this {
        this.__workers.push(worker);
        return this;
    }

    get _workers(): Worker[] {
        return this.__workers;
    }

    protected handleTemplating
        = this._config.templatingHandler ?? handleHandlebars;

    build = (options: IBuildOptions) => build.call(this, options);
}

process.on('unhandledRejection', (err) => {
    log(red('Build failed...'));
    error(err);
    process.exit(43);
});
