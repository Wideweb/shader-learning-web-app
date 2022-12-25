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
    token: string;
    expiresIn: number;
}

export interface SessionData {
    user: User;
    tokenData: TokenData;
}