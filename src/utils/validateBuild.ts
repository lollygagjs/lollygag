import {existsSync} from 'fs';
import {join, resolve} from 'path';
import {minimatch} from 'minimatch';
import Lollygag from '..';

export default function validateBuild(
    this: Lollygag,
    {
        allowExternalDirectories = false,
        allowWorkingDirectoryOutput = false,
    }
) {
    const cwd = resolve(process.cwd());
    const inDir = resolve(this._in);
    const contentDir = resolve(this._contentDir);
    const staticDir = resolve(this._staticDir);
    const outDir = resolve(this._out);

    if(!this._files && !existsSync(inDir)) {
        throw new Error(`Input directory '${inDir}' does not exist.`);
    }

    if(inDir === outDir) {
        throw new Error(
            'Input directory cannot be the same as the output directory.'
        );
    }

    if(inDir === cwd) {
        throw new Error(
            `Input directory '${inDir}' is the same as the current working directory.`
        );
    }

    if(contentDir === outDir) {
        throw new Error(
            'Content directory cannot be the same as the output directory.'
        );
    }

    if(staticDir === outDir) {
        throw new Error(
            'Static directory cannot be the same as the output directory.'
        );
    }

    if(!allowWorkingDirectoryOutput) {
        if(outDir === cwd) {
            throw new Error(
                `Output directory '${outDir}' is the same as the current working directory.`
            );
        }
    }

    if(!allowExternalDirectories) {
        if(!minimatch(inDir, join(cwd, '**/*'))) {
            throw new Error(
                `Input directory '${inDir}' is outside the current working directory.`
            );
        }

        if(!minimatch(outDir, join(cwd, '**/*'))) {
            throw new Error(
                `Output directory '${outDir}' is outside the current working directory.`
            );
        }
    }
}
