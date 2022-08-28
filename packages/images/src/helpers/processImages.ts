import {IFile} from '@lollygag/core';
import {existsSync} from 'fs';
import {ValidMimetypes} from '..';
import {generateImage, IHandlerOptions} from './generateImage';

interface IXArgs {
    fileCopy: IFile;
    originalFilePath: string;
    fullImgPath: string;
    fileMimetype: ValidMimetypes;
    widthsPaths: string[];
    handlerOptions: IHandlerOptions;
    previouslyProcessed?: boolean;
    quality?: number;
}

export async function processImages(args: IXArgs) {
    const newFiles: IFile[] = [];

    const {
        fileCopy,
        originalFilePath,
        fullImgPath,
        fileMimetype,
        widthsPaths,
        quality,
        handlerOptions,
        previouslyProcessed = false,
    } = args;

    if(previouslyProcessed ? !existsSync(originalFilePath) : true) {
        await generateImage(
            originalFilePath,
            fullImgPath,
            fileMimetype,
            handlerOptions,
            quality
        );
    }

    if(widthsPaths.length) {
        await Promise.all(
            widthsPaths.map(async(widthPath) => {
                newFiles.push({
                    ...fileCopy,
                    path: widthPath,
                });

                if(previouslyProcessed ? !existsSync(widthPath) : true) {
                    await generateImage(
                        originalFilePath,
                        widthPath,
                        fileMimetype,
                        handlerOptions,
                        quality
                    );
                }
            })
        );
    }

    return newFiles;
}
