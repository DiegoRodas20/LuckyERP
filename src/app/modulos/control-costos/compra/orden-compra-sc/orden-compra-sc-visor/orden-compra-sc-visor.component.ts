import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-orden-compra-sc-visor',
  templateUrl: './orden-compra-sc-visor.component.html',
  styleUrls: ['./orden-compra-sc-visor.component.css']
})
export class OrdenCompraScVisorComponent implements OnInit {
  url
  constructor(@Inject(MAT_DIALOG_DATA) private data, private domSanitizer: DomSanitizer) {

    this.url = this.domSanitizer.bypassSecurityTrustResourceUrl(data);
   }

  ngOnInit(): void {
  }

  MostrarImenge(){

  }
}
