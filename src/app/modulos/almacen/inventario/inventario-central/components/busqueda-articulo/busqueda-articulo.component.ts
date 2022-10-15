import { Component, OnInit, Inject, ViewChild, HostListener } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { InventarioService } from '../../../inventario.service';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { asistenciapAnimations } from 'src/app/modulos/comercial/Asistencia/asistenciap/asistenciap.animations';
import { NUMPAD_PERIOD } from '@angular/cdk/keycodes';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { ScannerComponent } from '../../scanner/scanner.component';
import Swal from 'sweetalert2';
import { AlmacenesService } from '../../../../almacenes/almacenes.service';
import { NgxSpinnerService } from 'ngx-spinner';


@Component({
  selector: 'app-busqueda-articulo',
  templateUrl: './busqueda-articulo.component.html',
  styleUrls: ['./busqueda-articulo.component.css'],
  animations: [asistenciapAnimations]
})
export class BusquedaArticuloComponent implements OnInit {
  abLista = [];
  tsLista = 'inactive';
  fbLista = [
    { icon: 'save', tool: 'Crear' }
  ];
  mobile: any;
  public innerWidth: any;
  txtFiltro = new FormControl();
  displayedColumns: string[] = [];
  dataSource: any;
  listaEmpresa: any;
  listaArticulo: any;
  listaUbicaciones: any;
  idPais: any;
  idEmpresa: any;
  qrString: string;
  formArticulo: FormGroup;
  articulo: any = '';
  idUser: any;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  constructor(
    private dialog: MatDialog,
    private inventarioService: InventarioService,
    private almacenService: AlmacenesService,
    public diaglogRef: MatDialogRef<BusquedaArticuloComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private spinner: NgxSpinnerService
  ) { }

