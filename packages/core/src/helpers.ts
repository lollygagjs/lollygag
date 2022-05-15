import {extname, basename, dirname, join} from 'path';

export * from './workers/handlebars';
export * from './workers/markdown';
export * from './workers/templates';

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
