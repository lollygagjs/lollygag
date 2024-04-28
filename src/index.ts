import {Stats} from 'fs';
import {log, error} from 'console';
import {join} from 'path';
import {red} from 'chalk';
import {handlebars} from './utils/general';
import build, {IBuildOptions} from './utils/build';

export * from './utils/general';

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
    exclude?: boolean;
    [prop: string]: RaggedyAny;
}

export interface ISitemeta {
    year?: number;
    [prop: string]: RaggedyAny;
}

export type FileHandler = (
    content: string,
    options?: unknown,
    sitemeta?: ISitemeta
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
        private __sitemeta: ISitemeta = {
            year: new Date().getFullYear(),
        },
        private __contentDir: string = 'content',
        private __staticDir: string = 'static',
        private __outputDir: string = 'public',
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

    sitemeta(sitemeta: ISitemeta): this {
        this.__sitemeta = {...this._sitemeta, ...sitemeta};
        return this;
    }

    get _sitemeta(): ISitemeta {
        return this.__sitemeta;
    }

    contentDir(dir: string): this {
        this.__contentDir = join(dir);
        return this;
    }

    get _contentDir(): string {
        return this.__contentDir;
    }

    staticDir(dir: string): this {
        this.__staticDir = join(dir);
        return this;
    }

    get _staticDir(): string {
        return this.__staticDir;
    }

    outputDir(dir: string): this {
        this.__outputDir = join(dir);
        return this;
    }

    get _outputDir(): string {
        return this.__outputDir;
    }

    do(worker: Worker): this {
        this.__workers.push(worker);
        return this;
    }

    get _workers(): Worker[] {
        return this.__workers;
    }

    protected handleTemplating
        = this._config.templatingHandler ?? handlebars.handler;

    build = (options: IBuildOptions) => build.call(this, options);
}

process.on('unhandledRejection', (err) => {
    log(red('Build failed...'));
    error(err);
    process.exit(43);
});
