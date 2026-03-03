"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LineOAuthService = void 0;
const common_1 = require("@nestjs/common");
let LineOAuthService = class LineOAuthService {
    lineAuthEndpoint = 'https://access.line.me/oauth2/v2.1/authorize';
    lineTokenEndpoint = 'https://api.line.me/oauth2/v2.1/token';
    lineTokenInfoEndpoint = 'https://api.line.me/v2/oauth/tokeninfo';
    lineProfileEndpoint = 'https://api.line.me/v2/profile';
    constructor() { }
    generateAuthUrl() {
        const clientId = process.env.LINE_CHANNEL_ID || '';
        const redirectUri = this.getRedirectUri();
        const state = this.generateState();
        this.logDebug('LINE LOGIN DEBUG', {
            channelId: process.env.LINE_CHANNEL_ID,
            redirectUri: process.env.LINE_REDIRECT_URI,
        });
        if (!clientId) {
            throw new Error('LINE credentials not configured: LINE_CHANNEL_ID is missing');
        }
        const authUrl = new URL(this.lineAuthEndpoint);
        authUrl.searchParams.append('response_type', 'code');
        authUrl.searchParams.append('client_id', clientId);
        authUrl.searchParams.append('redirect_uri', redirectUri);
        authUrl.searchParams.append('state', state);
        authUrl.searchParams.append('scope', 'profile openid');
        console.log('[LINE Auth] Generated authorization URL:', {
            clientId,
            redirectUri,
            state: state.substring(0, 5) + '...',
        });
        this.logDebug('LINE LOGIN DEBUG', { finalRedirectUri: redirectUri });
        return {
            auth_url: authUrl.toString(),
            client_id: clientId,
            redirect_uri: redirectUri,
            state,
        };
    }
    async exchangeCodeForToken(code) {
        const clientId = process.env.LINE_CHANNEL_ID || '';
        const clientSecret = process.env.LINE_CHANNEL_SECRET || '';
        const redirectUri = this.getRedirectUri();
        this.logDebug('TOKEN EXCHANGE DEBUG', {
            clientId,
            redirectUri,
            clientSecretExists: !!clientSecret,
        });
        if (!clientId || !clientSecret) {
            throw new Error('LINE credentials not configured');
        }
        console.log('[LINE Auth] Exchanging authorization code for access token');
        console.log('[LINE Auth] Using redirect_uri:', redirectUri);
        const tokenParams = new URLSearchParams({
            grant_type: 'authorization_code',
            code,
            redirect_uri: redirectUri,
            client_id: clientId,
            client_secret: clientSecret,
        });
        console.log('[LINE Auth] 🔴 DETAILED TOKEN EXCHANGE DEBUG:');
        console.log('[LINE Auth] grant_type:', 'authorization_code');
        console.log('[LINE Auth] code:', code.substring(0, 20) + '...');
        console.log('[LINE Auth] redirect_uri:', redirectUri);
        console.log('[LINE Auth] client_id:', clientId);
        console.log('[LINE Auth] client_secret:', clientSecret.substring(0, 10) + '...');
        console.log('[LINE Auth] Sending to:', this.lineTokenEndpoint);
        try {
            const response = await fetch(this.lineTokenEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: tokenParams.toString(),
            });
            const responseData = await response.json();
            if (!response.ok) {
                console.error('[LINE Auth] ❌ TOKEN EXCHANGE FAILED');
                console.error('[LINE Auth] HTTP Status:', response.status);
                console.error('[LINE Auth] Error response:', JSON.stringify(responseData, null, 2));
                console.error('[LINE Auth] Token params sent:', {
                    grant_type: 'authorization_code',
                    code: code.substring(0, 20) + '...',
                    redirect_uri: redirectUri,
                    client_id: clientId,
                });
                if ((responseData.error === 'invalid_grant' || responseData.error === 'invalid_request') &&
                    responseData.error_description &&
                    responseData.error_description.toLowerCase().includes('redirect_uri')) {
                    console.error('[LINE Auth] 🔴 REDIRECT_URI MISMATCH DETECTED!');
                    console.error('[LINE Auth] Backend redirect_uri:', redirectUri);
                    console.error('[LINE Auth] Expected by LINE Console: Check your LINE Console settings');
                    console.error('[LINE Auth] Ensure LINE_REDIRECT_URI in .env matches LINE Console exactly');
                    throw new common_1.UnauthorizedException(`redirect_uri mismatch. ` +
                        `Backend is using: "${redirectUri}". ` +
                        `Make sure LINE_REDIRECT_URI environment variable matches your LINE Console Callback URL exactly.`);
                }
                if (responseData.error === 'invalid_grant' &&
                    responseData.error_description &&
                    responseData.error_description.toLowerCase().includes('code_verifier')) {
                    console.error('[LINE Auth] 🔴 CODE_VERIFIER MISMATCH - Authorization code may have expired');
                    console.error('[LINE Auth] Try logging in again - authorization codes expire after 10 minutes');
                    throw new common_1.UnauthorizedException(`Authorization code expired or invalid. Please try logging in again.`);
                }
                throw new common_1.UnauthorizedException(`LINE API error: ${responseData.error || 'Unknown error'} - ${responseData.error_description || ''}. (Used redirect_uri: ${redirectUri})`);
            }
            console.log('[LINE Auth] ✅ Token exchange successful');
            return {
                access_token: responseData.access_token,
                user_id: responseData.user_id,
            };
        }
        catch (error) {
            console.error('[LINE Auth] Error exchanging code:', error.message);
            throw error instanceof common_1.UnauthorizedException
                ? error
                : new common_1.UnauthorizedException(`Failed to authenticate with LINE: ${error.message}`);
        }
    }
    async getUserId(accessToken) {
        try {
            const response = await fetch(this.lineTokenInfoEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    access_token: accessToken,
                }).toString(),
            });
            if (!response.ok) {
                throw new common_1.UnauthorizedException('Failed to verify LINE access token');
            }
            const data = await response.json();
            if (!data.user_id) {
                throw new common_1.UnauthorizedException('No user_id in LINE token response');
            }
            return data.user_id;
        }
        catch (error) {
            console.error('[LINE Auth] Error getting LINE user ID:', error.message);
            throw error instanceof common_1.UnauthorizedException
                ? error
                : new common_1.UnauthorizedException('Failed to get LINE user ID');
        }
    }
    async getUserProfile(accessToken) {
        try {
            const response = await fetch(this.lineProfileEndpoint, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            if (!response.ok) {
                console.warn('[LINE Auth] Failed to get LINE profile, using default');
                return { displayName: 'LINE User', userId: '' };
            }
            return await response.json();
        }
        catch (error) {
            console.error('[LINE Auth] Error getting LINE profile:', error);
            return { displayName: 'LINE User', userId: '' };
        }
    }
    verifyRedirectUri() {
        const redirectUri = process.env.LINE_REDIRECT_URI;
        if (!redirectUri) {
            console.warn('[LINE Auth] LINE_REDIRECT_URI not configured in .env');
            return false;
        }
        if (!redirectUri.startsWith('https://')) {
            console.warn('[LINE Auth] redirect_uri must use https://');
            return false;
        }
        return true;
    }
    getRedirectUri() {
        let redirectUri = process.env.LINE_REDIRECT_URI;
        if (!redirectUri && process.env.FRONTEND_URL) {
            redirectUri = `${process.env.FRONTEND_URL}/auth/line/callback`;
        }
        if (!redirectUri && (process.env.NODE_ENV === 'production' || !process.env.NODE_ENV)) {
            redirectUri = 'https://qa-rp-trr-ku-csc.vercel.app/auth/line/callback';
        }
        if (!redirectUri) {
            redirectUri = 'http://localhost:3000/auth/line/callback';
        }
        if (!redirectUri.startsWith('https://') && !redirectUri.startsWith('http://')) {
            throw new Error(`LINE_REDIRECT_URI must use https:// or http:// protocol. Got: ${redirectUri}`);
        }
        console.log('[LINE Auth] Using redirect_uri:', redirectUri);
        return redirectUri;
    }
    generateState() {
        return Math.random().toString(36).substring(7);
    }
    logDebug(label, data) {
        console.log(`[🔴 ${label}] ==========================================`);
        Object.entries(data).forEach(([key, value]) => {
            console.log(`[🔴 ${label}] ${key}:`, value);
        });
        console.log(`[🔴 ${label}] ==========================================`);
    }
};
exports.LineOAuthService = LineOAuthService;
exports.LineOAuthService = LineOAuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], LineOAuthService);
//# sourceMappingURL=line-oauth.service.js.map