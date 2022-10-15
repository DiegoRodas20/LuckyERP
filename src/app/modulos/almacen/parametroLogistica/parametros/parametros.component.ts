import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { resolve } from 'dns';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';
import { Parametro } from '../models/parametro.model';
import { ParametroLogisticaService } from '../parametro-logistica.service';
import { ListaparametrosComponent } from './lista-parametros/listaparametros.component';
import { LogPermisosDeUsuarioArticulosDialogParametrosComponent } from './log-permisos-de-usuario-articulos-dialog-parametros/log-permisos-de-usuario-articulos-dialog-parametros.component';

@Component({
  selector: 'app-parametros',
  templateUrl: './parametros.component.html',
  styleUrls: ['./parametros.component.css']
})
export class ParametrosComponent implements OnInit {

  // Fromularios
  ParametroForm: FormGroup
  // Verificación de que minutos sea mayor a 0.
  options: FormGroup;
  colorControl = new FormControl('primary');
  minutosControl = new FormControl(5, Validators.min(1));

  // Variables
  url: string; //variable de un solo valor
  idUser: number; //id del usuario
  pPais: string;  //Codigo del Pais de la empresa Actual
  idEmp: string;  //id de la empresa del grupo Actual
  nIdParametro: number;//Id del parametro
  lParametro = []; //Array con parametros.
  mostrarBotones = true; // Flag para mostrar y ocultar botones al abrir un dialog / modal
  nombrePais: any; // El nombre del pais de la empresa actual

  detalleExiste: boolean; // Verificar si hay un detalle de la empresa

  // Combobox
  ccTrasladosEmp: [];
  ccExtraCargas: [];
  cbDirecciones: any[] = [];
  cbTransportes: any[] = [];

  //NOTA DEL MISMO DIA HORARIOS
  cboMismoDia = ['06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00', '24:00'];
  cboDiaSabado = ['06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00'];
  cboDiaDomingo = ['06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00'];

  step = 0;

  constructor(fb: FormBuilder, private _builder: FormBuilder,
    private vParLogisticaService: ParametroLogisticaService,
    @Inject('BASE_URL') baseUrl: string,
    private dialog: MatDialog, // Declaracion del Dialog
    private spinner: NgxSpinnerService,
    private ref: ChangeDetectorRef
  ) {
    this.url = baseUrl;
    this.options = fb.group({
      color: this.colorControl
    });
  }


  async ngOnInit(): Promise<void> {
    this.spinner.show();
    //Cargando datos locales del usuarios en variables.
    this.pPais = localStorage.getItem('Pais'); //Pais del usuario
    let user = localStorage.getItem('currentUser'); //encriptacion del usuario
    this.idUser = JSON.parse(window.atob(user.split('.')[1])).uid; //id del usuario
    this.idEmp = localStorage.getItem('Empresa');

    //Definiendo mi formulario ParametroForm
    this.ParametroForm = this._builder.group({
      bNotaMismoDia: [''],
      bBloquearHoraMismoDia: [''],
      sHoraTopeDia: [''],
      bNotaDiaSabado: [''],
      bBloquearHoraDiaSabado: [''],
      sHoraTopeSabado: [''],
      bNotaDiaDomingo: [''],
      bBloquearHoraDiaDomingo: [''],
      sHoraTopeDomingo: [''],
      bCierreAutomatico: [''],
      nCierreAutoTiempo: ['', [Validators.required,Validators.pattern(/^[0-9]+$/),Validators.min(1),Validators.max(60)]],
      bTieneCourier: [''],
      bTieneDistribucion: [''],
      nTaxiPeso: ['', Validators.required],
      nTaxiVolumen: ['', Validators.required],
      nAlmacenMovilPrecio: ['', [Validators.min(0.01)]],
      nAlmacenMovilPeso: ['', Validators.required],

      // Controles detalle parametro
      nIdCcTrasladoEmp: [null],
      nIdCcExtraCargas: [null],
      bGrabaBalanza: [null],
      peso: ['',[Validators.required,Validators.min(1)]],
      volumen: ['',[Validators.required,Validators.min(1)]],
      articuloValoradoPrecioKilo: ['',[Validators.required,Validators.min(1)]],
      articuloValoradoPrecioAdicional: ['',[Validators.required,Validators.min(1)]],
      nuEnvio: [null, [Validators.required]],
      nIdDireccionTransito: [null, [Validators.required]],
      sUbicacion: null,
      sDireccion: null,
      nIdTipoVehiculo: [null, [Validators.required]],
    })

    //Listando los datos de el formulario.
    await this.fnListarComboboxParametrosDetalle();
    await this.fnListarComboboxDireccion();
    await this.fnListarComboboxTransporte();
    await this.fnListarParametro();
    await this.fnRecuperarNombrePais();
    await this.fnListarParametroDetalle();
    this.spinner.hide();
  }

