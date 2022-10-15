import { Component, OnInit, Input, ViewChild, Output, EventEmitter, HostListener } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { NgxSpinnerService } from 'ngx-spinner';
import { PresupuestosService } from '../../../presupuestos.service';
import { Estado } from '../requerimiento-sctr/requerimiento-sctr.component';
import { respuestaAlerta } from '../requerimiento-re/requerimiento-re.component';
import Swal from 'sweetalert2';
import { asistenciapAnimations } from '../../../../../comercial/Asistencia/asistenciap/asistenciap.animations';
import { DialogHistorialDocumentosComponent } from '../dialog-historial-documentos/dialog-historial-documentos.component';
import { MatDialog } from '@angular/material/dialog';
import { MatSort } from '@angular/material/sort';

@Component({
  selector: 'app-requerimiento-rr',
  templateUrl: './requerimiento-rr.component.html',
  styleUrls: ['./requerimiento-rr.component.css'],
  animations: [asistenciapAnimations]
})
export class RequerimientoRrComponent implements OnInit {


  @Input() data: any;
  @Output() campoActualizado: EventEmitter<any>;
  listaDetalleCabecera: any;
  listaHistorial: any;
  estado: any;
  abLista = [];
  tsLista = 'active';
  fbLista = [
    {icon: 'save', tool: 'Crear'}
  ];
  listaEstado: Estado[];
  form: FormGroup;
  formHistorial: FormGroup;
  vVerReporteRR: boolean = false;
  displayedColumns: string[] = ['ciudad', 'partida', 'depositario', 'banco', 'nroCuenta' , 'cantidad' , 'precio' ,'costo'];
  dataSource: MatTableDataSource<any>;
  nIdPais: any;
  ocultarBotones: boolean = true;

  // Booleano impresion
  vVerReporteImpresionRr = false;

  // Booleano para ver si se esta usando en celular
  vDispEsCelular = false;
  public innerWidth: any;
  @ViewChild(MatPaginator, {static: false}) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  constructor(private fb: FormBuilder,
    public dialog: MatDialog,
    private fbH: FormBuilder,
    private spinner: NgxSpinnerService,
    private presupuestoService: PresupuestosService) {
      this.crearFormulario();
      this.crearFormularioHistorial();
      this.campoActualizado = new EventEmitter();
    }

  async ngOnInit() {

    // Detectamos el dispositivo (Mobile o PC)
    this.vista();
    this.nIdPais = localStorage.getItem('Pais');
    this.spinner.show();
    this.listaDetalleCabecera = await this.presupuestoService.listarDocumentosParaAprobacion(3,`${this.data.nIdGastoCosto}|${this.nIdPais}`);
    this.listaHistorial = await this.presupuestoService.listarDocumentosParaAprobacion(5,`${this.data.nIdGastoCosto}|`);
    this.inicializarFormulario(this.data);
    this.inicializarFormularioHistorial(this.listaHistorial);
    this.estado = this.data.nEstado;
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

    stat = ( stat === -1 ) ? ( this.abLista.length > 0 ) ? 0 : 1 : stat;
    this.tsLista = ( stat === 0 ) ? 'inactive' : 'active';
    this.abLista = ( stat === 0 ) ? [] : this.fbLista;

  }


  crearFormulario() {
    this.form = this.fb.group({
      campana: [''],
      cliente: [''],
      solicitante: [''],
      dirCtas: [''],
      ejeCta: [''],
      proveedor: [''],
      titulo: [''],
      estado: [''],
      moneda: [''],
      fecha: [''],
      cambio: [''],
      creado: [''],
      vigencia: [''],
      finalizado: [''],
      total:[''],
      numeroCabecera: ['']
    });
  }

