import { HttpResponse } from '@angular/common/http';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { finalize } from 'rxjs/operators';
import { asistenciapAnimations } from 'src/app/modulos/comercial/Asistencia/asistenciap/asistenciap.animations';
import Swal from 'sweetalert2';
import { CompraService } from '../../compra.service';

@Component({
  selector: 'app-lista-articulo',
  templateUrl: './lista-articulo.component.html',
  styleUrls: ['./lista-articulo.component.css'],
  animations: [asistenciapAnimations]
})
export class ListaArticuloComponent implements OnInit {

  // Botones Flotantes Pantalla 
  tsLista = 'inactive';  // Inicia la lista visible
  fbLista = [ // Lista de las opciones que se mostrarán
    { icon: 'add', tool: 'Nuevo' },
  ];
  abLista = [];

  url: string; //variable de un solo valor
  pPais: string;
  empresa: any;
  idUser: number; //id del usuario

  searchKey: string
  listaData: any[] = []
  radioFiltroEstado = new FormControl();
  displayedColumns: string[] = ['opciones', 'Tipo', 'nombre', 'lote', 'categoria', 'marca', 'sImagen', 'sAreaRegistro', 'sEstado'];
  dataSource: MatTableDataSource<any>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  nAgregar: number = 0;
  nDuplicar: number = 0;
  nModificar: number = 0;

  esAdministrador: boolean;

  constructor(
    private spinner: NgxSpinnerService,
    private vDatoBasicoService: CompraService,
    @Inject('BASE_URL') baseUrl: string,
    public dialog: MatDialog,
    private route: Router) { this.url = baseUrl; }


  ngOnInit(): void {
    this.onToggleFab(1, -1);

    this.pPais = localStorage.getItem('Pais');
    this.empresa = localStorage.getItem("Empresa");
    let user = localStorage.getItem('currentUser');
    this.idUser = JSON.parse(window.atob(user.split('.')[1])).uid;
    this.traerPermisos();
    this.fnVerificarTipoUsuario();
    this.radioFiltroEstado.setValue('1');
    const tipo = this.generarValorRadioButton(this.radioFiltroEstado.value);
    this.ListarConteniedo(tipo);
  }

