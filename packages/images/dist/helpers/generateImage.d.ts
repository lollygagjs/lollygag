import { GifOptions, PngOptions, JpegOptions } from 'sharp';
import { ValidMimetypes } from '..';
export interface IHandlerOptions {
    gifOptions?: GifOptions;
    pngOptions?: PngOptions;
    jpegOptions?: JpegOptions;
}
export declare function generateImage(path: string, fullImgPath: string, mimetype: ValidMimetypes, options: IHandlerOptions, quality?: number): Promise<void>;
