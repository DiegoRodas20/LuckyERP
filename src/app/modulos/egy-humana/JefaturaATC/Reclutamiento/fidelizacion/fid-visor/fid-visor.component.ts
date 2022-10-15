import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-fid-visor',
  templateUrl: './fid-visor.component.html',
  styleUrls: ['./fid-visor.component.css']
})
export class FidVisorComponent implements OnInit {

  url
  constructor(@Inject(MAT_DIALOG_DATA) private data, private domSanitizer: DomSanitizer) {

    this.url = this.domSanitizer.bypassSecurityTrustResourceUrl(data);
   }

  ngOnInit(): void {
  }


  
}
