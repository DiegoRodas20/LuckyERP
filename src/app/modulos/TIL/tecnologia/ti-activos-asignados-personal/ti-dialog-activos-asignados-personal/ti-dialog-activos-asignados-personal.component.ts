import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { DecimalPipe } from '@angular/common';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatExpansionPanel } from '@angular/material/expansion';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { timer } from 'rxjs';
import { take } from 'rxjs/operators';
import { SecurityErp } from 'src/app/modulos/AAHelpers';
import Swal from 'sweetalert2';
import { DetalleAsignacionActivoArchivoTIDTO } from '../../api/models/activoAsignacionTITDO';
import { ActivosPersonalDTO, ComponentesActivoDTO, DetalleGastoTicketDTO, PptoPartidaSolicitud, SolicitudTicketDTO } from '../../api/models/activoAsignadoPersonalDTO';
import { InformacionArticuloTIDTO } from '../../api/models/articuloDTO';
import { ActivoAsignacionService } from '../../api/services/activo-asignacion.service';
import { ActivoAsignadoPersonalService } from '../../api/services/activo-asignado-personal.service';
import { ActivoService } from '../../api/services/activo.service';
import { PerfilEquipoService } from '../../api/services/perfil-equipo.service';
import { TiDialogTicketSolicitudComponent } from './ti-dialog-ticket-solicitud/ti-dialog-ticket-solicitud.component';

@Component({
  selector: 'app-ti-dialog-activos-asignados-personal',
  templateUrl: './ti-dialog-activos-asignados-personal.component.html',
  styleUrls: ['./ti-dialog-activos-asignados-personal.component.css'],
  providers: [DecimalPipe]
})
export class TiDialogActivosAsignadosPersonalComponent implements OnInit {

  //Arreglo con dispositivos que no se puede hacer tickets del activo,
  //solo de sus componentes. 
  //agregar mas items en caso sea necesario
  dispositivosEspeciales = [2517]
  bEsDispositivoEspecial = false;
  /*
  2608	Revisión técnica
  2609	Reposición perdida
  2616	Reposición robo
  */

  separatorKeysCodes: number[] = [ENTER, COMMA];

  formActivo: FormGroup;
  lInformacionArticulo: InformacionArticuloTIDTO[] = [];
  lFotos: DetalleAsignacionActivoArchivoTIDTO[] = []

  lComponente: ComponentesActivoDTO[] = [];
  //Mat-table para Componentes
  dataSourceComponente: MatTableDataSource<ComponentesActivoDTO>;
  @ViewChild('paginatorComponente', { static: true }) paginatorComponente: MatPaginator;
  @ViewChild('sortComponente', { static: true }) sortComponente: MatSort;
  @ViewChild('matComponente') matComponente: MatExpansionPanel;
  @ViewChild('matActivo') matActivo: MatExpansionPanel;

  displayedColumnsComponente: string[] = ['opcion', 'sTipoDispositivo', 'sArticulo',
    'nRevision', 'nReposicion'];
  txtFiltroComponente = new FormControl();

  storageData: SecurityErp;

  constructor(
    private formBuilder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: {
      activo: ActivosPersonalDTO, idSucursalPersonal: number,
      idCargoPersonal: number, sSucursal: string
    },
    private _activoService: ActivoService,
    public dialogRef: MatDialogRef<TiDialogActivosAsignadosPersonalComponent>,
    public dialog: MatDialog,
    private spinner: NgxSpinnerService,
    private _perfilEquipoService: PerfilEquipoService,
    private _activoAsignacionService: ActivoAsignacionService,
    private _activoAsignadoPersonalService: ActivoAsignadoPersonalService,
    private _decimalPipe: DecimalPipe
  ) {
    this.fnInicializarForm();
  }

  async ngOnInit(): Promise<void> {
    this.storageData = new SecurityErp();

    //Si es dispositivo especial no se va a poder hacer una solicitud de ticket del activo
    //solo de sus partes
    this.bEsDispositivoEspecial = this.dispositivosEspeciales.includes(this.data.activo.nIdTipoDispositivo)
  }

