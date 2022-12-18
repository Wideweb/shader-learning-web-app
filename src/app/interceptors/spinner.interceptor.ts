import { Injectable } from "@angular/core";
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpContextToken} from "@angular/common/http";
import { Observable, tap } from "rxjs";
import { Spinner } from "../services/spinner.service";

@Injectable()
export class SpinnerInterceptor implements HttpInterceptor {

    constructor(private spinner: Spinner) {}

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        if (req.context.get(CANCEL_SPINNER_TOKEN)) {
            return next.handle(req);
        }

        this.spinner.show();
        return next.handle(req).pipe(
            tap({ 
                complete: () => {
                    this.spinner.hide();
                },
                error: (err) => {
                    this.spinner.hide();
                    return err;
                }
            })
        );
    }
}

export const CANCEL_SPINNER_TOKEN = new HttpContextToken<boolean>(() => false);