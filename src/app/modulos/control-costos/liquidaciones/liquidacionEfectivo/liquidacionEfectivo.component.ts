
import { LiquidacionesService } from '../liquidaciones.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { NgForm, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Router, RouterLinkWithHref } from '@angular/router';
import {MatAccordion} from '@angular/material/expansion';
import { Component, OnInit, Inject, ViewChild, Input, ElementRef, Output, EventEmitter } from '@angular/core';
import Swal from 'sweetalert2';
import { ActivatedRoute } from '@angular/router';
import { ControlCostoReporteComponent } from '../../centroCosto/reporte/control-costo-reporte/control-costo-reporte.component';

export interface Liquidacion {
  liquidacion: number;
  sucursal: number;
  gastoCosto: number;
  depositario: number;
}

export interface EntityBase {
  pId: number;
  sDescripcion:string;
  sParametro: string;
}

@Component({
  selector: 'app-liquidacionEfectivo',
  templateUrl: './liquidacionEfectivo.component.html',
  styleUrls: ['./liquidacionEfectivo.component.css']
})
export class LiquidacionEfectivoComponent implements OnInit {
  url: string;
  idUser :number; //id del usuario
  pNom:string;    //Nombre Usr
  idEmp: string;  //id de la empresa del grupo Actual
  pPais: string;  //Codigo del Pais de la empresa Actual
  sEmpresa: string; //Nombre de la Empresa

  nEstado: number = 0; //Estado de la Liquidacion
  //Tabla material
  dataSource: MatTableDataSource<any>;
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  displayedColumns: string[] = ['nIdGastoCosto', 'sSucursal', 'sNombreCompletoDepositario',  'sCentroCosto', 'sNumero', // 'sDocDepositario', 'sBanco','sMoneda',
    'nTotal', 'nDebe', 'sEstadoRq'];

  vLiquidacion: Liquidacion;
  datosDepositario = null;

  panelOpenState = false;
  @ViewChild(MatAccordion) accordion: MatAccordion;


  txtFiltro  = new FormControl;
  nIdSucursal: number = 0
  nIdCentroCosto: number = 0
  nIdDepositario: number = 0

  Panel1: boolean = true;
  Panel2: boolean = false;
  Panel3: boolean = false;

  vSecundario: boolean = false;
  step = 0;

  //Busqueda
  lcboSucursal = []
  lCboCentroCosto = []
  lcboDepositario = []
  lAnio = []
  lSolicitudes = []

  buscarForm: FormGroup;
  liquidacionForm: FormGroup;

  constructor(
    private spinner: NgxSpinnerService,
    private vLiquidacionesService: LiquidacionesService,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    public dialog: MatDialog,
  @Inject('BASE_URL') baseUrl: string,)
  { this.url = baseUrl;}

  ngOnInit(): void {
    let user    = localStorage.getItem('currentUser');
    this.idUser = JSON.parse(window.atob(user.split('.')[1])).uid;
    this.pNom   = JSON.parse(window.atob(user.split('.')[1])).uno;
    this.idEmp  = localStorage.getItem('Empresa');
    this.pPais  = localStorage.getItem('Pais');
    //this.sEmpresa = "Lucky S.A.C.";
    //debugger
    var lista = [];
    lista = JSON.parse(localStorage.ListaEmpresa)
    for (let index = 0; index < lista.length; index++) {
      if(lista[index].nIdEmp== this.idEmp)
      {
        this.sEmpresa = lista[index].sDespEmp;
      }
    }

    this.buscarForm = this.formBuilder.group({
      txtSucursal: [''],
      txtCentroCosto: [''],
      txtDepositario: [''],
      cboAnio: [''],
    })

    this.fnListaSucursal();
    this.fnCargarAnio();
    var fecha = new Date();
    var num = fecha.getFullYear();
    // console.log(num);
    this.buscarForm.controls.cboAnio.setValue(num);
  }

  fnCargarAnio = function(){
    this.lAnio = [{nId: 2020, sDescripcion: '2020'},
                  {nId: 2021, sDescripcion: '2021'}];


  }

  setStep(index: number) {
    this.step = index;
  }

  nextStep(vTipo, oLiq: any) {
    this.vSecundario = false;

    if(vTipo == 1)
    {
      this.fnListarSolicitud();
      this.step = 1;
    }
    if(vTipo == 2)
    {
      this.vLiquidacion = {liquidacion: oLiq.nIdLiquidaEfectivo, gastoCosto: oLiq.nIdGastoCosto, sucursal: oLiq.nIdSucursal,  depositario: oLiq.nIdDepositario};
      this.vSecundario = true;
      this.datosDepositario = {nombreDepositario: oLiq.sNombreCompletoDepositario, documentoDepositario: oLiq.sCentroCosto + ' ' + oLiq.sNumero};
      this.step = 2;
    }
  }

