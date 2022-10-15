import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Aprobacion } from '../../model/Isctr';
import { SctrService } from '../sctr.service';

@Component({
  selector: 'app-dialog-aprobaciones',
  templateUrl: './dialog-aprobaciones.component.html',
  styleUrls: ['../sctr.component.css']
})
export class DialogAprobacionesComponent implements OnInit {
  @ViewChild(MatPaginator) listAproPag: MatPaginator;
  @ViewChild(MatSort) listAproSor: MatSort;
  listApro = new Array<Aprobacion>();
  aproDS: MatTableDataSource<Aprobacion>;
  aproDC: string[] = ['cargo', 'sFullNom', 'estado','dFecha'];
  nIdGastoCosto:string;
  url: string;
  

  constructor(public service: SctrService, @Inject('BASE_URL') baseUrl: string, public dialogRef: MatDialogRef<DialogAprobacionesComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { 
      this.url = baseUrl;
      this.nIdGastoCosto = data["nIdGastoCosto"];
      this.listTApro();
    }

  ngOnInit(): void {
  }

  async listTApro() {
    const param = [];
    param.push(this.nIdGastoCosto);
    this.service.fnSctr(103, param, this.url).subscribe(value => {
      this.listApro = value;
      this.aproDS = new MatTableDataSource(this.listApro);
      this.aproDS.paginator = this.listAproPag;
      this.aproDS.sort = this.listAproSor;
    });
  }

  btnCerrar() {
    this.dialogRef.close();
  }

}
