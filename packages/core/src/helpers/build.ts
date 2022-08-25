import minimatch from 'minimatch';
import {join} from 'path';
import {log, time, timeEnd} from 'console';

import Lollygag, {
    addParentToPath,
    deleteEmptyDirs,
    deleteFiles,
    removeParentFromPath,
    Worker,
} from '..';

import generatePrettyUrls from './generatePrettyUrls';
import getFiles from './getFiles';
import parseFiles from './parseFiles';
import validateBuild from './validateBuild';
import writeFiles from './writeFiles';

export interface IBuildOptions {
    fullBuild?: boolean;
    allowExternalDirectories?: boolean;
    allowWorkingDirectoryOutput?: boolean;
    globPattern?: string | null;
}

export default async function build(
    this: Lollygag,
    options?: IBuildOptions
): Promise<void> {
    const opts: IBuildOptions = {
        fullBuild: false,
        allowExternalDirectories: false,
        allowWorkingDirectoryOutput: false,
        ...options,
    };

    validateBuild.call(this, {
        allowExternalDirectories: opts.allowExternalDirectories,
        allowWorkingDirectoryOutput: opts.allowWorkingDirectoryOutput,
    });

    const defaultGlobPattern = '**/*';

    opts.globPattern = join(this._in, opts.globPattern ?? defaultGlobPattern);

    time('Total build time');

    time('Files collected');

    const fileList = await getFiles.call(this, opts.globPattern);

    timeEnd('Files collected');

    time('Files parsed');

    const fileObjects = this._files.filter((file) =>
        minimatch(file.path, opts.globPattern || defaultGlobPattern));

    const parsedFiles = [
        ...fileObjects,
        ...(await parseFiles.call(this, fileList)),
    ];

    timeEnd('Files parsed');

    await this._workers.reduce(
        async(possiblePromise, worker:Worker): Promise<void> => {
            const workerName = worker.name ?? 'unknown worker';

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

        toWrite = generatePrettyUrls(parsedFiles);

        timeEnd('Generated pretty URLs');
    }

    time('Files written');

    await writeFiles.call(this, toWrite);

    timeEnd('Files written');

    if(opts.fullBuild) {
        time(`Cleaned '${this._out}' directory`);

        const written = toWrite.map((file) =>
            addParentToPath(
                this._out,
                removeParentFromPath(this._in, file.path)
            ));

        const existing = await getFiles.call(this, join(this._out, '/**/*'));

        const difference = existing.filter((ex) => !written.includes(ex));

        // Delete old files and leftover directories
        await deleteFiles(difference);
        await deleteEmptyDirs(this._out);

        timeEnd(`Cleaned '${this._out}' directory`);
    }

    timeEnd('Total build time');
}
