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
import { Listas_RT } from './models/listasTraslado.model';
import { Registro_Traslado } from './models/registroTraslado.model';
import { RegistroTrasladoMasivoComponent } from './registro-traslado-masivo/registro-traslado-masivo.component';
import { RegistroTrasladoService } from './registro-traslado.service';
import { TrasladoFileComponent } from './traslado-file/traslado-file.component';

@Component({
  selector: 'app-registro-traslado',
  templateUrl: './registro-traslado.component.html',
  styleUrls: ['./registro-traslado.component.css'],
  animations: [asistenciapAnimations]
})
export class RegistroTrasladoComponent implements OnInit {
  tsLista = 'active';  // Inicia la lista abierta
  abLista = 0;

  lAnios: string[] = [];
  cboAnio = new FormControl();
  sAnio = '';

  lRegistroTraslado: Registro_Traslado[] = [];

  url: string; //variable de un solo valor
  idUser: number; //id del usuario
  pNom: string;    //Nombre Usr
  idEmp: string;  //id de la empresa del grupo Actual
  pPais: string;  //Codigo del Pais de la empresa Actual

  //Elementos para la tabla material
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  dataSource: MatTableDataSource<Registro_Traslado>;
  displayedColumns = ['nId', 'sNumeroDoc', 'nNumDocumento', 'sFecha', 'sAlmacen', 'sCentroCosto',
    'sAlmacenDestino', 'sCentroCostoDestino', 'sCliente', 'nTotalUnd', 'nTotalPeso', 'nTotalVolumen', 'sEstado', 'sSolicitante'];

  pMostrar: number;
  pIdRegistroSalida: number;
  rbGuias = new FormControl();
  vCantidadNotas = 0;
  nNota = 0; //0 cuando no es nota -- 1 cuando es nota para registrar -- 2 cuando es nota rechazada o devuelta

  txtFiltro = new FormControl();

  bEsLogisticoSatelite: boolean = true;

  constructor(
    private spinner: NgxSpinnerService,
    private formBuilder: FormBuilder,
    private router: Router,
    private vRegTraslado: RegistroTrasladoService,
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

    this.onToggleFab(1, -1);

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

    await this.fnListarRegistroTraslado();
    await this.fnListarCantidadNota();
  }

  // Funcionalidad de los botones laterales
  onToggleFab(fab: number, stat: number) {

    stat = (stat === -1) ? (this.abLista > 0) ? 0 : 1 : stat;
    this.tsLista = (stat === 0) ? 'inactive' : 'active';
    this.abLista = (stat === 0) ? 0 : 3;

  }

