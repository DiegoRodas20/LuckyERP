import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { asistenciapAnimations } from 'src/app/modulos/comercial/Asistencia/asistenciap/asistenciap.animations';
import Swal from 'sweetalert2';
import { DatoBasicoService } from '../datobasico.service';

@Component({
  selector: 'app-partidaArticulo',
  templateUrl: './partidaArticulo.component.html',
  styleUrls: ['./partidaArticulo.component.css'],
  animations: [asistenciapAnimations]
})
export class PartidaArticuloComponent implements OnInit {
  // Botones Flotantes Pantalla 
  tsListaPrincipal = 'inactive';  // Inicia la lista visible
  fbListaPrincipal = [ // Lista de las opciones que se mostrarán
    { icon: 'add', tool: 'Nueva Partida' },
    { icon: 'add', tool: 'Relación Útiles' },
  ];
  abListaPrincipal = [];

  // Botones Flotantes Pantalla Relacion
  tsListaRelacion = 'inactive';  // Inicia la lista visible
  fbListaRelacion = [ // Lista de las opciones que se mostrarán
    { icon: 'add', tool: 'Nuevo Artículo' },
    { icon: 'keyboard_arrow_left', tool: 'Salir' },
  ];
  abListaRelacion = [];

  // Botones Flotantes Pantalla Utiles
  tsListaUtiles = 'inactive';  // Inicia la lista visible
  fbListaUtiles = [ // Lista de las opciones que se mostrarán
    { icon: 'add', tool: 'Nuevo Artículo' },
    { icon: 'keyboard_arrow_left', tool: 'Salir' },
  ];
  abListaUtiles = [];

  // Asigancion de modal
  @ViewChild('modalParGen') modalParGen: ElementRef;
  @ViewChild('modalArticulo') modalArticulo: ElementRef;
  @ViewChild('modalArticuloUtil') modalArticuloUtil: ElementRef;

  // Variables Material
  dsMatriz: MatTableDataSource<any>
  @ViewChild('paginatorMatriz', { static: true }) paginatorMatriz: MatPaginator;
  @ViewChild('msMatriz', { static: true }) sortMatriz: MatSort;
  dcMatriz = ['accion', 'sParGenDsc', 'sCodPartida', 'sPartidaDesc', 'nServicio', 'nArticulo']

  dsRelacion: MatTableDataSource<any>
  @ViewChild('paginatorRelacion', { static: true }) paginatorRelacion: MatPaginator;
  @ViewChild('msRelacion', { static: true }) sortRelacion: MatSort;
  dcRelacion = ['accion', 'sCodPartida', 'sCodArticulo', 'sEsUtilOficina', 'nCantMin', 'sEstado']

  dsListado: MatTableDataSource<any>;
  @ViewChild('paginatorListado', { static: true }) paginatorListado: MatPaginator
  @ViewChild('msListado', { static: true }) sortListado: MatSort;
  dcListado = ['accion', 'sCodArticulo', 'sCodPartida', 'nCantMin']

  // -- Vale!******************************************************************************

  url: string; //variable de un solo valor
  idUser: number; //id del usuario
  pNom: string;    //Nombre Usr
  idEmp: string;  //id de la empresa del grupo Actual
  pPais: string;  //Codigo del Pais de la empresa Actual

  // Control para bsuqueda
  txtFiltro = new FormControl();
  txtFiltro2 = new FormControl();
  txtFiltro3 = new FormControl();

  // Variables publicas de opcion
  vPartidaGen: number = 0;
  vPartida: number = 0;
  vPartidaArticulo: number = 0;
  vIdPartida: number = 0;
  vOpcion: number = 0;
  vIdArticModif: number = 0;

  //Interacion entre pantallas
  vPrincipal: boolean = true;
  vDetalle: boolean = false;
  vMostarNU: boolean = false;

  // Listas
  lPartidaArt: any = [];
  lPartida: any = [];
  lUtiles: any = [];

  lUsoNota: any = [];
  lEstado: any = [];

  //Variables para mostrar el detalle del artículo
  vTitulo: string;
  vPartidaDsc: string;

  submitted: boolean = false;
  submitted2: boolean = false;

