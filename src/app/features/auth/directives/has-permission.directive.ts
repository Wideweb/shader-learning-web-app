import {
    Directive,
    Input,
    TemplateRef,
    ViewContainerRef,
    OnInit,
  } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { AuthState } from '../state/auth.state';
  
@Directive({
    selector: '[hasPermission]'
})
export class HasPermissionDirective implements OnInit {
    
    private permissions: string[] = [];
    
    private logicalOp: 'AND' | 'OR' = 'AND';
    
    private isHidden = true;

    @Select(AuthState.permissions)
    private userPermissions$!: Observable<string[]>;

    constructor(
        private templateRef: TemplateRef<any>,
        private viewContainer: ViewContainerRef,
        private store: Store,
    ) { }

    ngOnInit() {
        this.userPermissions$.subscribe(() => this.updateView());
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
        const userPermissions = this.store.selectSnapshot(AuthState.permissions);

        if (this.logicalOp === 'AND') {
            return this.store.selectSnapshot(AuthState.hasAllPermissions(this.permissions));
        }

        return this.store.selectSnapshot(AuthState.hasAnyPermissions(this.permissions));
    }
}