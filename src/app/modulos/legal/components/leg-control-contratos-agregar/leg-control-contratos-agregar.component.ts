import { Component, Inject, Injectable, Input, OnInit, Type, ViewChild, EventEmitter, Output, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { LegalService } from '../../leg-services/legal.service';
import * as moment from 'moment';
import { DateAdapter } from 'angular-calendar';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material/core';
import { Moment } from 'moment';
import { asistenciapAnimations } from '../../../comercial/Asistencia/asistenciap/asistenciap.animations';
import Swal from 'sweetalert2';
import { saveAs } from 'file-saver';
import { NgxSpinnerService } from 'ngx-spinner';
import { FilecontrolService } from 'src/app/shared/services/filecontrol.service';
import { HttpEventType } from '@angular/common/http';
import { PresupuestosService } from '../../../control-costos/presupuestos/presupuestos.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';

export const MY_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',

  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
}

@Component({
  selector: 'app-leg-control-contratos-agregar',
  templateUrl: './leg-control-contratos-agregar.component.html',
  styleUrls: ['./leg-control-contratos-agregar.component.css'],
  animations: [asistenciapAnimations],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE,MAT_MOMENT_DATE_ADAPTER_OPTIONS]
    },
    {provide: MAT_DATE_FORMATS, useValue: MY_FORMATS}
  ]
})
export class LegControlContratosAgregarComponent implements OnInit {
  //Input
  @Input() titulo: string;
  @Input() nIdTipoContrato: number;
  @Input() nIdCliente: number;
  @Input() nIdContratoCliente: number;
  @Input() tipo: number;
  @Input() contrato: any;
  @Input() nIdEmpresa: number;
  @Output() salidaFormulario: EventEmitter<number> = new EventEmitter();;

  // Variables para la animación de los botones laterales
  tsLista = 'inactive';  // Inicia la lista oculta
  fbLista = [ // Lista de las opciones que se mostrarán
    {icon: 'add', tool: 'Registrar Contrato', color: 'white'},
    {icon: 'exit_to_app', tool: 'Salir', color: 'warn'},
  ];
  displayedColumns: string[] = ['contrato', 'archivo', 'fechaFinAnterior','fechaAddeda','observacion'];
  dataSource: any;
  abLista = [];
  progreso: any;

  // Formulario
  formularioContrato: FormGroup;
  formularioAddenda: FormGroup;

  sPais: string;
  idUser: any;

  submitted: boolean;
  vArchivoSeleccioado = File;
  listaContratosAddendas: any[];
  filestring: string;
  ocultarBotones: boolean = true;
  ultimoRegistro: boolean = false;
  update: boolean = false;
  vigente: boolean = true;
  addAdenda: boolean = false;
  fechaFinGuardada: any;
  addendaActual: string;
  disabledButtonAddenda: boolean = false;
  private vNameRutaFile: string;
  url: string;
  @ViewChild(MatPaginator, {static: false}) paginator: MatPaginator;

  // Elemento para abrir modal
  @ViewChild('modalAddenda') modalAddenda: ElementRef;
  @ViewChild('modalAddendaClose') modalAddendaClose: ElementRef;

  constructor(
    private legalService: LegalService,
    private spinner: NgxSpinnerService,
    private vFilecontrolService: FilecontrolService,
    private vPresupuestosService: PresupuestosService,
    @Inject('BASE_URL') baseUrl: string,
    private fb: FormBuilder  ) {
      this.crearFormulario();
      this.url = baseUrl;
     }

  async ngOnInit() {
    this.sPais = localStorage.getItem('Pais');
    let user = localStorage.getItem('currentUser');
    this.idUser = JSON.parse(window.atob(user.split('.')[1])).uid;
    this.onToggleFab(1,-1);
    await this.iniciarVista();
  }

