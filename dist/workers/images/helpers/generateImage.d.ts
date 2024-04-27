import { GifOptions, PngOptions, JpegOptions } from 'sharp';
import { IResizeParams, ValidMimetypes } from '..';
export interface IHandlerOptions {
    gifOptions?: GifOptions;
    pngOptions?: PngOptions;
    jpegOptions?: JpegOptions;
}
export default function generateImage(path: string, fullImgPath: string, mimetype: ValidMimetypes, options: IHandlerOptions, quality?: number, resizeParams?: IResizeParams): Promise<void>;
