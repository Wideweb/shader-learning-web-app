import { ResetPasswordData } from "../models/reset-password-data.model";
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

export class RequestResetPassword {
    static readonly type = '[Auth] Request Reset Password';
    constructor(public email: string) {}
}

export class ResetPassword {
    static readonly type = '[Auth] Reset Password';
    constructor(public payload: ResetPasswordData) {}
}

export class LoadMe {
    static readonly type = '[Auth] Me';
}

export class RefreshAccessToken {
    static readonly type = '[Auth] Refresh Access Token';
}

export class UpdateToken {
    static readonly type = '[Auth] Update Token';
    constructor(
        public accessToken: {value: string; life: number; expired: boolean;},
        public refreshToken: {value: string; life: number; expired: boolean;},
        public stored: boolean = false) {}
}

export class SetTokenStored {
    static readonly type = '[Auth] Stored';
    constructor(public payload: boolean) {}
}

export class IsTokenExpired {
    static readonly type = '[Auth] Is Token Expired';
    constructor(public accessToken: boolean, public refreshToken: boolean) {}
}

export class AuthClear {
    static readonly type = '[Auth] Clear';
}