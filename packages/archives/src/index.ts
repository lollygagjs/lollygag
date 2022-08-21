/* eslint-disable no-continue */
import {dirname, extname, join} from 'path';
import glob from 'glob';
import {
    addParentToPath,
    changeExtname,
    fullExtname,
    TWorker,
} from '@lollygag/core';

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

        console.log('dir', dir);

        for(let i = 0; i < files.length; i++) {
            const file = files[i];

            if(!targetExtnames.includes(extname(file.path))) {
                continue;
            }

            if(newExtname !== false) {
                file.path = changeExtname(file.path, newExtname);
            }

            if(file.title && renameToTitle) {
                console.log('dirname(file.path)', dirname(file.path));
                console.log('slugify(file.title)', slugify(file.title));
                console.log('fullExtname(file.path)', fullExtname(file.path));

                file.path = join(
                    dirname(file.path),
                    slugify(file.title) + fullExtname(file.path)
                );
            }
        }
    };
}

export default archives;
