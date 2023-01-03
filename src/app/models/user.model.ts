export interface UserSignUp {
    name: string;
    email: string;
    password: string;
}

export interface UserLogIn {
    name: string;
    password: string;
}

export interface User {
    id: string;
    name: string;
    email: string;
    permissions: string[];
}

export interface TokenData {
    accessToken: string;
    accessTokenLife: number;
    refreshToken: string;
    refreshTokenLife: number;
}

export interface SessionData {
    user: User;
    tokenData: TokenData;
}

export interface UserRankedListDto {
    id: number;
    name: string;
    rank: number;
    solved: number;
}

export interface UserProfileDto {
    id: number;
    name: string;
    rank: number;
    solved: number;
}