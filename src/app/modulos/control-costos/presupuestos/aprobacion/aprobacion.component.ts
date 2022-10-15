import { Component, OnInit, ChangeDetectorRef, ViewChild, HostListener } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { DialogEditAprobacionComponent } from './components/dialog-edit-aprobacion/dialog-edit-aprobacion.component';
import { FormGroup, FormBuilder } from '@angular/forms';
import { PresupuestosService } from '../presupuestos.service';
import { TrasladoDocumentoService } from '../traslado-documento.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { MatTab } from '@angular/material/tabs';
import { MatPaginator } from '@angular/material/paginator';
import Swal from 'sweetalert2';
import { MatSort } from '@angular/material/sort';

export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
}

export interface Estado {
  codigo: number;
  nombre: string;
}

@Component({
  selector: 'app-aprobacion',
  templateUrl: './aprobacion.component.html',
  styleUrls: ['./aprobacion.component.css']
})
export class AprobacionComponent implements OnInit {
  form: FormGroup;
  listaTipoDocumento: any;
  listaEstados: any;
  listaAnio: string[] = [];
  anio: string = '';
  estado: any;
  tipoDocumento = '';
  entidad: number = 0;
  isDetalleView = false;
  dataCabecera: any;
  listaDocumentos: any;
  listaCantidadRequerimiento: any;
  cantidadsm: any;
  cantidadrp: any;
  cantidadre: any;
  cantidadrr: any;
  cantidadrs: any;
  cantidadrh: any;

