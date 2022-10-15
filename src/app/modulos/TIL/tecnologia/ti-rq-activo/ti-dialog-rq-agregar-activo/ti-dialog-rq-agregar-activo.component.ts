import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { SafeUrl } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { SecurityErp } from 'src/app/modulos/AAHelpers';
import Swal from 'sweetalert2';
import { ArticuloAsignacionActivoTableTIDTO, DetalleAsignacionActivoArchivoTIDTO, DetalleAsignacionActivoTIDTO, DetalleDocumentoAsignacionActivoTIDTO, FotosRqActivo, PersonalAsignacionActivoTIDTO } from '../../api/models/activoAsignacionTITDO';
import { ArticuloRqActivoTIDTO, ArticuloTIDTO, InformacionArticuloTIDTO } from '../../api/models/articuloDTO';
import { TipoElementoDto } from '../../api/models/tipoElementoDTO';
import { ActivoAsignacionService } from '../../api/services/activo-asignacion.service';
import { ActivoService } from '../../api/services/activo.service';
import { AsignacionDirectaService } from '../../api/services/asignacion-directa.service';
import { PerfilEquipoService } from '../../api/services/perfil-equipo.service';
import { TiDialogArchivoAsignacionActivoComponent } from '../ti-dialog-archivo-asignacion-activo/ti-dialog-archivo-asignacion-activo.component';
import { TiDialogDocumentoDescuentoRqAsignaComponent } from './ti-dialog-documento-descuento-rq-asigna/ti-dialog-documento-descuento-rq-asigna.component';

@Component({
  selector: 'app-ti-dialog-rq-agregar-activo',
  templateUrl: './ti-dialog-rq-agregar-activo.component.html',
  styleUrls: ['./ti-dialog-rq-agregar-activo.component.css']
})
export class TiDialogRqAgregarActivoComponent implements OnInit {
  lArticulo: ArticuloRqActivoTIDTO[] = [];
  vArticuloSeleccionado: ArticuloRqActivoTIDTO;
  lTipoArticulo: TipoElementoDto[] = [];
  lFotos: FotosRqActivo[] = [];
  lFotosDetalle: DetalleAsignacionActivoArchivoTIDTO[] = [];
  storageData: SecurityErp;
  formActivo: FormGroup;
  formActivoDetalle: FormGroup;
  lInformacionArticulo: InformacionArticuloTIDTO[] = [];
  separatorKeysCodes: number[] = [ENTER, COMMA];

  bEsDetalle: boolean = false;

  constructor(
    private _perfilEquipoService: PerfilEquipoService,
    private _activoAsignacionService: ActivoAsignacionService,
    private _activoService: ActivoService,
    private _asignacionDirectaService: AsignacionDirectaService,
    private formBuilder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: {
      personal: PersonalAsignacionActivoTIDTO, idActivoAsigna: number, activo: ArticuloAsignacionActivoTableTIDTO,
      lTipoActivo: TipoElementoDto[]
    },
    public dialogRef: MatDialogRef<TiDialogRqAgregarActivoComponent>,
    public dialog: MatDialog,
    private spinner: NgxSpinnerService,
  ) {
    this.fnInicializarForm();
  }

  async ngOnInit(): Promise<void> {
    this.storageData = new SecurityErp();

    if (this.data.activo) {
      this.bEsDetalle = true;
      this.fnLlenarForm();

    } else {
      //await this.GetAllTipoActivo();

      this.lTipoArticulo = this.data.lTipoActivo;
      this.bEsDetalle = false;
    }

  }

  async fnLlenarForm() {
    this.formActivoDetalle.controls.txtTipoArticulo.setValue(this.data.activo.sRecurso);
    this.formActivoDetalle.controls.txtArticulo.setValue(this.data.activo.sActivo + ' - ' + this.data.activo.sArticulo);
    this.formActivoDetalle.controls.txtObservacion.setValue(this.data.activo.sObservacion);
    let response = await this._perfilEquipoService.GetInformacionArticulo(this.data.activo.nIdArticulo)
    this.lInformacionArticulo = response.response.data
    let responseFotos = await this._activoAsignacionService.GetArchivosByActivo(this.data.activo.nIdDetActivoAsigna)
    this.lFotosDetalle = responseFotos.response.data

    let datosActivo = await this.GetDatosActivo(this.data.activo.nIdActivo);
    this.formActivoDetalle.controls.txtDatosActivo.setValue(datosActivo);

    this.formActivoDetalle.controls.txtDescuento.setValue(this.data.activo.nDescuento);
  }

  fnInicializarForm() {
    this.formActivo = this.formBuilder.group({
      cboTipoArticulo: [null, Validators.required],
      cboArticulo: [null, Validators.required],
      txtDescuento: [0, Validators.min(0)],
      cboInformacion: [''],
      cboFotos: [''],
      txtObservacion: [''],
      txtDatosActivo: ['']
    })

    this.formActivoDetalle = this.formBuilder.group({
      txtTipoArticulo: [null, Validators.required],
      txtArticulo: [null, Validators.required],
      cboInformacion: [''],
      txtDescuento: [0, Validators.min(0)],
      cboFotos: [''],
      txtObservacion: [''],
      txtDatosActivo: ['']
    })
  }

