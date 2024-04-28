// import {join} from 'path';
// import {glob} from 'glob';
// import Lollygag from '..';

// export default async function getFiles(
//     this: Lollygag,
//     globPattern = join(this._in, '/**/*')
// ): Promise<string[]> {
//     return glob(globPattern, {nodir: true, dot: true});
// }

import {join} from 'path';
import {glob} from 'glob';
import Lollygag from '..';

export default async function getFiles(
    this: Lollygag,
    globPatterns = [
        join(this._contentDir, '/**/*'),
        join(this._staticDir, '/**/*'),
    ]
): Promise<string[]> {
    const promises = globPatterns.map((pattern) =>
        glob(pattern, {nodir: true, dot: true}));
    const filesArrays = await Promise.all(promises);
    return filesArrays.flat();
}
