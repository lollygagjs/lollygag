import {fullExtname} from '@lollygag/core';
import {existsSync, mkdirSync} from 'fs';
import {basename, join, dirname} from 'path';

export function generateFilename(
    path: string,
    id: number | string,
    quality?: number
) {
    const fileExt = fullExtname(path);
    const fileBasename = basename(path, fileExt);

    let fileName: string;

    if(quality) fileName = `${fileBasename}-${id}-q${quality}${fileExt}`;
    else fileName = `${fileBasename}-${id}${fileExt}`;

    const dir = join('.images', dirname(path));

    if(!existsSync(dir)) mkdirSync(dir, {recursive: true});

    return join(dir, fileName);
}
