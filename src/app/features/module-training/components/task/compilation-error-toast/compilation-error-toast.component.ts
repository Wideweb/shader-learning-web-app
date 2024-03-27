import { Component, inject } from "@angular/core";
import { MatSnackBarRef } from "@angular/material/snack-bar";

@Component({
  selector: 'compilation-error-toast',
  templateUrl: './compilation-error-toast.component.html',
  styleUrls: ['./compilation-error-toast.component.scss'],
})
export class CompilationErrorToastToastComponent {
  public snackBarRef = inject(MatSnackBarRef);

  public close(): void {
    this.snackBarRef.dismiss();
  }
}