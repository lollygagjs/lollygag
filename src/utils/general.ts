import {promises as fsp, statSync} from 'fs';
import {extname, basename, dirname, join} from 'path';
import mmm from 'mmmagic';

export * as archives from '../workers/archives';
export * as handlebars from '../workers/handlebars';
export * as images from '../workers/images';
export * as livedev from '../workers/livedev';
export * as markdown from '../workers/markdown';
export * as postcss from '../workers/postcss';
export * as scss from '../workers/scss';
export * as templates from '../workers/templates';
export * as terser from '../workers/terser';
export * as typescript from '../workers/typescript';

/**
 * Returns the full extension of a file path.
 *
 * @param filePath - The file path.
 * @example
 * fullExtname('path/to/file.ext1.ext2') // '.ext1.ext2'
 * @returns The full extension of the file path.
 */
export function fullExtname(filePath: string): string {
    const extensions = basename(filePath).split('.');
    extensions.shift();
    return `.${extensions.join('.')}`;
}

/**
 * Changes the extension of a file path to a new extension.
 *
 * @param filePath - The original file path.
 * @param newExtension - The new extension to replace the current extension.
 * @example
 * changeExtname('path/to/file.ext1.ext2', '.new') // 'path/to/file.ext1.new'
 * @returns The modified file path with the new extension.
 */
export function changeExtname(
    filePath: string,
    newExtension: string
): string {
    return join(
        dirname(filePath),
        `${basename(filePath, extname(filePath))}${newExtension}`
    );
}

/**
 * Changes the full extension of a file path to a new extension.
 *
 * @param filePath - The original file path.
 * @param newExtension - The new extension to replace the existing extension.
 * @example
 * changeFullExtname('path/to/file.ext1.ext2', '.new') // 'path/to/file.new'
 * @returns The modified file path with the new extension.
 */
export function changeFullExtname(
    filePath: string,
    newExtension: string
): string {
    return join(
        dirname(filePath),
        `${basename(filePath, fullExtname(filePath))}${newExtension}`
    );
}

export function addParentToPath(
    parent: string,
    path: string
): string {
    // remove leading and trailing slashes
    let cleanParent = join(parent).replace(/^\/|\/$/g, '');

    if(path.startsWith('/')) cleanParent = join('/', cleanParent);

    return join(cleanParent, path);
}

export function removeParentFromPath(
    parent: string,
    path: string
): string {
    // remove leading and trailing slashes
    const cleanParent = join(parent).replace(/^\/|\/$/g, '');

    return join(path.replace(`${cleanParent}/`, ''));
}

export function removeUpToParentFromPath(
    parent: string,
    path: string
): string {
    // remove leading and trailing slashes
    const cleanParent = join(parent).replace(/^\/|\/$/g, '');

    return join(
        path.slice(
            path.indexOf(`${cleanParent}/`) + cleanParent.length
        )
    );
}

export function removeUpToParentsFromPath(
    parents: string[],
    path: string
): string {
    // remove leading and trailing slashes
    const cleanParents = parents.map((parent) =>
        join(parent).replace(/^\/|\/$/g, ''));

    for(const cleanParent of cleanParents) {
        if(path.includes(`${cleanParent}/`)) {
            return join(
                path.slice(
                    path.indexOf(`${cleanParent}/`)
                        + cleanParent.length
                )
            );
        }
    }

    return path;
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

export function deepCopy<T>(original: T): T {
    return JSON.parse(JSON.stringify(original));
}

export function deepEqual<T>(a: T, b: T) {
    if(a === b) return true;
    if(a === null || b === null) return false;
    if(typeof a !== 'object' || typeof b !== 'object') return false;
    if(Object.keys(a).length !== Object.keys(b).length) return false;

    for(const key in a) {
        if(!Object.prototype.hasOwnProperty.call(a, key)) continue;
        if(!Object.prototype.hasOwnProperty.call(b, key)) return false;
        if(!deepEqual(a[key], b[key])) return false;
    }

    return true;
}

const magic = new mmm.Magic(mmm.MAGIC_MIME_TYPE);

export function getFileMimetype(filePath: string): Promise<string> {
    return new Promise((res, rej) => {
        magic.detectFile(filePath, (err, result) => {
            if(err) rej(err);
            else res(typeof result === 'string' ? result : result[0]);
        });
    });
}
