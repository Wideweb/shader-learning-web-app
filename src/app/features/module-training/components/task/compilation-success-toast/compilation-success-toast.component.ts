import { Component, inject } from "@angular/core";
import { MatSnackBarRef } from "@angular/material/snack-bar";

@Component({
  selector: 'compilation-success-toast',
  templateUrl: './compilation-success-toast.component.html',
  styleUrls: ['./compilation-success-toast.component.scss'],
})
export class CompilationSuccessToastComponent {
  public snackBarRef = inject(MatSnackBarRef);

  public close(): void {
    this.snackBarRef.dismiss();
  }
}