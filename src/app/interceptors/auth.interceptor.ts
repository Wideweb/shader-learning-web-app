import { Injectable } from "@angular/core";
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpResponse, HttpErrorResponse} from "@angular/common/http";
import { Observable, tap } from "rxjs";
import { Router } from "@angular/router";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

    constructor(private router: Router) {}

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return this.authorizeRequest(req, next).pipe(
            tap({ error: (err) => this.handleError(err)})
        );
    }

    authorizeRequest(req: HttpRequest<any>, next: HttpHandler) {
        const idToken = localStorage.getItem("id_token");

        if (idToken) {
            const cloned = req.clone({
                headers: req.headers.set("Authorization",
                    "Bearer " + idToken)
            });

            return next.handle(cloned);
        }
        else {
            return next.handle(req);
        }
    }

    handleError(err: any) {
        if (err instanceof HttpErrorResponse) {
            if (err.status == 401) {
                console.log('Unauthorized')
                this.router.navigate(['/login']);
            }
        }
    }
}