  // displayedColumns: string[] = ['opciones', 'presupuesto','documento', 'cliente', 'solicitante', 'titulo','aprobadoCliente' ,'moneda', 'total', 'estado'];
  displayedColumns: string[] = ['opciones', 'presupuesto', 'documento', 'cliente', 'titulo', 'aprobadoCliente', 'moneda', 'total', 'estado'];
  dataSource: any;
  aprobarButtonMasivo = false;
  mobile: any;
  public innerWidth: any;
  @ViewChild('AprobacionTable', { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  constructor(private fb: FormBuilder,
    public dialog: MatDialog,
    private presupuestoService: PresupuestosService,
    private trasladoService: TrasladoDocumentoService,
    private spinner: NgxSpinnerService,
    private cdRef: ChangeDetectorRef) {
    this.crearFormulario();
    this.crearEstados();
    this.innerWidth = window.innerWidth;
    if (this.innerWidth <= 768) {
      this.mobile = true;
    } else {
      this.mobile = false;
    }
  }

  async ngOnInit() {
    this.spinner.show();

    // this.listaTipoDocumento = await this.trasladoService.listarCabeceraDocumentos(4, '');
    this.listaAnio = await this.presupuestoService.listarDocumentosParaAprobacion(8, '') as string[];
    if (this.listaAnio.length >= 0) {
      //Le damos el valor del ultimo año o año actual
      this.anio = this.listaAnio[this.listaAnio.length - 1]
      this.form.controls.anio.setValue(this.anio);
    }
    this.listaTipoDocumento = await this.presupuestoService.listarDocumentosParaAprobacion(4, '');
    this.listaTipoDocumento = await this.listaTipoDocumento.filter(item => item.nEleCod !== 2176);
    this.listaTipoDocumento = await this.listaTipoDocumento.filter(item => item.nEleCod !== 2221);
    this.listaTipoDocumento = await this.listaTipoDocumento.filter(item => item.nEleCod !== 2222);
    this.form.controls.tipo.setValue('RE');
    this.form.controls.estado.setValue(2053);
    this.form.controls.entidad.setValue(2034);
    this.estado = 2053; // Iniciado en el estado enviado
    this.tipoDocumento = 'RE';
    this.entidad = 2034; // Inicia como costo fijo

    this.obtenerCantidadPorAprobar(this.entidad, this.anio);
    await this.buscarDocumentos(this.tipoDocumento, this.estado, this.entidad, this.anio);
    this.spinner.hide();
  }

  async obtenerCantidadPorAprobar(entidad: number, anio: string) {
    this.listaCantidadRequerimiento = await this.presupuestoService.listarDocumentosParaAprobacion(6, `${entidad}|${anio}`);
    this.cantidadre = this.listaCantidadRequerimiento.cantidadRE;
    this.cantidadrs = this.listaCantidadRequerimiento.cantidadSCTR;
    this.cantidadrh = this.listaCantidadRequerimiento.cantidadRH;
    this.cantidadrr = this.listaCantidadRequerimiento.cantidadRR;
    this.cantidadsm = this.listaCantidadRequerimiento.cantidadSM;
    this.cantidadrp = this.listaCantidadRequerimiento.cantidadRP;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.innerWidth = window.innerWidth;
    if (this.innerWidth <= 768) {
      this.mobile = true;
    } else {
      this.mobile = false;
    }
  }

  limpiar() {
    this.buscarDocumentos(this.tipoDocumento, this.estado, this.entidad, this.anio);
  }

  crearFormulario() {
    this.form = this.fb.group({
      tipo: [''],
      estado: [''],
      entidad: ['',],
      anio: ['']
    });
  }

  crearEstados() {
    /*
      El enviado en la base de datos es Aprobado por Operaciones, sin embargo
      aquí sería enviado.
      El aprobado es Aprobado por presupuestos
    */
    let lista: Estado[] = [
      { codigo: 2053, nombre: 'Enviado' },
      { codigo: 2055, nombre: 'Aprobado' },
      { codigo: 2100, nombre: 'Devuelto' },
      { codigo: 2056, nombre: 'Rechazado' },
    ];
    this.listaEstados = lista;
  }

  async cambioEstado(estado) {
    this.cdRef.detectChanges();
    const tipo = this.form.get('tipo').value;
    if (this.entidad) {
      await this.buscarDocumentos(tipo, estado, this.entidad, this.anio);
      this.tipoDocumento = tipo;

      this.estado = estado;
    }

  }

  agregarListaDocumento(lista) {
    const tipo = this.form.get('tipo').value;
    if (tipo === 'SM') {
      this.displayedColumns = ['opciones', 'presupuesto', 'documento', 'cliente', 'aprobadoCliente', 'moneda', 'total', 'estado'];
    } else {
      this.displayedColumns = ['opciones', 'presupuesto', 'documento', 'cliente', 'titulo', 'aprobadoCliente', 'moneda', 'total', 'estado'];
    }
    this.dataSource = new MatTableDataSource(lista);
    this.cdRef.detectChanges();
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.paginator._intl.itemsPerPageLabel = "Registro por página";
  }

  async buscarDocumentos(tipo: string, estado: number, entidad: number, anio: string) {
    if ((tipo !== '' && tipo !== null && tipo !== undefined)
      && (estado !== null && estado !== undefined)) {
      this.spinner.show();
      this.listaDocumentos = await this.presupuestoService.listarDocumentosParaAprobacion(1, `${tipo}|${estado}|${entidad}|${anio}`);
      this.agregarListaDocumento(this.listaDocumentos);
      this.spinner.hide();
    } else {
    }
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  async editarElemento(data) {
    this.dataCabecera = data;
    this.isDetalleView = true;
  }

  async cambioTipo(event) {
    // this.estado = estado;
    if (this.estado && this.entidad) {
      await this.buscarDocumentos(event, this.estado, this.entidad, this.anio);
      this.tipoDocumento = event;
    }


  }

  async cambioEntidad(event) {

    if (this.estado && this.tipoDocumento) {
      await this.obtenerCantidadPorAprobar(event, this.anio);
      await this.buscarDocumentos(this.tipoDocumento, this.estado, event, this.anio);
      this.entidad = event;
    }
  }

  async cambioAnio(event) {

    if (this.estado && this.tipoDocumento) {
      await this.obtenerCantidadPorAprobar(this.entidad, event);
      await this.buscarDocumentos(this.tipoDocumento, this.estado, this.entidad, event);
      this.anio = event;
    }
  }

  async actualizarCampo(event) {
    if (event == 0) {

      this.isDetalleView = false;
      this.spinner.show();
      this.listaDocumentos = await this.presupuestoService.listarDocumentosParaAprobacion(1, `${this.tipoDocumento}|${this.estado}|${this.entidad}|${this.anio}`);
      this.agregarListaDocumento(this.listaDocumentos);
      await this.obtenerCantidadPorAprobar(this.entidad, this.anio);
      this.spinner.hide();
    } else {

      // this.cdRef.detectChanges();
      this.isDetalleView = false;
      this.spinner.show();
      setTimeout(function () {
      }, 1500);
      const data = event;
      this.cdRef.detectChanges();
      this.editarElemento(data);
      this.spinner.hide();
    }


  }

  aprobarTodosLosDocumentos() {
    if (this.listaDocumentos.length === 0) {
      return Swal.fire({
        title: 'No hay documentos pendientes por aprobar',
        icon: 'warning',
        timer: 1500
      });
    }
    const user = localStorage.getItem('currentUser');
    const idUser = JSON.parse(window.atob(user.split('.')[1])).uid;
    const pPais = localStorage.getItem('Pais');
    Swal.fire({
      title: '¿Estás seguro?',
      text: "Todos los documentos se aprobarán",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, aprobar'
    }).then(async (result) => {
      if (result.isConfirmed) {
        this.spinner.show();
        this.listaDocumentos.forEach(async item => {
          await this.presupuestoService.actualizarDocumentoAprobar(1, `${item.nIdGastoCosto}|2055|${idUser}|${pPais}|${item.nIdUserRegistro}|${this.tipoDocumento}`);
        });
        Swal.fire(
          'Actualización',
          'Todos los documentos se aprobaron',
          'success'
        )
        this.spinner.hide();
        this.agregarListaDocumento([]);
        await this.obtenerCantidadPorAprobar(this.entidad, this.anio);
      }
    })

  }

  async buscarDocumentosReque(tipoDocumento: string) {
    this.spinner.show();
    this.tipoDocumento = tipoDocumento;
    this.estado = 2053;
    this.form.controls.tipo.setValue(this.tipoDocumento);
    this.form.controls.estado.setValue(this.estado);
    await this.buscarDocumentos(this.tipoDocumento, this.estado, this.entidad, this.anio);
    this.spinner.hide();

  }
}
