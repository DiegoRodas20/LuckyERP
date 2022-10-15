import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatExpansionPanel } from '@angular/material/expansion';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { SecurityErp } from 'src/app/modulos/AAHelpers';
import Swal from 'sweetalert2';
import { DetalleGastoTicketDTO, PptoPartidaSolicitud, SolicitudTicketDTO, TicketUsuarioDTO } from '../../api/models/activoAsignadoPersonalDTO';
import { ActivoAsignadoPersonalService } from '../../api/services/activo-asignado-personal.service';
import { TicketService } from '../../api/services/ticket.service';
import { TiTicketDetalleComponent } from '../../ti-ticket/ti-ticket-detalle/ti-ticket-detalle.component';
import { TiDialogTicketSolicitudComponent } from '../ti-dialog-activos-asignados-personal/ti-dialog-ticket-solicitud/ti-dialog-ticket-solicitud.component';

@Component({
  selector: 'app-ti-dialog-ticket-usuario',
  templateUrl: './ti-dialog-ticket-usuario.component.html',
  styleUrls: ['./ti-dialog-ticket-usuario.component.css']
})
export class TiDialogTicketUsuarioComponent implements OnInit {


  readonly opciones: { nNumero: number, sDescripcion: string }[] =
    [
      { nNumero: 0, sDescripcion: 'Todos' },
      { nNumero: 2599, sDescripcion: 'Pendiente' },
      { nNumero: 2600, sDescripcion: 'En proceso' },
      { nNumero: 2602, sDescripcion: 'Atendido' },
    ];


  readonly REPOSICION = 2686;

  //Mat-table para Tickets
  dataSourceTicket: MatTableDataSource<TicketUsuarioDTO>;
  @ViewChild('paginatorTicket', { static: true }) paginatorTicket: MatPaginator;
  @ViewChild('sortTicket', { static: true }) sortTicket: MatSort;
  displayedColumnsTicket: string[] = ['opcion', 'sSolicitante', 'sTicket', 'sTipoTicket', 'sArticulo', 'bReposicion', 'dFechaCrea',
    'sEstado'];
  txtFiltroTicket = new FormControl();

  // Flags
  bExisteTicketSinRevisar: boolean = false;

  storageData: SecurityErp;

