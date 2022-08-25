/* eslint-disable no-continue */
import {basename, extname, join} from 'path';
import minimatch from 'minimatch';

import {
    addParentToPath,
    deepCopy,
    fullExtname,
    IFile,
    Worker,
} from '@lollygag/core';

export interface IArchivesOptions {
    dir: string;
    pageLimit?: number;
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

interface IPaginateArchivesArgs {
    archive: IFile[];
    files: IFile[];
    pretty?: boolean;
    pageLimit: number;
    relativeDir: string;
    prewriteDir: string;
}

function paginateArchive(args: IPaginateArchivesArgs) {
    const {archive, files, relativeDir, prewriteDir, pretty, pageLimit} = args;

    const pageCount = Math.ceil(archive.length / pageLimit);

    const nav = (pageNumber: string) => {
        const num = pageNumber === '1' ? '' : pageNumber;
        const uglyNum = num === '' ? num : `${num}.html`;

        return join(relativeDir, pretty ? `${num}` : uglyNum);
    };

    // eslint-disable-next-line no-mixed-operators
    for(let i = 1; i <= pageCount; i++) {
        const items = deepCopy(
            // eslint-disable-next-line no-mixed-operators
            archive.slice(i * pageLimit - pageLimit, i * pageLimit)
        );

        const nextLink = pageCount > i ? nav(`${i + 1}`) : false;
        const prevLink = i > 1 ? nav(`${i - 1}`) : false;

        files.push({
            path: join(prewriteDir, i === 1 ? 'index.html' : `${i}.html`),
            title: `Archives: Page ${i}`,
            template: 'archives.hbs',
            nextLink,
            prevLink,
            items,
            mimetype: 'text/plain',
        });
    }
}

export function archives(options: IArchivesOptions):Worker {
    return function archivesWorker(this:Worker, files, lollygag): void {
        if(!files) return;

        const {dir, pageLimit = 10, renameToTitle = true} = options;

        const relativeDir = dir.replace(/^\/|\/$/g, '');
        const prewriteDir = addParentToPath(lollygag._in, relativeDir);

        const archive: IFile[] = [];

        for(let i = 0; i < files.length; i++) {
            const file = files[i];

            if(
                extname(file.path) !== '.html'
                || !minimatch(file.path, join(prewriteDir, '/**/*'))
            ) {
                continue;
            }

            if(file.title && renameToTitle) {
                file.path = join(
                    prewriteDir,
                    slugify(file.title) + fullExtname(file.path)
                );
            } else {
                file.path = join(prewriteDir, basename(file.path));
            }

            archive.push(file);
        }

        archive.sort(
            (a, b) =>
                // Sort descending based on file creation time
                ((b.stats ?? {}).birthtimeMs ?? 0)
                - ((a.stats ?? {}).birthtimeMs ?? 0)
        );

        paginateArchive({
            archive,
            files,
            pretty: lollygag._config.prettyUrls,
            pageLimit,
            relativeDir,
            prewriteDir,
        });
    };
}

export default archives;
