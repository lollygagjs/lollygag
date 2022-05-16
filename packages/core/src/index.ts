import fs, {existsSync, promises as fsp} from 'fs';
import {log, error, time, timeEnd} from 'console';
import {basename, dirname, extname, join} from 'path';
import gm from 'gray-matter';
import rimraf from 'rimraf';
import glob from 'glob';
import minimatch from 'minimatch';
import {red} from 'chalk';
import mmm from 'mmmagic';

import {changeExtname, removeParentFromPath, handleHandlebars} from './helpers';

export * from './helpers';

const magic = new mmm.Magic(mmm.MAGIC_MIME_TYPE);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type RaggedyAny = any;
export type RaggedyObject = Record<string, RaggedyAny>;

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

export type TFileHandler = (
    content: string,
    options?: unknown,
    data?: IMeta
) => string;

export interface IConfig {
    generator?: string;
    prettyUrls?: boolean;
    subdir?: string;
    templatingHandler?: TFileHandler;
    templatingHandlerOptions?: unknown;
}

export interface IBuildOptions {
    fullBuild?: boolean;
    globPattern?: string;
}

export type TWorker = (
    files: IFile[],
    // eslint-disable-next-line no-use-before-define
    lollygag: Lollygag
) => void | Promise<void>;

export class Lollygag {
    constructor(
        private __config: IConfig = {
            generator: 'Lollygag',
            prettyUrls: true,
        },
        private __meta: IMeta = {
            year: new Date().getFullYear(),
        },
        private __in: string = 'files',
        private __out: string = 'public',
        private __files: IFile[] = [],
        private __workers: TWorker[] = []
    ) {
        log('Hello from Lollygag!');
    }

    config(config: IConfig): this {
        const c = config;
        if(c.subdir) c.subdir = join('/', c.subdir).replace(/\/$/, '');
        this.__config = {...this._config, ...c};
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

    do(worker: TWorker): this {
        this.__workers.push(worker);
        return this;
    }

    get _workers(): TWorker[] {
        return this.__workers;
    }

    private getFileMimetype(filePath: string): Promise<string> {
        return new Promise((resolve, reject) => {
            magic.detectFile(filePath, (err, result) => {
                if(err) reject(err);
                else resolve(typeof result === 'string' ? result : result[0]);
            });
        });
    }

    private getFiles(globPattern = join(this._in, '/**/*')): Promise<string[]> {
        return new Promise((resolve, reject) => {
            glob(globPattern, {nodir: true, dot: true}, (err, files) => {
                if(err) reject(err);
                else resolve(files);
            });
        });
    }

    private parseFiles(files: string[]): Promise<IFile[]> {
        const promises = files.map(async(file): Promise<IFile> => {
            const fileMimetype = await this.getFileMimetype(file);
            const fileStats = await fsp.stat(file);

            if(
                fileMimetype.startsWith('text/')
                || fileMimetype === 'inode/x-empty'
            ) {
                let rawFileContent = await fsp.readFile(file, {
                    encoding: 'utf-8',
                });

                rawFileContent = this.handleTemplating(
                    rawFileContent,
                    this._config.templatingHandlerOptions || null,
                    {...this._config, ...this._meta}
                );

                const gmResult = gm(rawFileContent);

                gmResult.content = this.handleTemplating(
                    gmResult.content,
                    this._config.templatingHandlerOptions || null,
                    gmResult.data
                );

                return {
                    path: file,
                    content: gmResult.content,
                    mimetype: fileMimetype,
                    ...gmResult.data,
                    stats: fileStats,
                };
            }

            return {path: file, mimetype: fileMimetype, stats: fileStats};
        });

        return Promise.all(promises);
    }

    private handleTemplating
        = this._config.templatingHandler || handleHandlebars;

    private generatePrettyUrls(files: IFile[]): Promise<IFile[]> {
        const promises = files.map(async(file): Promise<IFile> => {
            if(
                extname(file.path) === '.html'
                && basename(file.path) !== 'index.html'
            ) {
                return {
                    ...file,
                    path: join(
                        dirname(file.path),
                        changeExtname(basename(file.path), ''),
                        'index.html'
                    ),
                };
            }

            return file;
        });

        return Promise.all(promises);
    }

    private write(files: IFile[]): Promise<void[]> {
        const promises = files.map(async(file): Promise<void> => {
            const filePath = join(
                this._out,
                removeParentFromPath(this._in, file.path)
            );

            const fileDir = dirname(filePath);

            if(!fs.existsSync(fileDir)) {
                await fsp.mkdir(fileDir, {recursive: true});
            }

            if(
                file.mimetype.startsWith('text/')
                || file.mimetype === 'inode/x-empty'
                || file.mimetype === 'application/json'
            ) {
                await fsp.writeFile(filePath, file.content || '');
            } else {
                await fsp.copyFile(file.path, filePath);
            }

            await fsp.writeFile('.timestamp', new Date().getTime().toString());
        });

        return Promise.all(promises);
    }

    async build(options?: IBuildOptions): Promise<void> {
        if(!this._files && !existsSync(this._in)) {
            error(`Input directory '${this._in}' does not exist.`);
            return;
        }

        time('Total build time');

        const defaultGlobPattern = join(this._in, '/**/*');

        const opts: IBuildOptions = {
            fullBuild: false,
            globPattern: defaultGlobPattern,
            ...options,
        };

        if(opts.fullBuild) {
            opts.globPattern = defaultGlobPattern;

            time(`Deleted '${this._out}' directory`);

            await new Promise((resolve, reject) =>
                rimraf(this._out, (err) => {
                    if(err) reject(err);
                    else resolve(0);
                }));

            timeEnd(`Deleted '${this._out}' directory`);
        }

        time('Files collected');

        const fileList = await this.getFiles(opts.globPattern);

        timeEnd('Files collected');

        time('Files parsed');

        const fileObjects = this._files.filter((file) =>
            minimatch(file.path, opts.globPattern || defaultGlobPattern));

        const parsedFiles = [
            ...fileObjects,
            ...(await this.parseFiles(fileList)),
        ];

        timeEnd('Files parsed');

        await this._workers.reduce(
            async(
                possiblePromise: void | Promise<void>,
                worker: TWorker
            ): Promise<void> => {
                const workerName = worker.name || 'unknown worker';

                await Promise.resolve(possiblePromise);

                log(`Running ${workerName}...`);
                time(`Finished running ${workerName}`);

                await worker(parsedFiles, this);

                timeEnd(`Finished running ${workerName}`);
            },
            Promise.resolve()
        );

        let toWrite = parsedFiles;

        if(this._config.prettyUrls) {
            time('Generated pretty URLs');

            toWrite = await this.generatePrettyUrls(parsedFiles);

            timeEnd('Generated pretty URLs');
        }

        time('Files written');

        await this.write(toWrite);

        timeEnd('Files written');

        timeEnd('Total build time');
    }
}

process.on('unhandledRejection', (err) => {
    const msg = 'Build failed...';
    const dashes = '----------------------------------------';

    log(red(`${dashes}\n${msg}\n${dashes}`));
    error(err);
});

export default Lollygag;
