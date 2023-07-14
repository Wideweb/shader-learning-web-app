import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, debounceTime, delay, interval, map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SpinnerService implements OnDestroy {

    private counter: number = 0;

    private show$ = new BehaviorSubject<boolean>(false);

    public shown$: Observable<boolean>;

    public hidden$: Observable<boolean>;

    constructor() {
        this.shown$ = this.show$.asObservable().pipe(delay(0));
        this.hidden$ = this.show$.asObservable().pipe(delay(0), map(shown => !shown));
    }

    show(): void {
        this.counter++;
        if (this.counter === 1) {
            this.show$.next(true);
        }
    }

    hide(): void {
        if (this.counter > 0) {
            this.counter--;
        }
        if (this.counter < 1) {
            this.show$.next(false);
        }
    }

    ngOnDestroy(): void {
        this.show$.next(false);
        this.show$.unsubscribe();
    }
}

const spinnerService = new SpinnerService();
export default spinnerService;