  parGenForm: FormGroup;
  articuloForm: FormGroup;

  ListaArticuloNuevo = []; // lista que llena el combo para agregar articulos
  ListaArticuloMatris = [];

  //fin Vale

  constructor(
    private spinner: NgxSpinnerService,
    private formBuilder: FormBuilder,
    private router: Router,
    private vDatoBasicoService: DatoBasicoService,
    @Inject('BASE_URL') baseUrl: string
  ) { this.url = baseUrl; }

  ngOnInit(): void {
    //Obtener Variables Generales del proyecto .
    let user = localStorage.getItem('currentUser'); //encriptacion del usuario 
    this.idUser = JSON.parse(window.atob(user.split('.')[1])).uid;
    this.pNom = JSON.parse(window.atob(user.split('.')[1])).uno;
    this.idEmp = localStorage.getItem('Empresa');
    this.pPais = localStorage.getItem('Pais');

    //Relacionar los controles de html a su respectivo Formbuilder
    /*************************************************************/

    this.parGenForm = this.formBuilder.group({
      cboPartida: ['', Validators.required],
    });

    this.articuloForm = this.formBuilder.group({
      cboArticulo: ['', Validators.required],
      cboUsoNota: ['', Validators.required],
      txtStockMin: ['0', Validators.required],
      cboEstado: ['', Validators.required]
    });

    this.fnListarPartida() //se usa

    this.lUsoNota = [
      { nIdUso: 0, sDescripcion: "No - Usar Nota Útiles" },
      { nIdUso: 1, sDescripcion: "Si - Usar Nota Útiles" }
    ];

    this.lEstado = [
      { nIdEstado: 1, sDescripcion: "Activo" },
      { nIdEstado: 0, sDescripcion: "Inactivo" }
    ];

    this.onToggleFabPrincipal(1, -1);
  }


  // Recuperar todos los controles de la partida Generica para Validar
  get v() {
    return this.parGenForm.controls;
  }

  // Recuperar todos los controles del Articulo para Validar
  get u() {
    return this.articuloForm.controls;
  }


