import { Injectable } from "@angular/core";
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse} from "@angular/common/http";
import { BehaviorSubject, catchError, filter, Observable, switchMap, take, throwError } from "rxjs";
import { Router } from "@angular/router";
import { Store } from "@ngxs/store";
import { AuthState } from "../state/auth.state";
import { AuthClear, RefreshAccessToken } from "../state/auth.actions";
import { MatSnackBar } from "@angular/material/snack-bar";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

    private isRefreshing = false;

    private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

    constructor(private router: Router, private store: Store, private snackBar: MatSnackBar) {}

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return this.authorizeRequest(request, next).pipe(
            catchError(err => this.handleError(request, next, err)),
        );
    }

    authorizeRequest(request: HttpRequest<any>, next: HttpHandler) {
        const accessToken = this.store.selectSnapshot(AuthState.accessToken);

        if (accessToken) {
            return next.handle(this.addTokenHeader(request, accessToken));
        }
        else {
            return next.handle(request);
        }
    }

    handleError(request: HttpRequest<any>, next: HttpHandler, error: any): Observable<HttpEvent<any>> {
        if (!(error instanceof HttpErrorResponse)) {
            return throwError(() => error);
        }

        if (error.status === 401) {
            return this.handle401Error(request, next);
        }

        if (error.status === 403) {
            // this.snackBar.open('Unauthorized', '', {
            //     horizontalPosition: 'right',
            //     verticalPosition: 'top',
            //     duration: 5000,
            //     panelClass: 'snack-bar-item-server-error'
            // });
            this.router.navigate(['/explore']);
        }

        return throwError(() => error);
    }

    private handle401Error(request: HttpRequest<any>, next: HttpHandler) {
        if (!this.isRefreshing) {
            this.isRefreshing = true;
            this.refreshTokenSubject.next(null);

            return this.store
                .dispatch(new RefreshAccessToken())
                .pipe(
                    catchError((err) => this.store.dispatch(new AuthClear())
                        .pipe(switchMap(() => {
                            console.log('Unauthorized')
                            this.router.navigate(['/explore']);
                            return throwError(() => err);
                        }))),
                    switchMap(() => {
                        this.isRefreshing = false;
                        const accessToken = this.store.selectSnapshot(AuthState.accessToken)!;
                        this.refreshTokenSubject.next(accessToken);
                        return next.handle(this.addTokenHeader(request, accessToken));
                    }),
                );
        }

        return this.refreshTokenSubject.pipe(
            filter(token => token !== null),
            take(1),
            switchMap((token) => next.handle(this.addTokenHeader(request, token)))
        );
    }

    private addTokenHeader(request: HttpRequest<any>, accessToken: string) {
        return request.clone({
            headers: request.headers.set('Authorization', `Bearer ${accessToken}`)
        });
    }
}