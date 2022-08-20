import { RaggedyObject, TWorker } from '@lollygag/core';
export interface IImagesOptions {
    imageCompressorOptions?: RaggedyObject;
}
export default function images(options?: IImagesOptions): TWorker;
