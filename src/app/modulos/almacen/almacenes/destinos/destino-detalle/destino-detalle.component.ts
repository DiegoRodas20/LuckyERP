import { Component, Input, OnInit, ViewChild, EventEmitter, Output } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { AlmacenesService } from '../../almacenes.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { MatPaginator } from '@angular/material/paginator';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { DialogDetalleDestinoComponent } from '../dialog-detalle-destino/dialog-detalle-destino.component';
import Swal from 'sweetalert2';
import { asistenciapAnimations } from '../../../../comercial/Asistencia/asistenciap/asistenciap.animations';
import { MatSort } from '@angular/material/sort';
import { HostListener } from '@angular/core';
import { DialogDestinoCargaExcelComponent } from '../destino-carga-excel/destino-carga-excel.component';
import { DestinoValidacionesComponent } from '../destino-validaciones/destino-validaciones.component';

@Component({
  selector: 'app-destino-detalle',
  templateUrl: './destino-detalle.component.html',
  styleUrls: ['./destino-detalle.component.css', '../destinos.component.css'],
  animations: [asistenciapAnimations]
})
export class DestinoDetalleComponent implements OnInit {
  abLista = [];
  tsLista = 'inactive';
  fbLista = [
    { icon: 'save', tool: 'Crear' }
  ];
  mobile: boolean = false;
  displayedColumns: string[] = ['opciones', 'codigo', 'destino', 'despartamento', 'provincia', 'distrito', 'direccion', 'zona', 'estado'];
  dataSource = new MatTableDataSource();
  listaDireccionEntidad: any;
  public innerWidth: any;
  form: FormGroup;
  idUser: string;  //id del usuario del grupo Actual
  pPais: string;  //Codigo del Pais de la empresa Actual
  nIdEmpresa: string; // Código de la empresa
  @Input() destino: any;
  @Output() salida: EventEmitter<number> = new EventEmitter();
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  tituloMatExp = '';

  mostrarBotones: boolean = true;
  constructor(
    private dialog: MatDialog,
    private almacenService: AlmacenesService,
    private spinner: NgxSpinnerService,
    private fb: FormBuilder
  ) {
    this.crearFormulario();
    let user = localStorage.getItem('currentUser');
    this.idUser = JSON.parse(window.atob(user.split('.')[1])).uid;
    this.pPais = localStorage.getItem('Pais');
    this.nIdEmpresa = localStorage.getItem('Empresa');
  }

  ngOnInit() {
    this.innerWidth = window.innerWidth;
    if (this.innerWidth <= 768) {
      this.mobile = true;
    } else {
      this.mobile = false;
    }
    this.listarDirecciones();
    this.onToggleFab(1, -1);

    this.tituloMatExp = this.destino.nombreComercial || this.destino.descripcion
  }