  ListarConteniedo = function (tipo: string) {
    this.spinner.show();

    var pEntidad = 1; //Cabecera del movimiento
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 1;       //Listar Solo Guias de ingreso

    pParametro.push(this.pPais);
    this.vDatoBasicoService.fnDatosArticulo(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
      res => {
        let filtro;
        if (tipo === 'Artículo') {
          filtro = res.filter(item => item.sTipo === tipo);
        }
        if (tipo === 'Servicio') {
          filtro = res.filter(item => item.sTipo === tipo);
        }
        if (tipo === 'Ambos') {
          filtro = res;
        }
        let array = filtro.map(item => {
          return {
            nId: item['nId'],
            Tipo: item['sTipo'],
            categoria: item['categoria'],
            subCategoria: item['subCategoria'],
            marca: item['marca'],
            codigo: item['codigo'],
            nombre: item['nombre'],
            caracteristica: item['caracteristica'],
            unidadPrestacion: item['unidadPrestacion'],
            unidad: item['unidad'],
            lote: item['lote'],
            sEstado: item['sEstado'],
            sImagen: item['sImagen'],
            sAreaRegistro: item['sAreaRegistro'],
            nIdEstado: item['nIdEstado'],
          }
        })
        this.dataSource = new MatTableDataSource(array);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      },
      err => {
        this.spinner.hide();
        console.log(err);
      },
      () => {
        this.spinner.hide();
      }
    );
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  limpiar() {
    this.searchKey = ""
    const tipo = this.generarValorRadioButton(this.radioFiltroEstado.value);
    this.ListarConteniedo(tipo)
  }

  generarValorRadioButton(numero: string): string {
    let tipo: string;
    switch (numero) {
      case '1':
        tipo = 'Ambos';
        break;
      case '2':
        tipo = "Artículo";
        break;
      case '3':
        tipo = "Servicio";
        break;
      default:
        tipo = 'Ambos';
        break;
    }
    return tipo;
  }

  nuevo() {
    var pParametro = [];

    pParametro.push(this.empresa);
    pParametro.push(this.idUser);
    this.vDatoBasicoService.fnDatosArticulo(1, 1, pParametro, 6, this.url).subscribe(data => {
      if (data == 0) {
        Swal.fire({
          title: '¡Atención!',
          text: 'EL usuario actual no cuenta con perfil en la empresa seleccionada',
          icon: 'warning'
        });
        return false;
      }
      else {
        //Cuando cuenta con perfil direccionamos al componente de creación
        this.route.navigate(['/controlcostos/compra/CrearArticulo', 0])
      }
    });
  }

  Editar(termino: number) {
    this.spinner.show();
    var pParametro = [];

    pParametro.push(this.empresa);
    pParametro.push(this.idUser);
    this.vDatoBasicoService.fnDatosArticulo(1, 1, pParametro, 6, this.url).subscribe(data => {
      if (data == 0) {
        Swal.fire({
          title: '¡Atención!',
          text: 'EL usuario actual no cuenta con perfil en la empresa seleccionada',
          icon: 'warning'
        });
        return false;
      }
      else {
        //Cuando cuenta con perfil direccionamos al componente de Modificacion
        this.route.navigate(['/controlcostos/compra/CrearArticulo', termino])
      }
    });

  }

  verImagen(nIdArticulo: number) {
    let parametro = [];
    parametro.push(nIdArticulo);
    this.spinner.show();
    this.vDatoBasicoService.fnDatosArticulo(1, 1, parametro, 5, this.url).pipe(finalize(() => this.spinner.hide())).subscribe(
      data => {
        if (data.sRutaArchivo == "") {
          Swal.fire({ title: 'Este artículo no contiene una imagen', icon: 'warning' });
        } else {
          Swal.fire({
            title: data.sCodArticulo,
            text: data.sNombreProducto,
            imageUrl: data.sRutaArchivo,
            imageHeight: 250
          })
        }
      }, () => { this.spinner.hide() }
    );
  }

  async traerPermisos() {
    try {
      var pParametro = [];
      pParametro.push(this.idUser);
      pParametro.push(this.pPais);

      const { nAgregar, nDuplicar, nModificar } = await this.vDatoBasicoService.fnDatosArticulo(1, 2, pParametro, 10, this.url).toPromise();
      this.nAgregar = nAgregar;
      this.nDuplicar = nDuplicar;
      this.nModificar = nModificar;

    } catch (error) {
      this.nAgregar = 0;
      this.nDuplicar = 0;
      this.nModificar = 0;
      console.log(error);
    }
  }

  async cambioFiltro(estado) {
    let tipo = this.generarValorRadioButton(estado);
    await this.ListarConteniedo(tipo);
  }

  async exportarExcel() {
    this.spinner.show();

    var pEntidad = 0; //Cabecera del movimiento
    var pOpcion = 1;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 1;       //Listar Solo Guias de ingreso

    pParametro.push(this.pPais);
    try {
      const resp: any = await this.vDatoBasicoService.exportarExcelCatologoArticulo(pParametro, this.url);
      this.descargarExcel(resp, 'Reporte Catalogo de Artículos/Servicios');
      this.spinner.hide();
    } catch (error) {
      this.spinner.hide();
      let respuesta: HttpResponse<any> = error;
      if (respuesta.status == 400) {
        Swal.fire({
          title: "El excel no contiene ningún resgistro",
          icon: 'warning',
          timer: 1500
        })
      }
    }



    // if(resp === null) {
    //   this.spinner.hide();
    //   return Swal.fire({
    //     title: 'No se encuentran registros en el excel',
    //     icon: 'warning',
    //     timer: 1500
    //   })
    // } else {
    //   // Descargar el Excel
    //   const data = resp;
    //   const fileName = `Reporte Catalogo de Artículos/Servicios.xlsx`;
    //   if (window.navigator && window.navigator.msSaveOrOpenBlob) {
    //     window.navigator.msSaveOrOpenBlob(data, fileName);
    //     return;
    //   }
    //   const objectUrl = window.URL.createObjectURL(data);
    //   var link = document.createElement('a');
    //   link.href = objectUrl;
    //   link.download = fileName;
    //   // Trigger de descarga
    //   link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
    //   this.spinner.hide();
    //   Swal.fire({
    //     title: 'El Excel ha sido generado',
    //     html: `Si su descarga no ha comenzado, puede descargarlo <a href='${objectUrl}' download="${fileName}">aquí</a>`,
    //     icon: 'success',
    //     showCloseButton: true
    //   })
    // }
    // this.vDatoBasicoService.fnDatosArticulo(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(resp => {
    //   console.log('RES', resp);

    // });
  }

  descargarExcel(response: any, nombreArchivo: string): void {
    // Descargar el Excel
    const data = response;
    const fileName = `${nombreArchivo}.xlsx`;
    if (window.navigator && window.navigator['msSaveOrOpenBlob']) {
      window.navigator['msSaveOrOpenBlob'](data, fileName);
      return;
    }

    const objectUrl = window.URL.createObjectURL(data);
    var link = document.createElement('a');
    link.href = objectUrl;
    link.download = fileName;
    // Trigger de descarga
    link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));

    Swal.fire({
      title: 'El Excel ha sido generado',
      html: `Si su descarga no ha comenzado, puede descargarlo <a href='${objectUrl}' download="${fileName}">aquí</a>`,
      icon: 'success',
      showCloseButton: true
    })
  }

  fnVerificarTipoUsuario(): void {
    let pParametro = [];
    pParametro.push(this.empresa);
    pParametro.push(this.idUser);
    this.vDatoBasicoService.fnDatosArticulo(1, 1, pParametro, 6, this.url).subscribe(res => {
      this.esAdministrador = res == 1758 ? true : false;
    });
  }

  fnSubirArchivos(): void {
    this.spinner.show();
    this.vDatoBasicoService.fnDatosArticulo(2, 2, [], 0, this.url).pipe(finalize(() => this.spinner.hide())).subscribe(
      res => {
        if (res == 0) {
          Swal.fire({ title: 'No se encontraron registros para actualizar', icon: 'info' });
        } else {
          Swal.fire({ title: `Se ha actualizado ${res} registros de manera exitosa`, icon: 'success' });
        }
      },
      (error) => { this.spinner.hide() }
    );
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
        this.nuevo()
        break
      case 1:
        this.exportarExcel()
        break
      case 2:
        this.fnSubirArchivos()
        break
      default:
        break
    }
  }
}