  inicializarFormulario(data) {
    let fechaCreada: Date;
    let fechaInicio: Date;
    let fechaFin: Date;
    fechaCreada = new Date(data.dFecha);
    fechaInicio = new Date(data.fechaInicio);
    fechaFin = new Date(data.fechaFin);
    this.form.reset({
      "campana": `${data.sCodCC} - ${data.sDescCC}`,
      "cliente": data.sNombreComercial,
      'solicitante': data.sFullNom,
      "dirCtas": data.nombreDirector,
      "ejeCta": data.nombreEjecutivo,
      "proveedor": data.aseguradora,
      "titulo": data.sTitulo,
      "estado": data.cEleNam,
      "moneda": data.sDesc,
      "fecha": data.userCreate,
      "cambio": Number(data.tipoCambio).toFixed(4),
      "creado": data.fechaAprobadoComercial,
      'total': data.total,
      "vigencia": `${data.fechaInicioRequerimiento}    al    ${data.fechaFinRequerimiento}`,
      "numeroCabecera": data.numeroCabecera
      // "finalizado": (fechaFinalizado.getMonth() === 0 || fechaFinalizado.getDay() === 0) ? '' : `${fechaFinalizado.getDay()}-${fechaFinalizado.getMonth()}-${fechaFinalizado.getFullYear()}`,
    });
  }

