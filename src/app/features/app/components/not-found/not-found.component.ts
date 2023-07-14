import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LocationHistoryService } from 'src/app/features/common/services/location-history.service';
import { PageMetaService } from 'src/app/features/common/services/page-meta.service';

@Component({
  selector: 'not-found',
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.scss']
})
export class NotFoundComponent implements OnInit {
  constructor(
    private pageMeta: PageMetaService,
    private location: Location,
    private locationHistory: LocationHistoryService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.pageMeta.setTitle('404');
    this.pageMeta.setDefaultDescription();
  }

  goBack() {
    if (this.locationHistory.get().length > 1) {
      this.location.historyGo(-1);
    } else {
      this.router.navigate([`/explore`]);
    }
  }
}
