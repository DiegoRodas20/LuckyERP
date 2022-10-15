import { Component, Inject, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatDialog, MatDialogConfig } from "@angular/material/dialog";
import { NgxSpinnerService } from "ngx-spinner";
import Swal from "sweetalert2";
import { ComeReportesService } from "./../../come-reportes.service";
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { comercialAnimations } from '../../../Animations/comercial.animations';
@Component({
  selector: 'app-facturacion',
  templateUrl: './facturacion.component.html',
  styleUrls: ['./facturacion.component.css'],
  animations: [comercialAnimations],
})
export class FacturacionComponent implements OnInit {
  //Declaracion de variables
  url: string
  nIdUsuario: number
  sNombreUsuario: string
  nIdEmpresa: string
  sPais: string
  dFechaActual = new Date()
  nAnioActual: number
  nCodPer: number
  nIdNivel: number
  sMensajeError: string
  lListaReporte = []
  bMostrar: boolean = false;
  formFacturacion: FormGroup;
  //#region Botones Flotantes
  // Inicia la lista visible  
  tsLista = 'active';
  //Lista Principal
  abLista = [];
  // Lista de las opciones que se mostrarán
  fbLista = [
    { icon: 'search', tool: 'Ver Reporte' },
    { icon: 'cloud_download', tool: 'Descargar Excel' }
  ]
  //#endregion
  //Elementos para la tabla material
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  dataSource: MatTableDataSource<Tabla_Facturacion>;
  displayedColumns = ['sNombreEmpresa', 'nIdCentroCosto', 'sCodCentroCosto', 'sNombrePresupuesto', 'sRucCliente', 'sNombreCliente',
    'sNombreServicio', 'sNombreMarca', 'sFechaInicio', 'sFechaFin', 'sDirectorComercial', 'sDirectorCuentas', 'sGerente', 'sNombreEjecutivo',
    'sEstadoPresupuesto', 'sAprobCentroCosto', 'sUsuarioCreador', 'sFechaCreacion', 'nTotalPresupuesto',
    'Fact_Ind', 'Fact_Tipo', 'Fact_Por', 'Fact_Fecha', 'Fact_UltFactura'
  ];
  constructor(
    private formBuilder: FormBuilder,
    private spinner: NgxSpinnerService,
    private dialog: MatDialog,
    private comercialReportesService: ComeReportesService,
    @Inject('BASE_URL') baseUrl: string
  ) {
    this.url = baseUrl
  }
  ngOnInit(): void {
    //Datos del Usuario
    let user = localStorage.getItem('currentUser');
    this.nIdUsuario = JSON.parse(window.atob(user.split('.')[1])).uid;
    this.sNombreUsuario = JSON.parse(window.atob(user.split('.')[1])).uno;
    this.nIdEmpresa = localStorage.getItem('Empresa');
    this.sPais = localStorage.getItem('Pais');
    this.sMensajeError = ""
    //Abrir Botonera
    this.onToggleFab(1, -1);
    this.nAnioActual = this.dFechaActual.getFullYear();
    this.formFacturacion = this.formBuilder.group({
      nEjercicio: [this.nAnioActual, [Validators.required]],
      rbPresupuestos: '',
    })
    this.fnDatosUsuario();
  }
  //Botones Flotantes
  onToggleFab(fab: number, stat: number) {
    stat = (stat === -1) ? (this.abLista.length > 0) ? 0 : 1 : stat;
    this.tsLista = (stat === 0) ? 'inactive' : 'active';
    this.abLista = (stat === 0) ? [] : this.fbLista;
  }
  clickFab(index: number) {
    switch (index) {
      case 0:
        this.fnBuscarReporte()
        break
      case 1:
        this.fnDescargarReporte()
        break
      default:
        break
    }
  }
  async fnValidarFormulario() {
    let bValidacion;
    if (this.formFacturacion.get("rbPresupuestos").value == '') {
      Swal.fire({
        icon: 'warning',
        title: 'Seleccione un tipo de Presupuesto.',
        timer: 4000
      });
      bValidacion = false
    }
    else if (this.sMensajeError != '') {
      Swal.fire({
        icon: 'warning',
        title: this.sMensajeError
      });
      bValidacion = false
    }
    else {
      bValidacion = true;
    }
    return bValidacion;
  }
  async fnDatosUsuario() {
    let pParametro = [];
    pParametro.push(this.nIdEmpresa)
    pParametro.push(this.nIdUsuario);
    await this.comercialReportesService.fnReportesComercial(1, pParametro, this.url)
      .then((data: any = []) => {
        console.log(data)
        if (data.length > 0) {
          this.nIdNivel = data[0].nIdNivel
          this.nCodPer = data[0].nCodPer
        }
        else {
          this.sMensajeError = 'Usted no está autorizado para ver los reportes.'
        }
      }, error => {
        console.log(error);
      });
  }
  //#region Descargar Reporte
  async fnDescargarReporte() {
    if (await this.fnValidarFormulario() != false) {
      var nEjercicio = this.formFacturacion.get("nEjercicio").value;
      let pParametro = [];
      pParametro.push(this.nIdUsuario);
      pParametro.push(this.nIdEmpresa);
      pParametro.push(this.nCodPer);
      pParametro.push(nEjercicio);
      this.comercialReportesService.fnDescargarReporteExcel(2, pParametro, this.url).subscribe(
        data => {
          //console.log(data)

          if (data.size == 14) {
            Swal.fire('Atención', 'No se encontraron reportes', 'warning')
            return
          }
          else {
            this.downloadFile(data);
          }
        }
      )
    }
  }
  public downloadFile(response: any) {
    let name = 'Reportes Comerciales - Facturacion';
    var blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    saveAs(blob, name + '.xlsx')
    this.spinner.hide();
  }
  //#endregion
  async fnBuscarReporte() {
    this.fnValidarFormulario();
    var nEjercicio = this.formFacturacion.get("nEjercicio").value;
    let pParametro = [];
    pParametro.push(this.nIdUsuario);
    pParametro.push(this.nIdEmpresa);
    pParametro.push(this.nCodPer);
    pParametro.push(nEjercicio);
    await this.comercialReportesService.fnReportesComercial(2, pParametro, this.url).then((value: any) => {
      this.lListaReporte = value;

      console.log(value)

      if (value.length > 0) {
        this.bMostrar = true
        this.dataSource = new MatTableDataSource(value);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      }
      else {
        this.bMostrar = false
      }


    }, error => {
      console.log(error);
    });
  }
}


export interface Tabla_Facturacion {
  //Para la mat Table
  sNombreEmpresa     :string
  nIdCentroCosto     :string
  sCodCentroCosto    :string
  sNombrePresupuesto :string
  sRucCliente        :string
  sNombreCliente     :string
  sNombreServicio    :string
  sNombreMarca       :string
  sFechaInicio       :string
  sFechaFin          :string
  sNombreEjecutivo   :string
  sEstadoPresupuesto :string
  sAprobCentroCosto  :string
  sUsuarioCreador    :string
  sFechaCreacion     :string
  Fact_Ind           :string
  Fact_Por           :string
  Fact_Tipo          :string
  Fact_Fecha         :string
  Fact_UltFactura    :string
  nTotalPresupuesto  :string
  
}
