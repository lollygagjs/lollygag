import {join} from 'path';
import glob from 'glob';
import Lollygag from '..';

export default function getFiles(
    this: Lollygag,
    globPattern = join(this._in, '/**/*')
): Promise<string[]> {
    return new Promise((res, rej) => {
        glob(globPattern, {nodir: true, dot: true}, (err, files) => {
            if(err) rej(err);
            else res(files);
        });
    });
}
