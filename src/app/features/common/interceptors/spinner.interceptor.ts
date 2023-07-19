import { Injectable, NgZone } from "@angular/core";
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpContextToken} from "@angular/common/http";
import { Observable, tap } from "rxjs";
import { SpinnerService } from "../services/spinner.service";

@Injectable()
export class SpinnerInterceptor implements HttpInterceptor {

    constructor(private spinner: SpinnerService, private ngZone: NgZone) {}

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        if (req.context.get(CANCEL_SPINNER_TOKEN)) {
            return next.handle(req);
        }

        this.ngZone.run(() => this.spinner.show());
        return next.handle(req).pipe(
            tap({ 
                complete: () => {
                    this.ngZone.run(() => this.spinner.hide());
                },
                error: (err) => {
                    this.ngZone.run(() => this.spinner.hide());
                    return err;
                }
            })
        );
    }
}

export const CANCEL_SPINNER_TOKEN = new HttpContextToken<boolean>(() => false);