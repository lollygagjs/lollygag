import fs, {promises as fsp} from 'fs';
import grayMatter from 'gray-matter';
import Lollygag, {IFile} from '..';
import {glob} from 'glob';
import {basename, dirname, extname, join, resolve} from 'path/posix';
import {minimatch} from 'minimatch';

import {
    changeExtname,
    getFileMimetype,
    removeUpToParentsFromPath,
} from './general';

export function parseFiles(this: Lollygag, files: string[]) {
    const promises = files.map(async(file): Promise<IFile> => {
        const fileMimetype = await getFileMimetype(file);
        const fileStats = await fsp.stat(file);

        // if file size is 0, return immediately
        if(fileStats.size === 0) {
            return {path: file, mimetype: fileMimetype, exclude: true};
        }

        if(
            fileMimetype.startsWith('text/')
            || fileMimetype === 'inode/x-empty'
        ) {
            let rawFileContent = await fsp.readFile(file, {
                encoding: 'utf-8',
            });

            // if file is empty return immediately
            if(!rawFileContent.trim()) {
                return {
                    path: file,
                    mimetype: fileMimetype,
                    exclude: true,
                };
            }

            rawFileContent = this.handleTemplating(
                rawFileContent,
                this._config.templatingHandlerOptions ?? null,
                {...this._config, ...this._sitemeta}
            );

            const grayMatterResult = grayMatter(rawFileContent);

            grayMatterResult.content = this.handleTemplating(
                grayMatterResult.content,
                this._config.templatingHandlerOptions ?? null,
                grayMatterResult.data
            );

            return {
                path: file,
                content: grayMatterResult.content,
                mimetype: fileMimetype,
                ...grayMatterResult.data,
                stats: fileStats,
            };
        }

        return {path: file, mimetype: fileMimetype, stats: fileStats};
    });

    return Promise.all(promises);
}

export async function getFiles(
    this: Lollygag,
    globPatterns = [
        join(this._contentDir, '/**/*'),
        join(this._staticDir, '/**/*'),
    ]
): Promise<string[]> {
    const promises = globPatterns.map((pattern) =>
        glob(pattern, {nodir: true, dot: true}));
    const filesArrays = await Promise.all(promises);
    return filesArrays.flat();
}

export function generatePrettyUrls(files: IFile[]): IFile[] {
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

export function writeFiles(this: Lollygag, files: IFile[]): Promise<void[]> {
    const promises = files.map(async(file): Promise<void> => {
        /**
         * Change `file.path` to final output path.
         */
        const filePath = join(
            this._outputDir,
            // TODO: Ooooooh
            removeUpToParentsFromPath(
                [this._contentDir, this._staticDir],
                file.path
            )
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
            await fsp.writeFile(filePath, file.content ?? '');
        } else {
            await fsp.copyFile(file.path, filePath);
        }
    });

    const timestamp = this._config.generateTimestamp
        ? fsp.writeFile('.timestamp', new Date().getTime().toString())
        : Promise.resolve();

    return Promise.all([...promises, timestamp]);
}

export function validateBuild(
    this: Lollygag,
    {allowExternalDirectories = false, allowWorkingDirectoryOutput = false}
) {
    const cwd = resolve(process.cwd());
    const contentDir = resolve(this._contentDir);
    const staticDir = resolve(this._staticDir);
    const outputDir = resolve(this._outputDir);

    if(contentDir === outputDir) {
        throw new Error(
            'Content directory cannot be the same as the output directory.'
        );
    }

    if(contentDir === cwd) {
        throw new Error(
            `Content directory '${contentDir}' is the same as the current working directory.`
        );
    }

    if(staticDir === outputDir) {
        throw new Error(
            'Static directory cannot be the same as the output directory.'
        );
    }

    if(staticDir === cwd) {
        throw new Error(
            `Static directory '${staticDir}' is the same as the current working directory.`
        );
    }

    if(!allowWorkingDirectoryOutput) {
        if(outputDir === cwd) {
            throw new Error(
                `Output directory '${outputDir}' is the same as the current working directory.`
            );
        }
    }

    if(!allowExternalDirectories) {
        if(!minimatch(contentDir, join(cwd, '**/*'))) {
            throw new Error(
                `Content directory '${contentDir}' is outside the current working directory.`
            );
        }

        if(!minimatch(staticDir, join(cwd, '**/*'))) {
            throw new Error(
                `Static directory '${staticDir}' is outside the current working directory.`
            );
        }

        if(!minimatch(outputDir, join(cwd, '**/*'))) {
            throw new Error(
                `Output directory '${outputDir}' is outside the current working directory.`
            );
        }
    }
}
