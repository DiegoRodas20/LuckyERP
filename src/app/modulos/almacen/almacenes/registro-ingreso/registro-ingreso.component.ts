import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { asistenciapAnimations } from 'src/app/modulos/comercial/Asistencia/asistenciap/asistenciap.animations';
import Swal from 'sweetalert2';
import { GuiaIngresoFileComponent } from './guia-ingreso-file/guia-ingreso-file.component';
import { Lista_Registro_Ingreso } from './models/listasIngreso.model';
import { Registro_Ingreso } from './models/registroIngreso.models';
import { RegistroIngresoService } from './registro-ingreso.service';

@Component({
  selector: 'app-registro-ingreso',
  templateUrl: './registro-ingreso.component.html',
  styleUrls: ['./registro-ingreso.component.css'],
  animations: [asistenciapAnimations]
})
export class RegistroIngresoComponent implements OnInit {

  tsLista = 'active';  // Inicia la lista abierta
  abLista = 0;


  lAnios: string[] = [];
  cboAnio = new FormControl();
  sAnio = '';

  lRegistroIngreso: Registro_Ingreso[] = [];
  bEsOrdenCompra = false;
  bEsGuiaLucky = false;
  bEsNotaIngreso = false;
  bEsNotarRecojo = false;
  bEsNotaDetalle = false; //Para ver detalle de las notas rechazadas y devueltas

  url: string; //variable de un solo valor
  idUser: number; //id del usuario
  pNom: string;    //Nombre Usr
  idEmp: string;  //id de la empresa del grupo Actual
  pPais: string;  //Codigo del Pais de la empresa Actual

  //Para el componente nota-ingreso-ri
  sEstadoNotaIngreso: string = '';

  //Elementos para la tabla material
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  dataSource: MatTableDataSource<Registro_Ingreso>;
  displayedColumns = ['nId', 'sNumeroDoc', 'sCentroCosto', 'sDocRef', 'sFecha', 'sAlmacen',
    'sProveedor', 'sGuiaRef', 'nTotalUnd', 'nTotalPeso', 'nTotalVolumen', 'sEstado', 'sSolicitante'];

  pMostrar: number;
  pIdRegistroIngreso: number;

  rbRegIng = new FormControl();
  txtFiltro = new FormControl();

  nOC: number = 0;
  nNI: number = 0;
  nNR: number = 0;
  nGILucky: number = 0;

  bEsLogisticoSatelite: boolean = true;

  constructor(
    private spinner: NgxSpinnerService,
    private vRegIngreso: RegistroIngresoService,
    @Inject('BASE_URL') baseUrl: string,
    public dialog: MatDialog,
    private router: Router,
  ) { this.url = baseUrl; this.pMostrar = 0; }

  async ngOnInit(): Promise<void> {
    let user = localStorage.getItem('currentUser'); //encriptacion del usuario 
    this.idUser = JSON.parse(window.atob(user.split('.')[1])).uid;
    this.pNom = JSON.parse(window.atob(user.split('.')[1])).uno;
    this.idEmp = localStorage.getItem('Empresa');
    this.pPais = localStorage.getItem('Pais');

    await this.fnListarAnios();
    let sAnioActual = moment().year().toString();
    let estaAnioActual = this.lAnios.find(item => item == sAnioActual)

    //Si no esta el año actual lo agregamos
    if (!estaAnioActual) {
      this.lAnios.push(sAnioActual);
    }

    this.cboAnio.setValue(sAnioActual);
    this.sAnio = sAnioActual;

    this.rbRegIng.setValue('GI')

    await this.fnPermisoUsuario();
    await this.fnRevisarTipoUsuario();

    this.fnListarRegistroIngreso();
    this.fnListarCantidadRegistros();

    this.onToggleFab(1, -1);

  }

