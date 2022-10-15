import { Component, OnInit, Injectable, Inject, ElementRef, ViewChild } from '@angular/core';
import { NgForm, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SergeneralService } from "./../../../../../../shared/services/sergeneral.service";
import Swal from 'sweetalert2';
import { NgxSpinnerService } from 'ngx-spinner';
import { SerfidelizacionService } from './../serfidelizacion.service';

import { EnviarFirmar } from '../../../Model/IATC';
import { FidEnviarComponent } from './../fid-enviar/fid-enviar.component';

import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { AppDateAdapter, APP_DATE_FORMATS } from '../../../../../../shared/services/AppDateAdapter';
import * as moment from 'moment';

@Component({
  selector: 'app-fid-lista-enviar',
  templateUrl: './fid-lista-enviar.component.html',
  styleUrls: ['./fid-lista-enviar.component.css'],
  providers: [
    { provide: DateAdapter, useClass: AppDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS }
  ],
})
export class FidListaEnviarComponent implements OnInit {

  url: string;
  pais: string;
  Empresa: string;
  id: number;
  nCantidadEnviar: number;

  //Data de Fidelizacion
  idFide: number;
  Estado: string;
  sCodRQ: string;
  nEstadoRQ:number

  dataFide: any

  Valor = [];
  bEstadoEnvio: boolean = false;


  Enviar: boolean = false;

  PrimeraFormGroup: FormGroup;

  sltMotivo: any;
  sltContrato: any;


  sltSupervisor: any;
  sltController: any;

  //Listas
  lListaUsuariosRQ: any;
  lListaEnviar = [];
  //lListaEnviar: [{ nIdFide: 0, Enviado: '', sCodRQ: '' }]

  displayedColumns: string[] = ['sUsuario', 'sDocumentosValidados', 'bEnviar'];
  dataSource: MatTableDataSource<EnviarFirmar>;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(
    public dialogRef: MatDialogRef<FidListaEnviarComponent>,
    private formBuilder: FormBuilder,
    private spinner: NgxSpinnerService,
    private vSerFidelizacion: SerfidelizacionService,
    public dialog: MatDialog,
    @Inject("BASE_URL") baseUrl: string,
    private vSerGeneral: SergeneralService,
    @Inject(MAT_DIALOG_DATA) public data: any) {

    this.url = baseUrl;



  }

  ngOnInit(): void {

    this.pais = localStorage.getItem('Pais');
    this.Empresa = localStorage.getItem('Empresa');
    const user = localStorage.getItem('currentUser');
    this.id = JSON.parse(window.atob(user.split('.')[1])).uid;

    this.nCantidadEnviar = 0
    //Data de la Fidelización
    let Obj = this.data;

    this.idFide = Obj.IdFide;
    this.Estado = Obj.Estado;
    this.sCodRQ = Obj.sCodRQ;
    this.nEstadoRQ = Obj.nEstadoRQ;

    this.fnListarUsuariosRQ();


  }


  onNoClick(): void {
    this.dialogRef.close();
  }



  //#region Obtener Usuarios del Requerimiento
  async fnListarUsuariosRQ() {

    let pParametro = [];
    pParametro.push(this.sCodRQ);

    await this.vSerFidelizacion.fnReclutamiento(24, pParametro, this.url).then((value: any) => {

      this.lListaUsuariosRQ = value;

      this.dataSource = new MatTableDataSource(this.lListaUsuariosRQ);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;

    }, error => {
      console.log(error);
    });

  }
  //#endregion

  //#region Abrir Enviar
  async openDialogEnviar() {
    this.lListaEnviar = [];

    if (this.lListaUsuariosRQ.length > 0) {
      for (let i = 0; i < this.lListaUsuariosRQ.length; i++) {
        if (this.lListaUsuariosRQ[i].bEnviar == 1 && this.lListaUsuariosRQ[i].sEnviado=='No') {
          this.lListaEnviar.push(
            {
              nIdFide: this.lListaUsuariosRQ[i].nIdFide,
              Enviado: this.lListaUsuariosRQ[i].sEnviado, //'No',
              sCodRQ: this.sCodRQ
            }
          );
        }

      }
    }

    if (this.lListaEnviar.length < 1) {
      return Swal.fire({
        icon: 'warning',
        title: '¡Verificar!',
        text: 'Falta elegir que fidelizaciones va a enviar a firmar'
      });;
    }

    const dialogRef = this.dialog.open(FidEnviarComponent, {
      width: '600px',
      data: this.lListaEnviar,
    });

    dialogRef.afterClosed().subscribe(result => {

      if (!result) {

        return;
      }
      if (result.data.length > 0) {
        
        this.fnListarUsuariosRQ();

      }

    });

  }
  //#endregion

  //#region Evento Cambiar estado
  async fnChangeEstadoEnviar(row, event) {

    let bEnviar;
    if (event.checked == true) {
      bEnviar = 1;
      this.nCantidadEnviar++
    }
    else {
      bEnviar = 0;
      this.nCantidadEnviar--
    }

    //Checkear Individual
    for (let i = 0; i < this.lListaUsuariosRQ.length; i++) {
      if (this.lListaUsuariosRQ[i].nIdFide == row.nIdFide) {
        this.lListaUsuariosRQ[i].bEnviar = bEnviar
      }
    }
    
    if(this.nCantidadEnviar<=0 || this.nEstadoRQ != 1612){
      this.bEstadoEnvio=false
    }
    else{
      this.bEstadoEnvio=true
    }

  }
  //#endregion

  //#region Descargar Enviar

  fnDescargarExcel() {

    let pParametro = [];
    pParametro.push(this.sCodRQ);
 
    this.vSerFidelizacion.fnDescargarExcelReporteFidelizacion(24, pParametro, this.url).subscribe(
      data => {
       
        if (data.size == 14) {
          Swal.fire('Atención', 'No se encontraron reportes', 'warning')
          this.spinner.hide()
          return
        }
        else {
          this.downloadFile(data)
        }
      }
    )
  }

  public downloadFile(response: any) {
    let name = 'Reporte Fidelizaciones Enviadas';
    var blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    saveAs(blob, name + '.xlsx')
    this.spinner.hide();
  }
  //#endregion


}