  fnVerImagen(sCodActivo: string, sArticulo: string, sRutaArchivo: string) {

    if (sRutaArchivo != '' && sRutaArchivo != null) {
      Swal.fire({
        title: sCodActivo,
        text: sArticulo,
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

  async GetInformacionArticulo(idActivo: number) {
    let vArticulo = this.lArticulo.find(item => item.nIdActivo == idActivo)
    this.lInformacionArticulo = [];
    this.fnSeleccionarArticulo(vArticulo.nIdArticulo);

    let response = await this._perfilEquipoService.GetInformacionArticulo(vArticulo.nIdArticulo)
    this.lInformacionArticulo = response.response.data

    let datosActivo = await this.GetDatosActivo(idActivo);
    this.formActivo.controls.txtDatosActivo.setValue(datosActivo);

  }

  async GetAllTipoActivo() {
    let response = await this._activoAsignacionService.GetAllTipoDispositivo(this.data.personal.nIdCargo)
    this.lTipoArticulo = response.response.data
  }

  async GetAllArticulo(nIdTipo: number) {
    this.formActivo.controls.cboArticulo.setValue(null);
    this.formActivoDetalle.controls.txtDescuento.setValue(0);

    this.lInformacionArticulo = [];
    this.lArticulo = [];

    this.vArticuloSeleccionado = null;

    let response = await this._activoAsignacionService.GetAllArticulo(nIdTipo, this.data.personal.nIdCargo);

    this.lArticulo = response.response.data
  }

  async GetDatosActivo(nIdActivo: number) {
    let response = await this._activoService.GetDescripcionActivo(nIdActivo);
    return response.response.data[0];
  }

  fnSeleccionarArticulo(idArticulo: number) {
    this.vArticuloSeleccionado = this.lArticulo.find(item => item.nIdArticulo == idArticulo);
    this.formActivo.controls.txtDescuento.setValue(this.vArticuloSeleccionado.nDescuento);
  }

  fnAnadirFoto() {

    if (this.formActivo.invalid) {
      Swal.fire({
        icon: 'warning',
        title: 'Advertencia',
        text: 'Seleccione un activo para poder continuar.',
      });
      return;
    }

    const dialog = this.dialog.open(TiDialogArchivoAsignacionActivoComponent, {
      disableClose: true
    }).afterClosed().subscribe(data => {

      if (data) {
        let nNumero = 0;

        this.lFotos.forEach(item => {
          if (item.nNumero > nNumero) {
            nNumero = item.nNumero;
          }
        })

        let foto: FotosRqActivo = {
          nNumero: nNumero + 1,
          fileString: data.fileString,
          extension: data.extension,
          urlImage: data.urlImage,
          nIdActivo: 0,
          sObservacion: data.sObservacion,
        }

        this.lFotos.push(foto);
      }
    })
  }

  fnVerFoto(foto: FotosRqActivo) {
    Swal.fire({
      title: 'Observación N°' + foto.nNumero,
      text: foto.sObservacion,
      imageUrl: 'data:image/' + foto.extension + ';base64,' + foto.fileString,
      imageWidth: 250,
      imageHeight: 250,
    })
  }

  fnEliminarFoto(foto: FotosRqActivo) {
    this.lFotos = this.lFotos.filter(item => item.nNumero != foto.nNumero)
  }

  async fnAgregarActivo() {
    if (this.formActivo.invalid) {
      Swal.fire({
        icon: 'warning',
        title: 'Advertencia',
        text: 'Revise los datos ingresados.',
      });
      this.formActivo.markAllAsTouched();
      return;
    }

    if (this.lFotos.length == 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Advertencia',
        text: 'Ingrese al menos una foto.',
      });
      this.formActivo.markAllAsTouched();
      return;
    }


    let descuento = this.formActivo.controls.txtDescuento.value
    let agregoDescuento = !(descuento == null || descuento == 0);

    if (descuento == null || descuento == 0) {
      var resp = await Swal.fire({
        title: '¿Desea continuar?',
        text: 'No se está agregando un descuento',
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
    }

    let datos = this.formActivo.value

    let vActivo = this.lArticulo.find(item => item.nIdActivo == datos.cboArticulo)
    //let vTipo = this.lTipoArticulo.find(item => item.tipoElementoId == datos.cboTipoArticulo)

    // let data: ArticuloAsignacionActivoTableTIDTO = {
    //   nIdPersonal: this.data.personal.nIdPersonal,
    //   sRecurso: vTipo.descripcion,
    //   sPerfil: vActivo.sNombrePerfil,
    //   nIdActivo: vActivo.nIdActivo,
    //   sActivo: vActivo.sCodActivo,
    //   sArticulo: vActivo.sNombreProducto,
    //   sAddenda: vActivo.sAddenda,
    //   sAutorizaDcto: '',
    //   sObservacion: datos.txtObservacion.trim(),
    //   nIdDetActivoAsigna: 0,
    //   nIdArticulo: vActivo.nIdArticulo,
    //   sRutaArchivo: vActivo.sRutaArchivo
    // }

    this.lFotos.forEach(item => {
      item.nIdActivo = vActivo.nIdActivo
    })

    let model: DetalleAsignacionActivoTIDTO = {
      nIdDetActivoAsigna: 0,
      nIdActivoAsigna: this.data.idActivoAsigna,
      nIdEnv: this.data.personal.nIdEnv,
      nIdActivo: vActivo.nIdActivo,
      nIdTicket: 0,
      nIdPersonal: this.data.personal.nIdPersonal,
      sObservacion: datos.txtObservacion.trim(),
      dFechaEntrega: null,
      nIdDescuento: 0,
      dFechaDevolucion: null,
      nIdUsrDevolucion: 0,
      dFecha: null,
      bEstado: true,
      nIdUsuario: Number(this.storageData.getUsuarioId()),
      sIdPais: this.storageData.getPais(),
      nIdEmp: Number(this.storageData.getEmpresa()),
      nDescuento: descuento,
      detalleArchivo: this.lFotos.map(archivo => {
        return {
          nIdDetActivoAsignaArchivo: 0,
          nIdDetActivoAsigna: 0,
          nTipoAccion: 0,
          sRutaArchivo: '',
          nNumero: archivo.nNumero,
          sObservacion: archivo.sObservacion,
          fileString: archivo.fileString,
          extension: archivo.extension
        };
      })
    }

    try {
      this.spinner.show();
      let result = await this._activoAsignacionService.InsertDetalle(model);
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
      Swal.fire({
        icon: 'success',
        title: ('Correcto'),
        text: 'Se guardo el registro',
        showConfirmButton: false,
        timer: 1500
      });

      //Si agrego dcto ponemos en vista para ver detalle
      if (agregoDescuento) {
        let response = await this._activoAsignacionService.GetActivosByPersonal(
          this.data.personal.nIdPersonal,
          this.data.idActivoAsigna)

        this.data.activo = response.response.data.find(item => item.nIdActivo == vActivo.nIdActivo)

        this.bEsDetalle = true;

        this.fnLlenarForm();

      } else {
        this.dialogRef.close(null);
      }
    }
    catch (err) {
      console.log(err);
    }
  }


  async fnDescargarPDFDescuento() {

    // Id del descuento del documento
    let nIdDescuento = this.data.activo.nIdDescuento;

    this.spinner.show();

    const pEntidad = 4;
    const pOpcion = 2;
    const pParametro = [];
    const pTipo = 1;

    pParametro.push(nIdDescuento);
    pParametro.push(this.storageData.getEmpresa())

    const result = await this._asignacionDirectaService.fnDescargarPDFDescuento(pEntidad, pOpcion, pParametro, pTipo);

    // Descargar pdf
    const data = result;
    const fileName = `AD-${nIdDescuento}.pdf`; // Formato del nombre de la plantilla de descuento vacia

    saveAs(data, fileName);

    const objectUrl = window.URL.createObjectURL(data);
    // const link = document.createElement('a');
    // link.href = objectUrl;
    // link.download = fileName;
    // // Trigger de descarga
    // link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));

    this.spinner.hide();

    Swal.fire({
      title: 'El documento ha sido generado',
      html: `Si su descarga no ha comenzado, puede descargarlo <a href='${objectUrl}' download="${fileName}">aquí</a>`,
      icon: 'success',
      showCloseButton: true
    })
  }

  fnVerFile() {
    window.open(this.data.activo.sRutaArchivoDetalle, '_blank');
  }

  fnSubirDocumento() {
    const dialogRef = this.dialog.open(TiDialogDocumentoDescuentoRqAsignaComponent, {
      width: '1000px',
      autoFocus: false,
      disableClose: true,
      data: {
        nIdDetActivoAsigna: this.data.activo.nIdDetActivoAsigna,
      }
    });

    dialogRef.beforeClosed().subscribe(async (result: DetalleDocumentoAsignacionActivoTIDTO) => {

      if (result) {
        let response = await this._activoAsignacionService.GetActivosByPersonal(
          this.data.personal.nIdPersonal,
          this.data.idActivoAsigna)

        this.data.activo = response.response.data.find(item => item.nIdActivo == this.data.activo.nIdActivo)

        this.bEsDetalle = true;

        this.fnLlenarForm();
      }
    });
  }

  get cboTipoArticuloError(): string {
    return (this.formActivo.controls.cboTipoArticulo.hasError('required') && this.formActivo.controls.cboTipoArticulo.touched)
      ? 'Obligatorio' : null;
  }

  get cboArticuloError(): string {
    return (this.formActivo.controls.cboArticulo.hasError('required') && this.formActivo.controls.cboArticulo.touched)
      ? 'Obligatorio' : null;
  }
}
