/* eslint-disable no-continue */
import {extname, join} from 'path';
import minimatch from 'minimatch';

import {
    addParentToPath,
    changeExtname,
    fullExtname,
    IFile,
    TWorker,
} from '@lollygag/core';
import {writeFileSync} from 'fs';

export interface IArchivesOptions {
    newExtname?: string | false;
    targetExtnames?: string[];
    dir: string;
    renameToTitle?: boolean;
}

export const slugify = (s: string) =>
    s
        .trim()
        // Handle accented characters
        .replace(/\p{L}/gu, (ch) =>
            ch.normalize('NFD').replace(/[\u0300-\u036f]/g, ''))
        .replace(/&/g, '-and-')
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '')
        .replace(/--+/g, '-')
        .replace(/^-+|-+$/g, '')
        .toLowerCase();

export function archives(options: IArchivesOptions): TWorker {
    return function archivesWorker(this: TWorker, files, lollygag): void {
        if(!files) return;

        const dir = addParentToPath(lollygag._in, options.dir);
        const newExtname = options?.newExtname ?? '.html';
        const targetExtnames = options?.targetExtnames ?? ['.hbs', '.html'];
        const renameToTitle = options?.renameToTitle ?? true;

        // TODO: Temp
        const x: IFile[] = [];

        for(let i = 0; i < files.length; i++) {
            const file = files[i];

            if(
                !targetExtnames.includes(extname(file.path))
                || !minimatch(file.path, join(dir, '/**/*'))
            ) {
                continue;
            }

            if(newExtname !== false) {
                file.path = changeExtname(file.path, newExtname);
            }

            if(file.title && renameToTitle) {
                file.path = join(
                    dir,
                    slugify(file.title) + fullExtname(file.path)
                );
            }

            x.push(file);
        }

        // TODO: Create archive pages
        writeFileSync(
            'temp.json',
            JSON.stringify(
                x.sort(
                    (a, b) =>
                        // Sort descending based on file creation time
                        ((b.stats ?? {}).birthtimeMs ?? 0)
                        - ((a.stats ?? {}).birthtimeMs ?? 0)
                ),
                null,
                2
            )
        );
    };
}

export default archives;
