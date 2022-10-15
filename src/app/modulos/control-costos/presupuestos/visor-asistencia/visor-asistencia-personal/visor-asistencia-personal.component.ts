import { DecimalPipe } from '@angular/common';
import { Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { PresupuestosService } from '../../presupuestos.service'
import { Router } from '@angular/router';
import { NgForm, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { NgxSpinnerService } from 'ngx-spinner';
//import { SergeneralService } from '../../../../servicio/sergeneral.service';

import Swal from 'sweetalert2';
import { StringMapWithRename } from '@angular/compiler/src/compiler_facade_interface';

import { ChangeDetectorRef, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { validateVerticalPosition } from '@angular/cdk/overlay';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CCS_Personal, CC_Sucursal } from '../model';

@Component({
  selector: 'app-visor-asistencia-personal',
  templateUrl: './visor-asistencia-personal.component.html',
  styleUrls: ['./visor-asistencia-personal.component.css']
})
export class VisorAsistenciaPersonalComponent implements OnInit {

  url: string; //variable de un solo valor
  idUser: number; //id del usuario
  pNom: string;    //Nombre Usr
  idEmp: string;  //id de la empresa del grupo Actual
  pPais: string;  //Codigo del Pais de la empresa Actual

  //Elementos para la tabla material
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  dataSource: MatTableDataSource<CCS_Personal>;
  displayedColumns = [
    'sDocumento', 'sDescripcion'
  ];

  lPersonal: CCS_Personal[] = [];

  vSucursalSeleccionada: CC_Sucursal;

  constructor(
    private spinner: NgxSpinnerService,
    private formBuilder: FormBuilder,
    private router: Router,
    private vPreService: PresupuestosService,
    private cdr: ChangeDetectorRef,

    @Inject('BASE_URL') baseUrl: string,

    public dialogRef: MatDialogRef<VisorAsistenciaPersonalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: CC_Sucursal
  ) { this.url = baseUrl; }

  ngOnInit(): void {
    this.vSucursalSeleccionada = this.data;
    this.fnListarPersonal(this.vSucursalSeleccionada.nIdCCS);
  }

  fnListarPersonal = function (nId: number) {

    var pEntidad = 3;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 1;       //Listar todos los registros de la tabla

    pParametro.push(nId);


    this.vPreService.fnVisorAsistencia(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
      res => {
        this.lPersonal = res;
        const personal = res; ///Array.from({length: res.length}, (_, k) => createNewCC(res[k],k)); 
        this.dataSource = new MatTableDataSource(personal);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      },
      err => {
        console.log(err);
      },
      () => {
      }
    );
  }

}
