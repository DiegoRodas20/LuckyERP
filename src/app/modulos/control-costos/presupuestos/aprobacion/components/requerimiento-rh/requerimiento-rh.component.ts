import { Component, OnInit, EventEmitter, Input, Output, ViewChild, ChangeDetectorRef, HostListener } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { NgxSpinnerService } from 'ngx-spinner';
import { PresupuestosService } from '../../../presupuestos.service';
import Swal from 'sweetalert2';
import { Estado } from '../requerimiento-sctr/requerimiento-sctr.component';
import { asistenciapAnimations } from '../../../../../comercial/Asistencia/asistenciap/asistenciap.animations';
import { AprobacionComponent } from '../../aprobacion.component';
import { MatDialog } from '@angular/material/dialog';
import { DialogHistorialDocumentosComponent } from '../dialog-historial-documentos/dialog-historial-documentos.component';
import { MatSort } from '@angular/material/sort';

export interface respuestaAlerta {
  resp: number;
  observacion: string;
}

export interface E_RequerimientoHerramienta {
  nIdGastoCosto: number;
  nIdSolicitante: number;
  sSolicitante: string;
  nIdCentroCosto: number;
  sCentroCosto: string;
  sCliente: string;
  sEjecutivoCuenta: string;
  sServicio: string;
  sCanal: string;
  sFechasCC: string;
  sNumero: string;
  sTitulo: string;
  nIdUsrRegistro: number;
  sUsuarioRegistro: string;
  sFechaRegistro: string;
  sFechaSolicitud: string;
  nIdEstado: number;
  sEstado: string;
  sObservacion: string;
}

export interface E_HerramientaRqDetalle {
  nIdDetalle: number;
  nIdDepositario: number;
  sDepositario: string;
  nIdCargo: number;
  sCargo: string;
  nIdSucursal: number;
  sSucursal: string;
  nIdArticulo: number;
  sHerramienta: string;
  nIdPartida: number;
  sPartida: string;
  nUnidades: number;
  nPrecio: number;
  nTotal: number;
}

@Component({
  selector: 'app-requerimiento-rh',
  templateUrl: './requerimiento-rh.component.html',
  styleUrls: ['./requerimiento-rh.component.css'],
  animations: [asistenciapAnimations]
})
export class RequerimientoRhComponent implements OnInit {

  @Input() data: any;
  @Output() campoActualizado: EventEmitter<any>;
  vRqHerramienta: E_RequerimientoHerramienta;
  listaDetalleCabecera: E_HerramientaRqDetalle[] = [];
  listaHistorial: any;
  estado: any;
  abLista = [];
  tsLista = 'active';
  fbLista = [
    { icon: 'save', tool: 'Crear' }
  ];
  vVerReporte: boolean = false;
  vModifica: boolean = true;
  listaEstado: Estado[];
  form: FormGroup;
  formHistorial: FormGroup;
  displayedColumns: string[] = ["sDepositario", "sCargo", "sSucursal", "sHerramienta", "sPartida", "nUnidades", "nTotal"];
  dataSource: MatTableDataSource<E_HerramientaRqDetalle>;
  nIdPais: any;
  nIdGastoCosto: any;
  step = 0;
  ocultarBotones: boolean = true;

  // Booleano impresion
  vVerReporteImpresionRq = false;

  // Booleano para ver si se esta usando en celular
  vDispEsCelular = false;
  public innerWidth: any;
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  constructor(
    private fb: FormBuilder,
    private fbH: FormBuilder,
    private spinner: NgxSpinnerService,
    private presupuestoService: PresupuestosService,
    public formato: AprobacionComponent,
    private cdRef: ChangeDetectorRef,
    public dialog: MatDialog
  ) {
    this.crearFormulario();
    this.crearFormularioHistorial();
    this.campoActualizado = new EventEmitter();
  }

  async ngOnInit() {

    // Detectamos el dispositivo (Mobile o PC)
    this.vista();

    this.nIdPais = localStorage.getItem('Pais');
    this.spinner.show();

    let lCabecera = await this.presupuestoService.listarDocumentosParaAprobacion(9, `${this.data.nIdGastoCosto}`);
    this.vRqHerramienta = lCabecera[0];
    this.listaDetalleCabecera = await this.presupuestoService.listarDocumentosParaAprobacion(10, `${this.data.nIdGastoCosto}`) as any;


    this.listaHistorial = await this.presupuestoService.listarDocumentosParaAprobacion(5, `${this.data.nIdGastoCosto}|`);
    this.inicializarFormulario();
    // this.inicializarFormularioHistorial(this.listaHistorial);
    this.estado = this.data.nEstado;
    this.nIdGastoCosto = this.data.nIdGastoCosto;
    this.listarEstadoPorCabecera();
    this.dataSource = new MatTableDataSource(this.listaDetalleCabecera);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.verReporte();
    this.spinner.hide();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.vista();
  }

