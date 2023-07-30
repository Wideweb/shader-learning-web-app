import { Component, inject } from "@angular/core";
import { MatSnackBarRef } from "@angular/material/snack-bar";

@Component({
  selector: 'app-server-error-toast',
  templateUrl: './server-error-toast.component.html',
  styleUrls: ['./server-error-toast.component.scss'],
})
export class AppServerErrorToastComponent {
  public snackBarRef = inject(MatSnackBarRef);

  public close(): void {
    this.snackBarRef.dismiss();
  }
}