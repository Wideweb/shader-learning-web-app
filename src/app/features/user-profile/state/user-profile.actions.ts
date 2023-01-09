export class UserProfileLoad {
    static readonly type = '[UserProfile] Load';
    constructor(public id: number) {}
}

export class UserProfileLoadProgress {
    static readonly type = '[UserProfile] Load Progress';
}