  crearFormularioHistorial() {
    this.formHistorial = this.fb.group({
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
    switch(this.estado){
      case 2053: //Enviado
        this.listaEstado = [
          {name: 'Aprobar', codigo: 2055, disabled: false, accion: 1, icon: 'check'},
          {name: 'Devolver', codigo: 2100, disabled: false, accion: 2, icon: 'undo'},
          {name: 'Rechazar', codigo: 2056, disabled: false, accion: 3, icon: 'clear'},
        ];
        break;
      case 2055: // Aprobado
        this.listaEstado = [
          {name: 'Aprobar', codigo: 2055, disabled: true, accion: 1, icon: 'check'},
          {name: 'Devolver',codigo: 2100, disabled: false, accion: 2, icon: 'undo'},
          {name: 'Rechazar', codigo: 2056, disabled: true, accion: 3, icon: 'clear'},
        ];
        break;
      case 2100: // Devuelto
        this.listaEstado = [
          {name: 'Aprobar', codigo: 2055, disabled: true, accion: 1, icon: 'check'},
          {name: 'Devolver',codigo: 2100, disabled: true, accion: 2, icon: 'undo' },
          {name: 'Rechazar', codigo: 2056, disabled: true, accion: 3, icon: 'clear'},
        ];
        break;
      case 2056: // Rechazado
        this.listaEstado = [
          {name: 'Aprobar', codigo: 2055, disabled: true, accion: 1, icon: 'check'},
          {name: 'Devolver',codigo: 2100, disabled: true, accion: 2, icon: 'undo' },
          {name: 'Rechazar', codigo: 2056, disabled: true, accion: 3, icon: 'clear'},
        ];
        break;
      case 4:
        this.listaEstado = [
          {name: 'Aprobar', codigo: 2055, disabled: true, accion: 1,icon: 'check'},
          {name: 'Devolver',codigo: 2100, disabled: true, accion: 2,icon: 'undo' },
          {name: 'Rechazar', codigo: 2056, disabled: true, accion: 3,icon: 'clear'},
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
          resp = await this.presupuestoService.actualizarDocumentoAprobar(1, `${this.data.nIdGastoCosto}|${idEstado}|${idUser}|${pPais}|${this.data.nIdUserRegistro}|RR|${respSwet.observacion}|${pEmpresa}`);
          if (resp) {
            // this.campoActualizado.emit(this.data.nIdGastoCosto);
            this.data = await this.presupuestoService.listarDocumentosParaAprobacion(2, `${nIdGastoCosto}|${tipoDoc}` );
            this.campoActualizado.emit(this.data);
          }
        }
        break;
      case 2:
        idEstado = 2100;
        respSwet = await this.actualizarMensaje(idEstado, 'Devuelto', 'Devolver');
        if ( respSwet.resp === 1) {
          resp = await this.presupuestoService.actualizarDocumentoAprobar(1, `${this.data.nIdGastoCosto}|${idEstado}|${idUser}|${pPais}|${this.data.nIdUserRegistro}|RR|${respSwet.observacion}|${pEmpresa}`);
          if (resp) {
            // this.campoActualizado.emit(this.data.nIdGastoCosto);
            this.data = await this.presupuestoService.listarDocumentosParaAprobacion(2, `${nIdGastoCosto}|${tipoDoc}` );
            this.campoActualizado.emit(this.data);
          }
        }
        break;
      case 3:
        idEstado = 2056;
        respSwet = await this.actualizarMensaje(idEstado, 'Rechazado', 'Rechazar');
        if ( respSwet.resp === 1) {
          resp = await this.presupuestoService.actualizarDocumentoAprobar(1, `${this.data.nIdGastoCosto}|${idEstado}|${idUser}|${pPais}|${this.data.nIdUserRegistro}|RR|${respSwet.observacion}|${pEmpresa}`);
          if (resp) {
            // this.campoActualizado.emit(this.data.nIdGastoCosto);
            this.data = await this.presupuestoService.listarDocumentosParaAprobacion(2, `${nIdGastoCosto}|${tipoDoc}` );
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

  async actualizarMensaje(id: number, msj: string, estado: string) {
    let respuestaAlerta: respuestaAlerta;
    let resp = 0;
    let obs = '';
    if(msj === 'Aprobado') {
      await Swal.fire({
        title: `¿Desea ${estado} el Rq de reembolso`,
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
            text: 'El requerimiento fue '  + msj,
            icon: 'success',
            timer: 1500
          });
          resp = 1;
        }
      });
    } else {
      await Swal.fire({
        title: `¿Desea ${estado} el Rq de reembolso?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        cancelButtonText: 'Cancelar',
        confirmButtonText: 'Aceptar'
      }).then(async (result) => {
        if (result.isConfirmed) {
          const {value: observacion } = await Swal.fire({
            title: 'Ingrese el motivo' ,
            input: 'textarea',
            showCancelButton: true,
            cancelButtonColor: '#d33',
            confirmButtonText: 'Aceptar',
            cancelButtonText: 'Cancelar',
            inputValidator: (value) => {
              if(!value) {
                resp = 0;
                return 'El motivo es obligatorio';
              }
              for (let i = 0; i < value.length; i++) {
                const element = value.charAt(i);
                if(element === '|' || element === '/') {
                  resp = 0;
                  return 'El motivo no puede contener estos caracteres "|" "/"';
                }

              }
            }
          })

          if(observacion) {
            Swal.fire({
              title: 'Actualizado',
              text: 'El requerimiento fue '  + msj,
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
    this.vVerReporteRR = true;
  }

  verHistorial(): void {
    const dialogRef = this.dialog.open(DialogHistorialDocumentosComponent, {
      width: '90%',
      height: '65%',
      data: {
        'listaHistorial': this.listaHistorial,
        'cabecera': {
          'presupuesto': `${this.data.sCodCC}  ${this.data.numeroCabecera}` ,
          'documento': `${this.data.numeroCabecera}`,
          'cliente': `${this.data.sNombreComercial}`,
          'titulo': `${this.data.sTitulo}`
        },
        'tipo': 1
      }
    });
    dialogRef.afterClosed().subscribe(async result => {
      if(result) {

      }
    })
  }

  fnImprimirReporteRr(){
    const pdfFrame = document.getElementById('pdf-frame') as HTMLIFrameElement;
    const reporte = document.getElementById('print-reporte-rr').innerHTML;
    pdfFrame.contentWindow.document.open();
    pdfFrame.contentWindow.document.write(reporte);
    pdfFrame.contentWindow.document.close();
    pdfFrame.contentWindow.print();
  }

  async fnImprimirCelularReporteRr(){
    const divText = document.getElementById("print-reporte-rr").outerHTML;
    const myWindow = window.open('','','width=985,height=1394');
    const doc = myWindow.document;
    doc.open();
    doc.write(divText);
    doc.close();
    doc.title = 'Reporte Requerimiento de Reembolso';
  }

  // Detectar el dispositivo
  fnDetectarDispositivo(){
    const dispositivo = navigator.userAgent;
    if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i.test(dispositivo)){
      this.vDispEsCelular = true;
    }
    else{
      this.vDispEsCelular = false;
    }
  }

  /*
  fnImprimirRr(){
    this.vVerReporteImpresionRr = true;
    // Agregar nombre al documento
    const tempTitle = document.title;
    document.title = 'Reporte Requerimiento de Reembolso';
    // Impresion
    setTimeout(()=>{
      window.print();
      this.vVerReporteImpresionRr = false;
    })
    document.title = tempTitle;
    return;
  }
  */



}
