import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ISelectItem } from '../../../models/constantes';

@Component({
  templateUrl: './log-dialog-validaciones.component.html',
  styleUrls: ['./log-dialog-validaciones.component.css']
})
export class LogDialogValidacionesComponent implements OnInit {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { validaciones: ISelectItem[] }
  ) { }

  ngOnInit(): void {
  }

}
