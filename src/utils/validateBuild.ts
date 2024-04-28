import {join, resolve} from 'path';
import {minimatch} from 'minimatch';
import Lollygag from '..';

export default function validateBuild(
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
