import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { SecurityErp } from 'src/app/modulos/AAHelpers';
import Swal from 'sweetalert2';
import { PersonalSolicitudTicketDTO, SolicitudTicketDTO } from '../../api/models/activoAsignadoPersonalDTO';
import { ArticuloTIDTO } from '../../api/models/articuloDTO';
import { ElementoTIDTO } from '../../api/models/elementoTIDTO';
import { ActivoAsignadoPersonalService } from '../../api/services/activo-asignado-personal.service';

@Component({
  selector: 'app-ti-dialog-solicitud-ticket',
  templateUrl: './ti-dialog-solicitud-ticket.component.html',
  styleUrls: ['./ti-dialog-solicitud-ticket.component.css']
})
export class TiDialogSolicitudTicketComponent implements OnInit {

  lTipoSolicitud: ElementoTIDTO[] = [];
  lArticulo: ArticuloTIDTO[] = [];
  lPersonal: PersonalSolicitudTicketDTO[] = [];

  vArticuloSeleccionado: ArticuloTIDTO;

  formSolicitud: FormGroup;
  storageData: SecurityErp;

  constructor(
    public dialogRef: MatDialogRef<TiDialogSolicitudTicketComponent>,
    private formBuilder: FormBuilder,
    private spinner: NgxSpinnerService,
    private _activoAsignadoPersonalService: ActivoAsignadoPersonalService,
  ) {
    this.inicializarForm();
  }

  ngOnInit(): void {
    this.storageData = new SecurityErp();
  }

  async ngAfterViewInit() {
    setTimeout(async () => {

      //Para que no haya error de ngAfterContentChecked
      this.spinner.show();
      await this.GetTipoTicket()
      await this.GetPersonalSolicitud()
      this.spinner.hide();

    });
  }

  async GetTipoTicket() {
    let response = await this._activoAsignadoPersonalService.GetTipoTicket()
    this.lTipoSolicitud = response.response.data
  }

  async GetPersonalSolicitud() {
    let response = await this._activoAsignadoPersonalService.GetPersonalSolicitud(Number(this.storageData.getUsuarioId()), Number(this.storageData.getEmpresa()))
    this.lPersonal = response.response.data
    let vPersonalActual = this.lPersonal.find(item => item.bEsActual)
    if (vPersonalActual) {
      this.formSolicitud.controls.cboPersonal.setValue(vPersonalActual.nIdPersonal);
      this.fnSeleccionarPersonal(vPersonalActual.nIdPersonal)
    }
  }

  async GetArticulo(nIdTipoTicket: number) {

    this.formSolicitud.controls.cboArticulo.setValue(null);
    this.vArticuloSeleccionado = null;
    let response = await this._activoAsignadoPersonalService.GetArticuloByTipoTicket(nIdTipoTicket)
    this.lArticulo = response.response.data
  }

  fnSeleccionarArticulo(nIdArticulo: number) {
    this.vArticuloSeleccionado = this.lArticulo.find(item => item.nIdArticulo == nIdArticulo)
  }

  fnSeleccionarPersonal(nIdPersonal: number) {
    let vPersonal = this.lPersonal.find(item => item.nIdPersonal == nIdPersonal)
    if (vPersonal) {
      this.formSolicitud.controls.txtDatos.setValue(vPersonal.sDatosPersonal)
    }
  }

  inicializarForm() {
    this.formSolicitud = this.formBuilder.group({
      cboTipoSolicitud: [null, Validators.required],
      cboArticulo: [null, Validators.required],
      cboPersonal: [null, Validators.required],
      txtDatos: [''],
      txtObservacion: [''],
    })
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

  //#region Errores
  get cboArticuloError(): string {
    return (this.formSolicitud.controls.cboArticulo.hasError('required') && this.formSolicitud.controls.cboArticulo.touched)
      ? 'Obligatorio' : null;
  }

  get cboTipoSolicitudError(): string {
    return (this.formSolicitud.controls.cboTipoSolicitud.hasError('required') && this.formSolicitud.controls.cboTipoSolicitud.touched)
      ? 'Obligatorio' : null;
  }

  get cboPersonalError(): string {
    return (this.formSolicitud.controls.cboPersonal.hasError('required') && this.formSolicitud.controls.cboPersonal.touched)
      ? 'Obligatorio' : null;
  }
  //#endregion

  async fnGuardar() {
    if (this.formSolicitud.invalid) {
      Swal.fire({
        icon: 'warning',
        title: 'Advertencia',
        text: 'Revise los datos ingresados.',
      });
      this.formSolicitud.markAllAsTouched();
      return;
    }

    let datos = this.formSolicitud.value;

    let personalAsignado = this.lPersonal.find(item => item.nIdPersonal == datos.cboPersonal)

    let model: SolicitudTicketDTO = {
      nIdTicket: 0,
      nIdTipoTicket: datos.cboTipoSolicitud,
      nIdSolicitante: 0,
      nIdArticulo: datos.cboArticulo,
      nIdAsignado: datos.cboPersonal,
      nIdEmpAsignado: personalAsignado.nIdEmpresa,
      sObservacion: datos.txtObservacion,
      nIdUsuarioCrea: Number(this.storageData.getUsuarioId()),
      sIdPais: this.storageData.getPais(),
      nIdActivo: null,
      nEsCuenta: 0,
      sAnio: '',
      nMes: 0,
      nIdEmpresa: Number(this.storageData.getEmpresa()),
      detalle: [],
      nIdDetActivoAsigna: null,
      nMonto: 0
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
      this.dialogRef.close();

    }
    catch (err) {
      console.log(err);
    }
  }
}
