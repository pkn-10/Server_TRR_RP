export declare class CloudinaryService {
    private readonly logger;
    constructor();
    uploadFile(buffer: Buffer, originalname: string, folder?: string): Promise<{
        url: string;
        publicId: string;
    }>;
    deleteFile(publicId: string): Promise<void>;
    extractPublicIdFromUrl(url: string): string | null;
}
