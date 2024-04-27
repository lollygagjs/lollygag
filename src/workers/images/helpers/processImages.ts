import {deepEqual, IFile} from '../../..';
import {existsSync} from 'fs';
import {IGenerated, IImagesMetaProps, ValidMimetypes} from '..';
import generateImage, {IHandlerOptions} from './generateImage';

export interface IProcessImagesArgs {
    fileCopy: IFile;
    originalFilePath: string;
    fullImgPath: string;
    fileMimetype: ValidMimetypes;
    sizesObj: IGenerated;
    handlerOptions: IHandlerOptions;
    oldFileMeta?: IImagesMetaProps;
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
        oldFileMeta,
        previouslyProcessed = false,
    } = args;

    const oldSizes = oldFileMeta?.generated;

    let fullCondition = true;

    if(previouslyProcessed) {
        fullCondition
            = !existsSync(fullImgPath) || quality !== oldSizes?.full?.quality;
    }

    if(fullCondition) {
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
                    || quality !== oldSizes?.[size]?.quality
                    || sizeWidth !== oldSizes?.[size]?.width
                    || sizeHeight !== oldSizes?.[size]?.height
                    || !deepEqual(sizeOptions, oldSizes?.[size]?.options);

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
