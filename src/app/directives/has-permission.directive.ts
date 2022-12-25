import {
    Directive,
    Input,
    TemplateRef,
    ViewContainerRef,
    OnInit,
  } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { PermissionService } from '../services/permission.service';
  
@Directive({
    selector: '[hasPermission]'
})
export class HasPermissionDirective implements OnInit {
    private permissions: string[] = [];
    private logicalOp: 'AND' | 'OR' = 'AND';
    private isHidden = true;

    constructor(
        private templateRef: TemplateRef<any>,
        private viewContainer: ViewContainerRef,
        private auth: AuthService,
        private userPermissions: PermissionService
    ) { }

    ngOnInit() {
        this.auth.me$.subscribe(user => {
            this.updateView();
        });
    }

    @Input()
    set hasPermission(val: string[]) {
        this.permissions = val;
        this.updateView();
    }

    @Input()
    set hasPermissionOp(permop: 'AND' | 'OR') {
        this.logicalOp = permop;
        this.updateView();
    }

    private updateView() {
        if (!this.checkPermission()) {
            this.isHidden = true;
            this.viewContainer.clear();
            return;
        }

        if (this.isHidden) {
            this.viewContainer.createEmbeddedView(this.templateRef);
            this.isHidden = false;
        }
    }

    private checkPermission() {
        if (this.logicalOp === 'AND') {
            return this.userPermissions.hasAll(this.permissions);
        }

        return this.userPermissions.hasAny(this.permissions);
    }
}