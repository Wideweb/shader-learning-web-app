import { Injectable, OnDestroy } from '@angular/core';
import { Location } from '@angular/common';

@Injectable({
    providedIn: 'root',
})
export class LocationHistoryService implements OnDestroy {

    private history: string[] = [];

    private subscription: VoidFunction | null = null;

    constructor(private location: Location) {}

    init(): void {
        this.subscription = this.location.onUrlChange((v) => this.history.push(v));
    }

    get(): string[] {
        return this.history;
    }

    ngOnDestroy(): void {
        if (this.subscription) {
            this.subscription();
        }
    }
}