  //******************************************************************************************************************** */
  //Zona de implementacion de funciones  
  //******************************************************************************************************************** */

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dsMatriz.filter = filterValue.trim().toLowerCase();
  }

  applyFilter2(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dsRelacion.filter = filterValue.trim().toLowerCase();
  }

  applyFilter3(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dsListado.filter = filterValue.trim().toLowerCase();
  }

  fnListarPartida = function () {
    this.spinner.show();

    var pEntidad = 3; //Cabecera del movimiento
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 1;       //Listar Solo agrupar las partidas de la matriz 

    pParametro.push(this.pPais);
    this.vDatoBasicoService.fnDatoBasico(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
      res => {
        //this.lPartida = res;
        this.dsMatriz = new MatTableDataSource(res);
        this.dsMatriz.paginator = this.paginatorMatriz;
        this.dsMatriz.sort = this.sortMatriz
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

  fnVolver = function () {
    this.vPrincipal = true;
    this.vDetalle = false;
    this.fnListarPartida()
  }

  // **********************************************************************************************************************

  fnNuevaParGen = function () {
    this.vOpcion = 1;
    this.parGenForm.controls.cboPartida.setValue('');
    this.tsListaRelacion == 'inactive' ? null : this.onToggleFabRelacion(1, -1);
    this.ListaNuevasPartidas();
  }

  ListaNuevasPartidas(): void {
    let pEntidad = 3;
    let pOpcion = 2;
    let pParametro = [];
    let pTipo = 6;

    pParametro.push(this.pPais);

    this.vDatoBasicoService.fnDatoBasico(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(resp => {
      this.ListaArticuloNuevo = resp;
    });

  }

  fnValidarParGen = function () {
    let vNuevaPartida = this.parGenForm.value.txtPartida;
    let vPartidaNum: number;

    vPartidaNum = + vNuevaPartida

    //Inicio de validacionespara la partida indicada
    if (vNuevaPartida.length != 4) {
      Swal.fire('¡Verificar!', 'La partida debe tener 4 caracteres obligatorios.', 'error');
      this.parGenForm.controls.txtPartida.setValue('');
      return;
    }

    if (isNaN(vPartidaNum)) {
      Swal.fire('¡Verificar!', 'Todos los caracteres de la partida deben ser numéricos', 'error');
      this.parGenForm.controls.txtPartida.setValue('');
      return;
    }

    this.spinner.show();

    // Consultamos si ya existe ese valor en base de datos
    var pEntidad = 3;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 2;       //Devuelve un registro de descripcion despues de la validacion

    pParametro.push(1); //Indica que validara la Partida del registro
    pParametro.push(this.pPais);
    pParametro.push(vNuevaPartida);
    this.vDatoBasicoService.fnDatoBasico(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
      res => {

        //console.log(res.cod)
        if (res.cod == "0") {
          Swal.fire('¡Verificar!', 'La partida indicada: ' + vNuevaPartida + ', No existe, indique un número válido de partida.', 'error');
          this.parGenForm.controls.txtPartida.setValue('');
          return;

        } else if (res.cod == "1") {
          //console.log('entro descripcion')
          this.parGenForm.controls.txtDescripcion.setValue(res.mensaje);
          return;

        } else {
          Swal.fire('¡Verificar!', 'La partida indicada: ' + vNuevaPartida + ' - ' + res.mensaje + ', Ya se encuentra registrada.', 'error');
          this.parGenForm.controls.txtPartida.setValue('');
          return;
        }

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

  fnGuardarParGen = function () {
    let vDatosPartida;
    let pParametro = [];

    this.submitted = true;

    if (this.parGenForm.invalid) {
      Swal.fire('Atencion', 'Debe seleccionar una partida', 'warning');
      return;
    }

    this.spinner.show();

    // Pasamos todos los valores para insertar Partida Gen
    vDatosPartida = this.parGenForm.value;

    //Registrando una nueva partida a la Matriz
    pParametro.push(vDatosPartida.cboPartida);
    pParametro.push(this.pPais);
    pParametro.push(this.idUser);

    // Ejecutando el servicio
    this.vDatoBasicoService.fnDatoBasico(3, 1, pParametro, 1, this.url).subscribe(
      res => {
        this.spinner.hide();
        //Validar si hay error:
        if (res == 0) {
          Swal.fire(
            'Error', //Titulo
            'No se pudo realizar el ingreso: Verifique su conexion a Internet', //Mensaje html
            'error' //Tipo de mensaje
          ).then((result) => {
          });
        } else {

          this.fnListarPartida()
          this.modalParGen.nativeElement.click();
          Swal.fire({
            icon: 'success',
            title: 'Correcto',
            text: 'Se registro la Partida indicada. Debe agregar los Artículos o  Servicios correspondientes',
            showConfirmButton: false,
            timer: 1500
          });
          //Swal.fire('Correcto','Se registro la Partida indicada. Debe agregar los Artículos o  Servicios correspondientes','success');
        }

      },
      err => {
        this.spinner.hide();
        console.log(err);
      },
      () => {
        this.spinner.hide();
        this.submitted = false;
      }
    );


  }


  // **********************************************************************************************************************
  // **********************************************************************************************************************

  fnMostrarPartidaArticulo = function (vPartida) {
    let vFiltro2 = this.txtFiltro2.value

    var pEntidad = 3;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 3;       //Muestra la relacion del detalle Partida:Articulo/Servicio

    pParametro.push(vPartida);
    pParametro.push(vFiltro2);

    this.vDatoBasicoService.fnDatoBasico(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
      res => {
        //this.lPartidaArt = res;
        this.dsRelacion = new MatTableDataSource(res);
        this.dsRelacion.paginator = this.paginatorRelacion;
        this.dsRelacion.sort = this.sortRelacion;
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

  fnVerDetalle = function (z) {
    this.spinner.show();
    this.vPrincipal = false;
    this.vDetalle = true;

    this.vIdPartida = z.nIdPartida
    this.vPartidaDsc = z.sCodPartida + " - " + z.sPartidaDesc

    this.fnMostrarPartidaArticulo(z.nIdPartida)
    this.ListarArticulosMatris();
  }

  fnBuscarArticulo = function () {

    this.spinner.show();
    this.fnMostrarPartidaArticulo(this.vIdPartida)

  }

  ListarArticulosMatris(): void {
    var pEntidad = 3;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 5;

    pParametro.push(this.pPais);

    this.vDatoBasicoService.fnDatoBasico(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(res => {
      this.ListaArticuloMatris = res;
    });
  }

  fnValidarArticulo = function () {
    let vNuevoArticulo = this.articuloForm.value.txtArticulo;
    this.spinner.show();

    // Consultamos si ya existe ese valor en base de datos
    var pEntidad = 3;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 2;       //Zona de validacion

    pParametro.push(2); //Validar si el articulo indicado existe o ya esta registrado con otra partida en la matriz
    pParametro.push(this.pPais);
    //pParametro.push(this.vIdPartida); 
    pParametro.push(vNuevoArticulo);

    //console.log(pParametro)
    this.vDatoBasicoService.fnDatoBasico(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
      res => {

        if (res.cod == 0) {
          Swal.fire('¡Verificar!', 'EL código: ' + vNuevoArticulo.toUpperCase() + ', No esta registrado en el Catalogo de Articulos/Servicios, verificar.', 'error');
          this.articuloForm.controls.txtArticulo.setValue('');
          this.articuloForm.controls.txtDescripcion.setValue('');
          this.spinner.hide();
          return;
        }
        else if (res.cod == 1) {
          this.articuloForm.controls.txtDescripcion.setValue(res.mensaje);
          this.spinner.hide();
          return;

        }
        else {
          Swal.fire('¡Verificar!', 'EL código: ' + vNuevoArticulo.toUpperCase() + ', Ya se encuentra relacionado con la partida: ' + res.cod + ' - ' + res.mensaje + ', verificar.', 'error');
          this.articuloForm.controls.txtArticulo.setValue('');
          this.articuloForm.controls.txtDescripcion.setValue('');
          this.spinner.hide();
          return;

        }

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

  fnGuardarArticulo = function () {

    let vDatosArticulo;
    let vStock: number = 0;
    let pParametro = [];

    this.submitted2 = true;

    if (this.articuloForm.invalid) {
      return; //Si hay datos Obligatorios entonces no entra 
    }

    this.spinner.show();
    // Pasamos todos los valores para insertar la cabecera
    vDatosArticulo = this.articuloForm.value;
    vStock = + vDatosArticulo.txtStockMin

    //Cuando es matriz de Notas de útiles
    if (vDatosArticulo.cboUsoNota == 1) {
      //debugger;
      if (isNaN(vStock)) //No es númerico
      {
        Swal.fire('¡Verificar!', 'El valor del Stock minimo debe ser numérico', 'error');
        this.articuloForm.controls.txtStockMin.setValue('0');
        this.spinner.hide();
        return;
      }

      if (vStock <= 0) {
        Swal.fire('¡Verificar!', 'Cuando selecciona la gestion mediante Notas de Útiles debe indicar: El Stock minimo para notificaciones, debe ser mayor a cero', 'error');
        //this.parGenForm.controls.txtPartida.setValue('');
        this.spinner.hide();
        return;
      }
    }

    if (this.vOpcion == 1) //Registrando un nuevo Artículo/Servicio
    {

      pParametro.push(this.pPais);
      pParametro.push(this.vIdPartida);
      pParametro.push(vDatosArticulo.cboArticulo);
      pParametro.push(vDatosArticulo.cboUsoNota);
      pParametro.push(vDatosArticulo.txtStockMin);
      pParametro.push(this.pPais);
      pParametro.push(this.idUser);

      if (vDatosArticulo.cboUsoNota == 1) {
        for (let index = 0; index < this.ListaArticuloMatris.length; index++) {
          if (vDatosArticulo.cboArticulo == this.ListaArticuloMatris[index].nIdArticulo && this.ListaArticuloMatris[index].nServicio == 1) {
            Swal.fire('¡Atención!', 'No puede usar un Servicio como Artículo de Oficina, favor de verificar', 'warning')
            this.spinner.hide();
            return;
          }

        }
      }

      //Primero validamos si existe el Articulo/Servicio en otra Partida
      this.vDatoBasicoService.fnDatoBasico(3, 2, pParametro, 2, this.url).subscribe(
        res => {
          //debugger;
          this.spinner.hide();
          //Validar si Existe el articulo:
          if (res.cod == 1) {
            Swal.fire('¡Atención!', 'EL artículo/servicio indicado, ya se cuentra registrado en la partida: ' + res.mensaje, 'warning')
            return;
          }
          else //Registramos en BD
          {
            // Ejecutando el servicio para el registro de Datos 
            this.vDatoBasicoService.fnDatoBasico(3, 1, pParametro, 2, this.url).subscribe(
              res => {
                this.spinner.hide();
                //Validar si hay error:
                if (res == 0) {
                  Swal.fire('Error', 'No se pudo realizar el ingreso: Verifique su conexion a Internet', 'error')
                  return;
                }
                else //Registro correctamente
                {
                  this.fnMostrarPartidaArticulo(this.vIdPartida)
                  this.modalArticulo.nativeElement.click();
                  Swal.fire({
                    icon: 'success',
                    title: 'Correcto',
                    text: 'Se guardo el nuevo registro',
                    showConfirmButton: false,
                    timer: 1500
                  });
                  //Swal.fire('Correcto','Se guardo el nuevo registro','success');
                }

              },
              err => {
                this.spinner.hide();
                console.log(err);
              },
              () => {
                this.spinner.hide();
                this.submitted2 = false;
              });

          }

        });

    }
    else if (this.vOpcion == 2)//Modificando el Articulo
    {
      pParametro.push(this.vPartidaArticulo);
      pParametro.push(vDatosArticulo.cboUsoNota);
      pParametro.push(vDatosArticulo.txtStockMin);
      pParametro.push(vDatosArticulo.cboEstado);
      pParametro.push(this.pPais);
      pParametro.push(this.idUser);
      //console.log(pParametro)
      // Ejecutando el servicio
      //debugger
      if (vDatosArticulo.cboUsoNota == 1) {
        for (let index = 0; index < this.ListaArticuloMatris.length; index++) {
          if (this.vIdArticModif == this.ListaArticuloMatris[index].nIdArticulo && this.ListaArticuloMatris[index].nServicio == 1) {
            Swal.fire('¡Atención!', 'No puede usar un Servicio como Artículo de Oficina, favor de verificar', 'warning')
            this.spinner.hide();
            return;
          }

        }
      }

      this.vDatoBasicoService.fnDatoBasico(3, 3, pParametro, 0, this.url).subscribe(
        res => {
          this.spinner.hide();
          //Validar si hay error:
          if (res == 0) {
            Swal.fire(
              'Error', 'No se pudo realizar el ingreso: Verifique su conexion a Internet', 'error'
            ).then((result) => {
            });
          } else {

            this.fnMostrarPartidaArticulo(this.vIdPartida)
            this.modalArticulo.nativeElement.click();
            Swal.fire({
              icon: 'success',
              title: 'Correcto',
              text: 'Se actualizo el registro',
              showConfirmButton: false,
              timer: 1500
            });
            //Swal.fire('Correcto','Se actualizo el registro','success');
          }

        },
        err => {
          this.spinner.hide();
          console.log(err);
        },
        () => {
          this.spinner.hide();
          this.submitted2 = false;
        }
      );
    }
  }

  fnNuevoArticulo = function () {

    this.submitted2 = false;
    this.vOpcion = 1;
    this.vTitulo = "Agregar Artículo/Servicio a la Partida: " + this.vPartidaDsc
    this.articuloForm.controls.cboArticulo.setValue('');
    this.articuloForm.controls.txtStockMin.setValue(0);
    this.articuloForm.controls.cboUsoNota.setValue(0);
    this.articuloForm.controls.cboEstado.setValue(1);

    this.articuloForm.get('cboArticulo').enable();
    this.articuloForm.get('cboEstado').disable();
    this.articuloForm.get('txtStockMin').disable();

  }

  fnUsoUtiles = function () {
    let vUso = this.articuloForm.value.cboUsoNota
    if (vUso == 1) {
      this.articuloForm.get('txtStockMin').enable();
    }
    else {
      this.articuloForm.get('txtStockMin').disable();
    }
  }

  //para modificar el articulo registrado
  fnSelecArticulo = function (vPartidaArt) {
    //Listamos los articulos
    this.ListarArticulosMatris();

    this.vOpcion = 2; //Cuando esta modificando
    this.submitted2 = false;
    this.vPartida = vPartidaArt.nIdPartida
    this.vPartidaArticulo = vPartidaArt.nIdPartidaArticulo

    // vPartida.sCodPartida.slice(vPartida.sCodPartida.length-2)
    this.vTitulo = "Modificar el Artículo/Servicio de la Partida: " + this.vPartidaDsc
    this.vIdArticModif = vPartidaArt.nIdArticulo
    this.articuloForm.controls.cboArticulo.setValue(vPartidaArt.nIdArticulo);
    this.articuloForm.controls.cboUsoNota.setValue(vPartidaArt.bUtilOficina);
    this.articuloForm.controls.txtStockMin.setValue(vPartidaArt.nCantMin);
    this.articuloForm.controls.cboEstado.setValue(vPartidaArt.bEstado);

    this.articuloForm.get('cboArticulo').disable();
    this.articuloForm.get('cboEstado').enable();

    if (vPartidaArt.bUtilOficina == 1)
      this.articuloForm.get('txtStockMin').enable();
    else
      this.articuloForm.get('txtStockMin').disable();

  }

  fnSelecArticuloUtil = function (vPartidaArt) {
    //console.log(vPartidaArt)
    this.vOpcion = 2; //Cuando esta modificando
    this.submitted2 = false;
    this.vPartida = vPartidaArt.nIdPartida
    this.vPartidaArticulo = vPartidaArt.nIdPartidaArticulo


    // vPartida.sCodPartida.slice(vPartida.sCodPartida.length-2)
    this.vTitulo = "Modificar Articulo para Nota de Útiles: "//+ this.vPartidaDsc
    this.articuloForm.controls.txtArticulo.setValue(vPartidaArt.sCodArticulo);
    this.articuloForm.controls.txtDescripcion.setValue(vPartidaArt.sArticuloDesc);
    this.articuloForm.controls.cboUsoNota.setValue(vPartidaArt.bUtilOficina);
    this.articuloForm.controls.txtStockMin.setValue(vPartidaArt.nCantMin);
    this.articuloForm.controls.cboEstado.setValue(vPartidaArt.bEstado);

    this.articuloForm.get('txtArticulo').disable();
    this.articuloForm.get('txtDescripcion').disable();
    this.articuloForm.get('cboEstado').enable();
    this.articuloForm.get('txtStockMin').enable();


  }

  fnMostrarUtiles = function (x) {
    if (x == 1) {
      this.vPrincipal = false;
      this.vMostarNU = true;

      this.fnListaUtiles()
    }
    else if (x == 2) {
      this.vMostarNU = false;
      this.vPrincipal = true;
    }
  }

  fnListaUtiles = function () {
    let vFitro3 = this.txtFiltro3.value

    this.spinner.show();
    var pEntidad = 3;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 4;       //Muestra la relacion del detalle Partida:Articulo/Servicio

    pParametro.push(this.pPais);
    pParametro.push(vFitro3);

    this.vDatoBasicoService.fnDatoBasico(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
      res => {
        //this.lUtiles = res;
        this.dsListado = new MatTableDataSource(res);
        this.dsListado.sort = this.sortListado;
        this.dsListado.paginator = this.paginatorListado;
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

  fnGuardarArticuloUtil = function () {

    let vDatosArticulo;
    let vStock: number = 0;
    let pParametro = [];

    this.submitted2 = true;

    if (this.articuloForm.invalid) {
      return; //Si hay datos Obligatorios entonces no entra 
    }

    // Pasamos todos los valores para insertar la cabecera
    vDatosArticulo = this.articuloForm.value;
    vStock = + vDatosArticulo.txtStockMin
    //console.log(vStock)

    //Cuando es matriz de Notas de útiles
    if (vDatosArticulo.cboUsoNota == 1) {
      if (isNaN(vStock)) //No es númerico
      {
        Swal.fire('¡Verificar!', 'El valor del Stock minimo debe ser numérico', 'error');
        this.articuloForm.controls.txtStockMin.setValue('0');
        return;
      }

      if (vStock <= 0) {
        Swal.fire('¡Verificar!', 'Cuando selecciona la gestion mediante Notas de Útiles debe indicar: El Stock minimo para notificaciones, debe ser mayor a cero', 'error');
        //this.parGenForm.controls.txtPartida.setValue('');
        return;
      }
    }

    //Modificando el Articulo
    //console.log('se modifica: ' +this.vPartidaArticulo)
    pParametro.push(this.vPartidaArticulo);
    pParametro.push(vDatosArticulo.cboUsoNota);
    pParametro.push(vDatosArticulo.txtStockMin);
    pParametro.push(vDatosArticulo.cboEstado);
    pParametro.push(this.pPais);
    pParametro.push(this.idUser);

    // Ejecutando el servicio
    this.vDatoBasicoService.fnDatoBasico(3, 3, pParametro, 0, this.url).subscribe(
      res => {
        //Validar si hay error:
        if (res == 0) {
          Swal.fire(
            'Error', //Titulo
            'No se pudo realizar el ingreso: Verifique su conexion a Internet', //Mensaje html
            'error' //Tipo de mensaje
          ).then((result) => {
          });
        } else {

          this.fnMostrarUtiles(1)
          this.modalArticuloUtil.nativeElement.click();
          Swal.fire({
            icon: 'success',
            title: 'Correcto',
            text: 'Se actualizo el registro',
            showConfirmButton: false,
            timer: 1500
          });
          //Swal.fire('Correcto','Se actualizo el registro','success');
        }

      },
      err => {
        this.spinner.hide();
        console.log(err);
      },
      () => {
        this.spinner.hide();
        this.submitted2 = false;
      }
    );

  }

  fnVerDetalleArticulo = function (row: any) {
    //console.log(row);
    window.open('/controlcostos/compra/CrearArticulo/' + row.nIdArticulo, '_blank');
  }

  //#region Para ver la imagen de articulo
  fnVerImagen(row) {
    if (row.sRutaArchivo != '') {
      Swal.fire({
        text: row.sArticuloDesc,
        imageUrl: row.sRutaArchivo,
        imageWidth: 250,
        imageHeight: 250,
      })
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Este artículo no contiene una imagen',
        showConfirmButton: false,
        timer: 1500
      });
    }
  }
  //#endregion

  //Botones Flotantes Principal
  onToggleFabPrincipal(fab: number, stat: number) {
    stat = (stat === -1) ? (this.abListaPrincipal.length > 0) ? 0 : 1 : stat;
    this.tsListaPrincipal = (stat === 0) ? 'inactive' : 'active';
    this.abListaPrincipal = (stat === 0) ? [] : this.fbListaPrincipal;
  }

  clickFabPrincipal(index: number) {
    switch (index) {
      case 0:
        this.fnNuevaParGen()
        break

      case 1:
        this.fnMostrarUtiles(1)
        break

      default:
        break
    }
  }

  //Botones Flotantes Relacion
  onToggleFabRelacion(fab: number, stat: number) {
    stat = (stat === -1) ? (this.abListaRelacion.length > 0) ? 0 : 1 : stat;
    this.tsListaRelacion = (stat === 0) ? 'inactive' : 'active';
    this.abListaRelacion = (stat === 0) ? [] : this.fbListaRelacion;
  }

  clickFabRelacion(index: number) {
    switch (index) {
      case 0:
        this.fnNuevoArticulo()
        break

      case 1:
        this.fnVolver()
        break

      default:
        break
    }
  }

  //Botones Flotantes Utiles
  onToggleFabUtiles(fab: number, stat: number) {
    stat = (stat === -1) ? (this.abListaUtiles.length > 0) ? 0 : 1 : stat;
    this.tsListaUtiles = (stat === 0) ? 'inactive' : 'active';
    this.abListaUtiles = (stat === 0) ? [] : this.fbListaUtiles;
  }

  clickFabUtiles(index: number) {
    switch (index) {
      case 0:
        this.fnMostrarUtiles(2)
        break

      default:
        break
    }
  }
}