  async fnListarRegistroTraslado() {
    this.spinner.show();

    var pEntidad = 1;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 11;       //Listar todos los registros de la tabla    
    pParametro.push(this.idEmp);
    pParametro.push(this.idUser);
    pParametro.push(this.sAnio);

    try {
      const registro = await this.vRegTraslado.fnRegistroTraslado(pEntidad, pOpcion, pParametro, pTipo, null, this.url).toPromise()
      this.lRegistroTraslado = registro;
      this.dataSource = new MatTableDataSource(this.lRegistroTraslado);
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

  async fnListarNotasUtiles(nIdEstado: number) {
    this.spinner.show();

    var pEntidad = 1;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 15;       //Listar todos los registros de la tabla    

    pParametro.push(this.idEmp);
    pParametro.push(nIdEstado);
    pParametro.push(this.idUser);
    pParametro.push(this.sAnio);

    try {
      const notas = await this.vRegTraslado.fnRegistroTraslado(pEntidad, pOpcion, pParametro, pTipo, null, this.url).toPromise()
      this.lRegistroTraslado = notas;
      this.dataSource = new MatTableDataSource(this.lRegistroTraslado);
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

  async fnListarCantidadNota() {
    this.spinner.show();

    var pEntidad = 1;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 14;       //Listar todos los registros de la tabla    
    pParametro.push(this.idEmp);
    pParametro.push(2226);
    pParametro.push(this.idUser);
    pParametro.push(this.sAnio);

    try {
      const notas = await this.vRegTraslado.fnRegistroTraslado(pEntidad, pOpcion, pParametro, pTipo, null, this.url).toPromise()
      this.vCantidadNotas = notas;
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
        this.fnListarRegistroTraslado(); this.fnListarCantidadNota();
        break;
      case 2226:
        this.fnListarNotasUtiles(2226); this.fnListarCantidadNota();
        break;

      case 2230:
        this.fnListarNotasUtiles(2230); this.fnListarCantidadNota();
        break;

      case 2267:
        this.fnListarNotasUtiles(2267); this.fnListarCantidadNota();
        break;

      default:
        break;
    }

  }

  fnAgregarRegistro() {
    this.pMostrar = 1
    this.pIdRegistroSalida = 0;
    this.nNota = 0;
  }

  fnSeleccionarRegistro(row: Registro_Traslado) {
    this.pIdRegistroSalida = row.nId;
    this.pMostrar = 1
    this.nNota = 0;
  }

  fnSeleccionarNota(row: Registro_Traslado) {
    this.pIdRegistroSalida = row.nId;
    this.pMostrar = 1
    this.nNota = 1;
  }

  fnVerDetalleNota(row: Registro_Traslado) {
    this.pIdRegistroSalida = row.nId;
    this.pMostrar = 1
    this.nNota = 2;
  }

  async fnOcultar(p: number) {
    this.pMostrar = p;

    await this.fnListarCantidadNota();
    var value = this.rbGuias.value;

    //Listamos dependiendo de donde este el valor del radio button
    value == 1 ? this.fnListarRegistroTraslado() : this.fnListarNotasUtiles(value)
  }

  fnTrasladoMasivo() {
    this.dialog.open(RegistroTrasladoMasivoComponent, {
      minWidth: '80vW',
      maxWidth: '90vw',
      disableClose: true,
      data: {}
    }).afterClosed().subscribe(data => {
      var value = this.rbGuias.value;

      //Listamos dependiendo de donde este el valor del radio button
      value == 1 ? this.fnListarRegistroTraslado() : this.fnListarNotasUtiles(value);
      this.fnListarCantidadNota();
    })
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

  //#region Devolver /Rechazar Nota
  async fnDevolverNota(row: Registro_Traslado) {
    var resp = await Swal.fire({
      title: '¿Desea devolver la nota: ' + row.sCentroCosto + '-' + row.nNumDocumento + '?',
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
    var pOpcion = 3;
    var pParametro = [];
    var pTipo = 2;

    pParametro.push(row.nId);
    pParametro.push(this.pPais);
    pParametro.push(this.idUser);
    pParametro.push(observacion);

    try {
      var { result } = await this.vRegTraslado.fnRegistroTraslado(pEntidad, pOpcion, pParametro, pTipo, null, this.url).toPromise()
      if (Number(result) == 1) {
        Swal.fire({
          icon: 'success',
          title: ('Se devolvió de manera correcta la nota: ' + row.sCentroCosto + '-' + row.nNumDocumento),
          showConfirmButton: false,
          timer: 1500
        });
        this.fnListarNotasUtiles(2226);
        await this.fnListarCantidadNota();

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

  async fnRechazarNota(row: Registro_Traslado) {

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
    var pOpcion = 3;
    var pParametro = [];
    var pTipo = 3;

    pParametro.push(row.nId);
    pParametro.push(this.pPais);
    pParametro.push(this.idUser);
    pParametro.push(observacion);

    try {
      var { result } = await this.vRegTraslado.fnRegistroTraslado(pEntidad, pOpcion, pParametro, pTipo, null, this.url).toPromise()
      if (Number(result) == 1) {
        Swal.fire({
          icon: 'success',
          title: ('Se rechazó de manera correcta la nota: ' + row.sCentroCosto + '-' + row.nNumDocumento),
          showConfirmButton: false,
          timer: 1500
        });
        this.fnListarNotasUtiles(2226);
        await this.fnListarCantidadNota();
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
    this.lRegistroTraslado = [];
    this.dataSource = new MatTableDataSource(this.lRegistroTraslado);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  fnArchivo(row: Registro_Traslado) {
    const vRegistro: Listas_RT = {
      nId: row.nId,
      sDescripcion: row.sNumeroDoc
    }
    this.dialog.open(TrasladoFileComponent, {
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
    var pTipo = 21;

    pParametro.push(this.idEmp);
    pParametro.push(this.idUser);

    try {
      //retorna 1 si es logistico satelite, en caso contrario retorna 0
      const response = await this.vRegTraslado.fnRegistroTraslado(pEntidad, pOpcion, pParametro, pTipo, null, this.url).toPromise();
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
    var pTipo = 22;

    pParametro.push(this.idEmp);
    pParametro.push(this.idUser);

    try {
      //retorna 1 si tiene permiso, 0 no tiene permiso
      const response = await this.vRegTraslado.fnRegistroTraslado(pEntidad, pOpcion, pParametro, pTipo, null, this.url).toPromise();
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