  //#region CRUD Parametro
  async fnRecuperarNombrePais() {
    var pEntidad = 1; //Primera entidad
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 2;       //Listar todos los registros de la tabla

    pParametro.push(this.pPais);//Añadiendo dato pais a la consulta.

    this.nombrePais = await this.vParLogisticaService.fnParametro(pEntidad, pOpcion, pParametro, pTipo, this.url);
  };

  async fnListarParametro() {
    var pEntidad = 1; //Primera entidad
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 1;       //Listar todos los registros de la tabla

    pParametro.push(this.pPais);//Añadiendo dato pais a la consulta.
    this.lParametro = await this.vParLogisticaService.fnParametro(pEntidad, pOpcion, pParametro, pTipo, this.url);
    if(this.lParametro.length > 0 )
    {
      this.nIdParametro = this.lParametro[0].nIdParametro; //Recuperando id del usuario para luego utilizarlo.

      //console.log( this.lParametro[0]);

      //Tomo el valor del formulario y lo igualo a l valor que viene del servicio.
      this.ParametroForm.controls.bNotaMismoDia.setValue(this.lParametro[0].bNotaMismoDia);
      this.ParametroForm.controls.bBloquearHoraMismoDia.setValue(this.lParametro[0].bHoraBloqueoDia);
      this.ParametroForm.controls.sHoraTopeDia.setValue(this.lParametro[0].sHoraTopeDia);
      this.ParametroForm.controls.bNotaDiaSabado.setValue(this.lParametro[0].bNotaSabado);
      this.ParametroForm.controls.bBloquearHoraDiaSabado.setValue(this.lParametro[0].bHoraBloqueoSabado);
      this.ParametroForm.controls.sHoraTopeSabado.setValue(this.lParametro[0].sHoraTopeSabado);
      this.ParametroForm.controls.bNotaDiaDomingo.setValue(this.lParametro[0].bNotaDomingo);
      this.ParametroForm.controls.bBloquearHoraDiaDomingo.setValue(this.lParametro[0].bHoraBloqueoDomingo);
      this.ParametroForm.controls.sHoraTopeDomingo.setValue(this.lParametro[0].sHoraTopeDomingo);
      this.ParametroForm.controls.bCierreAutomatico.setValue(this.lParametro[0].bCierreAutomatico);
      this.ParametroForm.controls.nCierreAutoTiempo.setValue(this.lParametro[0].nCierreAutoTiempo);
      this.ParametroForm.controls.nTaxiPeso.setValue(parseFloat(this.lParametro[0].nTaxiPeso).toFixed(2));
      this.ParametroForm.controls.nTaxiVolumen.setValue(parseFloat(this.lParametro[0].nTaxiVolumen).toFixed(4));
      this.ParametroForm.controls.nAlmacenMovilPrecio.setValue(parseFloat(this.lParametro[0].nAlmacenMovilPrecio).toFixed(4));
      this.ParametroForm.controls.nAlmacenMovilPeso.setValue(parseFloat(this.lParametro[0].nAlmacenMovilPeso).toFixed(2));
      this.ParametroForm.controls.bTieneCourier.setValue(this.lParametro[0].bTieneCourier);
      this.ParametroForm.controls.bTieneDistribucion.setValue(this.lParametro[0].bTieneDistribucion);

      this.ParametroForm.controls.peso.setValue(parseFloat(this.lParametro[0].nPesoAlmacen).toFixed(2));
      this.ParametroForm.controls.volumen.setValue(parseFloat(this.lParametro[0].nVolumenAlmacen).toFixed(6));
      this.ParametroForm.controls.articuloValoradoPrecioKilo.setValue(parseFloat(this.lParametro[0].nArticuloPrecioKilo).toFixed(4));
      this.ParametroForm.controls.articuloValoradoPrecioAdicional.setValue(parseFloat(this.lParametro[0].nArticuloPrecioKiloAdicional).toFixed(4));
      this.ParametroForm.controls.nuEnvio.setValue(this.lParametro[0].bNuEnvioAuto);
      this.ParametroForm.controls.nIdDireccionTransito.setValue(this.lParametro[0].nIdDireccionTransito);
      this.ParametroForm.controls.nIdTipoVehiculo.setValue(this.lParametro[0].nIdTipoVehiculo);

      this.fnActualizarInputUbicacionDireccion();
    }
  }

