import { ChangeDetectorRef, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { asistenciapAnimations } from 'src/app/modulos/comercial/Asistencia/asistenciap/asistenciap.animations';
import Swal from 'sweetalert2';
import { RegistroIngresoService } from '../registro-ingreso/registro-ingreso.service';
import { GuiaSalidaFileComponent } from './guia-salida-file/guia-salida-file.component';
import { Listas_RS } from './models/listasSalida.model';
import { CantidadRegistros, Detalle_Articulo, Registro_Salida } from './models/registroSalida.model';
import { RegistroSalidaService } from './registro-salida.service';


@Component({
  selector: 'app-registro-salida',
  templateUrl: './registro-salida.component.html',
  styleUrls: ['./registro-salida.component.css'],
  animations: [asistenciapAnimations]
})

export class RegistroSalidaComponent implements OnInit {
  tsLista = 'active';  // Inicia la lista abierta
  abLista = 0;

  lAnios: string[] = [];
  cboAnio = new FormControl();
  sAnio = '';

  lRegistroSalida: Registro_Salida[] = [];
  lNotasSalida: Registro_Salida[] = [];
  vCantidadReg: CantidadRegistros;

  url: string; //variable de un solo valor
  idUser: number; //id del usuario
  pNom: string;    //Nombre Usr
  idEmp: string;  //id de la empresa del grupo Actual
  pPais: string;  //Codigo del Pais de la empresa Actual

  //Elementos para la tabla material
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  dataSource: MatTableDataSource<Registro_Salida>;
  displayedColumns = ['nId', 'sNumeroDoc', 'sCentroCosto', 'nNumDocumento', 'sFecha', 'sAlmacen',
    'sCliente', 'sGuiaRef', 'nTotalUnd', 'nTotalPeso', 'nTotalVolumen', 'sEstado', 'sSolicitante'];

  rbGuias = new FormControl();

  pMostrar: number; // 1 para ver detalle de guia, 2 para picking, 3 para anular guia de salida(se muestra el componente de ingreso)
  //  4 para notas courier
  pIdRegistroSalida: number;

  txtFiltro = new FormControl();

  bEsNota: boolean;
  bEsNotaVerDetalle: boolean;

  bEsLogisticoSatelite: boolean = true;

  constructor(
    private spinner: NgxSpinnerService,
    private formBuilder: FormBuilder,
    private router: Router,
    private vRegSalida: RegistroSalidaService,
    private cdr: ChangeDetectorRef,
    public dialog: MatDialog,
    @Inject('BASE_URL') baseUrl: string,
    private vRegIngreso: RegistroIngresoService,
  ) { this.url = baseUrl; this.pMostrar = 0; }

  async ngOnInit(): Promise<void> {
    let user = localStorage.getItem('currentUser'); //encriptacion del usuario 
    this.idUser = JSON.parse(window.atob(user.split('.')[1])).uid;
    this.pNom = JSON.parse(window.atob(user.split('.')[1])).uno;
    this.idEmp = localStorage.getItem('Empresa');
    this.pPais = localStorage.getItem('Pais');

    await this.fnPermisoUsuario();

    await this.fnListarAnios();
    let sAnioActual = moment().year().toString();
    let estaAnioActual = this.lAnios.find(item => item == sAnioActual)

    //Si no esta el año actual lo agregamos
    if (!estaAnioActual) {
      this.lAnios.push(sAnioActual);
    }

    this.cboAnio.setValue(sAnioActual);
    this.sAnio = sAnioActual;

    this.rbGuias.setValue(1);
    await this.fnRevisarTipoUsuario();

    await this.fnListarCantidadRegistro();
    await this.fnListarRegistroSalida();

    this.onToggleFab(1, -1);

  }

  // Funcionalidad de los botones laterales
  onToggleFab(fab: number, stat: number) {

    stat = (stat === -1) ? (this.abLista > 0) ? 0 : 1 : stat;
    this.tsLista = (stat === 0) ? 'inactive' : 'active';
    this.abLista = (stat === 0) ? 0 : 3;

  }

  async fnListarRegistroSalida() {
    this.spinner.show();

    var pEntidad = 1;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 15;       //Listar todos los registros de la tabla    
    pParametro.push(this.idEmp);
    pParametro.push(this.idUser);
    pParametro.push(this.sAnio);

    try {
      const registro = await this.vRegSalida.fnRegistroSalida(pEntidad, pOpcion, pParametro, pTipo, null, this.url).toPromise()
      this.lRegistroSalida = registro;
      this.dataSource = new MatTableDataSource(this.lRegistroSalida);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      this.fnFiltrar();
      this.spinner.hide();
    } catch (error) {
      console.log(error);
      this.fnLimpiar()
      this.spinner.hide();
    }
  }

  async fnListarNotaSalida(idEstado: number) {
    this.spinner.show();

    var pEntidad = 1;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 19;       //Listar todos los registros de la tabla    
    pParametro.push(this.idEmp);
    pParametro.push(idEstado);
    pParametro.push(this.idUser);
    pParametro.push(this.sAnio);

    try {
      const registro = await this.vRegSalida.fnRegistroSalida(pEntidad, pOpcion, pParametro, pTipo, null, this.url).toPromise()
      this.lRegistroSalida = registro;
      this.dataSource = new MatTableDataSource(this.lRegistroSalida);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      this.fnFiltrar();
      this.spinner.hide();
    } catch (error) {
      console.log(error);
      this.fnLimpiar()
      this.spinner.hide();
    }
  }

  async fnListarNotaCourier() {
    this.spinner.show();

    var pEntidad = 4;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 1;       //Listar todos los registros de la tabla    
    pParametro.push(this.idEmp);
    pParametro.push(this.idUser);
    pParametro.push(this.sAnio);

    try {
      const registro = await this.vRegSalida.fnRegistroSalida(pEntidad, pOpcion, pParametro, pTipo, null, this.url).toPromise()
      this.lRegistroSalida = registro;
      this.dataSource = new MatTableDataSource(this.lRegistroSalida);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      this.fnFiltrar();
      this.spinner.hide();
    } catch (error) {
      console.log(error);
      this.fnLimpiar()
      this.spinner.hide();
    }
  }

  async fnListarCantidadRegistro() {
    this.spinner.show();

    var pEntidad = 1;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 22;       //Listar todos los registros de la tabla    
    pParametro.push(this.idEmp);
    pParametro.push(2226);
    pParametro.push(this.idUser);
    pParametro.push(this.sAnio);

    try {
      const registro = await this.vRegSalida.fnRegistroSalida(pEntidad, pOpcion, pParametro, pTipo, null, this.url).toPromise()
      this.vCantidadReg = registro;
      this.spinner.hide();
    } catch (error) {
      console.log(error);
      this.spinner.hide();
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

    let value = this.rbGuias.value;
    switch (value) {
      case 1:
        this.fnListarRegistroSalida(); this.fnListarCantidadRegistro();
        break;
      case 2226:
        this.fnListarNotaSalida(2226); this.fnListarCantidadRegistro();
        break;

      case 2230:
        this.fnListarNotaSalida(2230); this.fnListarCantidadRegistro();
        break;

      case 2267:
        this.fnListarNotaSalida(2267); this.fnListarCantidadRegistro();
        break;

      case 2:
        this.fnListarNotaCourier(); this.fnListarCantidadRegistro();
        break;

      default:
        break;
    }

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

  //Funciones de interaccion con componentes
  fnAgregarRegistro() {
    this.pMostrar = 1
    this.bEsNota = false;
    this.bEsNotaVerDetalle = false;
    this.pIdRegistroSalida = 0;
  }

  fnSeleccionarRegistro(row: Registro_Salida) {
    this.pMostrar = 1
    this.pIdRegistroSalida = row.nId;
    this.bEsNota = false;
    this.bEsNotaVerDetalle = false;

  }

  fnSeleccionarNota(row: Registro_Salida) {
    this.pMostrar = 1
    this.pIdRegistroSalida = row.nId;
    this.bEsNota = true;
    this.bEsNotaVerDetalle = false;
  }

  fnVerDetalleNota(row: Registro_Salida) {
    this.pMostrar = 1
    this.pIdRegistroSalida = row.nId;
    this.bEsNota = false;
    this.bEsNotaVerDetalle = true;
  }

  fnPicking() {
    this.pMostrar = 2
  }

  fnAnularRegistro(row: Registro_Salida) {
    this.pMostrar = 3
    this.pIdRegistroSalida = row.nId;
  }

  fnProcesarNotaCourier(row: Registro_Salida) {
    this.pMostrar = 4;
    this.pIdRegistroSalida = row.nId;
  }

  fnGetIdRegistro(p: number) {
    this.pIdRegistroSalida = p;
  }

  async fnOcultar(p: number) {
    this.pMostrar = p;

    if (p != 3) {//Cuando p==3 se quiere anular una guia de salida desde el componente registroSalidaDetalle
      await this.fnListarCantidadRegistro();
      var value = this.rbGuias.value;

      //Listamos dependiendo de donde este el valor del radio button
      if (value == 1) {
        this.fnListarRegistroSalida();
      } else if (value == 2) {
        this.fnListarNotaCourier();
      } else {
        this.fnListarNotaSalida(value);
      }
    }
  }

  //#region Devolver/rechazar
  async fnDevolverNota(row: Registro_Salida) {
    var resp = await Swal.fire({
      title: '¿Desea devolver la nota: ' + row.sCentroCosto + '-' + row.nNumDocumento + '?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar',
    })

    if (!resp.isConfirmed) {
      return;
    }


    const { value: observacion } = await Swal.fire({
      title: row.sCentroCosto + '-' + row.nNumDocumento,
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

    var pEntidad = 3;  //Para actualizar
    var pOpcion = 1;
    var pParametro = [];
    var pTipo = 0;

    pParametro.push(row.nId);
    pParametro.push(this.pPais);
    pParametro.push(this.idUser);
    pParametro.push(observacion);

    try {
      var { result } = await this.vRegSalida.fnRegistroSalida(pEntidad, pOpcion, pParametro, pTipo, null, this.url).toPromise()
      if (Number(result) == 1) {
        Swal.fire({
          icon: 'success',
          title: ('Se devolvió de manera correcta la nota: ' + row.sCentroCosto + '-' + row.nNumDocumento),
          showConfirmButton: false,
          timer: 1500
        });
        this.fnListarNotaSalida(2226);
        await this.fnListarCantidadRegistro();

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

  async fnRechazarNota(row: Registro_Salida) {

    var resp = await Swal.fire({
      title: '¿Desea rechazar la nota: ' + row.sCentroCosto + '-' + row.nNumDocumento + '?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar',
    })

    if (!resp.isConfirmed) {
      return;
    }

    const { value: observacion } = await Swal.fire({
      title: row.sCentroCosto + '-' + row.nNumDocumento,
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

    var pEntidad = 3;  //Para actualizar
    var pOpcion = 2;
    var pParametro = [];
    var pTipo = 0;

    pParametro.push(row.nId);
    pParametro.push(this.pPais);
    pParametro.push(this.idUser);
    pParametro.push(observacion);

    try {
      var result = await this.vRegSalida.fnRegistroSalida(pEntidad, pOpcion, pParametro, pTipo, null, this.url).toPromise()
      if (Number(result) == 1) {
        Swal.fire({
          icon: 'success',
          title: ('Se rechazó de manera correcta la nota: ' + row.sCentroCosto + '-' + row.nNumDocumento),
          showConfirmButton: false,
          timer: 1500
        });
        this.fnListarNotaSalida(2226);
        await this.fnListarCantidadRegistro();
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

  //#region Enviar nota
  async fnEnviarNota(row: Registro_Salida) {

    try {

      const lDetalle = await this.fnListarNotaCourierArticulos(row.nId)
      if (lDetalle.length == 0) {
        Swal.fire('Error', 'No se pudo realizar la consulta: Verifique su conexion a Internet', 'error');
        this.spinner.hide();
        return;
      }
      //Validando que todos los articulos tengan precio courier mayor de 0
      let msjDetalle = '';

      for (let detalle of lDetalle) {
        if (detalle.nCostoCourier <= 0) {
          msjDetalle = `El artículo: ${detalle.sArticulo}, no puede tener precio courier menor o igual a 0, ingrese al registro para modificarlo!`
          break;
        }
      }
      if (msjDetalle != '') {
        Swal.fire('¡Verificar!', msjDetalle, 'warning')
        return;
      }

      var resp = await Swal.fire({
        title: '¿Desea continuar?',
        text: "Estará pendiente generar la guía en base a la nota: " + row.sCentroCosto + '-' + row.nNumDocumento + ".",
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Aceptar',
        cancelButtonText: 'Cancelar',
      })

      if (!resp.isConfirmed) {
        return;
      }

      this.spinner.show();

      var pEntidad = 4;
      var pOpcion = 3;  //CRUD -> actualizar
      var pParametro = []; //Parametros de campos vacios
      var pTipo = 0;

      pParametro.push(row.nId);
      pParametro.push(this.pPais);
      pParametro.push(this.idUser);

      var { result } = await this.vRegSalida.fnRegistroSalida(pEntidad, pOpcion, pParametro, pTipo, null, this.url).toPromise();

      if (isNaN(result)) {
        Swal.fire('Error', result, 'error');
        this.spinner.hide();
        return;
      }

      if (Number(result) == 0) {
        Swal.fire('Error', 'No se pudo realizar el registro: Verifique su conexion a Internet', 'error');
        this.spinner.hide();
        return;
      }

      Swal.fire('Correcto', 'Se actualizo el registro', 'success');
      this.fnListarNotaCourier();
      this.fnListarCantidadRegistro();
      this.spinner.hide();

    } catch (err) {
      console.log(err);
      this.spinner.hide();
    }
  }

  async fnListarNotaCourierArticulos(nId: number): Promise<Detalle_Articulo[]> {
    this.spinner.show();

    var pEntidad = 4;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 3;

    pParametro.push(nId);

    try {
      const lArticulo: Detalle_Articulo[] = await this.vRegSalida.fnRegistroSalida(pEntidad, pOpcion, pParametro, pTipo, null, this.url).toPromise();
      this.spinner.hide();
      return lArticulo;

    } catch (error) {
      console.log(error);
      this.spinner.hide();
      return [];
    }
  }
  //#endregion

  //#region Notas Salida automatica
  async fnAnularNSAutomatica(row: Registro_Salida) {
    var resp = await Swal.fire({
      title: '¿Desea rechazar la nota: ' + row.sCentroCosto + '-' + row.nNumDocumento + '?',
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

    var bEsConNotaUtil: number;

    var resp = await Swal.fire({
      title: 'Atención',
      text: 'La nota de salida seleccionada fue creada en automático por una Nota Util procesada ¿Desea rechazar tambien la nota util: ' + row.sCodTrasladoNu + '?',
      icon: 'question',
      showDenyButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si',
      denyButtonText: 'No'
    })

    if (resp.isDismissed) {
      return;
    }

    if (resp.isConfirmed) {
      bEsConNotaUtil = 1;
    }

    if (resp.isDenied) {
      bEsConNotaUtil = 0;
    }

    this.spinner.show();

    var pEntidad = 5;  //Para actualizar
    var pOpcion = 1;
    var pParametro = [];
    var pTipo = 0;

    pParametro.push(row.nId);
    pParametro.push(this.pPais);
    pParametro.push(this.idUser);
    pParametro.push(bEsConNotaUtil);

    try {
      var { result } = await this.vRegSalida.fnRegistroSalida(pEntidad, pOpcion, pParametro, pTipo, null, this.url).toPromise()
      if (Number(result) == 1) {
        Swal.fire({
          icon: 'success',
          title: ('Se rechazó de manera correcta la nota: ' + row.sCentroCosto + '-' + row.nNumDocumento),
          showConfirmButton: false,
          timer: 1500
        });
        this.fnListarNotaSalida(2226);
        await this.fnListarCantidadRegistro();
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
  fnLimpiar() {
    this.lRegistroSalida = [];
    this.dataSource = new MatTableDataSource(this.lRegistroSalida);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  fnArchivo(row: Registro_Salida) {
    const vRegistro: Listas_RS = {
      nId: row.nId,
      sDescripcion: row.sNumeroDoc
    }
    this.dialog.open(GuiaSalidaFileComponent, {
      width: '850px',
      maxWidth: '90vw',
      data: vRegistro,
      disableClose: true,
    });

  }

  //#region Revisar el tipo de usuario
  async fnRevisarTipoUsuario() {
    this.spinner.show();

    var pEntidad = 1;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 23;

    pParametro.push(this.idEmp);
    pParametro.push(this.idUser);

    try {
      //retorna 1 si es logistico satelite, en caso contrario retorna 0
      const response = await this.vRegSalida.fnRegistroSalida(pEntidad, pOpcion, pParametro, pTipo, null, this.url).toPromise();
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
    var pTipo = 24;

    pParametro.push(this.idEmp);
    pParametro.push(this.idUser);

    try {
      //retorna 1 si tiene permiso, 0 no tiene permiso
      const response = await this.vRegSalida.fnRegistroSalida(pEntidad, pOpcion, pParametro, pTipo, null, this.url).toPromise();
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
}
