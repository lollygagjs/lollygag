import {unlinkSync} from 'fs';
import {IImagesMeta} from '..';

export default function deleteStaleImages(
    meta: IImagesMeta,
    oldMeta: IImagesMeta
) {
    Object.keys(oldMeta).forEach((imageKey) => {
        const staleImages = oldMeta[imageKey].desired.filter(
            (d) => !meta[imageKey].desired.includes(d)
        );

        staleImages.forEach((filePath) => {
            unlinkSync(filePath);
        });
    });
}