  //#region Listados para la matTable
  async fnListarRegistroIngreso() {
    this.spinner.show();

    var pEntidad = 1;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 1;       //Listar todos los registros de la tabla   

    pParametro.push(this.idEmp);
    pParametro.push(this.idUser);
    pParametro.push(this.sAnio);

    try {
      const registro = await this.vRegIngreso.fnRegistroIngreso(pEntidad, pOpcion, pParametro, pTipo, null, null, this.url).toPromise()
      this.lRegistroIngreso = registro;
      this.dataSource = new MatTableDataSource(this.lRegistroIngreso);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      this.fnFiltrar();
    } catch (error) {
      console.log(error);
      this.fnLimpiar();
      this.spinner.hide();
    }
  }

  async fnListarOC() {
    this.spinner.show();

    var pEntidad = 2;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 1;       //Listar todos los registros de la tabla    
    pParametro.push(this.idEmp);
    pParametro.push(this.idUser);
    pParametro.push(this.sAnio);

    try {
      const registro = await this.vRegIngreso.fnRegistroIngreso(pEntidad, pOpcion, pParametro, pTipo, null, null, this.url).toPromise()
      this.lRegistroIngreso = registro;
      this.dataSource = new MatTableDataSource(this.lRegistroIngreso);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      this.fnFiltrar();
      this.spinner.hide();
    } catch (error) {
      console.log(error);
      this.fnLimpiar();
      this.spinner.hide();
    }
  }

  async fnListarGuiasIngresoLucky() {
    this.spinner.show();

    var pEntidad = 3;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 1;       //Listar todos los registros de la tabla    
    pParametro.push(this.idEmp);
    pParametro.push(this.idUser);
    pParametro.push(this.sAnio);

    try {
      const registro = await this.vRegIngreso.fnRegistroIngreso(pEntidad, pOpcion, pParametro, pTipo, null, null, this.url).toPromise()
      this.lRegistroIngreso = registro;
      this.dataSource = new MatTableDataSource(this.lRegistroIngreso);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      this.fnFiltrar();
      this.spinner.hide();
    } catch (error) {
      console.log(error);
      this.fnLimpiar();
      this.spinner.hide();
    }
  }

  async fnListarNotasIngreso(nIdEstado: number) {
    this.spinner.show();

    var pEntidad = 4;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 1;       //Listar todos los registros de la tabla    
    pParametro.push(this.idEmp);
    pParametro.push(this.idUser);
    pParametro.push(nIdEstado == 2226 ? '' : nIdEstado);
    pParametro.push(this.sAnio);

    try {
      const registro = await this.vRegIngreso.fnRegistroIngreso(pEntidad, pOpcion, pParametro, pTipo, null, null, this.url).toPromise()
      this.lRegistroIngreso = registro;
      this.dataSource = new MatTableDataSource(this.lRegistroIngreso);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      this.fnFiltrar();

      this.spinner.hide();
    } catch (error) {
      console.log(error);
      this.fnLimpiar();
      this.spinner.hide();
    }
  }

  async fnListarNotasRecojo(nIdEstado: number) {
    this.spinner.show();

    var pEntidad = 5;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 1;       //Listar todos los registros de la tabla    
    pParametro.push(this.idEmp);
    pParametro.push(this.idUser);
    pParametro.push(nIdEstado);
    pParametro.push(this.sAnio);

    try {
      const registro = await this.vRegIngreso.fnRegistroIngreso(pEntidad, pOpcion, pParametro, pTipo, null, null, this.url).toPromise()
      this.lRegistroIngreso = registro;
      this.dataSource = new MatTableDataSource(this.lRegistroIngreso);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      this.fnFiltrar();

      this.spinner.hide();
    } catch (error) {
      console.log(error);
      this.fnLimpiar();
      this.spinner.hide();
    }
  }

