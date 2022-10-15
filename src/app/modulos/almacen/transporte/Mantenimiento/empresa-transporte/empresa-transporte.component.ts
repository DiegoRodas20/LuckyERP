import { ChangeDetectorRef, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { TransporteService } from '../../transporte.service';
import { EmpresaTransporte } from '../models/EmpresaTransporte.model';

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null): boolean {
    return !!(control && control.invalid);
  }
}
@Component({
  selector: 'app-empresa-transporte',
  templateUrl: './empresa-transporte.component.html',
  styleUrls: ['./empresa-transporte.component.css']
})
export class EmpresaTransporteComponent implements OnInit {

  lEmpresaTransporte: EmpresaTransporte[] = [];

  url: string; //variable de un solo valor
  idUser: number; //id del usuario
  pNom: string;    //Nombre Usr
  idEmp: string;  //id de la empresa del grupo Actual
  pPais: string;  //Codigo del Pais de la empresa Actual

  //Elementos para la tabla material
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  dataSource: MatTableDataSource<EmpresaTransporte>;
  displayedColumns = ['nId', 'sRUC', 'sRazonSocial', 'sNombreComercial', 'nVehiculo', 'nChofer', 'sEstado'];

  pMostrar: number;
  pEmpresa: EmpresaTransporte;
  isNew: boolean = false;
  isVehiculo: boolean;

  txtFiltro = new FormControl();

  constructor(
    private spinner: NgxSpinnerService,
    private formBuilder: FormBuilder,
    private router: Router,
    private vTransporteService: TransporteService,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    @Inject('BASE_URL') baseUrl: string
  ) {
    let user = localStorage.getItem('currentUser'); //encriptacion del usuario 
    this.idUser = JSON.parse(window.atob(user.split('.')[1])).uid;
    this.pNom = JSON.parse(window.atob(user.split('.')[1])).uno;
    this.idEmp = localStorage.getItem('Empresa');
    this.pPais = localStorage.getItem('Pais');
    this.url = baseUrl; this.pMostrar = 0;
  }

  ngOnInit(): void {
    const vIdEmpTrans = this.route.snapshot.paramMap.get('nIdEmpTrans');
    this.isVehiculo = JSON.parse(this.route.snapshot.paramMap.get('isVehiculo'));
    if (vIdEmpTrans) {
      this.spinner.show();
      let pParametro = []; //Parametros de campos vacios
      pParametro.push(this.pPais);
      pParametro.push(vIdEmpTrans);
      this.vTransporteService.fnEmpresaTransporte(2, 2, pParametro, 1, this.url).subscribe(res => {
        this.spinner.hide();
        const item = res ? res[0] as EmpresaTransporte : null;
        this.isNew = true;
        this.fnSeleccionarEmpresa(item);
      })
    } else {
      this.fnListarEmpTransporte();
    }
  }

  async fnListarEmpTransporte(): Promise<void> {
    this.spinner.show();

    var pEntidad = 2;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 1;       //Listar todos los registros de la tabla
    pParametro.push(this.pPais);

    try {
      const empTransporte = await this.vTransporteService.fnEmpresaTransporte(pEntidad, pOpcion, pParametro, pTipo, this.url).toPromise()

      this.lEmpresaTransporte = empTransporte;
      this.dataSource = new MatTableDataSource(this.lEmpresaTransporte);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      this.fnFiltrar();

      this.spinner.hide();
    } catch (error) {
      console.log(error);
      this.spinner.hide();
    }
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

  fnAgregarEmpresa() {
    this.pMostrar = 1
    this.pEmpresa = null;
  }

  fnSeleccionarEmpresa(row: EmpresaTransporte) {
    this.pMostrar = 1
    this.pEmpresa = row;
  }

  fnOcultar(p: number) {
    this.pMostrar = p;
    this.fnListarEmpTransporte();
  }
}
