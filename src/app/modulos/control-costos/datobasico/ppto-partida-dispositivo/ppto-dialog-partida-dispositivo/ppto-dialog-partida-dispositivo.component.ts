import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';
import { DatoBasicoService } from '../../datobasico.service';
import { E_ListasPartidaDispositivo, E_PartidaDispositivo } from '../../interfaces/tipoDispositovoPartida';

@Component({
  selector: 'app-ppto-dialog-partida-dispositivo',
  templateUrl: './ppto-dialog-partida-dispositivo.component.html',
  styleUrls: ['./ppto-dialog-partida-dispositivo.component.css']
})
export class PptoDialogPartidaDispositivoComponent implements OnInit {

  lEstado = [
    { estado: 1, sDescripcion: 'Activo' },
    { estado: 0, sDescripcion: 'Inactivo' },
  ]

  url: string; //variable de un solo valor
  idUser: number; //id del usuario
  pNom: string;    //Nombre Usr
  idEmp: string;  //id de la empresa del grupo Actual
  pPais: string;  //Codigo del Pais de la empresa Actual


  lPartidaGenerica: E_ListasPartidaDispositivo[] = [];
  lPartidaEspecifica: E_ListasPartidaDispositivo[] = [];
  lTipoDispositivo: E_ListasPartidaDispositivo[] = [];

  sTitulo = '';

  formMatriz: FormGroup
  formMatrizActualizar: FormGroup

  constructor(
    private spinner: NgxSpinnerService,
    private formBuilder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: E_PartidaDispositivo,
    public dialogRef: MatDialogRef<PptoDialogPartidaDispositivoComponent>,
    public dialog: MatDialog,
    private _datoBasicoService: DatoBasicoService,
    @Inject('BASE_URL') baseUrl: string

  ) { this.url = baseUrl; }

  ngOnInit(): void {

    let user = localStorage.getItem('currentUser'); //encriptacion del usuario 
    this.idUser = JSON.parse(window.atob(user.split('.')[1])).uid;
    this.pNom = JSON.parse(window.atob(user.split('.')[1])).uno;
    this.idEmp = localStorage.getItem('Empresa');
    this.pPais = localStorage.getItem('Pais');

    this.formMatriz = this.formBuilder.group({
      cboPartidaGen: [null, Validators.required],
      cboPartidaEsp: [null, Validators.required],
      cboTipoDispositivo: [null, Validators.required],
      cboEstado: [null, Validators.required],
    })

    this.formMatrizActualizar = this.formBuilder.group({
      txtPartidaGen: [null],
      txtPartidaEsp: [null],
      txtTipoDispositivo: [null],
      cboEstado: [null, Validators.required],
    })
  }

  ngAfterViewInit() {
    //Para que no haya error de ngAfterContentChecked
    setTimeout(() => {
      this.fnLLenarForm();
    });

  }

  async fnLLenarForm() {

    //Para modificar
    if (this.data) {

      this.formMatrizActualizar.controls.cboEstado.setValue(this.data.nEstado);
      this.formMatrizActualizar.controls.txtPartidaGen.setValue(this.data.sPartGen);
      this.formMatrizActualizar.controls.txtPartidaEsp.setValue(this.data.sCodPartida + ' - ' + this.data.sPartida);
      this.formMatrizActualizar.controls.txtTipoDispositivo.setValue(this.data.sTipoDispositivo);

      this.sTitulo = 'Modificar Tipo Dispositivo - Partida'
    } else {
      //Para crear
      this.spinner.show();
      await this.fnListarTipoDispositivo()
      await this.fnListarPartGenerica()
  
      this.spinner.hide();

      this.formMatriz.controls.cboEstado.setValue(1);
      this.formMatriz.controls.cboEstado.disable();
      this.sTitulo = 'Agregar Tipo Dispositivo - Partida'
    }
  }

  async fnListarTipoDispositivo() {
    this.spinner.show();

    var pEntidad = 1;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 3;

    try {
      const registro = await this._datoBasicoService.fnTipoDispositivoPartida(pEntidad, pOpcion, pParametro, pTipo, this.url).toPromise()
      this.spinner.hide();

      this.lTipoDispositivo = registro;
    } catch (error) {
      console.log(error);
      this.spinner.hide();
    }
  }

  async fnListarPartGenerica() {
    this.spinner.show();

    var pEntidad = 1;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 1;

    pParametro.push(this.pPais);
    try {
      const registro = await this._datoBasicoService.fnTipoDispositivoPartida(pEntidad, pOpcion, pParametro, pTipo, this.url).toPromise()
      this.spinner.hide();
      this.lPartidaGenerica = registro;
    } catch (error) {
      console.log(error);
      this.spinner.hide();
    }
  }

