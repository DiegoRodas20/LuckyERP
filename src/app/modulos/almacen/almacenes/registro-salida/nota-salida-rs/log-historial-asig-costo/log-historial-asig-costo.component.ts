import { ChangeDetectorRef, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { Ubicacion_Articulo } from '../../../registro-ingreso/models/registroIngreso.models';
import { RegistroTrasladoService } from '../../../registro-traslado/registro-traslado.service';
import { Historial_Costo_NS, input_ModalArt } from '../../models/listasSalida.model';
import { ArticuloSalidaComponent } from '../../registro-salida-detalle/articulo-salida/articulo-salida.component';
import { RegistroSalidaService } from '../../registro-salida.service';

@Component({
  selector: 'app-log-historial-asig-costo',
  templateUrl: './log-historial-asig-costo.component.html',
  styleUrls: ['./log-historial-asig-costo.component.css']
})
export class LogHistorialAsigCostoComponent implements OnInit {

  nIdOperMov: number;
  lHistorial: Historial_Costo_NS[] = [];

  url: string; //variable de un solo valor
  idUser: number; //id del usuario
  pNom: string;    //Nombre Usr
  idEmp: string;  //id de la empresa del grupo Actual
  pPais: string;  //Codigo del Pais de la empresa Actual

  //Elementos para la tabla material
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  dataSource: MatTableDataSource<Historial_Costo_NS>;
  displayedColumns = ['sUsuario', 'sFecha', 'nPrecio', 'sEstado'];

  constructor(
    private spinner: NgxSpinnerService,
    private formBuilder: FormBuilder,
    private router: Router,
    private vRegSalida: RegistroSalidaService,
    private vRegTraslado: RegistroTrasladoService,
    private cdr: ChangeDetectorRef,
    @Inject(MAT_DIALOG_DATA) private data: number,
    public dialogRef: MatDialogRef<ArticuloSalidaComponent>,
    public dialog: MatDialog,
    @Inject('BASE_URL') baseUrl: string
  ) { this.url = baseUrl; this.nIdOperMov = data; }


  ngOnInit(): void {
  }

  ngAfterViewInit() {
    setTimeout(() => {

      //Para que no haya error de ngAfterContentChecked
      this.fnListarHistorial();
    });
  }

  async fnListarHistorial() {
    this.spinner.show();

    var pEntidad = 4;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 6;

    pParametro.push(this.nIdOperMov);

    try {
      this.lHistorial = await this.vRegSalida.fnRegistroSalida(pEntidad, pOpcion, pParametro, pTipo, null, this.url).toPromise();
      this.dataSource = new MatTableDataSource(this.lHistorial);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      this.spinner.hide();
    } catch (error) {
      console.log(error);
      this.spinner.hide();
    }
  }
}
