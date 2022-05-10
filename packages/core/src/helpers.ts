import {extname, basename, dirname, join} from 'path';
import {RaggedyAny, RaggedyObject} from '.';

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

export type TObjectFunctionCallback = (
    value: RaggedyAny,
    key: string,
    object: RaggedyObject
) => RaggedyAny;

export function foreachObject(
    obj: RaggedyObject,
    callback: TObjectFunctionCallback
): void {
    Object.keys(obj).forEach((key) => callback(obj[key], key, obj));
}

export function mapObject(
    obj: RaggedyObject,
    callback: TObjectFunctionCallback
): RaggedyObject {
    return Object.keys(obj).map((key) => callback(obj[key], key, obj));
}

export function filterObject(
    obj: RaggedyObject,
    callback: TObjectFunctionCallback
): RaggedyObject {
    return Object.keys(obj).filter((key) => callback(obj[key], key, obj));
}
