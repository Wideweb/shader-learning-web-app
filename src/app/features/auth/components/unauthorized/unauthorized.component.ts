import { Component, OnInit } from '@angular/core';
import { PageMetaService } from 'src/app/features/common/services/page-meta.service';

@Component({
  selector: 'unauthorized',
  templateUrl: './unauthorized.component.html',
  styleUrls: ['./unauthorized.component.css']
})
export class UnauthorizedComponent implements OnInit {
  constructor(private pageMeta: PageMetaService) {}

  ngOnInit(): void {
    this.pageMeta.setTitle('Unauthorized');
    this.pageMeta.setDefaultDescription();
  }
}
