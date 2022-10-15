// import { Component, OnInit } from '@angular/core';

import { Component, OnInit, Inject, ViewChild, HostListener, ElementRef, Renderer2 } from '@angular/core';
import { PresupuestosService } from '../presupuestos.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { NgForm, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
//import { RegistroFacturaCrearComponent } from '../registroFacturaCrear/registroFacturaCrear.component';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { FacturaFileComponent } from './factura-file/factura-file.component';
import { DialogInformeGastoComponent } from './dialog-informe-gasto/dialog-informe-gasto.component';
import { asistenciapAnimations } from '../../../comercial/Asistencia/asistenciap/asistenciap.animations';
import { ControlCostoReporteComponent } from '../../centroCosto/reporte/control-costo-reporte/control-costo-reporte.component';


export interface Factura{
  nIdFactura: number;
}


@Component({
  selector: 'app-registroFactura',
  templateUrl: './registroFactura.component.html',
  styleUrls: ['./registroFactura.component.css'],
  animations: [asistenciapAnimations]
})
export class RegistroFacturaComponent implements OnInit {
  url: string; //variable de ruta un solo valor
  idUser :number; //id del usuario
  pNom:string;    //Nombre Usr
  idEmp: string;  //id de la empresa del grupo Actual
  pPais: string;  //Codigo del Pais de la empresa Actual

  pOpcion: number // variable para el cambio de pantalla

  //Carga de Archivo
  filestring: string;
  private vNameRutaFile: string;
  private vArchivoSeleccioado = File;
  lArchivosSoporte: any = [];

  //

  vPrincipal: boolean = true;
  vSecundario: boolean = false;
  formArhivo: FormGroup;
  searchKey: string
  listaData: any[] = []

  btnAdd: boolean = true;

  //Tabla material
  dsFacturas: MatTableDataSource<any>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  displayedColumns: string[] = ['nIdGastoCosto','sNumero', 'sTitulo', 'sNombreComercial', 'sNombreCompleto',
  'sFecha','sFactura','nTotal','sEstado']; //,'sMoneda'
  // ,'nTotalCC','nTotalPP'
  //***

  txtFiltro= new FormControl();
  vFactura: Factura;
  // Variables para las opciones
  tsLista = 'inactive';
  fbLista = [
    {icon: 'post_add', tool: 'Nueva Factura'},
    {icon: 'article', tool: 'Visualizar Informe Gasto'},
    // {icon: 'article', tool: 'Prueba Control Costo'},
  ];
  abLista = [];

  filtroEstado = new FormControl();

  // Tipo de perfil
  idPerfil: number = 0;


  constructor(
    private spinner: NgxSpinnerService,
    private vPresupuestosService: PresupuestosService,
    private formBuilder: FormBuilder,
    @Inject('BASE_URL') baseUrl: string,
    public dialog: MatDialog,
    private route:Router,
    private renderer: Renderer2){
      //Obtener Variables Generales del proyecto .
      let user    = localStorage.getItem('currentUser');
      this.idUser = JSON.parse(window.atob(user.split('.')[1])).uid;
      this.pNom   = JSON.parse(window.atob(user.split('.')[1])).uno;
      this.idEmp  = localStorage.getItem('Empresa');
      this.pPais  = localStorage.getItem('Pais');
      this.url = baseUrl;

      // Recuperamos el perfil
      this.fnRecuperarPerfil();
    }

  async ngOnInit(): Promise<void> {

    this.onToggleFab(1,-1);
    this.formArhivo = this.formBuilder.group({
      cboTipoArchivo: ['', Validators.required],
      fileUpload: ['', Validators.required]
    });
    this.filtroEstado.setValue("0");
    this.fnListarFacturas()

  }


  //******************************************************************************************************************** */
  //Zona de implementacion de funciones
  //******************************************************************************************************************** */

  fnListarFacturas = function(){
    this.spinner.show('spiDialog');
    let vFiltro: any  = '';
    var pParametro = []; //Parametros de campos vacios

    vFiltro = this.txtFiltro.value
    pParametro.push(this.idEmp);
    pParametro.push(this.idUser);
    pParametro.push(this.filtroEstado.value || 0);
    pParametro.push(this.pPais);

    this.vPresupuestosService.fnPresupuesto(1, 2, pParametro, 1, 0, this.url).subscribe(
        res => {
            this.dsFacturas = new MatTableDataSource(res);
            this.dsFacturas.paginator = this.paginator;
            this.dsFacturas.sort = this.sort;
        },
        err => {
            this.spinner.hide('spiDialog');
            console.log(err);
        },
        () => {
            this.spinner.hide('spiDialog');
        }
    );
  }

  fnNuevaFactura = function(){
    this.vSecundario = true;
    this.vOpcion = 2; //Añadir partida
    this.pOpcion = 2  // envia al hijo que se esta aplicando una nueva factura
    this.vFactura = 0;
    this.vPrincipal = false;
  }

  fnVerDetalle = function(vFactura){
    this.vPrincipal = false
    this.vSecundario = true;
    this.vFactura = vFactura
    this.pOpcion = 1; //Opcion ver detalle
  }

  fnSalir= function(){
    this.vSecundario = false;
    this.vPrincipal = true;
    this.fnListarFacturas();
  }

  eventTempF(resp){
    if(resp == 1){
      this.vSecundario = false;
      this.vPrincipal = true;
      this.fnListarFacturas();
    }
  }

  fnAbrirDialog(p: Factura) {
    const dialogRef = this.dialog.open(FacturaFileComponent, {
      width: '80%',
      data: p
    });
  }

  fnFiltrar(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dsFacturas.filter = filterValue.trim().toLowerCase();

    if (this.dsFacturas.paginator) {
      this.dsFacturas.paginator.firstPage();
    }
  }

  verInformeGasto(): void {
    const dialogRef = this.dialog.open(DialogInformeGastoComponent, {
      width: '90%',
      minHeight: '350px',
      autoFocus: false
    });
    let instance = dialogRef.componentInstance;
    instance.tipoPresupuesto =  1;
    dialogRef.afterClosed().subscribe(async result => {
      if(result) {

      }
    })
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

  onToggleFab(fab: number, stat: number) {

    stat = ( stat === -1 ) ? ( this.abLista.length > 0 ) ? 0 : 1 : stat;
    this.tsLista = ( stat === 0 ) ? 'inactive' : 'active';
    this.abLista = ( stat === 0 ) ? [] : this.fbLista;

  }

  clickFab(index: number) {
    switch (index) {
      case 0:
        this.fnNuevaFactura();
        break;
      case 1:
        this.verInformeGasto();
        break;
      case 2:
        this.verInformeControlCosto();
      default:
        break;
    }
  }

  // Recuperamos el tipo de perfil del usuario
  async fnRecuperarPerfil(){
    let pParametro = [];
    pParametro.push(this.idEmp);
    pParametro.push(this.idUser);
    this.idPerfil = await this.vPresupuestosService.fnPresupuesto2(1, 2, pParametro, 16, this.url);
    console.log(this.idPerfil);
    console.log(pParametro);
  }
}
