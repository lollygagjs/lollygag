import {deepEqual, IFile} from '@lollygag/core';
import {existsSync} from 'fs';
import {IGenerated, IImagesMeta, ValidMimetypes} from '..';
import generateImage, {IHandlerOptions} from './generateImage';

export interface IProcessImagesArgs {
    fileCopy: IFile;
    originalFilePath: string;
    fullImgPath: string;
    fileMimetype: ValidMimetypes;
    sizesObj: IGenerated;
    handlerOptions: IHandlerOptions;
    oldMeta: IImagesMeta;
    previouslyProcessed?: boolean;
    quality?: number;
}

export default async function processImages(args: IProcessImagesArgs) {
    const newFiles: IFile[] = [];

    const {
        fileCopy,
        originalFilePath,
        fullImgPath,
        fileMimetype,
        sizesObj,
        quality,
        handlerOptions,
        oldMeta,
        previouslyProcessed = false,
    } = args;

    const oldSize = oldMeta[originalFilePath].generated;

    const fullCondition
        = !existsSync(fullImgPath) || quality !== (oldSize ?? {}).full.quality;

    if(previouslyProcessed ? fullCondition : true) {
        await generateImage(
            originalFilePath,
            fullImgPath,
            fileMimetype,
            handlerOptions,
            quality
        );
    }

    if(sizesObj) {
        await Promise.all(
            Object.keys(sizesObj).map(async(size) => {
                const sizePath = sizesObj[size].path;
                const sizeWidth = sizesObj[size].width;
                const sizeHeight = sizesObj[size].height;
                const sizeOptions = sizesObj[size].options;

                newFiles.push({
                    ...fileCopy,
                    path: sizePath,
                });

                const sizesCondition
                    = !existsSync(sizePath)
                    || quality !== (oldSize ?? {})[size].quality
                    || sizeWidth !== (oldSize ?? {})[size].width
                    || sizeHeight !== (oldSize ?? {})[size].height
                    || !deepEqual(sizeOptions, (oldSize ?? {})[size].options);

                if(previouslyProcessed ? sizesCondition : true) {
                    await generateImage(
                        originalFilePath,
                        sizePath,
                        fileMimetype,
                        handlerOptions,
                        quality,
                        {
                            width: sizeWidth,
                            height: sizeHeight,
                            options: sizeOptions,
                        }
                    );
                }
            })
        );
    }

    return newFiles;
}