  async ngAfterViewInit() {
    await timer(250).pipe(take(1)).toPromise(); //timer para renderize el componente
    await this.matActivo.open();

    this.spinner.show();
    this.formActivo.controls.txtTipoArticulo.setValue(this.data.activo.sTipoActivo);
    this.formActivo.controls.txtPenalizacion.setValue(this._decimalPipe.transform(this.data.activo.nMontoPenalizacion,'1.4-4'));
    this.formActivo.controls.moneda.setValue(this.data.activo.sMonedaPenalizacion);
    this.formActivo.controls.txtArticulo.setValue(this.data.activo.sActivo + ' - ' + this.data.activo.sArticulo);
    let response = await this._perfilEquipoService.GetInformacionArticulo(this.data.activo.nIdArticulo);
    this.lInformacionArticulo = response.response.data

    // Si el activo tiene id, se busca tambien las caracteristicas de sus activos repotenciadores
    const resultRepotenciacion = await this._activoService.GetAllCaracteristicasRepotenciacion(this.data.activo.nIdActivo);
    const chipsRepotenciacion = resultRepotenciacion.response.data;

    // Insertamos los chips de repotenciacion
    chipsRepotenciacion.map((chip) => {
      this.lInformacionArticulo.push({
        nIdArticulo: 0,
        sInformacion: chip.sDescripcion,
        bRepotenciado: chip.bRepotenciado
      })
    })

    // Ordenamos las caracteristicas alfabeticamente
    this.lInformacionArticulo = Array.from(this.lInformacionArticulo).sort((a, b) => (a.sInformacion > b.sInformacion) ? 1 : ((b.sInformacion > a.sInformacion) ? -1 : 0))
    
    let responseFotos = await this._activoAsignacionService.GetArchivosByActivo(this.data.activo.nIdDetActivoAsigna)
    this.lFotos = responseFotos.response.data
    let responseComponente = await this._activoAsignadoPersonalService.GetComponentesByActivo(this.data.activo.nIdActivo)
    this.lComponente = responseComponente.response.data
    this.dataSourceComponente = new MatTableDataSource(this.lComponente);
    this.dataSourceComponente.paginator = this.paginatorComponente;
    this.dataSourceComponente.sort = this.sortComponente;
    this.spinner.hide();
  }

  fnInicializarForm() {
    this.formActivo = this.formBuilder.group({
      txtTipoArticulo: [''],
      txtArticulo: [''],
      txtPenalizacion: [''],
      moneda: [null],
      cboInformacion: [''],
      cboFotos: [''],
    })
  }

  async fnMandarSolicitud(nIdArticulo: number, nIdTipoTicket: number, nMonto: number, bAplicaDescuento: boolean) {

    this.spinner.show();
    let resultValidacion = await this._activoAsignadoPersonalService.ValidacionTicket(this.data.activo.nIdActivo, this.data.activo.nIdPersonal, nIdArticulo);
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

    //Solo si es robo o perdida
    if ((nIdTipoTicket == 2616 || nIdTipoTicket == 2609) && bAplicaDescuento) {
      const { isConfirmed: personal, isDenied: cuenta } = await Swal.fire({
        title: '¿De donde se va a sacar el descuento?',
        showCancelButton: true,
        showDenyButton: true,
        showConfirmButton: true,
        cancelButtonText: 'Cancelar',
        denyButtonText: 'Descontar a mi area/cuenta',
        confirmButtonText: 'Descontar a mi persona',
        confirmButtonColor: '#3085d6',
        denyButtonColor: '#29E74E',
        cancelButtonColor: '#d33',
      })


      //Si es cuenta abrimos un dialog para que seleccione datos
      if (cuenta) {
        nEsCuenta = 1
        let dialogData: PptoPartidaSolicitud[] = await this.dialog.open(TiDialogTicketSolicitudComponent, {
          data: {
            idPersonal: this.data.activo.nIdPersonal,
            idArticulo: nIdArticulo,
            precioPenalizacion: nMonto,
            idSucursal: this.data.idSucursalPersonal,
            sSucursal: this.data.sSucursal
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
            nIdSucursal: this.data.idSucursalPersonal,
            nIdPartida: item.nIdPartida,
            nCantidad: 1,
            nPrecio: item.nMonto,
            nIdArticulo: this.data.activo.nIdArticulo,
            nIdCargo: this.data.idCargoPersonal,
            nIdDepositario: this.data.activo.nIdPersonal,
            nIdCentroCosto: item.nIdPresupuesto
          }
        })

      } else if (personal) {
        nEsCuenta = 0
      } else {
        return;
      }
    }

    let model: SolicitudTicketDTO = {
      nIdTicket: 0,
      nIdTipoTicket: nIdTipoTicket,
      nIdSolicitante: 0,
      nIdArticulo: nIdArticulo,
      nIdAsignado: this.data.activo.nIdPersonal,
      nIdEmpAsignado: this.data.activo.nIdEmpPersonal,
      sObservacion: observacion as string,
      nIdUsuarioCrea: Number(this.storageData.getUsuarioId()),
      sIdPais: this.storageData.getPais(),
      nIdActivo: this.data.activo.nIdActivo,
      nEsCuenta: nEsCuenta,
      sAnio: moment().year().toString(),
      nMes: moment().month() + 1,
      nIdEmpresa: Number(this.storageData.getEmpresa()),
      detalle: listaDetalle,
      nIdDetActivoAsigna: this.data.activo.nIdDetActivoAsigna,
      nMonto: nMonto
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
    }
    catch (err) {
      console.log(err);
    }
  }

  fnVerImagen(sTitulo: string, sText: string, sRutaArchivo: string) {

    if (sRutaArchivo != '' && sRutaArchivo != null) {
      Swal.fire({
        title: sTitulo,
        text: sText,
        imageUrl: sRutaArchivo,
        imageWidth: 250,
        imageHeight: 250,
      })
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Este artículo no contiene una imagen',
        showConfirmButton: false,
        timer: 1500
      });
    }
  }
}
