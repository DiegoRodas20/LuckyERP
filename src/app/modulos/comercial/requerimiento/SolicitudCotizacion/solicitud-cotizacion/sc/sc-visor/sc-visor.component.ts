import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {DomSanitizer} from '@angular/platform-browser';

@Component({
  selector: 'app-sc-visor',
  templateUrl: './sc-visor.component.html',
  styleUrls: ['./sc-visor.component.css']
})
export class ScVisorComponent implements OnInit {
  url;
  constructor(@Inject(MAT_DIALOG_DATA) public data, private domSanitizer: DomSanitizer) {
    this.url = this.domSanitizer.bypassSecurityTrustResourceUrl(data.sRutaArchivo);
  }

  ngOnInit(): void {
  }

}
