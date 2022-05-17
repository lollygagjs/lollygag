import fs, {existsSync, promises as fsp} from 'fs';
import {log, error, time, timeEnd} from 'console';
import {basename, dirname, extname, join, resolve} from 'path';
import gm from 'gray-matter';
import glob from 'glob';
import minimatch from 'minimatch';
import {red} from 'chalk';
import mmm from 'mmmagic';

import {
    changeExtname,
    removeParentFromPath,
    handleHandlebars,
    addParentToPath,
    deleteEmptyDirs,
    deleteFiles,
} from './helpers';

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
    globPattern?: string | null;
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
        return new Promise((res, rej) => {
            magic.detectFile(filePath, (err, result) => {
                if(err) rej(err);
                else res(typeof result === 'string' ? result : result[0]);
            });
        });
    }

    private getFiles(globPattern = join(this._in, '/**/*')): Promise<string[]> {
        return new Promise((res, rej) => {
            glob(globPattern, {nodir: true, dot: true}, (err, files) => {
                if(err) rej(err);
                else res(files);
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

    private generatePrettyUrls(files: IFile[]): IFile[] {
        return files.map((file): IFile => {
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

    private validate() {
        const cwd = resolve(process.cwd());
        const inDir = resolve(this._in);
        const outDir = resolve(this._out);

        if(!this._files && !existsSync(inDir)) {
            throw new Error(`Input directory '${inDir}' does not exist.`);
        }

        if(inDir === cwd) {
            throw new Error(
                `Input directory '${inDir}' is the same as the current working directory.`
            );
        }

        if(!minimatch(inDir, join(cwd, '**/*'))) {
            throw new Error(
                `Input directory '${inDir}' is outside the current working directory.`
            );
        }

        if(outDir === cwd) {
            throw new Error(
                `Output directory '${outDir}' is the same as the current working directory.`
            );
        }

        if(!minimatch(outDir, join(cwd, '**/*'))) {
            throw new Error(
                `Output directory '${outDir}' is outside the current working directory.`
            );
        }
    }

    async build(options?: IBuildOptions): Promise<void> {
        this.validate();

        const defaultGlobPattern = '**/*';

        const opts: IBuildOptions = {
            fullBuild: false,
            ...options,
        };

        opts.globPattern = join(
            this._in,
            opts.globPattern || defaultGlobPattern
        );

        time('Total build time');

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

            toWrite = this.generatePrettyUrls(parsedFiles);

            timeEnd('Generated pretty URLs');
        }

        time('Files written');

        await this.write(toWrite);

        timeEnd('Files written');

        if(opts.fullBuild) {
            time(`Cleaned '${this._out}' directory`);

            const written = toWrite.map((file) =>
                addParentToPath(
                    this._out,
                    removeParentFromPath(this._in, file.path)
                ));

            const existing = await this.getFiles(join(this._out, '/**/*'));
            const difference = existing.filter((ex) => !written.includes(ex));

            // Delete old files and leftover directories
            await deleteFiles(difference);
            await deleteEmptyDirs(this._out);

            timeEnd(`Cleaned '${this._out}' directory`);
        }

        timeEnd('Total build time');
    }
}

process.on('unhandledRejection', (err) => {
    log(red('Build failed...'));
    error(err);

    process.exit(43);
});

export default Lollygag;