  async iniciarVista() {
    this.listaContratosAddendas = await this.legalService.obtenerInformacionLegal(4,`${this.nIdContratoCliente}`);
    const countListaContratos = this.listaContratosAddendas.length + 1;
    this.addendaActual = this.listaContratosAddendas.length === 0 ? '' : `ADDENDA ${countListaContratos}`;
    this.llenarTabla(this.listaContratosAddendas);
    if(this.tipo === 2) { // Ver detalle
      this.inicializarFormulario(this.contrato);
      this.ultimoRegistro = this.contrato.bEstado === 1 && this.contrato.nNumAddenda === 0 ? true : false;
      let comentario =  await this.legalService.obtenerInformacionLegal(7,`${this.nIdContratoCliente}`);
      this.formularioContrato.controls.comentario.setValue(comentario.comentarioTxt);
    } else {
      this.formularioContrato.controls.vigente.setValue(true);
      this.formularioContrato.controls.addendas.disable();
    }
  }

  crearFormulario() {

    this.formularioContrato = this.fb.group({
      'contrato': ['', [Validators.required]],
      'suscriptor': ['', [Validators.required]],
      'objeto': ['',[Validators.required]],
      'fechaSuscripcion': [ ,[Validators.required]],
      'fechaInicio': [ ,[Validators.required]],
      'fechaFin': [ ,[Validators.required]],
      'addendas': [,],
      'vigente': [],
      'estado': ['1'],
      'fileUpload': [],
      'comentario': ['']

    },
    {
      validator: [
        this.dateRangeValidator(
          "fechaInicio",
          "fechaFin"
        )
      ],
    })

    this.formularioAddenda = this.fb.group({
      'fechaActual': [ null ,[Validators.required]],
      'fechaNueva': [ null ,[Validators.required]],
    },
    {
      validator: [
        this.dateRangeAddendaValidator(
          "fechaActual",
          "fechaNueva"
        )
      ],
    })


    this.formularioContrato.controls.vigente.disable();
  }

  inicializarFormulario(contrato) {
    let fechaSuscripcion: Moment = moment(contrato.dFechaSuscripcion,'DD-MM-yyyy');
    let fechaInicio: Moment = moment(contrato.dFechaInicio,'DD-MM-yyyy');
    let fechaFin: Moment = moment(contrato.dFechaFin,'DD-MM-yyyy');
    this.formularioContrato.reset({
      'contrato': contrato.sTitulo ,
      'suscriptor': contrato.sSuscriptores ,
      'objeto': contrato.sObjetivo,
      'fechaSuscripcion': fechaSuscripcion ,
      'fechaInicio': fechaInicio ,
      'fechaFin': fechaFin,
      'addendas': contrato.bitAddenda === 1 ? true : false ,
      'vigente': contrato.bitVigente === 1 ? true : false ,
      'estado': contrato.bEstado.toString()
    });
    this.bloquearCampos(true);
    //Verificamos si se encuentra vigente
    this.fechaFinGuardada = fechaFin;
    this.formularioAddenda.get("fechaActual").setValue(fechaFin);
    this.vigente = this.contrato.bitVigente === 1 ? true : false;
  }

  bloquearCampos(activar: boolean) {
    //Bloquearemos todos los campos
    if(activar) {
      this.formularioContrato.controls.contrato.disable();
      this.formularioContrato.controls.suscriptor.disable();
      this.formularioContrato.controls.objeto.disable();

      this.formularioContrato.controls.fechaSuscripcion.disable();
      this.formularioContrato.controls.fechaInicio.disable();
      this.formularioContrato.controls.fechaFin.disable();
      this.formularioContrato.controls.estado.disable();
      this.formularioContrato.controls.comentario.disable();
      this.formularioContrato.controls.addendas.disable();

    } else { // Desbloquear
      this.formularioContrato.controls.contrato.enable();
      this.formularioContrato.controls.suscriptor.enable();
      this.formularioContrato.controls.objeto.enable();

      this.formularioContrato.controls.fechaSuscripcion.enable();
      this.formularioContrato.controls.fechaInicio.enable();
      this.formularioContrato.controls.fechaFin.enable();
      this.formularioContrato.controls.estado.enable();
      this.formularioContrato.controls.comentario.enable();
    }

  }

  fnAbrirModalAddenda(){
    this.modalAddenda.nativeElement.click();
  }

