import { LocalService } from "./local-storage.service";

export class AuthToken {
    private hasExpiration = true;

    constructor(private valueKey: string, private expirationTimeKey: string, private storage: LocalService) {}

    public getValue(): string {
        return this.storage.getData(this.valueKey);;
    }

    public set(value: string, life: number): void {
        this.setValue(value);
        this.setLife(life);
    }

    public setValue(value: string): void {
        this.storage.saveData(this.valueKey, value);
    }    
    
    public setLife(life: number) {
        this.hasExpiration = life > 0;
        this.storage.saveData(this.expirationTimeKey, JSON.stringify(this.computeExpiresAt(life).valueOf()));
    }

    public isExpired(): boolean {
        return this.hasExpiration && this.getExpiresAt() < this.getNowUTC();
    }

    public getExpiresAt(): number {
        if (!this.hasExpiration) {
            Number.MAX_VALUE;
        }

        const expiration = this.storage.getData(this.expirationTimeKey);
        if (!expiration) {
            return 0;
        }

        const expiresAt = JSON.parse(expiration);
        return expiresAt
    }

    public clear() {
        this.storage.removeData(this.valueKey);
        this.storage.removeData(this.expirationTimeKey);
    }

    private getNowUTC(): number {
        var date = new Date();
        var nowUTC = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
        return nowUTC;
    }
    
    private computeExpiresAt(expiresIn: number): number {
        return this.getNowUTC() + expiresIn * 1000;
    }
}