  fnLimpiarPanelLiq = function(){

    this.vSecundario = false;
    this.datosDepositario = null;
  }

  fnListarSolicitud = function(){
    //debugger;
    var pParametro = []; //Parametros de campos vacios
    var pParametrodet = []

    let vDatosBusca = this.buscarForm.value;
    let vAnio = this.buscarForm.controls.cboAnio.value; //this.cboAnio.value;
    let sSucursal: string = '';
    // debugger;

    //Descripcion de la ciudad
    for (let index = 0; index < this.lcboSucursal.length; index++) {
      if(vDatosBusca.txtSucursal==this.lcboSucursal[index].nId)
      {
        sSucursal = this.lcboSucursal[index].sDescripcion;
      }
    }

    pParametro.push(this.idEmp);
    pParametro.push(sSucursal);
    pParametro.push(vDatosBusca.txtCentroCosto);
    pParametro.push(vDatosBusca.txtDepositario);
    pParametro.push(vAnio);
    pParametro.push(this.nEstado);

    //console.log(pParametro)
    this.spinner.show()
    this.vLiquidacionesService.fnLiquidaEfectivo(1, 2, pParametro, 1, 0, pParametrodet, this.url).subscribe(
        res => {
            this.lSolicitudes = res;
            //console.log(this.lSolicitudes);
            this.dataSource = new MatTableDataSource(res);
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;

            //Si tenemos valor filtrado palicamos el filtro actual
            const filterValue = this.txtFiltro.value == null? "" : this.txtFiltro.value;
            if(filterValue != "")
            {
              this.dataSource.filter = filterValue.trim().toLowerCase();
            }

            this.spinner.hide()
        },
        err => {
            this.spinner.hide();
            console.log(err);
        },
        () => {
            this.spinner.hide();
        }
    );

  }

  fnFiltrar(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
     // this.dataSource.paginator.firstPage();
    }
  }

  fnEstadoFiltro = function(vNumer: number){
    this.nEstado = vNumer ;
  }

  fnDescargarExcel(){
    if ( this.lSolicitudes.length > 0 ) {
      Swal.fire({
        title: '¿Desea descargar en Excel?',
        text: "",
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        cancelButtonText: 'Cancelar',
        confirmButtonText: 'Descargar'
      }).then(async (result) => {
        if(result.isConfirmed) {
          //console.log(this.lSolicitudes);
          // debugger;
          this.spinner.show();
          const response = await this.vLiquidacionesService.fnDescargarExcelLiquidacion(this.lSolicitudes, this.url, this.sEmpresa)
          if(response){
            // Descargar el Excel
            const data = response;
            const fileName = `Reporte Liquidaciones.xlsx`;
            if (window.navigator && window.navigator.msSaveOrOpenBlob) {
              window.navigator.msSaveOrOpenBlob(data, fileName);
              return;
            }
            const objectUrl = window.URL.createObjectURL(data);
            var link = document.createElement('a');
            link.href = objectUrl;
            link.download = fileName;
            // Trigger de descarga
            link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));

            Swal.fire({
              title: 'El Excel ha sido generado',
              html: `Si su descarga no ha comenzado, puede descargarlo <a href='${objectUrl}' download="${fileName}">aquí</a>`,
              icon: 'success',
              showCloseButton: true
            })
          }
          else{
            Swal.fire('¡Verificar!', 'No se encontraron registros', 'warning')
          }
          this.spinner.hide();
        }
      });
    } else {
      Swal.fire('¡Verificar!', 'No se encontraron registros', 'warning')
    }
  }

  fnListaSucursal = function(){
    let pParametro =[];
    let pParametrodet =[];
    pParametro.push(this.pPais);

    //console.log(pParametro)
    this.spinner.show()
    this.vLiquidacionesService.fnLiquidaEfectivo(1, 2, pParametro, 12, 0, pParametrodet, this.url).subscribe(
        res => {
            this.lcboSucursal = res;
            //console.log(this.lcboSucursal)
        },
        err => {
            this.spinner.hide();
            console.log(err);
        },
        () => {
            this.spinner.hide();
        }
    );


  }

  verInformeControlCosto(): void {
    const dialogRef = this.dialog.open(ControlCostoReporteComponent, {
      width: '90%',
      minHeight: '350px',
      data: {

      }
    });
    dialogRef.afterClosed().subscribe(async result => {
      if(result) {

      }
    })
  }
}