  fnReiniciarModalAddenda(){
    this.formularioAddenda.get("fechaNueva").setValue(null);
    this.formularioAddenda.get("fechaNueva").setErrors(null);
    this.formularioAddenda.markAsUntouched();
  }


  async registrarContrato() {
    this.spinner.show();

    // Crear contrato
    if(this.tipo === 1) {
      await this.crearContrato();
    }

    // Agregar adenda
    else if(this.tipo === 2) {
      this.formularioContrato.controls.fileUpload.disable();
      this.disabledButtonAddenda = true;
      await this.agregarAdenda(this.nIdContratoCliente)
    }

    this.spinner.hide();
  }

  async actualizarContrato() {
    if(this.update === false) {
      this.bloquearCampos(false);
      this.update = true;
    } else {
      const titulo = this.formularioContrato.get('contrato').value;
      const suscriptor = this.formularioContrato.get('suscriptor').value;
      const objeto = this.formularioContrato.get('objeto').value;
      let valorFechaSuscripcion: Moment = this.formularioContrato.get('fechaSuscripcion').value;
      const fechaSuscripcion = valorFechaSuscripcion.format('yyyy-MM-DD');
      let valorFechaInicio: Moment = this.formularioContrato.get('fechaInicio').value;
      const fechaInicio = valorFechaInicio.format('yyyy-MM-DD');
      let valorFechaFin: Moment = this.formularioContrato.get('fechaFin').value;
      const fechaFin = valorFechaFin.format('yyyy-MM-DD');
      const estado = this.formularioContrato.get('estado').value;
      let param = `${this.nIdContratoCliente}|${titulo}|${suscriptor}|${objeto}|${fechaSuscripcion}|${fechaInicio}|${fechaFin}|${estado}`;
      this.spinner.show();
      const resp: any = await this.legalService.insertOrUpdateContrato(5,param);
      this.spinner.hide();
      if(resp === 1) {
        const nIdContratoCliente = this.nIdContratoCliente;
        const comentario = this.formularioContrato.get('comentario').value;
        this.spinner.show();
        const respuestaComentario = await this.generarArchivoTxt(nIdContratoCliente,comentario);
        this.spinner.hide();
        if(respuestaComentario == 1) {
          const mensaje = this.tipo === 1 ? 'contrato' : 'addenda';
          Swal.fire({
            title: `El ${mensaje} se actualizó de manera exitosa`,
            icon: 'success',
            timer: 1500
          });
        }

      }
      this.update = false;
      this.bloquearCampos(true);
    }

  }

  async crearContrato() {
    if (this.formularioContrato.invalid) {
      return Object.values(this.formularioContrato.controls).forEach(control => {
        control.markAllAsTouched();
      })
    }
    this.spinner.show();
    const titulo = this.formularioContrato.get('contrato').value;
    const suscriptor = this.formularioContrato.get('suscriptor').value;
    const objeto = this.formularioContrato.get('objeto').value;
    let valorFechaSuscripcion: Moment = this.formularioContrato.get('fechaSuscripcion').value;
    const fechaSuscripcion = valorFechaSuscripcion.format('yyyy-MM-DD');
    let valorFechaInicio: Moment = this.formularioContrato.get('fechaInicio').value;
    const fechaInicio = valorFechaInicio.format('yyyy-MM-DD');
    let valorFechaFin: Moment = this.formularioContrato.get('fechaFin').value;
    const fechaFin = valorFechaFin.format('yyyy-MM-DD');
    const rutaArchivo =  '';
    const addendas = this.formularioContrato.get('addendas').value === true ? 1 : 0;
    const vigente = this.formularioContrato.get('vigente').value === true ? 1 : 0;
    const estado = this.formularioContrato.get('estado').value;
    let param = `${this.nIdTipoContrato}|${this.sPais}|${this.nIdCliente}|${titulo}|${objeto}|${suscriptor}|${fechaSuscripcion}|${fechaInicio}|${fechaFin}|${rutaArchivo}|`;
    param += `${addendas}|${vigente}|${this.idUser}|${estado}|${this.nIdEmpresa}`
    const resp: any = await this.legalService.insertOrUpdateContrato(1,param);
    if(resp > 0) {
      const nIdContratoCliente = resp;
      const comentario = this.formularioContrato.get('comentario').value;
      const respuestaComentario = await this.generarArchivoTxt(nIdContratoCliente,comentario);
      this.spinner.hide();
      if(respuestaComentario == 1) {

        const listaContratos = await this.legalService.obtenerInformacionLegal(3,`${this.nIdCliente}|${this.nIdTipoContrato}|${this.nIdEmpresa}`);

        this.contrato = listaContratos.find(item => item.nIdContratoCliente === nIdContratoCliente);

        // Ver detalle del objeto
        this.tipo = 2;
        this.nIdContratoCliente = nIdContratoCliente;
        await this.iniciarVista()

        this.inicializarFormulario(this.contrato);

        Swal.fire({
          title: 'El contrato se registró de manera exitosa',
          icon: 'success',
          timer: 1500
        });
      }
      // this.dialogRef.close(1);
    } else {
      this.spinner.hide();
    }

  }

