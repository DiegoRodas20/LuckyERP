import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatExpansionPanel } from '@angular/material/expansion';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { NgxSpinnerService } from 'ngx-spinner';
import { timer } from 'rxjs';
import { take } from 'rxjs/operators';
import { SecurityErp } from 'src/app/modulos/AAHelpers';
import { asistenciapAnimations } from 'src/app/modulos/comercial/Asistencia/asistenciap/asistenciap.animations';
import Swal from 'sweetalert2';
import { ArticuloAsignacionActivoTableTIDTO, DetalleAsignacionActivoTableTIDTO, DetalleAsignacionActivoTIDTO, FotosRqActivo, PersonalAsignacionActivoTIDTO } from '../../api/models/activoAsignacionTITDO';
import { ArticuloRqActivoTIDTO } from '../../api/models/articuloDTO';
import { TipoElementoDto } from '../../api/models/tipoElementoDTO';
import { ActivoAsignacionService } from '../../api/services/activo-asignacion.service';
import { TiDialogRqAgregarActivoComponent } from '../ti-dialog-rq-agregar-activo/ti-dialog-rq-agregar-activo.component';

@Component({
  selector: 'app-ti-rq-asignacion-activo',
  templateUrl: './ti-rq-asignacion-activo.component.html',
  styleUrls: ['./ti-rq-asignacion-activo.component.css'],
  animations: [asistenciapAnimations],
})
export class TiRqAsignacionActivoComponent implements OnInit {

  // Variables auxiliares
  estaCargado: boolean = false; // Flag para ver cuando la pagina este completamente cargada

  //Botones
  tsLista = 'inactive';
  fbLista = [
    { icon: 'exit_to_app', tool: 'Salir', state: true, color: 'secondary' }
  ];
  abLista = [];
  mostrarBotones = true; // Booleano para controlar la vista de los botones si es que hay un dialog abierto

  storageData: SecurityErp;
  vPersonalSeleccionado: PersonalAsignacionActivoTIDTO;

  //Mat-table para Personal
  displayedColumnsPersonal: string[] = ['opcion', 'sNroDoc', 'sNombrePersonal', 'sCargo', 'sPresupuesto',
    'sArea', 'sNombreComercial', 'sCanal'];
  dataSourcePersonal: MatTableDataSource<PersonalAsignacionActivoTIDTO>;
  @ViewChild('paginatorPersonal', { static: true }) paginatorPersonal: MatPaginator;
  @ViewChild('sortPersonal', { static: true }) sortPersonal: MatSort;
  @ViewChild('matPersonal') matPersonal: MatExpansionPanel;
  txtFiltroPersonal = new FormControl();

  //Mat-table para Activos
  dataSourceActivo: MatTableDataSource<ArticuloAsignacionActivoTableTIDTO>;
  @ViewChild('paginatorActivo', { static: true }) paginatorActivo: MatPaginator;
  @ViewChild('sortActivo', { static: true }) sortActivo: MatSort;
  @ViewChild('matActivo') matActivo: MatExpansionPanel;
  displayedColumnsActivo: string[] = ['opcion', 'sRecurso', 'sPerfil', 'sActivo', 'sArticulo',
    'sAddenda', 'sAutorizaDcto'];
  txtFiltroActivo = new FormControl();


  @Output() asignacionAbierta = new EventEmitter<boolean>();
  @Input() lPersonal: PersonalAsignacionActivoTIDTO[] = [];
  @Input() lTipoActivo: TipoElementoDto[] = [];
  @Input() idAsignaActivo: number;

  constructor(
    public dialog: MatDialog,
    private _activoAsignacionService: ActivoAsignacionService,
    private spinner: NgxSpinnerService,
    private overlayContainer: OverlayContainer
  ) {
    this.overlayContainer.getContainerElement().classList.add("multiDialog");
  }

  ngOnDestroy() {
    this.overlayContainer.getContainerElement().classList.remove("multiDialog");
  }

  ngAfterViewInit() {
    setTimeout(() => {

      //Para que no haya error de ngAfterContentChecked
      this.matPersonal.open();

    });
  }

  ngOnInit(): void {
    this.storageData = new SecurityErp();

    this.onToggleFab(1, -1);
    this.estaCargado = true;
    this.dataSourcePersonal = new MatTableDataSource(this.lPersonal)
    this.dataSourcePersonal.sort = this.sortPersonal
    this.dataSourcePersonal.paginator = this.paginatorPersonal;
  }

  // Metodo para utilizar las funciones del menu de botones
  async clickFab(index: number) {
    switch (index) {
      case 0:
        this.fnSalir()
        break;
      default:
        break;
    }

  }

