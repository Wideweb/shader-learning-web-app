import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SpinnerService {

    private counter: number = 0;

    show(): void {
        this.counter++;
    }

    hide(): void {
        if (this.counter > 0) {
            this.counter--;
        }
    }

    isShown(): boolean {
        return this.counter > 0;
    }

    isHidden(): boolean {
        return this.counter <= 0;
    }
}

const spinnerService = new SpinnerService();
export default spinnerService;