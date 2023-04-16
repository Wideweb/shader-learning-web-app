import { Component, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { Logout } from 'src/app/features/auth/state/auth.actions';
import { PageMetaService } from 'src/app/features/common/services/page-meta.service';


@Component({
  selector: 'logout',
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.css']
})
export class LogoutComponent implements OnInit {

  constructor(private store: Store, private pageMeta: PageMetaService) {}

  ngOnInit(): void {
    this.pageMeta.setTitle('Sign Out');
    this.pageMeta.setDefaultDescription();

    this.store.dispatch(new Logout());
  }
}