  vista() {
    this.innerWidth = window.innerWidth;
    if (this.innerWidth <= 768) {
      this.vDispEsCelular = true;
    } else {
      this.vDispEsCelular = false;
    }
  }

  onToggleFab(fab: number, stat: number) {

    stat = (stat === -1) ? (this.abLista.length > 0) ? 0 : 1 : stat;
    this.tsLista = (stat === 0) ? 'inactive' : 'active';
    this.abLista = (stat === 0) ? [] : this.fbLista;

  }

  crearFormulario() {
    this.form = this.fb.group({
      solicitante: [null],
      presupuesto: [null],
      cliente: [null],
      ejecutivoCuenta: [null],
      servicio: [null],
      canal: [null],
      fechaPpto: [null],
      titulo: [null],
      fechaSolicitud: [null],
      observaciones: [null],
      montoTotal: [null],
      // Auditoria
      numero: null,
      usuarioCreacion: null,
      fechaCreacion: null,
      estado: null,
    });
  }

  inicializarFormulario() {
    let data = this.vRqHerramienta
    this.form.reset({
      solicitante: data.sSolicitante,
      presupuesto: data.sCentroCosto,
      ejecutivoCuenta: data.sEjecutivoCuenta,
      cliente: data.sCliente,
      fechaPpto: data.sFechasCC,
      servicio: data.sServicio,
      canal: data.sCanal,
      titulo: data.sTitulo,
      fechaSolicitud: data.sFechaSolicitud,
      observaciones: data.sObservacion,
      montoTotal: this.listaDetalleCabecera.reduce((sum, actualValue) => sum + actualValue.nTotal, 0),
      numero: data.sNumero,
      // Auditoria
      usuarioCreacion: data.sUsuarioRegistro,
      fechaCreacion: data.sFechaRegistro,
      estado: data.sEstado,
    });
  }

  crearFormularioHistorial() {
    this.formHistorial = this.fbH.group({
      'userAprobacionComer': [''],
      'userAprobacion': [''],
      'userRechazado': [''],
      'userDevuelto': [''],
    })
  }

  inicializarFormularioHistorial(historial: any) {
    this.formHistorial.reset({
      'userAprobacionComer': historial.aprobadoComercial,
      'userAprobacion': historial.aprobadoPresupuesto,
      'userRechazado': historial.rechazadoPresupuesto,
      'userDevuelto': historial.devueltoPresupuesto,
    })
  }


  listarEstadoPorCabecera() {
    switch (this.estado) {
      case 2053: //Enviado
        this.listaEstado = [
          { name: 'Aprobar', codigo: 2055, disabled: false, accion: 1, icon: 'check' },
          { name: 'Devolver', codigo: 2100, disabled: false, accion: 2, icon: 'undo' },
          { name: 'Rechazar', codigo: 2056, disabled: false, accion: 3, icon: 'clear' },
        ];
        break;
      case 2055: // Aprobado
        this.listaEstado = [
          { name: 'Aprobar', codigo: 2055, disabled: true, accion: 1, icon: 'check' },
          { name: 'Devolver', codigo: 2100, disabled: false, accion: 2, icon: 'undo' },
          { name: 'Rechazar', codigo: 2056, disabled: true, accion: 3, icon: 'clear' },
        ];
        break;
      case 2100: // Devuelto
        this.listaEstado = [
          { name: 'Aprobar', codigo: 2055, disabled: true, accion: 1, icon: 'check' },
          { name: 'Devolver', codigo: 2100, disabled: true, accion: 2, icon: 'undo' },
          { name: 'Rechazar', codigo: 2056, disabled: true, accion: 3, icon: 'clear' },
        ];
        break;
      case 2056: // Rechazado
        this.listaEstado = [
          { name: 'Aprobar', codigo: 2055, disabled: true, accion: 1, icon: 'check' },
          { name: 'Devolver', codigo: 2100, disabled: true, accion: 2, icon: 'undo' },
          { name: 'Rechazar', codigo: 2056, disabled: true, accion: 3, icon: 'clear' },
        ];
        break;
      case 4:
        this.listaEstado = [
          { name: 'Aprobar', codigo: 2055, disabled: true, accion: 1, icon: 'check' },
          { name: 'Devolver', codigo: 2100, disabled: true, accion: 2, icon: 'undo' },
          { name: 'Rechazar', codigo: 2056, disabled: true, accion: 3, icon: 'clear' },
        ];
        break;

    }

  }