  async fnCrearParametro(){
    Swal.fire({
      title: '¿Está seguro que desea crear el parametro?',
      showDenyButton: true,
      confirmButtonText: `Crear`,
      denyButtonText: `Cancelar`
    }).then(async (result) => {
      if (result.isConfirmed) {

        this.spinner.show();
        var pEntidad = 1;
        var pOpcion = 1;  // CRUD -> Crear
        var pParametro = []; // Parametros de campos vacios
        var pTipo = 1;       // Crear parametro del pais

        pParametro.push(this.pPais);
        pParametro.push(this.idUser);

        if(this.lParametro.length > 0){

          Swal.fire('Este país ya cuenta con un parametro', '', 'error');
          this.spinner.hide();
        }
        else{
          this.lParametro = await this.vParLogisticaService.fnParametro(pEntidad, pOpcion, pParametro, pTipo, this.url);
          await this.fnListarParametro();
          this.spinner.hide();
        }
      }
    });
  }

  async fnGuardarParametro() {

    Swal.fire({
      icon: 'question',
      title: '¿Desea guardar los cambios?',
      showDenyButton: true,
      confirmButtonText: `Guardar`,
      denyButtonText: `Cancelar`
    }).then(async (result) => {

      if (result.isConfirmed) {
        this.spinner.show();
        var pEntidad = 1;
        var pOpcion = 3;  //CRUD -> Actualizar
        var pParametro = []; //Parametros de campos vacios
        var pTipo = 1;       //Listar todos los registros de la tabla

        pParametro.push(this.nIdParametro);
        pParametro.push(this.pPais);
        pParametro.push(this.ParametroForm.controls.bNotaMismoDia.value == true ? 1 : 0);
        pParametro.push(this.ParametroForm.controls.bBloquearHoraMismoDia.value == true ? 1 : 0);
        pParametro.push(this.ParametroForm.controls.sHoraTopeDia.value);
        pParametro.push(this.ParametroForm.controls.bNotaDiaSabado.value == true ? 1 : 0);
        pParametro.push(this.ParametroForm.controls.bBloquearHoraDiaSabado.value == true ? 1 : 0);
        pParametro.push(this.ParametroForm.controls.sHoraTopeSabado.value);
        pParametro.push(this.ParametroForm.controls.bNotaDiaDomingo.value == true ? 1 : 0);
        pParametro.push(this.ParametroForm.controls.bBloquearHoraDiaDomingo.value == true ? 1 : 0);
        pParametro.push(this.ParametroForm.controls.sHoraTopeDomingo.value);
        pParametro.push(this.ParametroForm.controls.bCierreAutomatico.value == true ? 1 : 0);
        pParametro.push(this.ParametroForm.controls.nCierreAutoTiempo.value);
        pParametro.push(Number(this.ParametroForm.controls.nTaxiPeso.value));
        pParametro.push(Number(this.ParametroForm.controls.nTaxiVolumen.value));
        pParametro.push(Number(this.ParametroForm.controls.nAlmacenMovilPrecio.value));
        pParametro.push(Number(this.ParametroForm.controls.nAlmacenMovilPeso.value));
        pParametro.push(this.ParametroForm.controls.bTieneCourier.value);
        pParametro.push(this.ParametroForm.controls.bTieneDistribucion.value);
        pParametro.push(this.idUser);
        pParametro.push(Number(this.ParametroForm.controls.peso.value));
        pParametro.push(Number(this.ParametroForm.controls.volumen.value));
        pParametro.push(Number(this.ParametroForm.controls.articuloValoradoPrecioKilo.value));
        pParametro.push(Number(this.ParametroForm.controls.articuloValoradoPrecioAdicional.value));
        pParametro.push(this.ParametroForm.controls.nuEnvio.value);
        pParametro.push(this.ParametroForm.controls.nIdTipoVehiculo.value);
        pParametro.push(this.ParametroForm.controls.nIdDireccionTransito.value);

        if(this.ParametroForm.get('nCierreAutoTiempo').invalid){
          this.spinner.hide();
          return Swal.fire('El tiempo de cierre no puede ser decimal y tiene que ser mayor a 1', '', 'error');
        }


        if (this.ParametroForm.controls.nCierreAutoTiempo.value <= 0) {
          this.spinner.hide();
          Swal.fire('El tiempo de Cierre no puede ser menor o igual que 0!', '', 'error');
        }
        else {
          if (this.ParametroForm.controls.nTaxiPeso.value <= 0) {
            this.spinner.hide();
            Swal.fire('El Taxi Peso no puede ser menor o igual que 0!', '', 'error');
          }
          else {
            if (this.ParametroForm.controls.nTaxiVolumen.value <= 0) {
              this.spinner.hide();
              Swal.fire('El Taxi Volumen no puede ser menor o igual que 0!', '', 'error');
            }
            else {
              if (this.ParametroForm.controls.nAlmacenMovilPrecio.value <= 0) {
                this.spinner.hide();
                Swal.fire('El Precio Movil del Almacen no puede ser menor o igual que 0!', '', 'error');
              }
              else {
                if (this.ParametroForm.controls.nAlmacenMovilPeso.value <= 0) {
                  this.spinner.hide();
                  Swal.fire('El Almacen Movil Peso no puede ser menor o igual que 0!', '', 'error');
                }
                else {
                  if(this.ParametroForm.controls.peso.value <= 0) {
                    this.spinner.hide();
                    Swal.fire('El Peso Máximo no puede ser menor o igual que 0!', '', 'error');
                  }
                  else {
                    if(this.ParametroForm.controls.volumen.value <= 0) {
                      this.spinner.hide();
                      Swal.fire('El Volumen Máximo no puede ser menor o igual que 0!', '', 'error');
                    }
                    else {
                      if(this.ParametroForm.controls.articuloValoradoPrecioKilo.value <= 0) {
                        this.spinner.hide();
                        Swal.fire('El precio del artículo valorado no puede ser menor o igual que 0!', '', 'error');
                      }
                      else {
                        if(this.ParametroForm.controls.articuloValoradoPrecioAdicional.value <= 0) {
                          this.spinner.hide();
                          Swal.fire('El precio del artículo valorado adicional no puede ser menor o igual que 0!', '', 'error');
                        }
                        else {
                          try {
                            await this.vParLogisticaService.fnParametro(pEntidad, pOpcion, pParametro, pTipo, this.url);
                            // Actualizar detalle
                            await this.fnGuardarDetalleParametro();
                            this.spinner.hide();
                            Swal.fire({
                              position: 'center',
                              icon: 'success',
                              title: 'Se guardo correctamente',
                              showConfirmButton: false,
                              timer: 1500});
                          }
                          catch (err) {
                            console.log(err);
                            this.spinner.hide();
                            Swal.fire('Error al momento de guardar!', '', 'error');
                          }
                        }

                      }

                    }

                  }

                }
              }
            }
          }
        }
      } else if (result.isDenied) {
        this.spinner.hide();
        Swal.fire('Los cambios no se han guardado!', '', 'info')
      }
    })
  }

