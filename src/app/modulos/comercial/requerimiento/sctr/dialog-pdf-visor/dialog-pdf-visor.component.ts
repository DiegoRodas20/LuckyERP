import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-dialog-pdf-visor',
  templateUrl: './dialog-pdf-visor.component.html',
  styleUrls: ['./dialog-pdf-visor.component.css']
})
export class DialogPdfVisorComponent implements OnInit {

  url

  constructor(@Inject(MAT_DIALOG_DATA) private data, private domSanitizer: DomSanitizer) {
    this.url = this.domSanitizer.bypassSecurityTrustResourceUrl(data);
  }

  ngOnInit(): void {
  }

}