  async actualizarEstado(tipo) {
    const user = localStorage.getItem('currentUser');
    const idUser = JSON.parse(window.atob(user.split('.')[1])).uid;
    const pPais = localStorage.getItem('Pais');
    const pEmpresa = localStorage.getItem('Empresa');
    const tipoDoc = this.data.sTipoDoc;
    const nIdGastoCosto = this.data.nIdGastoCosto;
    let idEstado: number;
    let resp: any;
    let respSwet: any;
    /* tipo
      1: Aprobar
      2: Devolver
      3: Rechazar
      4: Cancelar
      0: Cancelar
    */
    switch (tipo) {
      case 1:
        idEstado = 2055;
        respSwet = await this.actualizarMensaje(idEstado, 'Aprobado', 'Aprobar');
        if (respSwet.resp === 1) {
          resp = await this.presupuestoService.actualizarDocumentoAprobar(1, `${this.data.nIdGastoCosto}|${idEstado}|${idUser}|${pPais}|${this.data.nIdUserRegistro}|RH|${respSwet.observacion}|${pEmpresa}`);
          if (resp) {
            // this.campoActualizado.emit(this.data.nIdGastoCosto);
            this.data = await this.presupuestoService.listarDocumentosParaAprobacion(2, `${nIdGastoCosto}|${tipoDoc}`);
            this.campoActualizado.emit(this.data);
          }
        }
        break;
      case 2:
        idEstado = 2100;
        respSwet = await this.actualizarMensaje(idEstado, 'Devuelto', 'Devolver');
        if (respSwet.resp === 1) {
          resp = await this.presupuestoService.actualizarDocumentoAprobar(1, `${this.data.nIdGastoCosto}|${idEstado}|${idUser}|${pPais}|${this.data.nIdUserRegistro}|RH|${respSwet.observacion}|${pEmpresa}`);
          if (resp) {
            this.data = await this.presupuestoService.listarDocumentosParaAprobacion(2, `${nIdGastoCosto}|${tipoDoc}`);
            this.campoActualizado.emit(this.data);
          }
        }
        break;
      case 3:
        idEstado = 2056;
        respSwet = await this.actualizarMensaje(idEstado, 'Rechazado', 'Rechazar');
        if (respSwet.resp === 1) {
          resp = await this.presupuestoService.actualizarDocumentoAprobar(1, `${this.data.nIdGastoCosto}|${idEstado}|${idUser}|${pPais}|${this.data.nIdUserRegistro}|RH|${respSwet.observacion}|${pEmpresa}`);
          if (resp) {
            // this.campoActualizado.emit(this.data.nIdGastoCosto);
            this.data = await this.presupuestoService.listarDocumentosParaAprobacion(2, `${nIdGastoCosto}|${tipoDoc}`);
            this.campoActualizado.emit(this.data);
          }
        }
        break;
      case 4:
        idEstado = 0;
        this.campoActualizado.emit(0);
        break;
      default:
        idEstado = 0;
        break;
    }

  }

  // async actualizacionVista() {
  //   const tipoDoc = this.data.sTipoDoc;
  //   const nIdGastoCosto = this.data.nIdGastoCosto;
  //   this.data = await this.presupuestoService.listarDocumentosParaAprobacion(2, `${nIdGastoCosto}|${tipoDoc}`);
  //   this.listaHistorial = await this.presupuestoService.listarDocumentosParaAprobacion(5, `${this.data.nIdGastoCosto}|`);
  //   this.listaDetalleCabecera = await this.presupuestoService.listarDocumentosParaAprobacion(3, `${this.data.nIdGastoCosto}|${this.nIdPais}`);
  //   this.estado = this.data.nEstado;
  //   this.nIdGastoCosto = this.data.nIdGastoCosto;
  //   this.inicializarFormulario(this.data);
  //   this.inicializarFormularioHistorial(this.listaHistorial);
  //   this.listarEstadoPorCabecera();
  //   this.dataSource = new MatTableDataSource(this.listaDetalleCabecera);
  //   this.dataSource.paginator = this.paginator;
  //   this.dataSource.sort = this.sort;
  //   // this.verReporte();
  //   this.cdRef.detectChanges();
  // }

