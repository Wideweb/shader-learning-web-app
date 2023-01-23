import { Injectable } from "@angular/core";
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse} from "@angular/common/http";
import { catchError, Observable, throwError } from "rxjs";
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable()
export class ServerErrorInterceptor implements HttpInterceptor {

    constructor(private snackBar: MatSnackBar) {}

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(request).pipe(
            catchError(err => this.handleError(request, next, err)),
        );
    }

    handleError(request: HttpRequest<any>, next: HttpHandler, error: any): Observable<HttpEvent<any>> {
        if (error instanceof HttpErrorResponse && error.status >= 500) {
            this.snackBar.open('Server Error', '', {
                horizontalPosition: 'right',
                verticalPosition: 'top',
                duration: 5000,
                panelClass: 'snack-bar-item-server-error'
            });
        }

        return throwError(() => error);
    }
}