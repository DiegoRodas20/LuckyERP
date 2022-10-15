import { ChangeDetectorRef, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { asistenciapAnimations } from 'src/app/modulos/comercial/Asistencia/asistenciap/asistenciap.animations';
import { CentroCostoService } from '../centroCosto.service';
import { CentroCosto, Moneda, TiposCC } from '../Models/centroCostos/ICentroCosto';
import { CentroCostoCrearComponent } from './centroCostoCrear/centroCostoCrear.component';

// Importante para las validaciones
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null): boolean {
    return !!(control && control.invalid);
  }
}
@Component({
  selector: 'app-centroCostos',
  templateUrl: './centroCostos.component.html',
  styleUrls: ['./centroCostos.component.css'],
  animations: [asistenciapAnimations]
})
export class CentroCostosComponent implements OnInit {

  dataSource: MatTableDataSource<CentroCosto>;


  vPrincipal: boolean = true;
  vSecundario: boolean = false;


  vCentroCostoSeleccionado: CentroCosto;
  vOpcion: number;
  // Asigancion para Paginar y ordedar las columnas de mi tabla 
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;

  @ViewChild(CentroCostoCrearComponent) centrocostocrearComp: CentroCostoCrearComponent;


  displayedColumns = ['nIdCC', 'sCodCC', 'sDescCC', 'sDescDireccion', 'sDescArea', 'sDescCargo',
    'sSubCargo'
  ];

  url: string; //variable de un solo valor
  idUser: number; //id del usuario
  pNom: string;    //Nombre Usr
  idEmp: string;  //id de la empresa del grupo Actual
  pPais: string;  //Codigo del Pais de la empresa Actual

  //controles libres
  txtFiltroGen = new FormControl();

  //Listas de datos
  lCentroCostos: CentroCosto[];
  lMonedas: Moneda[];
  lTiposCC: TiposCC[];


  tsLista = 'active';
  nListaLength = 0;

  constructor(
    private spinner: NgxSpinnerService,
    private formBuilder: FormBuilder,
    private router: Router,
    private vCentroCostoService: CentroCostoService,
    private cdr: ChangeDetectorRef,

    @Inject('BASE_URL') baseUrl: string
  ) { this.url = baseUrl; }

  ngOnInit(): void {

    let user = localStorage.getItem('currentUser'); //encriptacion del usuario 
    this.idUser = JSON.parse(window.atob(user.split('.')[1])).uid;
    this.pNom = JSON.parse(window.atob(user.split('.')[1])).uno;
    this.idEmp = localStorage.getItem('Empresa');
    this.pPais = localStorage.getItem('Pais');

    this.onToggleFab(1, -1)

    this.fnListarCC();
  }

  ngAfterContentChecked() {
    this.cdr.detectChanges();
  }


  fnListarCC = function () {
    this.spinner.show();
    let vFiltro = this.txtFiltroGen.value;

    var pEntidad = 6; //Cabecera del tarfario
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 1;       //Listar todos los registros de la tabla

    pParametro.push(vFiltro);
    pParametro.push(this.idEmp);

    this.vCentroCostoService.fnCentroCosto(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
      res => {
        this.lCentroCostos = res;
        const centroCostos = res; ///Array.from({length: res.length}, (_, k) => createNewCC(res[k],k)); 
        this.dataSource = new MatTableDataSource(centroCostos);
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

  fnVerDetalle(row) {
    this.vSecundario = true;
    this.vCentroCostoSeleccionado = row;
    this.vOpcion = 1; //Opcion ver detalle
    this.vPrincipal = false;
    if (this.tsLista != 'active') {
      this.onToggleFab(1, -1)
    }
  }

  fnCrearCC() {
    this.vSecundario = true;
    this.vOpcion = 2; //Añadir CC
    this.vPrincipal = false;
    if (this.tsLista != 'active') {
      this.onToggleFab(1, -1)
    }
  }

  fnSalir() {
    this.vSecundario = false;
    this.vPrincipal = true;
    this.fnListarCC();
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

  onToggleFab(fab: number, stat: number) {

    stat = (stat === -1) ? (this.nListaLength > 0) ? 0 : 1 : stat;
    this.tsLista = (stat === 0) ? 'inactive' : 'active';
    this.nListaLength = (stat === 0) ? 0 : 4;

  }

}
