import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table'; 
import { Aseguradora } from '../interface';
import { ParametroSctrService } from '../parametro-sctr.service';

@Component({
  selector: 'app-dialog-sctr',
  templateUrl: './dialog-sctr.component.html',
  styleUrls: ['../parametro-sctr.component.css']
})
export class DialogSctrComponent implements OnInit {
  @ViewChild(MatPaginator) asegPag: MatPaginator;
  @ViewChild(MatSort) asegSor: MatSort;
  aseg: Aseguradora;
  asegDC: string[] = ['sruc','srazonSocial','snombreComercial','bestado'];
  asegDS: MatTableDataSource<Aseguradora>;
  listaAseg = new Array<Aseguradora>();
  url: string;
  fabButtons = [{ icon: 'personal_add', tool: 'Nuevo Parametro SCTR' }];
  buttons = [];
  fabTogglerState = 'inactive';
  asegFG: FormGroup;

  constructor(public dialogRef: MatDialogRef<DialogSctrComponent>,
    public service: ParametroSctrService, @Inject('BASE_URL') baseUrl: string,
    private fb: FormBuilder, private _snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: any) { 
      this.url = baseUrl;
      this.tblAseg();
      this.btnNuevo();
    }

  ngOnInit(): void {
    this.asegFG = this.fb.group({
      sruc: [Validators.required],
      srazonSocial: [Validators.required],
      snombreComercial: [Validators.required],
    });
  }

  async tblAseg() {
    const param = [];
    this.service.fnUsuario(7, param, this.url).subscribe((value: Aseguradora[]) => {
      this.asegDS = new MatTableDataSource(value);
      this.asegDS.paginator = this.asegPag;
      this.asegDS.sort = this.asegSor;
    });
  }

  btnGrabar(){
    if (this.asegFG.invalid || this.aseg.sruc=='' || this.aseg.srazonSocial=='' || this.aseg.snombreComercial=='') {
      this.showAlert('Todos los datos son requeridos', "Alerta", 5);
      return;
    }

    var accion:number = 8;
    const param = [];
    param.push(this.aseg.sruc);
    param.push(this.aseg.srazonSocial);
    param.push(this.aseg.snombreComercial);
    param.push(1);

    if(this.aseg.nIdAseg != 0){
      accion=9
      param.push(this.aseg.nIdAseg);
    }
    this.service.fnUsuario(accion, param, this.url).subscribe(data => {
      if (data[0] == '01') {
        this.showAlert('Aseguradora Grabado', 'Correcto', 5);
        this.tblAseg();
      }else {
        this.showAlert(data, "Error", 5);
      }
    }, err => {
      console.log(err)
    });
  }

  seleccionar(element: Aseguradora){
    this.aseg = element;
  }

  btnNuevo(){
    this.aseg = {nIdAseg:0}
  }

  btnCerrar(){
    this.dialogRef.close();
  }

  showAlert(data: string, titulo: string, duration: number) {
    this._snackBar.open(data, titulo, {
      duration: duration * 10000,
      verticalPosition: "top"
    });
  }

}