  async ngOnInit() {
    this.crearFormulario();
    let user = localStorage.getItem('currentUser');
    this.idUser = JSON.parse(window.atob(user.split('.')[1])).uid;
    const vistaPresupuesto = this.formArticulo.get('vistaPresupuesto').value;
    if (vistaPresupuesto) {
      this.displayedColumns = ['opciones', 'marcarMerma', 'sCodUbicacion', 'sCodPresupuesto', 'sCodAlmacen', 'cliente', 'sLote', 'fechaIngreso', 'fechaVencimiento', 'nMarcado', 'nMerma', 'saldo'];
    } else {
      this.displayedColumns = ['opciones', 'sCodUbicacion', 'sCodAlmacen', 'cliente', 'sLote', 'fechaIngreso', 'fechaVencimiento', 'nMarcado', 'nMerma', 'saldo'];
    }
    this.innerWidth = window.innerWidth;
    if (this.innerWidth <= 768) {
      this.mobile = true;
    } else {
      this.mobile = false;
    }
    this.idPais = localStorage.getItem('Pais');
    this.idEmpresa = localStorage.getItem('Empresa');

    this.listaEmpresa = await this.inventarioService.listaInformacionInventario(2, `${this.idPais}`);
    this.listaArticulo = await this.inventarioService.listaInformacionInventario(5, `${this.idPais}`);
    const empresa = this.listaEmpresa.filter(item => item.nIdEmpresa === Number.parseInt(this.idEmpresa));
    if (empresa.length > 0) {
      this.formArticulo.controls.idEmpresa.setValue(empresa[0].nIdEmpresa);
    }
    this.onToggleFab(1, -1)
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

  async busquedaArticuloUbicacion() {
    this.llenarTablaUbicaciones([]);
    this.formArticulo.controls.totalArticulo.setValue('');
    const idArticulo = this.formArticulo.get('idArticulo').value;
    const idEmpresa = this.formArticulo.get('idEmpresa').value;
    const articulo = this.listaArticulo.filter(item => item.nIdArticulo === idArticulo)[0];
    this.articulo = articulo.imagenArticulo;
    if (idArticulo) {
      await this.buscarArticulo(idEmpresa, idArticulo);
    }
  }

  async cambioEmpresa() {
    this.llenarTablaUbicaciones([]);
    this.formArticulo.controls.totalArticulo.setValue('');
    const idEmpresa = this.formArticulo.get('idEmpresa').value;
    const idArticulo = this.formArticulo.get('idArticulo').value;
    if (idArticulo) {
      await this.buscarArticulo(idEmpresa, idArticulo);
    }
  }

  async buscarArticulo(idEmpresa, idArticulo) {
    const vistaPresupuesto = this.formArticulo.get('vistaPresupuesto').value;
    this.spinner.show();
    if (vistaPresupuesto) { // Sin agrupar
      this.listaUbicaciones = await this.inventarioService.listaInformacionInventario(7, `${idArticulo}|${idEmpresa}|0`);
    } else { // Agrupando
      this.listaUbicaciones = await this.inventarioService.listaInformacionInventario(7, `${idArticulo}|${idEmpresa}|1`);
    }
    this.calcularTotalUbicaciones();
    this.listaUbicaciones = this.addNewValueList(this.listaUbicaciones);
    this.llenarTablaUbicaciones(this.listaUbicaciones);
    this.spinner.hide();
  }

  calcularTotalUbicaciones() {
    let total = 0;
    this.listaUbicaciones.forEach(element => {
      total += element.saldo;
    });
    this.formArticulo.controls.totalArticulo.setValue(total);
  }

  crearFormulario() {
    this.formArticulo = this.fb.group({
      'idEmpresa': [''],
      'idArticulo': [''],
      'totalArticulo': [''],
      'vistaPresupuesto': [false]
    });
  }

  llenarTablaUbicaciones(listaUbicaciones) {
    let total = 0;
    this.dataSource = new MatTableDataSource(listaUbicaciones);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  onToggleFab(fab: number, stat: number) {

    stat = (stat === -1) ? (this.abLista.length > 0) ? 0 : 1 : stat;
    this.tsLista = (stat === 0) ? 'inactive' : 'active';
    this.abLista = (stat === 0) ? [] : this.fbLista;

  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  async clean() {
    if (this.dataSource) {
      this.dataSource.filter = '';
    }
    this.txtFiltro.setValue('');
    const idEmpresa = this.formArticulo.get('idEmpresa').value;
    const idArticulo = this.formArticulo.get('idArticulo').value;
    if (idArticulo !== '' && idArticulo !== '') {
      await this.buscarArticulo(idEmpresa, idArticulo);
    }
  }

  salir() {
    this.diaglogRef.close();
  }

  async cambioSlider(event: MatSlideToggleChange) {
    this.llenarTablaUbicaciones([]);
    if (event.checked) {
      this.displayedColumns = ['opciones', 'marcarMerma', 'sCodUbicacion', 'sCodPresupuesto', 'sCodAlmacen', 'cliente', 'sLote', 'fechaIngreso', 'fechaVencimiento', 'nMarcado', 'nMerma', 'saldo'];
    } else {
      this.displayedColumns = ['opciones', 'sCodUbicacion', 'sCodAlmacen', 'cliente', 'sLote', 'fechaIngreso', 'fechaVencimiento', 'nMarcado', 'nMerma', 'saldo'];
    }
    const idEmpresa = this.formArticulo.get('idEmpresa').value;
    const idArticulo = this.formArticulo.get('idArticulo').value;
    if (idArticulo) {
      await this.buscarArticulo(idEmpresa, idArticulo);
      if (this.txtFiltro.value !== '' && this.txtFiltro.value !== null) {
        this.dataSource.filter = this.txtFiltro.value.trim().toLowerCase();
      }
    }

  }

  activarCamara() {
    const dialogRef = this.dialog.open(ScannerComponent, {
      width: '90%',
      height: '90%',
      autoFocus: false,
    });
    dialogRef.afterClosed().subscribe(async respuesta => {
      if (respuesta) {
        if (respuesta === false) {
          return;
        }
        this.spinner.show();
        this.qrString = respuesta.toUpperCase();
        if (this.qrString === '' || this.qrString === ' ') {
          this.formArticulo.controls.idArticulo.setValue('');
          this.formArticulo.controls.totalArticulo.setValue('');
          this.spinner.hide();
          return Swal.fire({
            icon: 'warning',
            text: 'El escaneo trajo vacío por favor intentar nuevamente o revisar el código',
            title: '¡Atención!',
          });
        }
        const idEmpresa = this.formArticulo.get('idEmpresa').value;
        const articulo: any = await this.almacenService.obtenerInformacionUbicacionAlmacen(8, `${this.qrString}`);
        const validarExistencia = this.listaArticulo.filter(item => item.nIdArticulo === articulo.nIdArticulo);
        if (validarExistencia.length > 0) {
          this.formArticulo.controls.idArticulo.setValue(articulo.nIdArticulo);
        } else {
          this.formArticulo.controls.idArticulo.setValue('');
          this.formArticulo.controls.totalArticulo.setValue('');
          this.spinner.hide();
          return Swal.fire({
            icon: 'warning',
            title: '¡Atención!',
            text: 'El artículo escaneado no existe por favor verificarlo',
          });
        }
        await this.buscarArticulo(idEmpresa, articulo.nIdArticulo);
        this.spinner.hide();
      }

    });
  }

  irUbicacion(element) {
    this.diaglogRef.close(element);
  }

  abrirImagen() {
    if (this.articulo) {
      Swal.fire({
        imageUrl: this.articulo,
        imageWidth: 250,
        imageHeight: 250,
      })
    } else {
      Swal.fire({
        icon: 'warning',
        title: '¡Atención!',
        text: 'Este artículo no contiene una imagen',
      });
    }
  }


  agregarMerma(cantidadMerma, ubicacion) {
    let cantidad = Number.parseInt(cantidadMerma);
    if (cantidad <= 0) {
      return Swal.fire({
        title: '¡Atención!',
        text: 'La cantidad tiene que ser mayor a 0',
        icon: 'warning',
      })
    }
    if (ubicacion.saldo < cantidad) {
      return Swal.fire({
        title: '¡Atención!',
        text: 'No hay suficiente cantidad para marcar merma, revisar',
        icon: 'warning',
      })
    }
    if (cantidadMerma !== '') {
      this.listaUbicaciones.map(item => {
        if (item.id === ubicacion.id) {
          item.cantidadMerma = cantidad;
        }
        return item;
      })

    }
  }

  async guardarMerma() {

    //Si no esta en esta visto no va a poder continuar
    if (!this.formArticulo.controls.vistaPresupuesto.value) {
      return Swal.fire({
        title: '¡Atención!',
        text: 'La vista con presupuesto debe estar activida para poder marcar como merma.',
        icon: 'warning',
      })
    }
    this.spinner.show();

    let listaMerma = this.listaUbicaciones.filter(item => item.cantidadMerma > 0);

    // Validamos que ninguno sea menor a 0 y la cantidad colocada no sea mayor a la posible
    const validar = listaMerma.filter(item => item.saldo < item.cantidadMerma);

    if (validar.length > 0) {
      return Swal.fire({
        title: '¡Atención!',
        text: 'La cantidad de la merma no puede exceder al saldo',
        icon: 'warning',
      })
    } else {
      const nIdArticulo = this.formArticulo.get('idArticulo').value;
      for (const articulo of listaMerma) {

        // Salida
        const estaMarcado = articulo.nMarcado;
        const merma = 1;
        const marcado = articulo.nMarcado;
        let parametroSalida = '';
        if (estaMarcado === 1) {
          parametroSalida = `${articulo.nIdUbicacion}|${articulo.nIdAlmacen}|${articulo.nIdCentroCosto}|${nIdArticulo}|${articulo.sLote}|${articulo.fechaIngreso}|${articulo.fechaVencimiento}|${articulo.sObservacion}|0|${articulo.cantidadMerma}|${this.idUser}|${0}|${0}|0|1`;
        } else {
          parametroSalida = `${articulo.nIdUbicacion}|${articulo.nIdAlmacen}|${articulo.nIdCentroCosto}|${nIdArticulo}|${articulo.sLote}|${articulo.fechaIngreso}|${articulo.fechaVencimiento}|${articulo.sObservacion}|0|${articulo.cantidadMerma}|${this.idUser}|${0}|${0}|0|0`;
        }

        const respSalida = await this.inventarioService.insertOrUpdateArticuloInventario(1, parametroSalida);
        let parametroIngreso = `${articulo.nIdUbicacion}|${articulo.nIdAlmacen}|${articulo.nIdCentroCosto}|${nIdArticulo}|${articulo.sLote}|${articulo.fechaIngreso}|${articulo.fechaVencimiento}|${articulo.sObservacion}|${articulo.cantidadMerma}|0|${this.idUser}|${0}|${0}|${merma}|${marcado}`;
        const respIngreso = await this.inventarioService.insertOrUpdateArticuloInventario(1, parametroIngreso);
      }
      const idEmpresa = this.formArticulo.get('idEmpresa').value;
      if (nIdArticulo) {
        await this.buscarArticulo(idEmpresa, nIdArticulo);
        if (this.txtFiltro.value !== '' && this.txtFiltro.value !== null) {
          this.dataSource.filter = this.txtFiltro.value.trim().toLowerCase();
        }
      }
    }


    this.spinner.hide();
  }

  addNewValueList(lista: any[]) {
    lista.forEach(item => {
      item.cantidadMerma = 0;
    })
    return lista;
  }



}