  // Lo usamos para detectar cambios en la pantalla
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.innerWidth = window.innerWidth;
    if (this.innerWidth <= 768) {
      this.mobile = true;
    } else {
      this.mobile = false;
    }
  }

  listarDirecciones(): void {
    this.spinner.show();
    this.almacenService.fnDireccionDestino(1, 2, 1, `${this.destino.nIdEntidad}`).subscribe(res => {
      this.spinner.hide();
      this.listaDireccionEntidad = res;
      this.llenarTablaDirecciones(this.listaDireccionEntidad);
      this.llenarFormulario(this.destino);
    }, () => { this.spinner.hide() });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  clean() {
    this.dataSource.filter = ''
  }

  async llenarTablaDirecciones(listaDireccionDestino: unknown[]) {
    this.dataSource = new MatTableDataSource(listaDireccionDestino);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  crearFormulario() {
    this.form = this.fb.group({
      'cliente': [''],
      'nombre': [''],
      'nombreComercial': [''],
      'tipo': [''],
      'estado': [''],
      'negocio': [0]
    });
  }

  llenarFormulario(cabecera) {
    this.form.reset({
      'cliente': cabecera.codigo,
      'nombre': cabecera.descripcion,
      'nombreComercial': cabecera.nombreComercial,
      'tipo': cabecera.tipo,
      'estado': cabecera.estado === 1 ? 'Activo' : 'Inactivo',
      'negocio': cabecera.negocio
    })
  }

  async agregarDireccion() {
    const validar: any = await this.almacenService.obtenerInformacionDireccionDestino(7, `${this.idUser}|${this.nIdEmpresa}`);
    if (validar.id === 0) {
      return Swal.fire({
        title: validar.mensaje,
        icon: 'warning',
      })
    }
    this.mostrarBotones = false;

    const dialogRef = this.dialog.open(DialogDetalleDestinoComponent, {
      width: '80%',
      disableClose: true,
      data: { 'data': this.destino, 'dataDetalle': '', 'tipo': 0, 'negocio': this.form.get('negocio').value }
    });
    dialogRef.afterClosed().subscribe(async result => {
      this.mostrarBotones = true;
      if (result) {
        const nIdEntidad = this.destino.nIdEntidad;
        const sUbigeo = result.ubicacion;
        const sDescripcion = result.destino;
        const sDireccion = result.direccion;
        const sReferencia = result.referencia;
        const nIdUser = this.idUser;
        const bEstadoDestino = result.estado;
        const nTipoZona = result.idTipoZona;
        const sTipoZona = result.tipoZona;
        const nIdPais = this.pPais;
        const nombreDepartamento = result.nombreDepartamento;
        const nombreProvincia = result.nombreProvincia;
        const nombreDistrito = result.nombreDistrito;
        const latitud = result.latitud;
        const longitud = result.longitud;
        const bModulo = result.bModulo as boolean ? 1 : 0;
        const parameters = `${nIdEntidad}|${sUbigeo}|${sDescripcion}|${sDireccion}|${sReferencia}|${nIdUser}|${bEstadoDestino}|${nTipoZona}|${nIdPais}|${latitud}|${longitud}|${bModulo}`;
        this.spinner.show();
        this.almacenService.fnDireccionDestino(1, 1, 2, parameters).subscribe(res => {
          this.spinner.hide();
          if (res.id === 1) {
            const size = parseInt(this.listaDireccionEntidad[this.listaDireccionEntidad.length - 1].codigo);
            let body = {
              'codigo': this.padLeft(size + 1, 4),
              'departamento': nombreDepartamento,
              'destino': sDescripcion,
              'direccion': sDireccion,
              'distrito': nombreDistrito,
              'estado': bEstadoDestino,
              'idDireccion': 0,
              'idTipoZona': nTipoZona,
              'provincia': nombreProvincia,
              'referencia': sReferencia,
              'tipoZona': sTipoZona,
              'ubicacion': sUbigeo,
              'latitud': latitud,
              'longitud': longitud,
              'bModulo': result.bModulo
            }
            this.listaDireccionEntidad.push(body);
            this.llenarTablaDirecciones(this.listaDireccionEntidad);
            Swal.fire({ title: 'La dirección se agregó de manera exitosa', icon: 'success', timer: 2000 });
          } else {
            Swal.fire({ title: res.mensaje, icon: 'warning' });
          }
        }, () => { this.spinner.hide() })
      }
    });
  }

  verDetalle(data) {
    this.mostrarBotones = false;

    const dialogRef = this.dialog.open(DialogDetalleDestinoComponent, {
      width: '80%',
      //height: '65%',
      disableClose: true,
      data: {
        'data': this.destino,
        'dataDetalle': data,
        'tipo': 1,
        'negocio': this.form.get('negocio').value
      }
    });
    dialogRef.afterClosed().subscribe(async result => {
      this.mostrarBotones = true;

      if (result) {
        const bModulo = result.bModulo as boolean ? 1 : 0;
        const parameters = `${result.idDireccion}|${result.destino}|${result.direccion}|${result.estado}|${result.idTipoZona}|${result.latitud}|${result.longitud}|${result.ubicacion}|${result.referencia}|${bModulo}`;
        this.spinner.show();
        this.almacenService.fnDireccionDestino(1, 2, 2, parameters).subscribe(res => {
          this.spinner.hide();
          if (res.id === 1) {
            this.listaDireccionEntidad.map(item => {
              if (item.idDireccion === result.idDireccion) {
                item.codigo = result.codigo;
                item.departamento = result.nombreDepartamento;
                item.destino = result.destino;
                item.direccion = result.direccion;
                item.distrito = result.nombreDistrito;
                item.estado = result.estado;
                item.idTipoZona = result.idTipoZona;
                item.provincia = result.nombreProvincia;
                item.tipoZona = result.tipoZona;
                item.ubicacion = result.ubicacion;
                item.longitud = result.longitud;
                item.latitud = result.latitud;
                item.bModulo = result.bModulo;
              }
              return item;
            })
            Swal.fire({ title: 'La dirección se actualizó de manera exitosa', icon: 'success', timer: 2000 });
          } else {
            Swal.fire({ title: 'Hubo un incoveniente, comuníquese con sistemas por favor', icon: 'warning' });
          }
        }, () => { this.spinner.hide() });
      }
    })
  }

  onToggleFab(fab: number, stat: number) {
    stat = (stat === -1) ? (this.abLista.length > 0) ? 0 : 1 : stat;
    this.tsLista = (stat === 0) ? 'inactive' : 'active';
    this.abLista = (stat === 0) ? [] : this.fbLista;
  }

  salir() {
    this.salida.emit(0);
  }

  padLeft(value, length) {
    return (value.toString().length < length) ? this.padLeft("0" + value, length) :
      value;
  }

  get clienteField(): FormControl {// retorna el FormContorl del campo cliente
    return this.form.get('cliente') as FormControl;
  }

  /* #region  Método que guarda el archivo excel */
  fnSubirExcel(): void {
    this.mostrarBotones = false;

    this.dialog.open(DialogDestinoCargaExcelComponent, {
      width: '50%',
      height: 'auto',
      disableClose: true,
      autoFocus: false
    }).afterClosed().subscribe((result: File) => {
      this.mostrarBotones = true;
      if (result) {
        this.spinner.show();
        /* #region servicio que verifica validaciones*/
        this.almacenService.fnDestino(result, this.clienteField.value).then(async res => {
          if (res.codigo == 0) {

            const fileName = result.name;
            const pEntidad = 2; //Proceso
            const pTipo = 0;
            const pOpcion = 1; //Guardar excel
            const pParametro = `${this.idUser}|${this.pPais}|${this.clienteField.value}`; // Concatena parametros estáticos

            /* #region  servicio que registra el excel*/
            this.almacenService.guardarExcel(fileName, pEntidad, pTipo, pOpcion, pParametro).subscribe((res) => {
              this.spinner.hide();
              if (res.length > 0) {
                Swal.fire('Información', 'Hay observaciones en el archivo', 'warning')
                this.fnOpenDialogValidaciones({ 'data2': res });
              } else {
                Swal.fire({
                  icon: 'success',
                  title: ('Transacción exitosa'),
                  text: res.resuesta,
                  showConfirmButton: false,
                  timer: 1500
                });
                //Swal.fire('Transacción exitosa', res.resuesta, 'success');
                this.clean();
                this.listarDirecciones();
              }
            },
              (err) => {
                this.spinner.hide();
              }
            );
            /* #endregion */
          } else {
            this.spinner.hide();
            if (res.codigo == 1) {
              Swal.fire('¡Verificar!', 'Se encontraron validaciones en el archivo', 'warning')
              this.fnOpenDialogValidaciones({ 'data': res.listaErrores });
              return;
            }
            if (res.codigo == 2) {
              Swal.fire('¡Verificar!', 'El archivo ingresado no tiene el formato requerido', 'warning')
              return;
            }
          }
        });
        /* #endregion */
      }
    });
  }
  /* #endregion */

  /* #region  Método que muestra el modal de observaciones o validaciones */
  fnOpenDialogValidaciones(obj: any): void {
    this.mostrarBotones = false;

    this.dialog.open(DestinoValidacionesComponent, { width: '50%', height: 'auto', disableClose: true, data: obj })
      .afterClosed().subscribe(data => {
        this.mostrarBotones = true;

      });
  }
  /* #endregion */
}
