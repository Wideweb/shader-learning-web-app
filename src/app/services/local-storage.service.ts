import { Injectable, OnDestroy } from '@angular/core';
import  *  as CryptoJS from  'crypto-js';
import { filter, fromEvent, ReplaySubject, Subject, takeUntil } from 'rxjs';

export interface LocalServiceEvent {
    key: string | null;
    value: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class LocalService implements OnDestroy {

    public message$ = new ReplaySubject<LocalServiceEvent>(1);

    private key = 'shader-learning';

    private destroy$: Subject<boolean> = new Subject<boolean>();

    constructor() {
        fromEvent<StorageEvent>(window, 'storage')
            .pipe(
                filter(event => event.storageArea === localStorage),
                takeUntil(this.destroy$),
            )
            .subscribe(event => {
                this.message$.next({key: event.key, value: event.newValue })
            });
    }

    ngOnDestroy(): void {
        this.destroy$.next(true);
        this.destroy$.unsubscribe();
    }

    public saveData(key: string, value: string) {
        localStorage.setItem(key, this.encrypt(value));
    }

    public getData(key: string) {
        let data = localStorage.getItem(key)|| "";
        return this.decrypt(data);
    }
    
    public removeData(key: string) {
        localStorage.removeItem(key);
    }

    public clearData() {
        localStorage.clear();
    }

    private encrypt(txt: string): string {
        return CryptoJS.AES.encrypt(txt, this.key).toString();
    }

    private decrypt(txtToDecrypt: string) {
        return CryptoJS.AES.decrypt(txtToDecrypt, this.key).toString(CryptoJS.enc.Utf8);
    }
}