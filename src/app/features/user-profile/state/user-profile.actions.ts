export class UserProfileLoad {
    static readonly type = '[UserProfile] Load';
    constructor(public id: number) {}
}

export class UserProfileLoadMe {
    static readonly type = '[UserProfile] Load Me';
}