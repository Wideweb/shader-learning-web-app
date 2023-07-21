import { saturate } from "src/app/features/common/services/math";

export class FinitAction {
    protected forward = true;

    protected elapsedTime = 0;

    protected playSpeed = 1;

    constructor(protected duration: number, protected ease: (t: number) => number) {}

    public update(deltaTime: number) {
        this.elapsedTime = Math.min(this.elapsedTime + deltaTime * this.playSpeed, this.duration);
        let progress = saturate(this.elapsedTime / this.duration);
        progress = this.forward ? progress : (1.0 - progress);

        this.step(this.ease(progress));
    }

    public setDirection(forward: boolean): void {
        if (this.forward === forward) {
            return;
        }
        this.forward = forward;
        this.elapsedTime = this.duration - this.elapsedTime;

        if (this.isDone()) {
            this.reset();
        }
    };

    public isDone(): boolean {
        return Math.abs(this.elapsedTime - this.duration) < 0.1;
    }

    public isForward(): boolean {
        return this.forward;
    }

    public reset(): void {
        this.elapsedTime = 0;
    }

    public setPlaySpeed(speed: number): void {
        this.playSpeed = speed;
    }

    public getPlaySpeed(): number {
        return this.playSpeed;
    }

    protected step(progress: number) { }
};

const emptyAction = new FinitAction(-1, x => x);

export { emptyAction };