import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-oc-devolver-visor',
  templateUrl: './oc-devolver-visor.component.html',
  styleUrls: ['./oc-devolver-visor.component.css']
})
export class OcDevolverVisorComponent implements OnInit {

  url

  constructor(
    @Inject(MAT_DIALOG_DATA) private data,
    private domSanitizer: DomSanitizer) {

    this.url = this.domSanitizer.bypassSecurityTrustResourceUrl(data);
  }

  ngOnInit(): void {
  }
}
