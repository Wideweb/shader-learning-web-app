import { BehaviorSubject, filter, map } from "rxjs";
import { LocalService } from "../../common/services/local-storage.service";

export interface AuthTokenUpdateEvent {
    value: string;
    life: number;
    expired: boolean;
}

export class AuthToken {

    public update$: BehaviorSubject<AuthTokenUpdateEvent>;

    constructor(private valueKey: string, private lifeKey: string, private storage: LocalService) { 
        this.update$ = new BehaviorSubject(this.getUpdateEvent());

        this.storage.message$.pipe(
            filter(message => message.key == valueKey || message.key == lifeKey),
            map(() => this.getUpdateEvent())
        ).subscribe(this.update$);
    }

    private getUpdateEvent() {
        return {
            value: this.getValue(),
            life: this.getLife(),
            expired: this.isExpired(),
        };
    }

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

    public getLife() {
        return Number.parseInt(this.storage.getData(this.lifeKey));
    }
    
    public setLife(life: number) {
        this.storage.saveData(this.lifeKey, JSON.stringify(life));
    }

    public isExpired(): boolean {
        const life = this.getLife();
        if (Number.isNaN(life)) {
            return true;
        }

        const hasExpiration = life > 0;
        return hasExpiration && this.getExpiresAt() < this.getNowUTC();
    }

    public getExpiresAt(): number {
        const life = this.getLife();

        if (Number.isNaN(life)) {
            return 0;
        }

        const hasExpiration = life > 0;
        if (!hasExpiration) {
            Number.MAX_VALUE;
        }

        return this.computeExpiresAt(life);
    }

    public clear() {
        this.storage.removeData(this.valueKey);
        this.storage.removeData(this.lifeKey);
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