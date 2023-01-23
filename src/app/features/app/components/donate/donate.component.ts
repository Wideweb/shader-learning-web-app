import { Component, OnInit } from '@angular/core';
import { PageMetaService } from 'src/app/features/common/services/page-meta.service';

@Component({
  selector: 'donate',
  templateUrl: './donate.component.html',
  styleUrls: ['./donate.component.css']
})
export class DonateComponent implements OnInit {
  constructor(private pageMeta: PageMetaService) { }

  ngOnInit(): void {
    this.pageMeta.setTitle('Alexander Alkevich');
    this.pageMeta.setDescription(`Shader Learning platform was created by me in my free time purely on enthusiasm. I hope you've enjoyed my work. Your help inspires me to further develop the project.`);
  }
}
