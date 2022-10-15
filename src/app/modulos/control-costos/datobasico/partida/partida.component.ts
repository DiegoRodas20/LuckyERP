import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';
import { SergeneralService } from '../../../../shared/services/sergeneral.service';
import { DatoBasicoService } from '../datobasico.service';
import { MyErrorStateMatcher } from './../tarifario/tarifario.component';
import { DomSanitizer } from '@angular/platform-browser';
import { asistenciapAnimations } from 'src/app/modulos/comercial/Asistencia/asistenciap/asistenciap.animations';

@Component({ 
  selector: 'app-partida',
  templateUrl: './partida.component.html',
  styleUrls: ['./partida.component.css'] ,
  animations: [asistenciapAnimations]//,'../../../../sccs/styles2.scss'
})

export class PartidaComponent implements OnInit {

  // Botones Flotantes Pantalla 
  tsLista = 'inactive';  // Inicia la lista visible
  fbLista = [ // Lista de las opciones que se mostrarán
    { icon: 'add', tool: 'Nueva Partida' },
  ];
  abLista = [];

    
  // Asigancion de modal
  @ViewChild('modalParGen') modalParGen: ElementRef;
  @ViewChild('modalPartida') modalPartida: ElementRef;
  

  // -- Vale!******************************************************************************

  url: string; //variable de un solo valor
  idUser :number; //id del usuario
  pNom:string;    //Nombre Usr
  idEmp: string;  //id de la empresa del grupo Actual
  pPais: string;  //Codigo del Pais de la empresa Actual

  // Control busqueda
  txtFiltroGen = new FormControl();
  txtFiltroPar = new FormControl();
  radioFiltroEstado = new FormControl();
  radioFiltroEstadoEspecifica = new FormControl();

  vPartidaGen: number = 0;
  vPartida: number = 0;
  vPrincipal: boolean = true;
  vOpcion: number = 0;

  // Listas
  lPartidaGen: any = []; 
  lPartida: any = []; 

  lPersonal: any = []; 
  lUsoComercial: any = []; 
  lEstado: any = []; 
  
  //Variables para mostrar el detalle del artículo
  vTitulo: string;
  vPartidaGenDsc: string;
  vPartidaNumero: string;

  submitted: boolean = false;
  submitted2: boolean = false;

  partidaForm: FormGroup;
  parGenForm: FormGroup;

  //Table material
  dsPartidaGen: MatTableDataSource<any>;
  @ViewChild('paginatorPartidaGen', {static:true}) paginatorPartidaGen: MatPaginator;
  @ViewChild('msPartidaGente', {static:true}) sortPartidaGen: MatSort;
  dcPartidaGen=['opcion','sParGen','sDescripcion','sDePersonal','sEstado']

  dsPartida: MatTableDataSource<any>;
  @ViewChild('paginatorPartida', {static:true}) paginatorPartida: MatPaginator;
  @ViewChild('msPartida', {static:true}) sortPartida: MatSort;
  dcPartida=['accion','sCodPartida','sDescripcion','sAbrev','sUsoComercial','sEstado']

  matcher = new MyErrorStateMatcher();

  //fin Vale

  nModificable = 1; //Para ver si se modifican los hijos de una part. gen.
  constructor(
    private spinner: NgxSpinnerService,
    private formBuilder: FormBuilder,
    private router: Router,
    private vDatoBasicoService: DatoBasicoService,
    private vSerGeneral: SergeneralService, 
    @Inject('BASE_URL') baseUrl: string
  
  ) { this.url = baseUrl; }