  async fnListarNotasDetalle(nIdEstado: number) {
    this.spinner.show();

    //Para notas rechazadas y devueltas
    var pEntidad = 6;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 1;       //Listar todos los registros de la tabla    
    pParametro.push(this.idEmp);
    pParametro.push(this.idUser);
    pParametro.push(nIdEstado);
    pParametro.push(this.sAnio);

    try {
      const registro = await this.vRegIngreso.fnRegistroIngreso(pEntidad, pOpcion, pParametro, pTipo, null, null, this.url).toPromise()
      this.lRegistroIngreso = registro;
      this.dataSource = new MatTableDataSource(this.lRegistroIngreso);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      this.fnFiltrar();

      this.spinner.hide();
    } catch (error) {
      console.log(error);
      this.fnLimpiar();
      this.spinner.hide();
    }
  }

  async fnListarCantidadRegistros() {
    this.spinner.show();

    var pEntidad = 1;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 23;       //Listar todos los registros de la tabla    
    pParametro.push(this.idEmp);
    pParametro.push(this.idUser);
    pParametro.push(this.sAnio);

    try {
      var { nOC, nNI, nNR, nGILucky } = await this.vRegIngreso.fnRegistroIngreso(pEntidad, pOpcion, pParametro, pTipo, null, null, this.url).toPromise()
      this.nOC = nOC;
      this.nNI = nNI;
      this.nNR = nNR;
      this.nGILucky = nGILucky;

      this.spinner.hide();
    } catch (error) {
      console.log(error);
      this.spinner.hide();
    }
  }

  async fnListar(sValor: string) {
    await this.fnListarCantidadRegistros();

    switch (sValor) {
      case 'GI':
        this.fnListarRegistroIngreso();
        break;

      case 'OC':
        this.fnListarOC();
        break;

      case 'NI':
        this.fnListarNotasIngreso(2226);
        break;

      case 'NR':
        this.fnListarNotasRecojo(2226);
        break;

      case 'GI_Lucky':
        this.fnListarGuiasIngresoLucky();
        break;

      case 'N_Dev':
        this.fnListarNotasDetalle(2230);
        break;

      case 'N_Rech':
        this.fnListarNotasDetalle(2267);
        break;

      default:
        break;
    }
  }

  async fnListarAnios() {
    this.spinner.show();

    try {
      var data = await this.vRegIngreso.fnListarAnio(this.url).toPromise() as string[]
      this.lAnios = data;

      this.spinner.hide();
    } catch (error) {
      console.log(error);
      this.spinner.hide();
    }
  }

  fnCambioAnio(sAnio: string) {
    this.sAnio = sAnio;
    this.fnListar(this.rbRegIng.value)
  }

  //#endregion

  fnFiltrar() {
    var filtro = "";

    if (this.txtFiltro.value == null) {
      return;
    }
    filtro = this.txtFiltro.value.trim(); // Remove whitespace
    filtro = filtro.toLowerCase(); // MatTableDataSource defaults to lowercase matches
    this.dataSource.filter = filtro;
  }

  //#region Funciones de interaccion con componentes
  fnAgregarRegistro() {
    this.bEsOrdenCompra = false;
    this.bEsGuiaLucky = false;
    this.bEsNotaIngreso = false;
    this.bEsNotarRecojo = false;
    this.bEsNotaDetalle = false;
    this.pMostrar = 1
    this.pIdRegistroIngreso = 0;
  }

  fnSeleccionarRegistro(row: Registro_Ingreso) {
    this.bEsOrdenCompra = false;
    this.bEsGuiaLucky = false;
    this.bEsNotaIngreso = false;
    this.bEsNotarRecojo = false;
    this.bEsNotaDetalle = false;
    this.pMostrar = 1
    this.pIdRegistroIngreso = row.nId;
  }

  fnProcesarOC(row: Registro_Ingreso) {
    this.pIdRegistroIngreso = row.nId;
    this.bEsOrdenCompra = true;
    this.bEsGuiaLucky = false;
    this.bEsNotaIngreso = false;
    this.bEsNotarRecojo = false;
    this.bEsNotaDetalle = false;
    this.pMostrar = 1
  }

  fnProcesarGuiaLucky(row: Registro_Ingreso) {
    this.pIdRegistroIngreso = row.nId;
    this.bEsOrdenCompra = false;
    this.bEsGuiaLucky = true;
    this.bEsNotaIngreso = false;
    this.bEsNotarRecojo = false;
    this.bEsNotaDetalle = false;
    this.pMostrar = 1
  }

