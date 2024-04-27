import {join} from 'path';
import {glob} from 'glob';
import Lollygag from '..';

export default async function getFiles(
    this: Lollygag,
    globPattern = join(this._in, '/**/*')
): Promise<string[]> {
    return glob(globPattern, {nodir: true, dot: true});
}