  async agregarAdenda(nIdContratoCliente) {

    if (this.formularioContrato.invalid) {
      return Object.values(this.formularioContrato.controls).forEach(control => {
        control.markAllAsTouched();
      })
    }

    this.spinner.show();
    const titulo = this.formularioContrato.get('contrato').value;
    const suscriptor = this.formularioContrato.get('suscriptor').value;
    const objeto = this.formularioContrato.get('objeto').value;
    let valorFechaSuscripcion: Moment = this.formularioContrato.get('fechaSuscripcion').value;
    const fechaSuscripcion = valorFechaSuscripcion.format('yyyy-MM-DD');
    let valorFechaInicio: Moment = this.formularioContrato.get('fechaInicio').value;
    const fechaInicio = valorFechaInicio.format('yyyy-MM-DD');
    let valorFechaFin: Moment = this.formularioAddenda.get('fechaNueva').value;
    const fechaFin = valorFechaFin.format('yyyy-MM-DD');
    let fechaFinValidacion: Moment = moment(valorFechaFin,'DD-MM-yyyy');
    const rutaArchivo =  '';
    const addendas = 1; // Siempre será addenda por eso está en 1 por defecto
    const vigente = 1;
    const estado = 1;

    if(fechaFinValidacion <= this.fechaFinGuardada){
      this.spinner.hide();
      return Swal.fire({
        title: 'La fecha nueva de la addenda no puede ser menor o igual a la fecha actual',
        icon: 'warning'
      });
    }

    let param = `${nIdContratoCliente}|${this.nIdTipoContrato}|${this.sPais}|${this.nIdCliente}|${titulo}|${objeto}|${suscriptor}|${fechaSuscripcion}|${fechaInicio}|${fechaFin}|${rutaArchivo}|`;
    param += `${addendas}|${vigente}|${this.idUser}|${estado}|${nIdContratoCliente}|${this.nIdEmpresa}`;
    const resp: any = await this.legalService.insertOrUpdateContrato(3,param);
    if(resp > 0) {
      const nIdContratoCliente = resp;
      const comentario = this.formularioContrato.get('comentario').value;
      const respuestaComentario = await this.generarArchivoTxt(nIdContratoCliente,comentario);
      this.spinner.hide();
      if(respuestaComentario === 1) {

        Swal.fire({
          title: 'La addenda se registró de manera exitosa',
          icon: 'success'
        });

        this.modalAddendaClose.nativeElement.click();

        //Actualizar fecha actual en el modal
        this.formularioAddenda.get("fechaActual").setValue(fechaFin);

        await this.recargarVistaAddenda(resp);
        this.formularioContrato.controls.fileUpload.enable();
        this.disabledButtonAddenda = false;
      }

      // this.dialogRef.close(1);
    }

  }

