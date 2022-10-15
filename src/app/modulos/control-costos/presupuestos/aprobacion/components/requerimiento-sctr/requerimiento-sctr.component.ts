import { Component, OnInit, ViewChild, ChangeDetectorRef, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ParametroService } from '../../../../datobasico/parametro.service';
import { PresupuestosService } from '../../../presupuestos.service';
import Swal from 'sweetalert2';
import { NgxSpinnerService } from 'ngx-spinner';
import { asistenciapAnimations } from '../../../../../comercial/Asistencia/asistenciap/asistenciap.animations';
import { MatDialog } from '@angular/material/dialog';
import { DialogHistorialDocumentosComponent } from '../dialog-historial-documentos/dialog-historial-documentos.component';
import { MatSort } from '@angular/material/sort';

export interface respuestaAlerta {
  resp: number;
  observacion: string;
}

export interface Estado {
  name: string;
  codigo: number;
  disabled: boolean;
  accion: number;
  icon: string;
}


@Component({
  selector: 'app-requerimiento-sctr',
  templateUrl: './requerimiento-sctr.component.html',
  styleUrls: ['./requerimiento-sctr.component.css', '../dialog-edit-aprobacion/dialog-edit-aprobacion.component.css'],
  animations: [asistenciapAnimations]
})
export class RequerimientoSctrComponent implements OnInit {

  @Input() data: any;
  estado: any;
  @Output() campoActualizado: EventEmitter<any>;
  form: FormGroup;
  formHistorial: FormGroup;
  listaDetalleCabecera: any;
  listaHistorial: any;
  listaEstado: Estado[];
  displayedColumns: string[] = ['ciudad', 'partida', 'beneficiario', 'costo'];
  abLista = [];
  tsLista = 'active'; 
  fbLista = [
    {icon: 'save', tool: 'Crear'}
  ];
  // dataSource = new MatTableDataSource(ELEMENT_DATA);
  dataSource: MatTableDataSource<any>;
  nIdPais: any;
  nIdGastoCosto: any;
  ocultarBotones: boolean = true;

  // Booleano para ver si se esta usando en celular
  vDispEsCelular = false;
  public innerWidth: any;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort, {static: false}) sort: MatSort;
  constructor( private fb: FormBuilder, private fbH: FormBuilder,
    private cdRef: ChangeDetectorRef,
    public dialog: MatDialog,
    private presupuestoService: PresupuestosService,
    private spinner: NgxSpinnerService) {
    
    this.crearFormulario();
    this.crearFormularioHistorial();
    this.campoActualizado = new EventEmitter();
    
  }

  onToggleFab(fab: number, stat: number) {
    
    stat = ( stat === -1 ) ? ( this.abLista.length > 0 ) ? 0 : 1 : stat;
    this.tsLista = ( stat === 0 ) ? 'inactive' : 'active';
    this.abLista = ( stat === 0 ) ? [] : this.fbLista;
 
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
    this.cdRef.detectChanges();
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
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
  
  crearFormularioHistorial() {
    this.formHistorial = this.fb.group({
      'userAprobacionComer': [''],
      'userAprobacion': [''],
      'userRechazado': [''],
      'userDevuelto': [''],
    })
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
      "vigencia": `${data.fechaInicio}    al    ${data.fechaFin}`,
      "numeroCabecera": data.numeroCabecera
      // "finalizado": (fechaFinalizado.getMonth() === 0 || fechaFinalizado.getDay() === 0) ? '' : `${fechaFinalizado.getDay()}-${fechaFinalizado.getMonth()}-${fechaFinalizado.getFullYear()}`,
    });
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

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  async actualizarEstado(tipo) {
    const user = localStorage.getItem('currentUser');
    const idUser = JSON.parse(window.atob(user.split('.')[1])).uid;
    const pPais = localStorage.getItem('Pais');
    const pEmpresa = localStorage.getItem('Empresa');
    let idEstado: number;
    let resp: any;
    let respSwet: any;
    const tipoDoc = this.data.sTipoDoc; 
    const nIdGastoCosto = this.data.nIdGastoCosto;
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
          resp = await this.presupuestoService.actualizarDocumentoAprobar(1, `${this.data.nIdGastoCosto}|${idEstado}|${idUser}|${pPais}|${this.data.nIdUserRegistro}|SCTR|${respSwet.observacion}|${pEmpresa}`);
          if (resp) {
            // this.campoActualizado.emit(this.data.nIdGastoCosto);
            this.data = await this.presupuestoService.listarDocumentosParaAprobacion(2, `${nIdGastoCosto}|${tipoDoc}` );
            this.campoActualizado.emit(this.data);
            // this.actualizacionVista();
          }
        }
        break;
      case 2:
        idEstado = 2100;
        respSwet = await this.actualizarMensaje(idEstado, 'Devuelto', 'Devolver');
        if ( respSwet.resp === 1) {
          resp = await this.presupuestoService.actualizarDocumentoAprobar(1, `${this.data.nIdGastoCosto}|${idEstado}|${idUser}|${pPais}|${this.data.nIdUserRegistro}|SCTR|${respSwet.observacion}|${pEmpresa}`);
          if (resp) {
            this.data = await this.presupuestoService.listarDocumentosParaAprobacion(2, `${nIdGastoCosto}|${tipoDoc}` );
            this.campoActualizado.emit(this.data);
          }
        }
        break;
      case 3:
        idEstado = 2056;
        respSwet = await this.actualizarMensaje(idEstado, 'Rechazado', 'Rechazar');
        if ( respSwet.resp === 1) {
          resp = await this.presupuestoService.actualizarDocumentoAprobar(1, `${this.data.nIdGastoCosto}|${idEstado}|${idUser}|${pPais}|${this.data.nIdUserRegistro}|SCTR|${respSwet.observacion}|${pEmpresa}`);
          if (resp) {
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

  async actualizacionVista() {
    const tipoDoc = this.data.sTipoDoc; 
    const nIdGastoCosto = this.data.nIdGastoCosto;
    this.data = await this.presupuestoService.listarDocumentosParaAprobacion(2, `${nIdGastoCosto}|${tipoDoc}` );
    this.listaHistorial = await this.presupuestoService.listarDocumentosParaAprobacion(5,`${this.data.nIdGastoCosto}|`);
    this.listaDetalleCabecera = await this.presupuestoService.listarDocumentosParaAprobacion(3,`${this.data.nIdGastoCosto}|${this.nIdPais}`);
    this.estado = this.data.nEstado;
    this.nIdGastoCosto = this.data.nIdGastoCosto;
    this.inicializarFormulario(this.data);
    this.inicializarFormularioHistorial(this.listaHistorial);
    this.listarEstadoPorCabecera();
    this.dataSource = new MatTableDataSource(this.listaDetalleCabecera);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    // this.verReporte();
    this.cdRef.detectChanges();
  }

  async actualizarMensaje(id: number, msj: string, estado: string) {
    let respuestaAlerta: respuestaAlerta;
    let resp = 0;
    let obs = '';
    if(msj === 'Aprobado') {
      await Swal.fire({
        title: `¿Desea ${estado} el Requerimiento de Efectivo?`,
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
        title: `¿Desea ${estado} el Requerimiento de Efectivo?`,
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


}
