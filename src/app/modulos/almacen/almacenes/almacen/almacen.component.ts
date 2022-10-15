import { Component, OnInit, ViewChild, HostListener } from '@angular/core';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { AlmacenesService } from '../almacenes.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { asistenciapAnimations } from '../../../comercial/Asistencia/asistenciap/asistenciap.animations';
import { MatDialog } from '@angular/material/dialog';
import { AgregarAlmacenFisicoComponent } from './components/agregar-almacen-fisico/agregar-almacen-fisico.component';
import Swal from 'sweetalert2';
import { AlmacenUbicacionesComponent } from './almacen-ubicaciones/almacen-ubicaciones.component';
import { MatSort } from '@angular/material/sort';

@Component({
  selector: 'app-almacen',
  templateUrl: './almacen.component.html',
  styleUrls: ['./almacen.component.css'],
  animations: [asistenciapAnimations]
})

export class AlmacenComponent implements OnInit {

  tsLista = 'active';  // Inicia la lista oculta
  fbLista = [ // Lista de las opciones que se mostrarán
    { icon: 'note_add', tool: 'Agregar Almacen' },
    { icon: 'store', tool: 'Almacén Base' },
  ];
  abLista = [];

  displayedColumns: string[] = ['opciones', 'codigo', 'descripcion', 'ubicacion', 'bloqueoComercial', 'estado'];
  form: FormGroup;
  idDireccionBase: number;
  idUser: number;
  pPais: string;
  listaAlmacen: any;
  listaAlmacenFisico: any;

  txtFiltro = new FormControl();
  listaAlmacenUsuario: any;
  listaAlmacenBaseUsuario: any;
  dataSource: any; //= new MatTableDataSource(ELEMENT_DATA);
  mobile: any;
  public innerWidth: any;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  constructor(private dialog: MatDialog,
    private fb: FormBuilder, private almacenService: AlmacenesService, private spinner: NgxSpinnerService) {
    this.crearFormulario();
  }