  async cancelarOperacion() {
    this.spinner.show();

    this.bloquearCampos(true);

    this.update = false;
    this.disabledButtonAddenda = false;
    this.addAdenda = false;

    if(this.tipo === 2) { // Ver detalle
      this.inicializarFormulario(this.contrato);
      this.ultimoRegistro = this.contrato.bEstado === 1 && this.contrato.nNumAddenda === 0 ? true : false;
      let comentario =  await this.legalService.obtenerInformacionLegal(7,`${this.nIdContratoCliente}`);
      this.formularioContrato.controls.comentario.setValue(comentario.comentarioTxt);
    }
    else {
      this.formularioContrato.controls.vigente.setValue(true);
      this.formularioContrato.controls.addendas.disable();
      this.formularioContrato.controls.fileUpload.enable();
    }

    this.spinner.hide();
  }

  llenarTabla(listaContratoAddenda) {
    this.dataSource = new MatTableDataSource(listaContratoAddenda);
    this.dataSource.paginator = this.paginator;
  }

  seleccionarArchivo(event, lbl:any) {
    this.vArchivoSeleccioado = event.target.files;

    var reader = new FileReader();
    reader.onload = this._handleReaderLoaded.bind(this);

    if(this.vArchivoSeleccioado.length != 0) {
      document.getElementById(lbl).innerHTML = this.vArchivoSeleccioado[0].name;
      this.filestring = this.vArchivoSeleccioado[0].name;
      reader.readAsBinaryString(this.vArchivoSeleccioado[0]);
    }
    // this.progeso = 0;
  }

  uploadFile() {
    if(!this.filestring) {
      Swal.fire('¡Verificar!', 'Debe seleccionarse un archivo', 'warning');
    } else {
      if(this.vArchivoSeleccioado.length != 0) {
        this.spinner.show();
        this.vFilecontrolService.fnUploadFile(this.filestring,this.vArchivoSeleccioado[0].type, 10, this.url ).subscribe(
          event => {
            if(event.type === HttpEventType.UploadProgress) {
              this.progreso = Math.round((event.loaded / event.total) * 100);
            } else if(event.type === HttpEventType.Response) {
              let res: any = event.body;
              if(res.filename) {
                this.vNameRutaFile = res.filename;
                console.log(res);
                //Para guardar en la BD
                this.legalService.insertOrUpdateContrato(4,`${this.nIdContratoCliente}|${this.vNameRutaFile}`).then((resolve) => {
                  console.log(resolve);
                  Swal.fire({
                    title: 'Su archivo se subió de manera exitosa',
                    icon: 'success',
                    timer: 1500
                  })
                  // let lbl = document.getElementById('lblName').innerHTML;
                  document.getElementById('lblName').innerHTML = "Seleccione Archivo:";
                  this.filestring = '';
                  this.formularioContrato.controls.fileUpload.setValue(null);

                  this.contrato.sRutaArchivo = res.filename;
                  // reader.readAsBinaryString(this.vArchivoSeleccioado[0]);
                },
                (reject) => {
                });
                this.spinner.hide()
              }
            }
          }
        )
      }
    }
  }

  async cargarArchivo() {
    await this.uploadFile();
    const rutaArchivo = this.vNameRutaFile;
  }

  descargarArchivo(sRutaArchivo: string, titulo: string) {

    if(sRutaArchivo !== '') {
      let count = sRutaArchivo.split('.');
      let tipoArchivo = sRutaArchivo.split('.')[count.length - 1];
      this.download(sRutaArchivo,`Documento-${titulo}.${tipoArchivo}`);
    } else {
      Swal.fire({
        title: 'Este contrato no contiene documento',
        icon: 'warning',
        timer: 1500
      });
    }

  }

  descargarDocumentoActual() {
    const url = this.contrato.sRutaArchivo;
    const titulo = this.contrato.sTitulo;
    this.descargarArchivo(url,titulo);
  }

  download(url, filename) {
    fetch(url).then(function(t) {
        return t.blob().then((b)=>{
            var a = document.createElement("a");
            a.href = URL.createObjectURL(b);
            a.setAttribute("download", filename);
            a.click();
            Swal.fire({
              title: 'Su archivo se ha descargado de manera exitosa',
              icon: 'success',
              showCloseButton: true
            });
        }
        );
    });
  }

