export interface LineAuthUrlResponse {
    auth_url: string;
    client_id: string;
    redirect_uri: string;
    state: string;
}
export interface LineCallbackResponse {
    access_token: string;
    user_id: string;
}
export interface LineUserProfile {
    displayName: string;
    userId: string;
    pictureUrl?: string;
    statusMessage?: string;
}
export declare class LineOAuthService {
    private readonly lineAuthEndpoint;
    private readonly lineTokenEndpoint;
    private readonly lineTokenInfoEndpoint;
    private readonly lineProfileEndpoint;
    constructor();
    generateAuthUrl(): LineAuthUrlResponse;
    exchangeCodeForToken(code: string): Promise<LineCallbackResponse>;
    getUserId(accessToken: string): Promise<string>;
    getUserProfile(accessToken: string): Promise<LineUserProfile>;
    verifyRedirectUri(): boolean;
    private getRedirectUri;
    private generateState;
    private logDebug;
}