  async fnListarPartEspecifica(nIdPartGen: number) {

    this.lPartidaEspecifica = [];
    this.formMatriz.controls.cboPartidaEsp.setValue(null);

    this.spinner.show();

    var pEntidad = 1;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 2;

    pParametro.push(this.pPais);
    pParametro.push(nIdPartGen);

    try {
      const registro = await this._datoBasicoService.fnTipoDispositivoPartida(pEntidad, pOpcion, pParametro, pTipo, this.url).toPromise()
      this.spinner.hide();
      this.lPartidaEspecifica = registro;
    } catch (error) {
      console.log(error);
      this.spinner.hide();
    }
  }

  fnGuardar() {
    if (this.data) {
      this.Actualizar();
    } else {
      //Para crear
      this.Crear();
    }


  }

  async Crear() {

    if (this.formMatriz.invalid) {
      Swal.fire({
        icon: 'warning',
        title: 'Advertencia',
        text: 'Revise los datos ingresados.',
      });
      this.formMatriz.markAllAsTouched();
      return;
    }

    let datos = this.formMatriz.value;


    //Validamos que no exista
    var pEntidad1 = 1;
    var pOpcion1 = 2;  //CRUD -> Listar
    var pParametro1 = []; //Parametros de campos vacios
    var pTipo1 = 4;
    pParametro1.push(this.pPais);
    let listaValidar: E_PartidaDispositivo[] = []
    try {
      this.spinner.show();
      listaValidar = await this._datoBasicoService.fnTipoDispositivoPartida(pEntidad1, pOpcion1, pParametro1, pTipo1, this.url).toPromise()
      this.spinner.hide();
    } catch (err) {
      this.spinner.hide();
      return;
    }

    let validar = listaValidar.find(item => item.nIdPartida == datos.cboPartidaEsp && item.nIdTipoDispositivo == datos.cboTipoDispositivo)
    if (validar) {
      Swal.fire({
        icon: 'warning',
        title: 'Advertencia',
        text: 'Ya existe un registro con la partida específica y el tipo dispositivo indicado.',
      });
      this.formMatriz.markAllAsTouched();
      return;
    }

    //Insercion
    var pEntidad = 1;
    var pOpcion = 1;  //CRUD -> Insertar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 0;

    pParametro.push(datos.cboPartidaEsp);
    pParametro.push(datos.cboTipoDispositivo);
    pParametro.push(this.idUser);
    pParametro.push(this.pPais);

    try {
      this.spinner.show();
      let res = await this._datoBasicoService.fnTipoDispositivoPartida(pEntidad, pOpcion, pParametro, pTipo, this.url).toPromise()
      this.spinner.hide();
      if (res == 0) {
        this.spinner.hide();
        Swal.fire(
          'Error', //Titulo
          'No se pudo realizar el ingreso: Verifique su conexion a Internet', //Mensaje html
          'error' //Tipo de mensaje
        ).then((result) => {
        });
      } else {
        //Registrado
        this.spinner.hide();
        await Swal.fire({
          icon: 'success',
          title: 'Correcto',
          text: 'Se guardo el registro.',
          showConfirmButton: false,
          timer: 1500
        });
        this.dialogRef.close();
      }

    } catch (error) {
      console.log(error);
      this.spinner.hide();
    }
  }

  async Actualizar() {
    if (this.formMatrizActualizar.invalid) {
      Swal.fire({
        icon: 'warning',
        title: 'Advertencia',
        text: 'Revise los datos ingresados.',
      });
      this.formMatriz.markAllAsTouched();
      return;
    }

    let datos = this.formMatrizActualizar.value;

    //Insercion
    var pEntidad = 1;
    var pOpcion = 3;  //CRUD -> Actualizar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 0;

    pParametro.push(this.data.nIdPartidaDispositivo);
    pParametro.push(datos.cboEstado);
    
    try {
      this.spinner.show();
      let res = await this._datoBasicoService.fnTipoDispositivoPartida(pEntidad, pOpcion, pParametro, pTipo, this.url).toPromise()
      this.spinner.hide();
      if (res == 0) {
        this.spinner.hide();
        Swal.fire(
          'Error', //Titulo
          'No se pudo realizar el ingreso: Verifique su conexion a Internet', //Mensaje html
          'error' //Tipo de mensaje
        ).then((result) => {
        });
      } else {
        //Registrado
        this.spinner.hide();
        await Swal.fire({
          icon: 'success',
          title: 'Correcto',
          text: 'Se actualizó el registro.',
          showConfirmButton: false,
          timer: 1500
        });
        this.dialogRef.close();
      }

    } catch (error) {
      console.log(error);
      this.spinner.hide();
    }
  }
}
