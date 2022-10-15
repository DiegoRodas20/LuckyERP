import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-gestioni-informacion-personal',
  templateUrl: './gestioni-informacion-personal.component.html',
  styleUrls: ['./gestioni-informacion-personal.component.scss']
})
export class GestioniInformacionPersonalComponent implements OnInit {
  @Input() personal: any;

  constructor() { }

  ngOnInit(): void {
  }

}
