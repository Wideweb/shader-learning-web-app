import { BehaviorSubject, filter, map, zip } from "rxjs";
import { LocalService } from "../../common/services/local-storage.service";
import { isExpired } from "./token.utils";

export interface AuthTokenUpdateEvent {
    value: string;
    expiresAt: number;
}

export class AuthToken {

    public update$: BehaviorSubject<AuthTokenUpdateEvent>;

    constructor(private valueKey: string, private expiresAtKey: string, private storage: LocalService) { 
        this.update$ = new BehaviorSubject(this.getUpdateEvent());

        const value$ = this.storage.message$.pipe(filter(message => message.key == valueKey));
        const expiresAtKey$ = this.storage.message$.pipe(filter(message => message.key == expiresAtKey));

        zip(value$, expiresAtKey$).pipe(map(() => this.getUpdateEvent())).subscribe(this.update$);
    }

    private getUpdateEvent() {
        const event = {
            value: this.getValue(),
            expiresAt: this.getExpiresAt(),
        };

        return event;
    }

    public getValue(): string {
        return this.storage.getData(this.valueKey);;
    }

    public set(value: string, expiresAt: number): void {
        this.setValue(value);
        this.setExpiresAt(expiresAt);
    }

    private setValue(value: string): void {
        if (value == this.getValue()) {
            return;
        }

        this.storage.saveData(this.valueKey, value);
    }    

    public getExpiresAt() {
        return Number.parseInt(this.storage.getData(this.expiresAtKey));
    }
    
    private setExpiresAt(expiresAt: number) {
        if (expiresAt == this.getExpiresAt() || (isNaN(expiresAt) && isNaN(this.getExpiresAt()))) {
            return;
        }

        this.storage.saveData(this.expiresAtKey, JSON.stringify(expiresAt));
    }

    public isExpired() {
        return isExpired(this.getExpiresAt());
    }

    public clear() {
        this.storage.removeData(this.valueKey);
        this.storage.removeData(this.expiresAtKey);
    }
}