  fnProcesarNotaIngreso(row: Registro_Ingreso) {
    this.pIdRegistroIngreso = row.nId;
    this.bEsOrdenCompra = false;
    this.bEsGuiaLucky = false;
    this.bEsNotaIngreso = true;
    this.bEsNotarRecojo = false;
    this.bEsNotaDetalle = false;
    this.pMostrar = 1
  }

  fnProcesarGuiaRecojo(row: Registro_Ingreso) {
    this.pIdRegistroIngreso = row.nId;
    this.bEsOrdenCompra = false;
    this.bEsGuiaLucky = false;
    this.bEsNotaIngreso = false;
    this.bEsNotaDetalle = false;
    this.bEsNotarRecojo = true;
    this.pMostrar = 1
  }

  fnAgendarNotaIngreso(row: Registro_Ingreso) {
    this.pIdRegistroIngreso = row.nId;
    this.bEsOrdenCompra = false;
    this.bEsGuiaLucky = false;
    this.bEsNotaDetalle = false;
    this.bEsNotaIngreso = true;
    this.sEstadoNotaIngreso = row.sEstado
    this.pMostrar = 2
  }

  fnVerDetalleNota(row: Registro_Ingreso) {
    this.bEsOrdenCompra = false;
    this.bEsGuiaLucky = false;
    this.bEsNotaIngreso = false;
    this.bEsNotarRecojo = false;
    this.bEsNotaDetalle = true;

    this.pMostrar = 1
    this.pIdRegistroIngreso = row.nId;
  }

  fnOcultar(p: number) {
    this.pMostrar = p;
    var value = this.rbRegIng.value;
    this.fnListar(value);
  }

