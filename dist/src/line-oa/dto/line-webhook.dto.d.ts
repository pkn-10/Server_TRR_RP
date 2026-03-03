export declare class LineWebhookDto {
    events: LineEvent[];
}
export declare class LineEvent {
    type: string;
    timestamp: number;
    source: {
        type: string;
        userId: string;
        groupId?: string;
        roomId?: string;
    };
    replyToken?: string;
    message?: {
        type: string;
        id: string;
        text?: string;
    };
    postback?: {
        data: string;
        params?: any;
    };
}
