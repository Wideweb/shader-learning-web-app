import { UserLogIn } from "../models/user-login.model";
import { UserSignUp } from "../models/user-sign-up.model";

export class SignUp {
    static readonly type = '[Auth] SignUp';
    constructor(public payload: UserSignUp) {}
}

export class Login {
    static readonly type = '[Auth] Login';
    constructor(public payload: UserLogIn) {}
}
  
export class Logout {
    static readonly type = '[Auth] Logout';
}

export class LoadMe {
    static readonly type = '[Auth] Me';
}

export class RefreshAccessToken {
    static readonly type = '[Auth] Refresh Access Token';
}

export class UpdateAccessToken {
    static readonly type = '[Auth] Update Access Token';
    constructor(public payload: {value: string; life: number; expired: boolean;}) {}
}

export class UpdateRefreshToken {
    static readonly type = '[Auth] Update Refresh Token';
    constructor(public payload: {value: string; life: number; expired: boolean;}) {}
}

export class IsAccessTokenExpired {
    static readonly type = '[Auth] Is Access Token Expired';
    constructor(public payload: boolean) {}
}

export class IsRefreshTokenExpired {
    static readonly type = '[Auth] Is Refresh Token Expired';
    constructor(public payload: boolean) {}
}

export class AuthClear {
    static readonly type = '[Auth] Clear';
}