  //#endregion

  //#region CRUD DetalleParametro
  async fnListarComboboxParametrosDetalle(){
    var pEntidad = 3;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 2;       //Listar todos los presupuestos

    pParametro.push(this.idEmp);//Añadiendo dato pais a la consulta.

    this.ccTrasladosEmp = await this.vParLogisticaService.fnParametro(pEntidad, pOpcion, pParametro, pTipo, this.url);
    this.ccExtraCargas  = await this.vParLogisticaService.fnParametro(pEntidad, pOpcion, pParametro, pTipo, this.url);
  }

  async fnListarComboboxDireccion(){
    const pEntidad = 2;
    const pOpcion = 2;  //CRUD -> Listar
    const pParametro = []; //Parametros de campos vacios
    const pTipo = 6;       //Listar las direcciones

    this.cbDirecciones = await this.vParLogisticaService.fnParametro(pEntidad, pOpcion, pParametro, pTipo, this.url);
  }

  async fnListarComboboxTransporte(){
    const pEntidad = 2;
    const pOpcion = 2;  //CRUD -> Listar
    const pParametro = []; //Parametros de campos vacios
    const pTipo = 5;       //Listar las direcciones

    this.cbTransportes = await this.vParLogisticaService.fnParametro(pEntidad, pOpcion, pParametro, pTipo, this.url);
  }