  async ngOnInit() {

    this.spinner.show();
    let user = localStorage.getItem('currentUser');
    this.idUser = JSON.parse(window.atob(user.split('.')[1])).uid;
    this.pPais = localStorage.getItem('Pais');
    this.innerWidth = window.innerWidth;

    if (this.innerWidth <= 768) {
      this.mobile = true;
    } else {
      this.mobile = false;
    }

    this.listaAlmacen = await this.almacenService.listarInformacionAlmacen(1, `${this.pPais}|0`);

    if (this.listaAlmacen.length > 0) {
      this.form.controls.descripcion.setValue(`${this.listaAlmacen[0].sDesc}`)
      await this.cambioTipo();
    }

    this.onToggleFab(1, -1)
    this.spinner.hide();
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

  filtrarLista(listaAlmacenBaseUsuario: any[], listaAlmacenUsuario: any[]) {
    let lista: any[] = [];
    listaAlmacenUsuario.forEach(almacenUsuario => {
      let almacen = listaAlmacenBaseUsuario.filter(item => item.nIdDireccion === almacenUsuario.nIdDireccion);
      if (almacen.length > 0) {
        lista.push(almacen[0]);
      }
    })
    return lista;
  }

  crearFormulario() {
    this.form = this.fb.group({
      'id': [''],
      'descripcion': [''],
      'ubicacion': [''],
      'direccion': ['']
    });
  }

  fnFiltrar() {
    var filtro = "";
    if (this.txtFiltro.value == null) {
      return;
    }
    filtro = this.txtFiltro.value.trim(); // Remove whitespace
    filtro = filtro.toLowerCase(); // MatTableDataSource defaults to lowercase matches
    this.dataSource.filter = filtro;
  }

  applyFilter(event: Event) {
    const idAlmacenBase = this.form.get('id').value;
    if (idAlmacenBase) {
      const filterValue = (event.target as HTMLInputElement).value;
      this.dataSource.filter = filterValue.trim().toLowerCase();
    }

  }

  async clean() {
    if (this.dataSource) {
      this.dataSource.filter = '';
    }
    this.txtFiltro.setValue('');
    await this.cambioTipo();

  }

  async cambioTipo() {
    this.spinner.show();
    const descripcion = this.form.get('descripcion').value;
    const almacen = this.listaAlmacen.filter(item => item.sDesc === descripcion)[0];
    this.idDireccionBase = almacen.nIdDireccion;
    this.form.controls.id.setValue(`${almacen.nIdAlmacenBase}`)
    this.form.controls.ubicacion.setValue(`${almacen.sGeoUbicacion}`)
    this.form.controls.direccion.setValue(`${almacen.sDireccion}`)
    this.listaAlmacenFisico = await this.almacenService.listarInformacionAlmacen(2, `${almacen.nIdAlmacenBase}|`);
    await this.llenarAlmacenFisico(this.listaAlmacenFisico);

    this.spinner.hide();
  }

  async llenarAlmacenFisico(listaAlmacen) {
    this.dataSource = new MatTableDataSource(listaAlmacen);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    // this.paginator._intl.itemsPerPageLabel = "Registro por página";
  }

  // Acciones

  agregarAlmacen() {
    const idAlmacenBase = this.form.get('id').value;
    if (idAlmacenBase) {
      const dialogRef = this.dialog.open(AgregarAlmacenFisicoComponent, {
        width: '80%',
        height: '50%',
        data: {
          'tipo': 0,
          'data': '',
          'lalmacenFisico': this.listaAlmacenFisico,
          'cabecera': this.form.get('id').value
        },
        disableClose: true
      });
      dialogRef.afterClosed().subscribe(async result => {
        if (result) {
          const tipo = result.tipo;
          const body = result.body;
          const parametro = `${idAlmacenBase}|${body.sCodAlmacen}|${body.sDescripcion}|${body.nTipoUso}|${body.nTipoAlmacen}|${body.nIdEstado}|${body.nIdVerUbicacion}|${this.pPais}|${this.idUser}|${body.operativo}`;
          const resp = await this.almacenService.insertOrUpdateAlmacen(3, parametro);
          if (resp === 1) {
            Swal.fire({
              title: 'El almacén se creo de manera exitosa',
              icon: 'success',
              timer: 1500
            })
            this.listaAlmacenFisico.push(body);
            this.llenarAlmacenFisico(this.listaAlmacenFisico);
          } else {
            Swal.fire({
              title: 'Hubo un incoveniente, comuniquese con sistemas por favor',
              icon: 'warning',
            })
          }
        }
      })
    } else {
      Swal.fire({
        title: 'Primero seleccione un almacén base, por favor',
        icon: 'warning',
      })
    }


  }

  editarElemento(almacen) {
    const dialogRef = this.dialog.open(AgregarAlmacenFisicoComponent, {
      width: '80%',
      height: '50%',
      data: {
        'tipo': 1,
        'data': almacen,
        'lalmacenFisico': this.listaAlmacenFisico,
        'cabecera': this.form.get('id').value
      },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(async result => {
      if (result) {
        const tipo = result.tipo;
        const body = result.body;
        // this.listaAlmacenFisico.push(result);
        const parametro = `${almacen.nIdAlmacen}|${body.sCodAlmacen}|${body.sDescripcion}|${body.nTipoUso}|${body.nTipoAlmacen}|${body.nIdEstado}|${body.nIdVerUbicacion}|${this.pPais}|${this.idUser}|${body.operativo}`;
        const resp = await this.almacenService.insertOrUpdateAlmacen(4, parametro);
        if (resp === 1) {
          this.llenarAlmacenFisico(this.listaAlmacenFisico);
          this.listaAlmacenFisico.map(item => {
            if (item.nIdAlmacen === almacen.nIdAlmacen) {
              item.estado = body.estado;
              item.sDescripcion = body.sDescripcion;
              item.nIdEstado = body.nIdEstado;
              item.nIdVerUbicacion = body.nIdVerUbicacion;
              item.nTipoAlmacen = body.nTipoAlmacen;
              item.nTipoUso = body.nTipoUso;
              item.sCodAlmacen = body.sCodAlmacen;
              item.tipoAlmacen = body.tipoAlmacen;
              item.tipoUso = body.tipoUso;
              item.ubicacion = body.ubicacion;
              item.operativo = body.operativo;
            }
            return item;
          })
          Swal.fire({
            title: 'El almacén se actualizó de manera exitosa',
            icon: 'success',
            timer: 1500
          })

        } else {
          Swal.fire({
            title: 'Hubo un incoveniente, comuniquese con sistemas por favor',
            icon: 'warning',
          })
        }
        // this.llenarAlmacenFisico(this.listaAlmacenFisico);    
      }
    })
  }

  // Agregar Ubicaciones

  async agregarUbicaciones() {
    this.spinner.show();
    const listaAlmacen = await this.almacenService.listarInformacionAlmacen(1, `${this.pPais}|0`);
    this.spinner.hide();
    const dialogRef = this.dialog.open(AlmacenUbicacionesComponent, {
      // width: '80%',
      // height: '65%',
      data: {
        'listaAlmacen': listaAlmacen
      },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(async result => {
      this.listaAlmacen = await this.almacenService.listarInformacionAlmacen(1, `${this.pPais}|0`);
      // if(result) {
      // }
    });
    // const id = this.form.get('id').value;
    // if(id){

    // } else {
    //   return Swal.fire({
    //     title: 'Por favor seleccione un almacén base',
    //     icon: 'warning',
    //     timer: 1500
    //   });
    // }

  }

  //Botones Flotantes

  onToggleFab(fab: number, stat: number) {
    stat = (stat === -1) ? (this.abLista.length > 0) ? 0 : 1 : stat;
    this.tsLista = (stat === 0) ? 'inactive' : 'active';
    this.abLista = (stat === 0) ? [] : this.fbLista;
  }

  clickFab(index: number) {
    switch (index) {
      case 0:
        this.agregarAlmacen()
        break
      case 1:
        this.agregarUbicaciones()
      default:
        break
    }
  }

}
