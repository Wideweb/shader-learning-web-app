import { Injectable } from "@angular/core";
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpResponse, HttpErrorResponse} from "@angular/common/http";
import { BehaviorSubject, catchError, filter, Observable, switchMap, take, tap, throwError } from "rxjs";
import { Router } from "@angular/router";
import { AuthService } from "../services/auth.service";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

    private isRefreshing = false;

    private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

    constructor(private router: Router, private auth: AuthService) {}

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return this.authorizeRequest(request, next).pipe(
            catchError(err => this.handleError(request, next, err)),
        );
    }

    authorizeRequest(request: HttpRequest<any>, next: HttpHandler) {
        const accessToken = this.auth.getAccessToken();

        if (accessToken) {
            return next.handle(this.addTokenHeader(request, accessToken));
        }
        else {
            return next.handle(request);
        }
    }

    handleError(request: HttpRequest<any>, next: HttpHandler, error: any): Observable<HttpEvent<any>> {
        if (error instanceof HttpErrorResponse && error.status === 401) {
            return this.handle401Error(request, next);
        }

        return throwError(() => error);
    }

    private handle401Error(request: HttpRequest<any>, next: HttpHandler) {
        if (!this.isRefreshing) {
            this.isRefreshing = true;
            this.refreshTokenSubject.next(null);

            return this.auth.refreshAccessToke().pipe(
                switchMap(() => {
                    this.isRefreshing = false;
                    const accessToken = this.auth.getAccessToken();
                    this.refreshTokenSubject.next(accessToken);
                    return next.handle(this.addTokenHeader(request, accessToken));
                }),
                catchError((err) => {
                    this.isRefreshing = false;
                    this.auth.clearSession();
                    console.log('Unauthorized')
                    this.router.navigate(['/login']);
                    return throwError(() => err);
                })
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