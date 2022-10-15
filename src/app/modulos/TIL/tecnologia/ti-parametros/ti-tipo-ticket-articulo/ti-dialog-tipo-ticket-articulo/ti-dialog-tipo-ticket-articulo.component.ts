import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { SecurityErp } from 'src/app/modulos/AAHelpers';
import Swal from 'sweetalert2';
import { ArticuloTIDTO } from '../../../api/models/articuloDTO';
import { ElementoTIDTO } from '../../../api/models/elementoTIDTO';
import { TipoTicketArticuloDTO } from '../../../api/models/tipoTicketArticuloDTO';
import { SubFamiliaCaracteristicaService } from '../../../api/services/sub-familia-caracteristica.service';

@Component({
  selector: 'app-ti-dialog-tipo-ticket-articulo',
  templateUrl: './ti-dialog-tipo-ticket-articulo.component.html',
  styleUrls: ['./ti-dialog-tipo-ticket-articulo.component.css']
})
export class TiDialogTipoTicketArticuloComponent implements OnInit {

  lEstado = [
    { estado: true, sDescripcion: 'Activo' },
    { estado: false, sDescripcion: 'Inactivo' },
  ]

  lTipoTicket: ElementoTIDTO[] = [];
  lArticulo: ArticuloTIDTO[] = [];

  sTitulo = '';

  formMatrizTicketArticulo: FormGroup

  storageData: SecurityErp;

  constructor(
    private spinner: NgxSpinnerService,
    private formBuilder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: TipoTicketArticuloDTO,
    public dialogRef: MatDialogRef<TiDialogTipoTicketArticuloComponent>,
    public dialog: MatDialog,
    private _subFamiliaCaracteristicaService: SubFamiliaCaracteristicaService,
  ) {
  }

  ngOnInit(): void {
    this.storageData = new SecurityErp()

    this.fnInicializarForm();
  }

  ngAfterViewInit() {
    //Para que no haya error de ngAfterContentChecked
    setTimeout(() => {
      this.fnLLenarForm();
    });

  }

  async fnLLenarForm() {

    this.spinner.show();
    await this.GetTipoTicket()
    await this.GetArticulo()

    this.spinner.hide();

    //Para modificar
    if (this.data) {

      this.formMatrizTicketArticulo.controls.cboTipoTicket.setValue(this.data.nIdTipoTicket);
      this.formMatrizTicketArticulo.controls.cboArticulo.setValue(this.data.nIdArticulo);
      this.formMatrizTicketArticulo.controls.cboEstado.setValue(this.data.bEstado);
      this.sTitulo = 'Modificar Tipo Ticket por Artículo'
    } else {
      //Para crear
      this.formMatrizTicketArticulo.controls.cboEstado.setValue(true);
      this.formMatrizTicketArticulo.controls.cboEstado.disable();
      this.sTitulo = 'Agregar Tipo Ticket por Artículo'
    }
  }

  fnInicializarForm() {
    this.formMatrizTicketArticulo = this.formBuilder.group({
      cboTipoTicket: [null, [Validators.required]],
      cboArticulo: [null, [Validators.required]],
      cboEstado: [''],
    })
  }

  fnGuardar() {
    if (this.data) {
      this.Update();
    } else {
      //Para crear
      this.Save();
    }
  }

  async Update() {
    if (this.formMatrizTicketArticulo.invalid) {
      Swal.fire({
        icon: 'warning',
        title: 'Advertencia',
        text: 'Revise los datos ingresados.',
      });
      this.formMatrizTicketArticulo.markAllAsTouched();
      return;
    }

    let datos = this.formMatrizTicketArticulo.value;

    let model: TipoTicketArticuloDTO = {
      nIdTipoTicketArticulo: this.data.nIdTipoTicketArticulo,
      nIdTipoTicket: datos.cboTipoTicket,
      sTipoTicket: '',
      nIdArticulo: datos.cboArticulo,
      sArticulo: '',
      sRutaArchivo: '',
      bEstado: datos.cboEstado,
      sEstado: ''
    }

    try {
      this.spinner.show();

      let result = await this._subFamiliaCaracteristicaService.UpdateTipoTicketArticulo(model);
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
        text: 'Se actualizó el registro',
        showConfirmButton: false,
        timer: 1500
      });

      this.dialogRef.close();
    }
    catch (err) {
      this.spinner.hide();
      console.log(err);
    }
  }
  async Save() {
    if (this.formMatrizTicketArticulo.invalid) {
      Swal.fire({
        icon: 'warning',
        title: 'Advertencia',
        text: 'Revise los datos ingresados.',
      });
      this.formMatrizTicketArticulo.markAllAsTouched();
      return;
    }

    let datos = this.formMatrizTicketArticulo.value;

    let model: TipoTicketArticuloDTO = {
      nIdTipoTicketArticulo: 0,
      nIdTipoTicket: datos.cboTipoTicket,
      sTipoTicket: '',
      nIdArticulo: datos.cboArticulo,
      sArticulo: '',
      sRutaArchivo: '',
      bEstado: true,
      sEstado: ''
    }

    try {
      this.spinner.show();

      let result = await this._subFamiliaCaracteristicaService.InsertTipoTicketArticulo(model);
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
        text: 'Se inserto el registro',
        showConfirmButton: false,
        timer: 1500
      });

      this.dialogRef.close();
    }
    catch (err) {
      this.spinner.hide();
      console.log(err);
    }
  }

  //#region Funcions listado
  async GetTipoTicket() {

    let response = await this._subFamiliaCaracteristicaService.GetTipoTicket()
    this.lTipoTicket = response.response.data
  }

  async GetArticulo() {

    let response = await this._subFamiliaCaracteristicaService.GetArticulo(this.storageData.getPais())
    this.lArticulo = response.response.data
  }
  //#endregion

  //#region Errores Controles
  get cboTipoTicketError(): string {
    return (this.formMatrizTicketArticulo.controls.cboTipoTicket.hasError('required') && this.formMatrizTicketArticulo.controls.cboTipoTicket.touched)
      ? 'Obligatorio' : null;
  }

  get cboArticuloError(): string {
    return (this.formMatrizTicketArticulo.controls.cboArticulo.hasError('required') && this.formMatrizTicketArticulo.controls.cboArticulo.touched)
      ? 'Obligatorio' : null;
  }

  get cboEstadoError(): string {
    return this.formMatrizTicketArticulo.controls.cboEstado.hasError('required') ? 'Obligatorio' : null;
  }
  //#endregion
}
