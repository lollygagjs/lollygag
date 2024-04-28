import {join} from 'path';
import {log, time, timeEnd} from 'console';
import Lollygag, {Worker} from '..';

import generatePrettyUrls from './generatePrettyUrls';
import getFiles from './getFiles';
import parseFiles from './parseFiles';
import validateBuild from './validateBuild';
import writeFiles from './writeFiles';
import {rimraf} from 'rimraf';

export interface IBuildOptions {
    fullBuild?: boolean;
    allowExternalDirectories?: boolean;
    allowWorkingDirectoryOutput?: boolean;
    globPattern?: string | null;
}

export default async function build(this: Lollygag, options?: IBuildOptions) {
    const {
        fullBuild = false,
        allowExternalDirectories = false,
        allowWorkingDirectoryOutput = false,
        globPattern,
    } = options ?? {};

    validateBuild.call(this, {
        allowExternalDirectories,
        allowWorkingDirectoryOutput,
    });

    const defaultGlobPattern = '**/*';

    const globPatterns = [
        join(this._contentDir, globPattern ?? defaultGlobPattern),
        join(this._staticDir, globPattern ?? defaultGlobPattern),
    ];

    time('Total build time');

    if(fullBuild) {
        time(`Cleaned '${this._outputDir}' directory`);

        await rimraf(join(this._outputDir, '**/*'));

        timeEnd(`Cleaned '${this._outputDir}' directory`);
    }

    time('Files collected');

    const fileList = await getFiles.call(this, globPatterns);

    timeEnd('Files collected');

    time('Files parsed');

    const parsedFiles = (await parseFiles.call(this, fileList)).filter(
        (file) => !file.exclude
    );

    timeEnd('Files parsed');

    await this._workers.reduce(
        async(possiblePromise, worker: Worker): Promise<void> => {
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

    timeEnd('Total build time');
}