  ngOnInit(): void {
    this.onToggleFab(1, -1)
    //Obtener Variables Generales del proyecto .
    let user    = localStorage.getItem('currentUser'); //encriptacion del usuario 
    this.idUser = JSON.parse(window.atob(user.split('.')[1])).uid; 
    this.pNom   = JSON.parse(window.atob(user.split('.')[1])).uno;
    this.idEmp  = localStorage.getItem('Empresa'); 
    this.pPais  = localStorage.getItem('Pais');   

    //Relacionar los controles de html a su respectivo Formbuilder
    /*************************************************************/

    this.partidaForm = this.formBuilder.group({
      txtCodigoPartida: [''],
      txtPartida: ['',Validators.required],
      txtDescripcion: ['',Validators.required],
      txtAbreviado: [''],
      cboComercial: ['',Validators.required],
      cboEstado: ['',Validators.required]
    }); 

    this.parGenForm = this.formBuilder.group({
      txtPartida: ['',Validators.required],
      txtDescripcion: ['',Validators.required],
      cboPersonal: ['',Validators.required],
      cboEstado: ['',Validators.required]
    }); 
    this.radioFiltroEstado.setValue('1');
    this.fnListarPartidaGen(Number.parseInt(this.radioFiltroEstado.value));
    
    this.fnGetTipoParGen() 

    this.lUsoComercial= [
      {nIdUso: 0 ,sDescripcion:"Si - Usa Comercial"},
      {nIdUso: 1 ,sDescripcion:"No - Usa Comercial"}
    ];

    this.lEstado= [
      {nIdEstado: 1 ,sDescripcion:"Activo"},
      {nIdEstado: 0 ,sDescripcion:"Inactivo"}
    ];

    // this.lPersonal= [
    //   {nIdPersonal: 1 ,sDescripcion:"Si "},
    //   {nIdPersonal: 0 ,sDescripcion:"No "}
    // ];
  }

  // Recuperar todos los controles de la partida Generica para Validar
  get v() {
    return this.parGenForm.controls;
  }

  // Recuperar todos los controles de la partida Especifica para Validar
  get u() {
    return this.partidaForm.controls;
  }


  //******************************************************************************************************************** */
  //Zona de implementacion de funciones  
  //******************************************************************************************************************** */


  fnGetTipoParGen = function () { 

    this.vDatoBasicoService.fnDatoBasico(2, 2, [], 4, this.url).subscribe(
      res => {
        this.lPersonal = res;
      },
      err => {
          this.spinner.hide();
      },
      () => {
          this.spinner.hide();
      }
  );
  }

  fnListarPartidaGen = function (estado: number) {
    this.spinner.show();
    let vFiltro = this.txtFiltroGen.value

    var pEntidad = 1; //Cabecera del movimiento
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 1;       //Listar Solo Guias de ingreso
    pParametro.push(this.pPais);
    pParametro.push(vFiltro);
    
    this.vDatoBasicoService.fnDatoBasico(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
        res => {
            let filtro;
            if(estado === 0) {
              filtro = res.filter(item => item.nEstado === estado);
            }
            if(estado === 1) {
              filtro = res.filter(item => item.nEstado === estado);
            }
            if(estado === 2) {
              filtro = res;
            }
            this.dsPartidaGen = new MatTableDataSource(filtro);
            this.dsPartidaGen.paginator = this.paginatorPartidaGen;
            this.dsPartidaGen.sort = this.sortPartidaGen;
        },
        err => {
            this.spinner.hide();
        },
        () => {
            this.spinner.hide();
        }
    );

  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dsPartidaGen.filter = filterValue.trim().toLowerCase();
  }

  fnVolver= function () {
    this.vPrincipal=true;
  }

  // **********************************************************************************************************************

  fnNuevaParGen = function () {
    this.vOpcion = 1;
    this.parGenForm.controls.txtPartida.setValue('');
    this.parGenForm.controls.txtDescripcion.setValue('');
    this.parGenForm.controls.cboPersonal.setValue('');
    this.parGenForm.controls.cboEstado.setValue(1);
    this.parGenForm.get('txtPartida').enable(); 
    this.parGenForm.get('cboEstado').disable(); 

  }

