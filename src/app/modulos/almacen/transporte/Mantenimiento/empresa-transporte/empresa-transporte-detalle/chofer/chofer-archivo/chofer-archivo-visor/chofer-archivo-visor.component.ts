import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-chofer-archivo-visor',
  templateUrl: './chofer-archivo-visor.component.html',
  styleUrls: ['./chofer-archivo-visor.component.css']
})
export class ChoferArchivoVisorComponent implements OnInit {
  
  url;

  constructor(
    @Inject(MAT_DIALOG_DATA) private data,
    private domSanitizer: DomSanitizer) {
    this.url = this.domSanitizer.bypassSecurityTrustResourceUrl(data);
  }

  ngOnInit() {

  }


}