  async fnListarParametroDetalle(){
    var pEntidad = 3;
    var pOpcion = 2;  // CRUD -> Listar
    var pParametro = []; // Parametros de campos vacios
    var pTipo = 1;       //Listar todos los registros de la tabla

    pParametro.push(this.nIdParametro);
    pParametro.push(this.idEmp); //

    const detalleParametro = await this.vParLogisticaService.fnParametro(pEntidad, pOpcion, pParametro, pTipo, this.url);
    if(detalleParametro){
      this.ParametroForm.patchValue({
        nIdCcTrasladoEmp: detalleParametro.nIdCcTrasladoEmp != 0 ? detalleParametro.nIdCcTrasladoEmp : null,
        nIdCcExtraCargas: detalleParametro.nIdCcExtraCargas != 0 ? detalleParametro.nIdCcExtraCargas : null,
        bGrabaBalanza: detalleParametro.bGrabaBalanza
      })
      this.detalleExiste = true;
      //console.log(this.detalleExiste);
    }
    else{
      this.detalleExiste = false;
      //console.log(this.detalleExiste);
    }
  }

  fnActualizarInputUbicacionDireccion() {
    let nIdDireccionTransito = this.ParametroForm.get("nIdDireccionTransito").value;
    // Limpiar ubicacion y direccion
    let direccionActual = this.cbDirecciones.find((direccion) => direccion.nId === nIdDireccionTransito);
    this.ParametroForm.patchValue({
      sUbicacion: direccionActual.sUbicacion,
      sDireccion: direccionActual.sDireccion,
    });
  }

  async fnGuardarDetalleParametro(){
    let pEntidad = 3;
    let pOpcion = 3;  // CRUD -> Actualizar
    let pParametro = []; // Parametros de campos vacios
    let pTipo = 1;       // Actualizar detalle parametro

    const {nIdCcTrasladoEmp, nIdCcExtraCargas, bGrabaBalanza} = this.ParametroForm.value;

    pParametro.push(nIdCcTrasladoEmp);
    pParametro.push(nIdCcExtraCargas);
    pParametro.push(bGrabaBalanza);
    pParametro.push(this.nIdParametro);
    pParametro.push(this.idEmp);

    if(!this.detalleExiste){
      pOpcion = 1; // CRUD -> Insertar
    }

    await this.vParLogisticaService.fnParametro(pEntidad, pOpcion, pParametro, pTipo, this.url);
  }

  setStep(index: number) {
    this.step = index;
  }

  //#endregion


  //#region Cambio de valor: mat-slide-toggle
  ActivarBloqueoDiaPorHora(dia) {
    if (dia == 2) {
      if (this.ParametroForm.controls.bNotaDiaSabado.value == false) {
        this.ParametroForm.controls.bBloquearHoraDiaSabado.setValue(1);
      }

    } else if (dia == 3) {
      if (this.ParametroForm.controls.bNotaDiaDomingo.value == false) {
        this.ParametroForm.controls.bBloquearHoraDiaDomingo.setValue(1);
      }

    }
  }
  //#endregion

  //#region Dialogs
  async fnOpenDialogCierreAutomatico() {
    this.spinner.show(); // Inicio de spinner

    this.mostrarBotones = false; // Ocultar botones de opciones

    const dialogRef = this.dialog.open(ListaparametrosComponent, {
      width: '1000px',
      autoFocus: false,
      data: {
        nIdParametro: this.nIdParametro
      }
    });

    dialogRef.beforeClosed().subscribe(result => {
      this.mostrarBotones = true;
    });

  }

  async fnOpenDialogPermisosUsuarioArticulo() {
    this.spinner.show(); // Inicio de spinner

    this.mostrarBotones = false; // Ocultar botones de opciones

    const dialogRef = this.dialog.open(LogPermisosDeUsuarioArticulosDialogParametrosComponent, {
      width: '1000px',
      autoFocus: false,
      data: {}
    });

    dialogRef.beforeClosed().subscribe(result => {
      this.mostrarBotones = true;
    });

  }
  //#endregion



  //#region Validaciones

  get ValidarTiempo() {
    return this.ParametroForm.get('nCierreAutoTiempo').invalid && this.ParametroForm.get('nCierreAutoTiempo').touched;
  }

  get validarPeso() {
    return this.ParametroForm.get('peso').invalid && this.ParametroForm.get('peso').touched;
  }

  get validarVolumen() {
    return this.ParametroForm.get('volumen').invalid && this.ParametroForm.get('volumen').touched;
  }

  get validarValoradoPrecioKilo() {
    return this.ParametroForm.get('articuloValoradoPrecioKilo').invalid && this.ParametroForm.get('articuloValoradoPrecioKilo').touched;
  }

  get validarArticuloValoradoPrecioAdicional() {
    return this.ParametroForm.get('articuloValoradoPrecioAdicional').invalid && this.ParametroForm.get('articuloValoradoPrecioAdicional').touched;
  }

  //#endregion

}
