import {promises as fsp, statSync} from 'fs';
import {extname, basename, dirname, join} from 'path';
import {RaggedyAny, RaggedyObject} from '.';

export * from './workers/handlebars';

export function fullExtname(filePath: string): string {
    const extensions = basename(filePath).split('.');
    extensions.shift();
    return `.${extensions.join('.')}`;
}

export function changeExtname(filePath: string, newExtension: string): string {
    return join(
        dirname(filePath),
        `${basename(filePath, extname(filePath))}${newExtension}`
    );
}

export function changeFullExtname(
    filePath: string,
    newExtension: string
): string {
    return join(
        dirname(filePath),
        `${basename(filePath, fullExtname(filePath))}${newExtension}`
    );
}

export function addParentToPath(parent: string, path: string): string {
    // remove leading and trailing slashes
    let cleanParent = join(parent).replace(/^\/|\/$/g, '');

    if(path.startsWith('/')) cleanParent = join('/', cleanParent);

    return join(cleanParent, path);
}

export function removeParentFromPath(parent: string, path: string): string {
    // remove leading and trailing slashes
    const cleanParent = join(parent).replace(/^\/|\/$/g, '');

    return join(path.replace(`${cleanParent}/`, ''));
}

export async function deleteEmptyDirs(dir: string) {
    if(!statSync(dir).isDirectory()) return;

    let files = await fsp.readdir(dir);

    if(files.length > 0) {
        await Promise.all(
            files.map(async(file) => {
                await deleteEmptyDirs(join(dir, file));
            })
        );

        files = await fsp.readdir(dir);
    }

    if(files.length === 0) await fsp.rmdir(dir);
}

export function deleteFiles(files: string[]) {
    return Promise.all(files.map((f) => fsp.unlink(f)));
}

export function deepCopy(original: RaggedyAny[] | RaggedyObject) {
    return JSON.parse(JSON.stringify(original));
}