  fnLimpiar() {
    this.lRegistroIngreso = [];
    this.dataSource = new MatTableDataSource(this.lRegistroIngreso);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  fnArchivo(row: Registro_Ingreso) {
    const vRegistro: Lista_Registro_Ingreso = {
      nId: row.nId,
      sDescripcion: row.sNumeroDoc
    }
    this.dialog.open(GuiaIngresoFileComponent, {
      width: '850px',
      maxWidth: '90vw',
      data: vRegistro,
      disableClose: true,
    });

  }
  //#endregion

  //#region Devolver /Rechazar Nota
  async fnDevolverNota(row: Registro_Ingreso) {
    var resp = await Swal.fire({
      title: '¿Desea devolver la nota: ' + row.sDocRef + '?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar'
    })

    if (!resp.isConfirmed) {
      return;
    }

    const { value: observacion } = await Swal.fire({
      title: row.sDocRef,
      text: 'Ingrese el mensaje',
      input: 'textarea',
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Continuar',
      inputValidator: (value) => {
        if (!value) {
          return 'El mensaje es obligatorio';
        }

        if (value.trim() == '') {
          return 'El mensaje es obligatorio';
        }

        if (value.includes('|')) {
          return "El mensaje no puede contener '|'";
        }
      }
    })

    if (!observacion) {
      return;
    }

    this.spinner.show();

    var pEntidad = 6;  //Para actualizar
    var pOpcion = 3;
    var pParametro = [];
    var pTipo = 1;

    pParametro.push(row.nId);
    pParametro.push(this.pPais);
    pParametro.push(this.idUser);
    pParametro.push(observacion);

    try {
      var result = await this.vRegIngreso.fnRegistroIngreso(pEntidad, pOpcion, pParametro, pTipo, null, null, this.url).toPromise()
      if (Number(result) == 1) {
        Swal.fire({
          icon: 'success',
          title: ('Se devolvió de manera correcta la nota: ' + row.sDocRef),
          showConfirmButton: false,
          timer: 1500
        });
        this.fnListar(this.rbRegIng.value);

      } else {
        Swal.fire({
          icon: 'error',
          title: 'No se pudo realizar la actualización, !Revise su conexión a internet!',
          showConfirmButton: false,
          timer: 1500
        });
      }
      this.spinner.hide();
    } catch (error) {
      console.log(error);
      this.spinner.hide();
    }
  }

  async fnRechazarNota(row: Registro_Ingreso) {

    var resp = await Swal.fire({
      title: '¿Desea rechazar la nota: ' + row.sDocRef + '?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar'
    })

    if (!resp.isConfirmed) {
      return;
    }

    const { value: observacion } = await Swal.fire({
      title: row.sDocRef,
      text: 'Ingrese el mensaje',
      input: 'textarea',
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Continuar',
      inputValidator: (value) => {
        if (!value) {
          return 'El mensaje es obligatorio';
        }

        if (value.trim() == '') {
          return 'El mensaje es obligatorio';
        }

        if (value.includes('|')) {
          return "El mensaje no puede contener '|'";
        }
      }
    })

    if (!observacion) {
      return;
    }

    this.spinner.show();

    var pEntidad = 6;  //Para actualizar
    var pOpcion = 3;
    var pParametro = [];
    var pTipo = 2;

    pParametro.push(row.nId);
    pParametro.push(this.pPais);
    pParametro.push(this.idUser);
    pParametro.push(observacion);

    try {
      var result = await this.vRegIngreso.fnRegistroIngreso(pEntidad, pOpcion, pParametro, pTipo, null, null, this.url).toPromise()
      if (Number(result) == 1) {
        Swal.fire({
          icon: 'success',
          title: ('Se rechazó de manera correcta la nota: ' + row.sDocRef),
          showConfirmButton: false,
          timer: 1500
        });
        this.fnListar(this.rbRegIng.value);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'No se pudo realizar la actualización, !Revise su conexión a internet!',
          showConfirmButton: false,
          timer: 1500
        });
      }
      this.spinner.hide();
    } catch (error) {
      console.log(error);
      this.spinner.hide();
    }
  }
  //#endregion

  //#region Boton Ver detalle notas rechazadas y devueltas
  get bVerDetalle() {
    var valor = this.rbRegIng.value
    if (valor == 'NI_Dev' || valor == 'NI_Rech' || valor == 'NR_Dev' || valor == 'NR_Rech') {
      return true;
    }
    return false;
  }
  //#endregion

  //#region Revisar el tipo de usuario
  async fnRevisarTipoUsuario() {
    this.spinner.show();

    var pEntidad = 1;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 24;

    pParametro.push(this.idEmp);
    pParametro.push(this.idUser);

    try {
      //retorna 1 si es logistico satelite, en caso contrario retorna 0
      const response = await this.vRegIngreso.fnRegistroIngreso(pEntidad, pOpcion, pParametro, pTipo, null, null, this.url).toPromise();
      this.spinner.hide();

      this.bEsLogisticoSatelite = response == 0 ? false : true
    } catch (error) {
      console.log(error);
      this.spinner.hide();
    }
  }

  async fnPermisoUsuario() {
    this.spinner.show();

    var pEntidad = 1;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 25;

    pParametro.push(this.idEmp);
    pParametro.push(this.idUser);

    try {
      //retorna 1 si tiene permiso, 0 no tiene permiso
      const response = await this.vRegIngreso.fnRegistroIngreso(pEntidad, pOpcion, pParametro, pTipo, null, null, this.url).toPromise();
      this.spinner.hide();
      if (response == 0) {
        this.router.navigate(['/almacen/almacenes/acceso-restringido'])
      }
    } catch (error) {
      console.log(error);
      this.spinner.hide();
    }
  }
  //#endregion

  // Funcionalidad de los botones laterales
  onToggleFab(fab: number, stat: number) {

    stat = (stat === -1) ? (this.abLista > 0) ? 0 : 1 : stat;
    this.tsLista = (stat === 0) ? 'inactive' : 'active';
    this.abLista = (stat === 0) ? 0 : 3;

  }
}