  fnValidarParGen = function () {
    let vNuevaPatida = this.parGenForm.value.txtPartida; 
    let vBase = vNuevaPatida.substr(0,2);
    let vPartidaNum: number;

    vPartidaNum =  + vNuevaPatida

    if (vNuevaPatida.length != 2 )
    {
      Swal.fire('¡Verificar!','La partida Generica debe tener 2 caracteres obligatorios.','error');
      this.parGenForm.controls.txtPartida.setValue('');
      return;
    }  

    if(isNaN(vPartidaNum))
    {
      Swal.fire('¡Verificar!','Todos los caracteres de la partida deben ser numericos','error');
      this.parGenForm.controls.txtPartida.setValue('');
      return;
    }
    
    
    this.spinner.show();

    // Consultamos si ya existe ese valor en base de datos
    var pEntidad = 1; 
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 2;       

    pParametro.push(this.pPais);
    pParametro.push(vNuevaPatida);
    this.vDatoBasicoService.fnDatoBasico(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
        res => {
          // console.log(res);
          if(res.cod!='0'){
            Swal.fire('¡Verificar!','La partida Generica indicada: '+ res.cod +' - '+res.mensaje+', ya se encuentra registrada, indique otro número.','error');
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

  fnSelecParGen = function(vPartida) {

    this.vOpcion = 2; //Cuando esta modificando
    this.vPartida = vPartida.nIdPartida
    // vPartida.sCodPartida.slice(vPartida.sCodPartida.length-2)
    // this.vTitulo = "Modificar la partida Especifica del grupo: "+ this.vPartidaGenDsc
    this.parGenForm.controls.txtPartida.setValue(vPartida.sParGen);
    this.parGenForm.controls.txtDescripcion.setValue(vPartida.sDescripcion);
    this.parGenForm.controls.cboPersonal.setValue(vPartida.nNotocar);
    this.parGenForm.controls.cboEstado.setValue(vPartida.nEstado);
    
    this.parGenForm.get('txtPartida').disable(); 
    this.parGenForm.get('cboEstado').enable(); 

  }

  fnGuardarParGen = async function () {

    let vDatosPartida;
    let pParametro = [];
    this.submitted = true;

    if (this.parGenForm.invalid) {
      return; //Si hay datos Obligatorios entonces no entra 
    }


    // Pasamos todos los valores para insertar Partida Gen
    vDatosPartida = this.parGenForm.value;

    // console.log('Modifica: '+ this.vOpcion)

    if(this.vOpcion == 1)
    {
      this.spinner.show();

      //Registrando una nueva partida
      pParametro.push(this.pPais);
      pParametro.push(vDatosPartida.txtPartida); 
      pParametro.push(vDatosPartida.txtDescripcion); 
      pParametro.push(vDatosPartida.cboPersonal);
        
      // Ejecutando el servicio
      this.vDatoBasicoService.fnDatoBasico(1, 1, pParametro, 0, this.url).subscribe(
          res => {
              // console.log('resultado: '+res)
              this.spinner.hide();
              //Validar si hay error:
              if (res == 0) {
                Swal.fire(
                    'Error', //Titulo
                    'No se pudo realizar el ingreso: Verifique su conexion a Internet', //Mensaje html
                    'error' //Tipo de mensaje
                ).then((result) => {
                });
              }else {

                this.fnListarPartidaGen(Number.parseInt(this.radioFiltroEstado.value))
                this.modalParGen.nativeElement.click();

                Swal.fire({
                  icon: 'success',
                  title: 'Correcto',
                  text: 'Se guardo la Partida Generica.',
                  showConfirmButton: false,
                  timer: 1500
                });
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
    else if(this.vOpcion == 2)
    {
      var resp = await Swal.fire({
        title: '¿Desea continuar?',
        text:'Se ' + (vDatosPartida.cboEstado==1?'activaran': 'inactivaran') + ' las partidas de la partida genérica.',
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

      this.spinner.show();

      //Modificando la partida Gen
      pParametro.push(this.vPartida);
      pParametro.push(vDatosPartida.txtDescripcion); 
      pParametro.push(vDatosPartida.cboPersonal);
      pParametro.push(vDatosPartida.cboEstado);
      console.log(pParametro)
      // Ejecutando el servicio
      this.vDatoBasicoService.fnDatoBasico(1, 3, pParametro, 0, this.url).subscribe(
          res => {

              //Validar si hay error:
              if (res == 0) {
                Swal.fire(
                    'Error', //Titulo
                    'No se pudo realizar la modificacion de la partida generica', //Mensaje html
                    'error' //Tipo de mensaje
                ).then((result) => {
                });
              }else {

                this.fnListarPartidaGen(Number.parseInt(this.radioFiltroEstado.value))
                this.modalParGen.nativeElement.click();
                Swal.fire({
                  icon: 'success',
                  title: 'Correcto',
                  text: 'Se actualizo el registro.',
                  showConfirmButton: false,
                  timer: 1500
                });
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
  }


  // **********************************************************************************************************************
  // **********************************************************************************************************************

  fnMostrarPartida = function (vParGen,estado) {
    //console.log('entro: '+vParGen)
    var pEntidad = 2; 
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 1;     

    pParametro.push(this.pPais);
    pParametro.push(vParGen);
    pParametro.push('');
    this.vDatoBasicoService.fnDatoBasico(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
        res => {
            /*this.lPartida = res;
            console.log(res);*/
            let filtro;
            if(estado === 0) {
              filtro = res.filter(item => item.nEstado === estado);
            }
            if(estado === 1) {
              filtro = res.filter(item => item.nEstado === estado);
            }
            if(estado === 2) {
              filtro = res;
            }
            this.dsPartida = new MatTableDataSource(filtro);
            this.dsPartida.sort = this.sortPartida;
            this.dsPartida.paginator = this.paginatorPartida
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

  fnBuscarPartida = function(){
    let vFiltro = this.txtFiltroPar.value
    
    var pEntidad = 2; 
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 1;     

    pParametro.push(this.pPais);
    pParametro.push(this.vPartidaGen);
    pParametro.push(vFiltro);

    this.spinner.show()
    this.vDatoBasicoService.fnDatoBasico(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
        res => {
            /*this.lPartida = res;*/

            this.dsPartida = new MatTableDataSource(res);
            this.dsPartida.sort = this.sortPartida;
            this.dsPartida.paginator = this.paginatorPartida
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

  fnVerDetalle(z){
    this.nModificable = z.nModificable;
    //Si se puede modificar se muestra la columna
    if(this.nModificable==1){
      let columnaAccion = this.dcPartida.find(item=> item=='accion')
      //Si no esta la agregamos
      if(!columnaAccion){
        this.dcPartida.splice(0, 0, 'accion');
      }
    }else{
      const indexCol = this.dcPartida.findIndex(item=> item=='accion')
      //Si lo encuentra lo saca
      if (indexCol > -1) {
        this.dcPartida.splice(indexCol, 1);
      }
    }

    this.dsPartida = new MatTableDataSource([]);
    this.dsPartida.sort = this.sortPartida;
    this.dsPartida.paginator = this.paginatorPartida

    this.spinner.show();
    this.vPrincipal = false;
    this.vPartidaGen= z.nIdPartida
    this.vPartidaGenDsc = z.sParGen +" - "+ z.sDescripcion
    this.vPartidaNumero = z.sParGen;

    this.radioFiltroEstadoEspecifica.setValue('1');
    this.fnMostrarPartida(z.nIdPartida,Number.parseInt(this.radioFiltroEstadoEspecifica.value))
    
  }

  fnValidarPartida = function () {
    let vNuevaPatida = this.partidaForm.value.txtPartida; 
    let vBase = vNuevaPatida.substr(0,2);
    let vParGEn = this.vPartidaGenDsc.substr(0,2)
    let vPartidaNum: number;
 
     
    vPartidaNum =  + vNuevaPatida
  
    if (vNuevaPatida.length != 2 )
    {
      Swal.fire('¡Verificar!','La partida debe tener 2 caracteres obligatorios,2 de la partida Especifica.','error');
      this.partidaForm.controls.txtPartida.setValue('');
      return;
    }  

    if(isNaN(vPartidaNum))
    {
      Swal.fire('¡Verificar!','Todos los caracteres de la partida deben ser numericos','error');
      this.partidaForm.controls.txtPartida.setValue('');
      return;
    }
    
   /* if (vBase != vParGEn )
    {
      Swal.fire('¡Verificar!','Los 2 primeros caracteres de la partida debe ser igual a: '+this.vPartidaGenDsc,'error');
      this.partidaForm.controls.txtPartida.setValue('');
      return;
    }  */
    
    this.spinner.show();

    // Consultamos si ya existe ese valor en base de datos
    var pEntidad = 2; 
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 2;       

    pParametro.push(this.pPais);
    pParametro.push(this.vPartidaGen);
    pParametro.push(this.vPartidaNumero + vNuevaPatida);
    this.vDatoBasicoService.fnDatoBasico(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
        res => {
          //console.log(res);
          if(res.cod!=0){
            Swal.fire('¡Verificar!','La partida indicada: '+ res.cod + ' - '+ res.mensaje +', ya se encuentra registrada, indique otro número.','error');
            this.partidaForm.controls.txtPartida.setValue('');
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

  fnGuardarPartida = function () {

    let vDatosPartida;
    let pParametro = [];
    
    this.submitted2 = true;

    if (this.partidaForm.invalid) {
      return; //Si hay datos Obligatorios entonces no entra 
    }

    this.spinner.show();

    // Pasamos todos los valores para insertar la cabecera
    vDatosPartida = this.partidaForm.value;

    if(this.vOpcion == 1)
    {
      //Registrando una nueva partida
      pParametro.push(this.pPais);
      pParametro.push(this.vPartidaGen);
      pParametro.push(this.vPartidaNumero + vDatosPartida.txtPartida); 
      pParametro.push(vDatosPartida.txtDescripcion); 
      pParametro.push(vDatosPartida.txtAbreviado); 
      pParametro.push(vDatosPartida.cboComercial);
        
      // Ejecutando el servicio
      this.vDatoBasicoService.fnDatoBasico(2, 1, pParametro, 0, this.url).subscribe(
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
            }else {

              this.fnMostrarPartida(this.vPartidaGen,Number.parseInt(this.radioFiltroEstadoEspecifica.value))
              this.modalPartida.nativeElement.click();
              Swal.fire({
                icon: 'success',
                title: 'Correcto',
                text: 'Se guardo.',
                showConfirmButton: false,
                timer: 1500
              });
            }
              
          },
          err => {
              this.spinner.hide();
              
          },
          () => {
              this.spinner.hide();
              this.submitted2 = false;
        }
      );  
    
    }
    else if(this.vOpcion == 2)
    {
      //Modificando la partida 
      pParametro.push(this.vPartida);
      pParametro.push(vDatosPartida.txtDescripcion); 
      pParametro.push(vDatosPartida.txtAbreviado); 
      pParametro.push(vDatosPartida.cboComercial);
      pParametro.push(vDatosPartida.cboEstado);
        
      // Ejecutando el servicio
      this.vDatoBasicoService.fnDatoBasico(2, 3, pParametro, 0, this.url).subscribe(
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
            }else {

              this.fnMostrarPartida(this.vPartidaGen,Number.parseInt(this.radioFiltroEstadoEspecifica.value))
              this.modalPartida.nativeElement.click();
              Swal.fire({
                icon: 'success',
                title: 'Correcto',
                text: 'Se guardo.',
                showConfirmButton: false,
                timer: 1500
              });
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

  fnNuevaPartida  = function () {
    this.vOpcion = 1;
    this.vTitulo = "Agregar partida Especifica a Generica: "+ this.vPartidaGenDsc
    this.partidaForm.controls.txtCodigoPartida.setValue(this.vPartidaNumero);
    this.partidaForm.controls.txtPartida.setValue('');
    this.partidaForm.controls.txtDescripcion.setValue('');
    this.partidaForm.controls.txtAbreviado.setValue('');
    this.partidaForm.controls.cboComercial.setValue('');
    this.partidaForm.controls.cboEstado.setValue(1);
    this.partidaForm.get('txtPartida').enable(); 
    this.partidaForm.get('cboEstado').disable(); 
  }

  fnSelecPartida = function(vPartida) {
    this.vOpcion = 2; //Cuando esta modificando
    this.vPartida = vPartida.nIdPartida
    // vPartida.sCodPartida.slice(vPartida.sCodPartida.length-2)
    this.vTitulo = "Modificar la partida Especifica del grupo: "+ this.vPartidaGenDsc
    this.partidaForm.controls.txtPartida.setValue(vPartida.sCodPartida);
    this.partidaForm.controls.txtDescripcion.setValue(vPartida.sDescripcion);
    this.partidaForm.controls.txtAbreviado.setValue(vPartida.sAbrev);
    this.partidaForm.controls.cboComercial.setValue(vPartida.nNotocar);
    this.partidaForm.controls.cboEstado.setValue(vPartida.nEstado);
    
    this.partidaForm.get('txtPartida').disable(); 
    this.partidaForm.get('cboEstado').enable(); 

  }


  cambioEstado(event) {
    let nEstado = Number.parseInt(event);
    this.fnListarPartidaGen(nEstado);

  }

  cambioEstadoEspecifico(event) {
    let nEstado = Number.parseInt(event);
    this.fnMostrarPartida(this.vPartidaGen,nEstado);
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
        this.fnNuevaParGen()
        break
      default:
        break
    }
  }
}
