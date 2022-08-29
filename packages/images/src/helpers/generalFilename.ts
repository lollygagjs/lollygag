import {fullExtname} from '@lollygag/core';
import {existsSync, mkdirSync} from 'fs';
import {basename, join, dirname} from 'path';

export default function generateFilename(path: string, sizeId?: string) {
    const fileExt = fullExtname(path);
    const fileBasename = basename(path, fileExt);

    const fileName = fileBasename + (sizeId ? `-${sizeId}` : '') + fileExt;

    const dir = join('.images', dirname(path));

    if(!existsSync(dir)) mkdirSync(dir, {recursive: true});

    return join(dir, fileName);
}
