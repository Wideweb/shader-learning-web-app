import { Injectable, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class AppEventService implements OnDestroy {

    private _pageScroll$ = new Subject<number>();

    public pageScroll$ = this._pageScroll$.asObservable();

    pageScroll(top: number): void {
        this._pageScroll$.next(top);
    }

    ngOnDestroy(): void {
        this._pageScroll$.unsubscribe();
    }
}