  async actualizarMensaje(id: number, msj: string, estado: string) {
    let respuestaAlerta: respuestaAlerta;
    let resp = 0;
    let obs = '';
    if (msj === 'Aprobado') {
      await Swal.fire({
        title: `¿Desea ${estado} el Rq de Herramienta(TI)?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        cancelButtonText: 'Cancelar',
        confirmButtonText: 'Aceptar'
      }).then(async (result) => {
        if (result.isConfirmed) {
          Swal.fire({
            title: 'Actualizado',
            text: 'El requerimiento fue ' + msj,
            icon: 'success',
            timer: 1500
          });
          resp = 1;
        }
      });
    } else {
      await Swal.fire({
        title: `¿Desea ${estado} el Rq de Herramienta(TI)?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        cancelButtonText: 'Cancelar',
        confirmButtonText: 'Aceptar'
      }).then(async (result) => {
        if (result.isConfirmed) {
          const { value: observacion } = await Swal.fire({
            title: 'Ingrese el motivo',
            input: 'textarea',
            showCancelButton: true,
            cancelButtonColor: '#d33',
            confirmButtonText: 'Aceptar',
            cancelButtonText: 'Cancelar',
            inputValidator: (value) => {

              if (!value) {
                resp = 0;
                return 'El motivo es obligatorio';
              }

              for (let i = 0; i < value.length; i++) {
                const element = value.charAt(i);
                if (element === '|' || element === '/') {
                  resp = 0;
                  return 'El motivo no puede contener estos caracteres "|" "/"';
                }

              }


            }
          })

          if (observacion) {
            Swal.fire({
              title: 'Actualizado',
              text: 'El requerimiento fue ' + msj,
              icon: 'success',
              timer: 1500
            });
            resp = 1;
            obs = observacion.toString();
          }

          // Swal.fire({
          //   title: 'Actualizado',
          //   text: 'El requerimiento fue '  + msj,
          //   icon: 'success',
          //   timer: 1500
          // });
          // resp = 1;
        }

      });


    }
    respuestaAlerta = {
      resp: resp,
      observacion: obs
    };
    return respuestaAlerta;
  }

  verReporte() {
    this.vVerReporte = true;
  }

  verHistorial(): void {
    const dialogRef = this.dialog.open(DialogHistorialDocumentosComponent, {
      width: '90%',
      height: '65%',
      data: {
        'listaHistorial': this.listaHistorial,
        'cabecera': {
          'presupuesto': `${this.data.sCodCC}  ${this.data.numeroCabecera}`,
          'documento': `${this.data.numeroCabecera}`,
          'cliente': `${this.data.sNombreComercial}`,
          'titulo': `${this.data.sTitulo}`
        },
        'tipo': 1
      }
    });
    dialogRef.afterClosed().subscribe(async result => {
      if (result) {

      }
    })
  }

  fnImprimirReporteRq() {
    const pdfFrame = document.getElementById('pdf-frame') as HTMLIFrameElement;
    const reporte = document.getElementById('print-reporte-rq').innerHTML;
    pdfFrame.contentWindow.document.open();
    pdfFrame.contentWindow.document.write(reporte);
    pdfFrame.contentWindow.document.close();
    pdfFrame.contentWindow.print();
  }

  /*
  fnImprimirRq(){
    this.vVerReporteImpresionRq = true;
    // Agregar nombre al documento
    const tempTitle = document.title;
    document.title = 'Reporte Requerimiento de Herramienta(TI)';
    // Impresion
    setTimeout(()=>{
      window.print();
      this.vVerReporteImpresionRq = false;
    })
    document.title = tempTitle;
    return;
  }
  */

  async fnImprimirCelularReporteRq() {
    const divText = document.getElementById("print-reporte-rq").outerHTML;
    const myWindow = window.open('', '', 'width=985,height=1394');
    const doc = myWindow.document;
    doc.open();
    doc.write(divText);
    doc.close();
    doc.title = 'Reporte Requerimiento de Herramienta';
  }

  setStep(index: number) {
    this.step = index;
  }

  // Detectar el dispositivo
  fnDetectarDispositivo() {
    const dispositivo = navigator.userAgent;
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i.test(dispositivo)) {
      this.vDispEsCelular = true;
    }
    else {
      this.vDispEsCelular = false;
    }
  }

}
