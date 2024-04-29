import {basename, extname, join} from 'path';
import {minimatch} from 'minimatch';
import Lollygag, {IFile, addParentToPath, deepCopy, fullExtname} from '../..';

export interface IArchivesOptions {
    collection: string;
    pageLimit?: number;
    renameToTitle?: boolean;
}

export const slugify = (s: string) =>
    s
        .trim()
        // handle accented characters
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

export function worker(options: IArchivesOptions) {
    return function archivesWorker(files: IFile[], lollygag: Lollygag) {
        if(!files) return;

        const {collection, pageLimit = 10, renameToTitle = true} = options;

        const relativeDir = collection.replace(/^\/|\/$/g, '');
        const prewriteDir = addParentToPath(lollygag._contentDir, relativeDir);

        const archive: IFile[] = [];

        for(let i = 0; i < files.length; i++) {
            const file = files[i];

            // only process html files in the collection
            if(
                extname(file.path) !== '.html'
                || !minimatch(file.path, join(prewriteDir, '/**/*'))
            ) {
                continue;
            }

            if(file.slug) {
                file.path = join(
                    prewriteDir,
                    file.slug + fullExtname(file.path)
                );
            } else if(file.title && renameToTitle) {
                file.path = join(
                    prewriteDir,
                    slugify(file.title) + fullExtname(file.path)
                );
            } else {
                file.path = join(prewriteDir, basename(file.path));
            }

            archive.push(file);
        }

        // sort descending by file creation time
        archive.sort(
            (a, b) =>
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

export default worker;
