import { ChangeDetectorRef, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';
import { CompraService } from '../compra.service';
import { OcDevolverFileComponent } from './oc-devolver-file/oc-devolver-file.component';

//Modelo de orden de compra
export interface OrdenCompra {
  nIdOC: number;
  sAnio: string;
  nIdCC: number;
  sCodCC: string;
  sDescCC: string;
  nOrd: number;
  sTitulo: string;
  sFechaOC: string;
  sFechaEntrega: string;
  nIdProveedor: number;
  sDescProveedor: string;
  nTotalUnidad: number;
  nTotal: number;
  sOrden: string;
  sEstado: string;
}

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null): boolean {
    return !!(control && control.invalid);
  }
}
@Component({
  selector: 'app-oc-devolver',
  templateUrl: './oc-devolver.component.html',
  styleUrls: ['./oc-devolver.component.css']
})
export class OcDevolverComponent implements OnInit {

  dataSource: MatTableDataSource<any>;

  vPrincipal: boolean = true;
  vSecundario: boolean = false;
  idGastoCosto: string;
  ///===================
  pEntidad = 1; //Cabecera del movimiento
  pOpcion = 2;  //CRUD -> Listar
  pParametro = []; //Parametros de campos vacios
  pTipo = 1;       //Listar Solo Guias de ingreso
  pDetalle = []//Parametros de campos vacios
  //========================


  vOrdenCompraSeleccionado: OrdenCompra;
  vOpcion: number;
  // Asigancion para Paginar y ordedar las columnas de mi tabla
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;


  displayedColumns = ['nIdOC', 'anio', 'centroCosto', 'sDocumento', 'Titulo', 'FechaRegistro',
    'FechaEntrega', 'Proveedor', 'cantidad', 'sTotal','sMoneda' ,'TipoDOC', 'Estado', 'sVB', 'sPDF'
  ];

  txtFiltroGen = new FormControl();

  url: string; //variable de un solo valor
  idUser: number; //id del usuario
  pNom: string;    //Nombre Usr
  idEmp: string;  //id de la empresa del grupo Actual
  pPais: string;  //Codigo del Pais de la empresa Actual
  sLista: any[] = []
  constructor(
    private spinner: NgxSpinnerService,
    private formBuilder: FormBuilder,
    private router: Router,
    private cdr: ChangeDetectorRef,
    public dialog: MatDialog,
    public vOrdenCompraService: CompraService,
    @Inject('BASE_URL') baseUrl: string,
    private route: Router
  ) { this.url = baseUrl; }

  ngOnInit(): void {

    let user = localStorage.getItem('currentUser'); //encriptacion del usuario
    this.idUser = JSON.parse(window.atob(user.split('.')[1])).uid;
    this.pNom = JSON.parse(window.atob(user.split('.')[1])).uno;
    this.idEmp = localStorage.getItem('Empresa');
    this.pPais = localStorage.getItem('Pais');

    this.fnListarConteniedo();
  }

  fnListarConteniedo() {
    this.spinner.show();
    this.pParametro = []

    this.pEntidad = 4;
    this.pOpcion = 2;
    this.pTipo = 1;
    this.pParametro.push(this.idEmp);

    this.vOrdenCompraService.fnDatosOrdenCompras(this.pEntidad, this.pOpcion, this.pParametro, this.pTipo, this.url).subscribe(
      res => {
        this.sLista = res
        let array = res.map(item => {
          return {
            nId: item['nId'],
            anio: item['anio'],
            centroCosto: item['centroCosto'],
            Titulo: item['titulo'],
            FechaRegistro: item['fechaRegistro'],
            FechaEntrega: item['fechaEntrega'],
            Proveedor: item['proveedor'],
            cantidad: item['cantidad'],
            TipoDOC: item['tipoDOC'],
            Estado: item['estado'],
            sNumeroDoc: item['sNumeroDoc'],
            sTotal: parseFloat(item['total']),
            sMoneda: item["sMoneda"],
            sDocumento: item['sDocumento'],
            sPDF: item['sPdf'],
            sVB: item['sVB'],
          }
        })

        this.dataSource = new MatTableDataSource(array);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
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

  async fnRechazar(idGastoCosto) {

    const confirma = await Swal.fire({
      title: '¿Desea Continuar?',
      text: 'Se rechazará la orden de compra',
      input: 'textarea',
      inputPlaceholder: "Escriba un mensaje con la razón del rechazo (opcional)",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar',
    });

    const { value: mensaje } = confirma;

    if (!confirma.isConfirmed) {
      return;
    }

    this.spinner.show();
    this.pParametro = []

    this.pEntidad = 4;
    this.pOpcion = 3;
    this.pTipo = 2;
    this.pParametro.push(idGastoCosto);
    this.pParametro.push(this.idUser);
    this.pParametro.push(this.pPais);
    this.pParametro.push(mensaje);


    this.vOrdenCompraService.fnDatosOrdenCompras(this.pEntidad, this.pOpcion, this.pParametro, this.pTipo, this.url).subscribe(
      res => {
        this.fnListarConteniedo();

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

  async fnDevolver(idGastoCosto) {

    const confirma = await Swal.fire({
      title: '¿Desea Continuar?',
      text: 'Se devolverá la orden de compra',
      input: 'textarea',
      inputPlaceholder: "Escriba un mensaje con la razón de la devolución (opcional)",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar',
    });

    const { value: mensaje } = confirma;

    if (!confirma.isConfirmed) {
      return;
    }

    this.spinner.show();
    this.pParametro = []

    this.pEntidad = 4;
    this.pOpcion = 3;
    this.pTipo = 1;
    this.pParametro.push(idGastoCosto);
    this.pParametro.push(this.idUser);
    this.pParametro.push(this.pPais);
    this.pParametro.push(mensaje);

    this.vOrdenCompraService.fnDatosOrdenCompras(this.pEntidad, this.pOpcion, this.pParametro, this.pTipo, this.url).subscribe(
      res => {
        this.fnListarConteniedo();
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

  fnVerDetalle(nId) {
    this.idGastoCosto = nId;
    this.vPrincipal = false;
    this.vSecundario = true;
    console.log(this.idGastoCosto);
    console.log(this.vPrincipal);
    console.log(this.vSecundario);
  }

  fnCerrarDetalle(event){
    this.idGastoCosto = '';
    this.vPrincipal = true;
    this.vSecundario = false;
    this.fnListarConteniedo();
    //console.log('entro en cerrar detalle');
  }

  fnArchivos(nId, row) {
    var Numero = row.sNumeroDoc
    this.dialog.open(OcDevolverFileComponent, {
      width: '80%',
      data: { nId, Numero }
    });
  }

  fnRedondear(num) {
    var pow = Math.pow(10, 2);
    return Math.round(num * pow) / pow;
  }

  fnFiltrar() {
    var filtro = "";

    if (this.txtFiltroGen.value == null) {
      return;
    }
    filtro = this.txtFiltroGen.value.trim(); // Remove whitespace
    filtro = filtro.toLowerCase(); // MatTableDataSource defaults to lowercase matches
    this.dataSource.filter = filtro;
  }
}