  // Metodo para abrir/cerrar menu de botones
  onToggleFab(fab: number, stat: number) {
    stat = (stat === -1) ? (this.abLista.length > 0) ? 0 : 1 : stat;
    this.tsLista = (stat === 0) ? 'inactive' : 'active';
    this.abLista = (stat === 0) ? [] : this.fbLista;
  }

  fnSalir() {
    this.asignacionAbierta.emit(false);
  }

  async fnVerActivos(row: PersonalAsignacionActivoTIDTO) {
    this.vPersonalSeleccionado = row;
    this.matPersonal.close();

    this.spinner.show();

    let response = await this._activoAsignacionService.GetActivosByPersonal(row.nIdPersonal, this.idAsignaActivo)
    this.dataSourceActivo = new MatTableDataSource(response.response.data);
    this.dataSourceActivo.paginator = this.paginatorActivo;
    this.dataSourceActivo.sort = this.sortActivo;
    this.fnFiltrarActivo();

    this.spinner.hide();

    this.matActivo.open();
  }

  fnFiltrarPersonal() {
    let filtro = '';

    if (this.txtFiltroPersonal.value == null) {
      return;
    }
    filtro = this.txtFiltroPersonal.value.trim();
    filtro = filtro.toLowerCase();
    this.dataSourcePersonal.filter = filtro;
  }

  fnFiltrarActivo() {
    let filtro = '';

    if (this.txtFiltroActivo.value == null) {
      return;
    }
    filtro = this.txtFiltroActivo.value.trim();
    filtro = filtro.toLowerCase();
    this.dataSourceActivo.filter = filtro;
  }

  fnAnadirActivo() {
    const dialog = this.dialog.open(TiDialogRqAgregarActivoComponent, {
      width: '850px',
      maxWidth: '90vw',
      data: {
        personal: this.vPersonalSeleccionado,
        idActivoAsigna: Number(this.idAsignaActivo),
        activo: null,
        lTipoActivo: this.lTipoActivo
      },
      disableClose: true
    }).afterClosed().subscribe(data => {
      this.fnVerActivos(this.vPersonalSeleccionado);
    })
  }

  fnVerDetalleActivo(row: ArticuloAsignacionActivoTableTIDTO) {
    const dialog = this.dialog.open(TiDialogRqAgregarActivoComponent, {
      width: '850px',
      maxWidth: '90vw',
      data: {
        personal: this.vPersonalSeleccionado,
        idActivoAsigna: Number(this.idAsignaActivo),
        activo: row
      },
      backdropClass: 'backdropBackground',
      disableClose: true
    }).afterClosed().subscribe(data => {
      this.fnVerActivos(this.vPersonalSeleccionado);
    })
  }

  async fnEliminarActivo(row: ArticuloAsignacionActivoTableTIDTO) {
    var resp = await Swal.fire({
      title: '¿Desea continuar?',
      text: `Se liberará el activo: ${row.sActivo} - ${row.sArticulo} ,del personal: ${this.vPersonalSeleccionado.sNombrePersonal}`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar',
    })

    if (!resp.isConfirmed) {
      return;
    }


    let model: DetalleAsignacionActivoTIDTO = {
      nIdDetActivoAsigna: row.nIdDetActivoAsigna,
      bEstado: false,
      detalleArchivo: [],
      nIdActivoAsigna: 0,
      nIdEnv: 0,
      nIdActivo: row.nIdActivo,
      nIdTicket: 0,
      nIdPersonal: 0,
      sObservacion: '',
      dFechaEntrega: null,
      nIdDescuento: 0,
      dFechaDevolucion: null,
      nIdUsrDevolucion: 0,
      dFecha: null,
      nIdUsuario: Number(this.storageData.getUsuarioId()),
      sIdPais: this.storageData.getPais(),
      nIdEmp: Number(this.storageData.getEmpresa()),
      nDescuento: 5
    }

    try {
      let result = await this._activoAsignacionService.UpdateDetalle(model);
      if (!result.success) {
        let mensaje = result.errors.map(item => {
          return item.message
        })
        Swal.fire({
          icon: 'warning',
          title: 'Advertencia',
          text: mensaje.join(', '),
        });
        return;
      }
      Swal.fire({
        icon: 'success',
        title: ('Correcto'),
        text: 'Se liberó el activo',
        showConfirmButton: false,
        timer: 1500
      });
      await this.fnVerActivos(this.vPersonalSeleccionado);
    }
    catch (err) {
      console.log(err);
    }

  }

}