  rbEstado = new FormControl();
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: {
      idPersonal: number
    },
    public dialogRef: MatDialogRef<TiDialogTicketUsuarioComponent>,
    public dialog: MatDialog,
    private _activoAsignadoPersonalService: ActivoAsignadoPersonalService,
    private _ticketService: TicketService,
    private spinner: NgxSpinnerService,
  ) { }

  ngOnInit(): void {
    this.storageData = new SecurityErp();
  }

  async ngAfterViewInit() {
    setTimeout(async () => {

      this.rbEstado.setValue(2599);
      //Para que no haya error de ngAfterContentChecked
      await this.GetTicketSolicitados(2599)

    });
  }

  async GetTicketSolicitados(nIdEstado: number) {
    this.spinner.show();
    let response = await this._activoAsignadoPersonalService.GetTicketSolicitados(
      Number(this.storageData.getUsuarioId()),
      nIdEstado
    )
    this.spinner.hide();

    // Verificar si hay tickets que el usuario no ha revisado
    this.bExisteTicketSinRevisar = false;
    response.response.data.map(ticket => !ticket.bRevisadoTI ? this.bExisteTicketSinRevisar = true : null);

    this.dataSourceTicket = new MatTableDataSource(response.response.data);
    this.dataSourceTicket.paginator = this.paginatorTicket;
    this.dataSourceTicket.sort = this.sortTicket;
    this.fnFiltrarTicket();
  }

  async fnVerDetalle(row: TicketUsuarioDTO) {
    
    this.spinner.show();

    const result = await this._ticketService.UpdateTicketRevisado(row.nIdTicket);

    if(result.success){
      const dialogRef = this.dialog.open(TiTicketDetalleComponent, {
        width: '1250px',
        autoFocus: false,
        data: {
          nIdTicket: row.nIdTicket
        }
      });
  
      dialogRef.beforeClosed().subscribe(async result => {
        await this.GetTicketSolicitados(this.rbEstado.value);
      });
    }
  }

  async fnSolicitar(row: TicketUsuarioDTO) {
    this.spinner.show();
    let resultValidacion = await this._activoAsignadoPersonalService.ValidacionTicket(row.nIdActivo ?? 0, row.nIdSolicitante, row.nIdArticulo);
    let validacion = resultValidacion.response.data
    this.spinner.hide();

    if (validacion[0] != '') {
      Swal.fire({
        icon: 'warning',
        title: 'Advertencia',
        text: validacion[0],
      });
      return;
    }
    const { value: observacion, isConfirmed } = await Swal.fire({
      title: 'Observación de la Solicitud',
      text: 'Ingrese la observación',
      input: 'textarea',
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Continuar',
      inputValidator: (value) => {
        if (value.length >= 100) {
          return 'La observación solo puede tener 100 caractéres como máximo.';
        }
      }
    })

    if (!isConfirmed) {
      return;
    }

    let nEsCuenta = 0;
    let listaDetalle: DetalleGastoTicketDTO[] = []

    const { isConfirmed: personal, isDenied: cuenta } = await Swal.fire({
      title: '¿De donde se va a sacar el descuento?',
      showCancelButton: true,
      showDenyButton: true,
      showConfirmButton: true,
      cancelButtonText: 'Cancelar',
      denyButtonText: 'Descontar cuenta',
      confirmButtonText: 'Descontar personal',
      confirmButtonColor: '#3085d6',
      denyButtonColor: '#29E74E',
      cancelButtonColor: '#d33',
    })


    //Si es cuenta abrimos un dialog para que seleccione datos
    if (cuenta) {
      nEsCuenta = 1
      let dialogData: PptoPartidaSolicitud[] = await this.dialog.open(TiDialogTicketSolicitudComponent, {
        data: {
          idPersonal: row.nIdSolicitante,
          idArticulo: row.nIdArticulo,
          precioPenalizacion: row.nMonto,
          idSucursal: row.nIdSucursal
        },
        disableClose: true,
        width: '850px',
        maxWidth: '90vw',
      }).afterClosed().toPromise();

      if (!dialogData) {
        return;
      }

      listaDetalle = dialogData.map(item => {
        return {
          nIdGastoCosto: 0,
          nIdSucursal: row.nIdSucursal,
          nIdPartida: item.nIdPartida,
          nCantidad: 1,
          nPrecio: item.nMonto,
          nIdArticulo: row.nIdArticulo,
          nIdCargo: row.nIdCargo,
          nIdDepositario: row.nIdSolicitante,
          nIdCentroCosto: item.nIdPresupuesto
        }
      })

    } else if (personal) {
      nEsCuenta = 0
    } else {
      return;
    }


    let model: SolicitudTicketDTO = {
      nIdTicket: 0,
      nIdTipoTicket: this.REPOSICION,
      nIdSolicitante: this.data.idPersonal,
      nIdArticulo: row.nIdArticulo,
      nIdAsignado: row.nIdSolicitante,
      nIdEmpAsignado: row.nIdEmpPersonal,
      sObservacion: observacion as string,
      nIdUsuarioCrea: Number(this.storageData.getUsuarioId()),
      sIdPais: this.storageData.getPais(),
      nIdActivo: null,
      nEsCuenta: nEsCuenta,
      sAnio: moment().year().toString(),
      nMes: moment().month() + 1,
      nIdEmpresa: Number(this.storageData.getEmpresa()),
      detalle: listaDetalle,
      nIdDetActivoAsigna: row.nIdDetActivoAsigna,
      nMonto: row.nMonto //Monto para reponer
    }

    try {
      this.spinner.show();
      let result = await this._activoAsignadoPersonalService.InsertTicket(model);
      this.spinner.hide();

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
      await Swal.fire({
        icon: 'success',
        title: ('Correcto'),
        text: 'Se creo la solicitud de ticket.',
        showConfirmButton: false,
        timer: 1500
      });

      await this.GetTicketSolicitados(this.rbEstado.value)
    }
    catch (err) {
      console.log(err);
    }
  }

  fnFiltrarTicket() {
    let filtro = '';

    if (this.txtFiltroTicket.value == null) {
      return;
    }
    filtro = this.txtFiltroTicket.value.trim();
    filtro = filtro.toLowerCase();
    this.dataSourceTicket.filter = filtro;
  }
}
