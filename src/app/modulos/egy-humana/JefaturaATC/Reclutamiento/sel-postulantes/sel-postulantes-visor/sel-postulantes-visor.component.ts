import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-sel-postulantes-visor',
  templateUrl: './sel-postulantes-visor.component.html',
  styleUrls: ['./sel-postulantes-visor.component.css']
})

export class SelPostulantesVisorComponent implements OnInit {

  url: any;
  nTipoData: number;

  constructor(
    private spinner: NgxSpinnerService,
    private domSanitizer: DomSanitizer,
    @Inject(MAT_DIALOG_DATA) private data) {
    this.spinner.show()
  }

  ngOnInit() {
    this.fnCargarModal()
  }

  fnCargarModal() {
    this.nTipoData = this.data.tipo

    if (this.nTipoData == 1) {
      this.url = this.data.url
      this.spinner.hide()
    }
    else {
      this.url = this.domSanitizer.bypassSecurityTrustResourceUrl(this.data);
      this.spinner.hide()
    }
  }
}