  async generarArchivoTxt(nIdContratoCliente,comentario) {

    const resp =  await this.legalService.insertOrUpdateContrato(2,`${nIdContratoCliente}|${comentario}`);
    return resp;
  }


  _handleReaderLoaded(readerEvt) {
    var binaryString = readerEvt.target.result;
    this.filestring = btoa(binaryString);
  }

  salir(): void {
    // Este metodo sirve para enviarlo al output
    this.salidaFormulario.emit(1);
  }

  async recargarVistaAddenda(nuevaAddenda: number) {
    const listaContratos = await this.legalService.obtenerInformacionLegal(3,`${this.nIdCliente}|${this.nIdTipoContrato}|${this.nIdEmpresa}`);
    let addenda = listaContratos.find(item => item.nIdContratoCliente === nuevaAddenda);
    this.tipo = 2;
    this.contrato = addenda;
    this.nIdContratoCliente = addenda.nIdContratoCliente;
    this.iniciarVista();
  }

  // Funcionalidad de los botones laterales
  onToggleFab(fab: number, stat: number) {

    stat = ( stat === -1 ) ? ( this.abLista.length > 0 ) ? 0 : 1 : stat;
    this.tsLista = ( stat === 0 ) ? 'inactive' : 'active';
    this.abLista = ( stat === 0 ) ? [] : this.fbLista;

  }

  clickFab(index: number) {
    switch (index) {
      case 0:
        this.registrarContrato();
        break;

      case 1:
        this.salir();
        break;

      default:
        break;
    }
  }

  //#region  Validaciones
  get contratoNoValido() {
    return this.formularioContrato.get('contrato').invalid && this.formularioContrato.get('contrato').touched;
  }
  get suscriptorNoValido() {
    return this.formularioContrato.get('suscriptor').invalid && this.formularioContrato.get('suscriptor').touched;
  }
  get objetoNoValido() {
    return this.formularioContrato.get('objeto').invalid && this.formularioContrato.get('objeto').touched;
  }
  get fechaSuscripcionNoValido() {
    return this.formularioContrato.get('fechaSuscripcion').invalid && this.formularioContrato.get('fechaSuscripcion').touched;
  }
  get fechaInicioNoValido() {
    return this.formularioContrato.get('fechaInicio').hasError("required") && this.formularioContrato.get('fechaInicio').touched;
  }
  get fechaFinNoValido() {
    return this.formularioContrato.get('fechaFin').hasError("required") && this.formularioContrato.get('fechaFin').touched;
  }
  // get addendasNoValido() {
  //   return this.formularioContrato.get('addendas').invalid && this.formularioContrato.get('addendas').touched;
  // }
  // get vigenteNoValido() {
  //   return this.formularioContrato.get('vigente').invalid && this.formularioContrato.get('vigente').touched;
  // }
  get estadoNoValido() {
    return this.formularioContrato.get('estado').invalid && this.formularioContrato.get('estado').touched;
  }

  dateRangeValidator(fechaMinima: string, fechaMaxima: string): ValidatorFn {
    return (formGroup: FormGroup) => {
      let fMin = formGroup.controls[fechaMinima];
      let tMax = formGroup.controls[fechaMaxima];
      if (fMin.value != null && tMax.value != null) {
        if (moment(fMin.value).toDate() > moment(tMax.value).toDate()) {
          fMin.setErrors({ dateRangeValidator: true });
          tMax.setErrors({ dateRangeValidator: true });
        } else {
          fMin.setErrors(null);
          tMax.setErrors(null);
        }
      }
      return {};
    };
  }

  dateRangeAddendaValidator(fechaMinima: string, fechaMaxima: string): ValidatorFn {
    return (formGroup: FormGroup) => {
      let fMin = formGroup.controls[fechaMinima];
      let tMax = formGroup.controls[fechaMaxima];
      if (fMin.value != null && tMax.value != null) {
        if (moment(fMin.value).toDate() >= moment(tMax.value).toDate()) {
          tMax.setErrors({ dateRangeValidator: true });
        } else {
          tMax.setErrors(null);
        }
      }
      return {};
    };
  }

  //#endregion



}
