import { ChangeDetectorRef, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { DatoBasicoService } from '../../datobasico.service';
import { Planilla } from '../../interfaces/matriz';
import { PlanillaPartidaDetalleComponent } from '../planilla-partida-detalle/planilla-partida-detalle.component';


export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null): boolean {
    return !!(control && control.invalid);
  }
}

@Component({
  selector: 'app-planilla-partida',
  templateUrl: './planilla-partida.component.html',
  styleUrls: ['./planilla-partida.component.css']
})
export class PlanillaPartidaComponent implements OnInit {

  url: string; //variable de un solo valor
  idUser: number; //id del usuario
  pNom: string;    //Nombre Usr
  idEmp: string;  //id de la empresa del grupo Actual
  pPais: string;  //Codigo del Pais de la empresa Actual

  pMostrar: number;
  //Elementos para la tabla material
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  dataSource: MatTableDataSource<Planilla>;
  displayedColumns = ['nId', 'sCodigo', 'sDescripcion', 'nCantidad'];
  lPlanilla: Planilla[] = [];
  vPlanillaSeleccionada: Planilla;

  @ViewChild(PlanillaPartidaDetalleComponent) planillaPartidaDetalleComp: PlanillaPartidaDetalleComponent;

  txtFiltro = new FormControl();

  matcher = new ErrorStateMatcher();

  constructor(
    private spinner: NgxSpinnerService,
    private formBuilder: FormBuilder,
    private router: Router,
    private vDatoBasicoService: DatoBasicoService,
    private cdr: ChangeDetectorRef,

    @Inject('BASE_URL') baseUrl: string
  ) {
    this.url = baseUrl;
    this.pMostrar = 0;
  }

  ngOnInit(): void {
    let user = localStorage.getItem('currentUser'); //encriptacion del usuario 
    this.idUser = JSON.parse(window.atob(user.split('.')[1])).uid;
    this.pNom = JSON.parse(window.atob(user.split('.')[1])).uno;
    this.idEmp = localStorage.getItem('Empresa');
    this.pPais = localStorage.getItem('Pais');

    this.fnListarPlanilla();
  }

  // ngOnChanges(changes: SimpleChanges){
  //   this.pMostrar= changes.pMostrar.currentValue;
  // }
  ngAfterContentChecked() {
    this.cdr.detectChanges();
  }

  fnListarPlanilla = function () {
    this.spinner.show();

    var pEntidad = 3;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 1;       //Listar todos los registros de la tabla

    pParametro.push(this.idEmp);

    this.vDatoBasicoService.fnDatoMatriz(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
      res => {
        this.lPlanilla = res;
        const planilla = res;
        this.dataSource = new MatTableDataSource(planilla);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      },
      err => {
        console.log(err);
      },
      () => {
        this.spinner.hide();
      }
    );
  }

  fnSeleccionarPlanilla(row: Planilla) {
    this.vPlanillaSeleccionada = row;
    this.pMostrar = 1;
  }

  fnFiltrar() {
    var filtro = "";

    if (this.txtFiltro.value == null) {
      return;
    }
    filtro = this.txtFiltro.value.trim(); // Remove whitespace
    filtro = filtro.toLowerCase(); // MatTableDataSource defaults to lowercase matches
    this.dataSource.filter = filtro;
  }

  fnOcultar(p: number){
    this.pMostrar=p;
  }

}
