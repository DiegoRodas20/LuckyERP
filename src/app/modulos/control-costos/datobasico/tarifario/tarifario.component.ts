import { ChangeDetectorRef, Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { resolve } from 'dns';
import { NgxSpinnerService } from 'ngx-spinner';
import { asistenciapAnimations } from 'src/app/modulos/comercial/Asistencia/asistenciap/asistenciap.animations';
import Swal from 'sweetalert2';
import { SergeneralService } from '../../../../shared/services/sergeneral.service';
import { DatoBasicoService } from '../datobasico.service';

// Importante para las validaciones
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null): boolean {
    return !!(control && control.invalid);
  }
}

@Component({
  selector: 'app-tarifario',
  templateUrl: './tarifario.component.html',
  styleUrls: ['./tarifario.component.css'],
  animations: [asistenciapAnimations]
})

export class TarifarioComponent implements OnInit {

  // Botones Flotantes Pantalla Principal
  tsListaPrincipal = 'inactive';  // Inicia la lista visible
  fbListaPrincipal = [ // Lista de las opciones que se mostrarán
    { icon: 'post_add', tool: 'Nuevo Tarifario' },
  ];
  abListaPrincipal = [];



  // Asigancion para Paginar y ordedar las columnas de mi tabla
  dataSource:  MatTableDataSource<any>
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild('MatSort1', {static: true}) sortTarifario1: MatSort;
  displayedColumns = ['nIdTarifario','sNumero','sClienteDsc','sDesc','sCanalDesc','sCategoriaDesc','sMoneda','nTotalRemunera','sVigente','sEstado']

  dataSource2: MatTableDataSource<any>
  @ViewChild('MatPaginator2', {static: true}) MatPaginator2: MatPaginator;
  @ViewChild('MatSort2', {static: true}) sortTarifario2: MatSort;
  displayedColumns2 = ['nIdDetTarifario','sCodPartida','sDesc','nImpMes','nDiaBase','nImpDia']

  dataSource3: MatTableDataSource<any>
  @ViewChild('MatPaginator3', {static: true}) MatPaginator3: MatPaginator;
  @ViewChild('MatSort3', {static: true}) sortTarifario3: MatSort;
  displayedColumns3 = ['nIdTarifarioRemun','sCodPartida','sDesc','nMonto']


  // Asigancion de modal
  @ViewChild('modalPartidaTarifario') modalPartidaTarifario: ElementRef;
  @ViewChild('modalPartidaRemun') modalPartidaRemun: ElementRef;

  url: string; //variable de un solo valor
  idUser :number; //id del usuario
  pNom:string;    //Nombre Usr
  idEmp: string;  //id de la empresa del grupo Actual
  pPais: string;  //Codigo del Pais de la empresa Actual

  // Controles libres
  txtFiltroGen = new FormControl();
  txtFiltroPar = new FormControl();
  txtTotal = new FormControl();

  cboPartidaRemuneacion = new FormControl('',[Validators.required]);
  txtMontoRemuneacion   = new FormControl('',[Validators.required]);

  objTarifa: any ;
  vTarifa : number = 0; // Id de la tarifa Actual
  vTarifaDet : number = 0; // Id de la partida tarifa Actual

  // Acciones
  vPrincipal: boolean = true;
  vModifica: boolean = false;

  // Botones
  tsLista = 'inactive';
  fbLista = [
    {icon: 'save', tool: 'Guardar', state: true},
    {icon: 'edit', tool: 'Editar', state: true},
    {icon: 'close', tool: 'Cancelar', state: true},
    {icon: 'check', tool: 'Aprobar', state: true},
    {icon: 'file_copy', tool: 'Duplicar', state: true},
    {icon: 'exit_to_app', tool: 'Salir', state: true},
  ];
  abLista = [];
  mostrarBotones = true; // Booleano para controlar la vista de los botones si es que hay un dialog abierto

  vbtnPartida: boolean = false;
  vModifica2: boolean = false;
  vModifica3: boolean = false;

  vOpcion: number = 0;
  vPartida: number = 0;

  // Listas para grillas
  lTarifa: any = [];
  lTarifaDetalle: any = [];
  lEstrucRemun: any = [];

  // Listas para Combos
  lCliente: any = [];
  lPartidaBase: any = [];
  lCanal: any = [];
  lCategoria: any = [];
  lMoneda: any = [];
  lVigente: any = [];
  lPartidaTarifa: any = [];
  lPartidaRemunera: any = [];
  lPartida: any = [];

  submitted: boolean = false;
  submitted2: boolean = false;

  tarifaForm: FormGroup;
  parTarifaForm: FormGroup;
  codigoMoneda: any;

  diaBaseActual: number = 1;

  matcher = new MyErrorStateMatcher();

  constructor(
    private spinner: NgxSpinnerService,
    private formBuilder: FormBuilder,
    private router: Router,
    private vDatoBasicoService: DatoBasicoService,
    private vSerGeneral: SergeneralService,
    private cdr: ChangeDetectorRef,

    @Inject('BASE_URL') baseUrl: string
  ) { this.url = baseUrl; }

  ngOnInit(): void {

    this.spinner.show();

    //Obtener Variables Generales del proyecto .
    let user    = localStorage.getItem('currentUser');
    this.idUser = JSON.parse(window.atob(user.split('.')[1])).uid;
    this.pNom   = JSON.parse(window.atob(user.split('.')[1])).uno;
    this.idEmp  = localStorage.getItem('Empresa');
    this.pPais  = localStorage.getItem('Pais');

    //Relacionar los controles de html a su respectivo Formbuilder
    /*************************************************************/

    this.onToggleFab(1,-1);
    this.onToggleFabPrincipal(1,-1);

    this.tarifaForm = this.formBuilder.group({
      cboCliente: ['',Validators.required],
      cboPartidaBase: ['',Validators.required],
      cboCanal: ['',Validators.required],
      cboCategoria: ['',Validators.required],
      cboMoneda: ['',Validators.required],
      txtVersion: [''],
      cboVigente: [''],
      txtImplemento: ['',Validators.required],
      txtImplementoDet: ['',Validators.required],
      txtReferencia: [''],
      txtDiaBase: ['',Validators.required],
      txtSueldoMes: [''],
      txtSueldoDia: [''],
      txtTotalRemunera: [''],
      txtTotalDia: [''],
      txtNumero: [''],
      txtCreado: [''],
      txtFechaCrea: [''],
      txtModificado: [''],
      txtFechaMod: [''],
      txtEstado: ['']
    });

    this.parTarifaForm = this.formBuilder.group({
      cboParTarifario: ['',Validators.required],
      txtMonto: ['',Validators.required],
      txtDiaBase: [1 ,Validators.required],
      txtMontoDia: ['',Validators.required]
    });

    this.fnListarTarifario();
    
  }

  //#region Botones

  onToggleFab(fab: number, stat: number) {

    stat = ( stat === -1 ) ? ( this.abLista.length > 0 ) ? 0 : 1 : stat;
    this.tsLista = ( stat === 0 ) ? 'inactive' : 'active';
    this.abLista = ( stat === 0 ) ? [] : this.fbLista;
  }

  async clickFab(index: number) {
    switch (index) {
      case 0:
        this.fnAccion(1);
        break;
      case 1:
        this.fnAccion(2);
        break;
      case 2:
        this.fnAccion(3);
        break;
      case 3:
        this.fnAccion(4);
        break;
      case 4:
        this.fnAccion(5);
        break;
      case 5:
        this.fnAccion(6);
        break;
      default:
        break;
    }
  }

  fnControlFab(vEstado){

    //Verificamos el estado de la tarifa para mostrar componentes
    if(vEstado == 1) //Pendiente
    {
      this.vModifica = false;
      this.vbtnPartida = false;

      this.fbLista[0].state = false; // Guardar
      this.fbLista[1].state = true; // Editar
      this.fbLista[2].state = false; // Cancelar
      this.fbLista[3].state = true; // Aprobar
      this.fbLista[4].state = false; // Duplicar
    }
    else if(vEstado == 2 || vEstado == 0) //Activo || Inactivo
    {
      this.vModifica = false;
      this.vbtnPartida = false;

      this.fbLista[0].state = false; // Guardar
      this.fbLista[1].state = false; // Editar
      this.fbLista[2].state = false; // Cancelar
      this.fbLista[3].state = false; // Aprobar
      this.fbLista[4].state = true; // Duplicar
    }

    else if(vEstado == 3) // Cuando es Nuevo
    {
      this.vModifica = true;
      this.vbtnPartida = true;

      this.fbLista[0].state = true; // Guardar
      this.fbLista[1].state = false; // Editar
      this.fbLista[2].state = false; // Cancelar
      this.fbLista[3].state = false; // Aprobar
      this.fbLista[4].state = false; // Duplicar
    }
    else if(vEstado == 4) // Cuando esta modificando
    {
      this.vModifica = true;
      this.vbtnPartida = true;

      this.fbLista[0].state = true; // Guardar
      this.fbLista[1].state = false; // Editar
      this.fbLista[2].state = true; // Cancelar
      this.fbLista[3].state = false; // Aprobar
      this.fbLista[4].state = false; // Duplicar

    }

    // Actualizamos el estado de los botones
    this.abLista = this.fbLista;
  }

  //#endregion

  // Recuperar todos los controles de la partida Generica para Validar
  get v() {
    return this.tarifaForm.controls;
  }

  // Recuperar todos los controles de la partida Especifica para Validar
  get u() {
    return this.parTarifaForm.controls;
  }


  //******************************************************************************************************************** */
  //Zona de implementacion de funciones
  //**********************************************************************************************************************

  fnIniDatosCabecera = function () {

    // Relacion de Clientes
    var pParametro = [];
    pParametro.push(this.pPais);
    this.vDatoBasicoService.fnDatoBasico(4, 2, pParametro, 4, this.url).subscribe(
          res => {
            this.lCliente = res;
        },
        err => {
            this.spinner.hide('spiDialog');
            console.log(err);
        },
        () => {
            this.spinner.hide('spiDialog');
        }
    );

    // Partidas de Personal
    var pParametro = [];
    pParametro.push(this.pPais);
    pParametro.push(1);
    this.vDatoBasicoService.fnDatoBasico(2, 2, pParametro, 3, this.url).subscribe(
          res => {
            this.lPartidaBase = res;
        },
        err => {
            this.spinner.hide('spiDialog');
            console.log(err);
        },
        () => {
            this.spinner.hide('spiDialog');
        }
    );

    // Partida de Remuneracion
    var pParametro = [];
    pParametro.push(this.pPais);
    pParametro.push(4);
    this.vDatoBasicoService.fnDatoBasico(2, 2, pParametro, 3, this.url).subscribe(
          res => {
            this.lPartidaRemunera = res;
        },
        err => {
            this.spinner.hide('spiDialog');
            console.log(err);
        },
        () => {
            this.spinner.hide('spiDialog');
        }
    );

    // Partida de Tarifa
    var pParametro = [];
    pParametro.push(this.pPais);
    pParametro.push(3);
    this.vDatoBasicoService.fnDatoBasico(2, 2, pParametro, 3, this.url).subscribe(
          res => {
            this.lPartidaTarifa = res;
        },
        err => {
            this.spinner.hide('spiDialog');
            console.log(err);
        },
        () => {
            this.spinner.hide('spiDialog');
        }
    );

    // Canal de Negocio
    this.vSerGeneral.fnSystemElements(1, '427', '1', 'nElecod,cElenam','', this.url).subscribe(
      res => {
          this.lCanal = res;
      },
      err => {
          console.log(err);
      },
      () => {
          // this.spinner.hide('spiDialog');
      }
    )

    // Categoria de Personal
    this.vSerGeneral.fnSystemElements(1, '1989', '1', 'nElecod,cElenam','', this.url).subscribe(
      res => {
          this.lCategoria = res;
      },
      err => {
          console.log(err);
      },
      () => {
          // this.spinner.hide('spiDialog');
      }
    )

    // Monedas del pais
    pParametro = [];
    pParametro.push(this.pPais);
    this.vDatoBasicoService.fnDatoBasico(4, 2, pParametro, 6, this.url).subscribe(
      res => {
          this.lMoneda = res;
          for (let index = 0; index < this.lMoneda.length; index++) {
            if( 1 == this.lMoneda[index].nParam )
            {
              this.codigoMoneda = this.lMoneda[index].nId;
            }
          }
          this.tarifaForm.controls.cboMoneda.setValue(this.codigoMoneda);

      },
      err => {
          console.log(err);
      },
      () => {
          // this.spinner.hide('spiDialog');
      }
    )

    //Implemento e Implemento detalle
    var pParametroImp = [];
    pParametroImp.push(this.idEmp);
    this.vDatoBasicoService.fnDatoBasico(4, 2, pParametroImp, 7, this.url).subscribe(
      res => {
        if(this.vOpcion == 1){ //Solo cuando se va a agregar tarifa se setean los implementos
          const lImplemento = res;
          if(lImplemento.length>0){
            this.tarifaForm.get('txtImplemento').setValue(lImplemento[0].nTarifaImplemento);
            this.tarifaForm.get('txtImplementoDet').setValue(lImplemento[0].nTarifaImplementoDet);
          }else{
            this.tarifaForm.get('txtImplemento').setValue(0);
            this.tarifaForm.get('txtImplementoDet').setValue(0);
          }
        }
      },
      err => {
          console.log(err);
      },
      () => {
          // this.spinner.hide('spiDialog');
      }
    )

    // Vigente
    this.lVigente= [
      {nIdVigente: 1 ,sDescripcion:"Si"},
      {nIdVigente: 0 ,sDescripcion:"No"}
    ];

    this.tarifaForm.get('txtCreado').disable();
    this.tarifaForm.get('txtFechaCrea').disable();
    this.tarifaForm.get('txtModificado').disable();
    this.tarifaForm.get('txtFechaMod').disable();
  }

  fnListarTarifario = function () {
    var pParametro = [];
    //let vFiltro = this.txtFiltroGen.value

    pParametro.push(this.idEmp);
    pParametro.push('');

    this.spinner.show('spiDialog');
    this.vDatoBasicoService.fnDatoBasico(4, 2, pParametro, 1, this.url).subscribe(
        async res => {
            this.lTarifa = res;
            this.dataSource = new MatTableDataSource(res);
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sortTarifario1;

            this.spinner.hide();
        },
        err => {
            this.spinner.hide('spiDialog');
            console.log(err);
        },
        () => {
            this.spinner.hide('spiDialog');
        }
    );
  }

  fnFiltrar(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  async fnNuevaTarifa () {
    this.vPrincipal = false;
    this.vModifica  = false;
    this.vOpcion = 1;

    this.lTarifaDetalle = []
    this.lEstrucRemun = []
    this.dataSource2 = new MatTableDataSource(null);
    this.dataSource3 = new MatTableDataSource(null);

    this.tarifaForm.controls.cboCliente.setValue('');
    this.tarifaForm.controls.cboPartidaBase.setValue('');
    this.tarifaForm.controls.cboCanal.setValue('');
    this.tarifaForm.controls.cboCategoria.setValue('');
    this.tarifaForm.controls.txtVersion.setValue('');
    this.tarifaForm.controls.txtImplemento.setValue('');
    this.tarifaForm.controls.txtImplementoDet.setValue('');
    this.tarifaForm.controls.cboVigente.setValue(0);
    this.tarifaForm.controls.txtReferencia.setValue('');
    this.tarifaForm.controls.txtDiaBase.setValue(1);
    this.tarifaForm.controls.txtSueldoMes.setValue('');
    this.tarifaForm.controls.txtSueldoDia.setValue('');
    this.tarifaForm.controls.txtTotalRemunera.setValue('');
    this.tarifaForm.controls.txtTotalDia.setValue('');
    this.tarifaForm.controls.txtNumero.setValue('');
    this.tarifaForm.controls.txtCreado.setValue('');
    this.tarifaForm.controls.txtFechaCrea.setValue('');
    this.tarifaForm.controls.txtModificado.setValue('');
    this.tarifaForm.controls.txtFechaMod.setValue('');
    this.tarifaForm.controls.txtEstado.setValue('Incompleto');
    //this.tarifaForm.controls.cboMoneda.setValue('');

    //Actualizamos la tabla material
    this.dataSource2 = new MatTableDataSource(this.lTarifaDetalle);
    this.dataSource2.paginator = this.MatPaginator2;
    this.dataSource2.sort = this.sortTarifario2;
    await this.fnCalcularTotales();

    //Modal
    this.txtTotal.setValue(0.00);

    this.tarifaForm.get('cboCliente').enable();
    this.tarifaForm.get('cboPartidaBase').enable();
    this.tarifaForm.get('cboCanal').enable();
    this.tarifaForm.get('cboCategoria').enable();
    this.tarifaForm.get('cboMoneda').enable();
    this.tarifaForm.get('txtVersion').disable();
    this.tarifaForm.get('txtImplemento').enable();
    this.tarifaForm.get('txtImplementoDet').enable();
    this.tarifaForm.get('cboVigente').disable();
    this.tarifaForm.get('txtReferencia').enable();
    this.tarifaForm.get('txtDiaBase').enable();

    this.vTarifa = 0; //Nueva tarifa seteamos nuestra variable principal que india id partida
    this.fnControlFab(3);
    this.fnIniDatosCabecera()
    //debugger;
    //this.tarifaForm.controls.cboMoneda.setValue(this.codigoMoneda);
  }

  fnVerDetalle (nIdTarifario){
    this.vOpcion = 2;
    this.vPrincipal = false;
    this.vModifica  = true;
    this.vTarifa = nIdTarifario //Actualizo la variable general para saber la tarifa actual

    this.fnIniDatosCabecera()

    this.spinner.show('spiDialog');
    var pParametro = [];
    pParametro.push(nIdTarifario);
    this.vDatoBasicoService.fnDatoBasico(4, 2, pParametro, 5, this.url).subscribe(
        async res => {
          //console.log(res);
          this.tarifaForm.controls.cboCliente.setValue(Number(res[0].nIdCliente));
          this.tarifaForm.controls.cboPartidaBase.setValue(res[0].nIdPartidaBase);
          this.tarifaForm.controls.cboCanal.setValue(res[0].nIdCanal.toString());
          this.tarifaForm.controls.cboCategoria.setValue(res[0].nIdCategoria.toString())
          this.tarifaForm.controls.cboMoneda.setValue(res[0].nIdMoneda);
          this.tarifaForm.controls.txtVersion.setValue(res[0].nVersion);
          this.tarifaForm.controls.txtImplemento.setValue(res[0].nResguardo);
          this.tarifaForm.controls.txtImplementoDet.setValue(res[0].nResguardoDet);
          this.tarifaForm.controls.cboVigente.setValue(res[0].bEsVigente);
          this.tarifaForm.controls.txtReferencia.setValue(res[0].sObservacion);
          this.tarifaForm.controls.txtDiaBase.setValue(res[0].nDiaBase);
          this.tarifaForm.controls.txtSueldoMes.setValue((Math.round( res[0].nSueldoBase * 100) / 100).toFixed(4));
          this.tarifaForm.controls.txtSueldoDia.setValue((Math.round( res[0].nDiaSueldo * 100) / 100).toFixed(4));
          this.tarifaForm.controls.txtTotalRemunera.setValue((Math.round( res[0].nTotalRemunera * 100) / 100).toFixed(4));
          this.tarifaForm.controls.txtTotalDia.setValue((Math.round( res[0].nDiaTotaRemunera * 100) / 100).toFixed(4));
          this.tarifaForm.controls.txtNumero.setValue(res[0].sNumero);
          this.tarifaForm.controls.txtCreado.setValue(res[0].sUsrRegistro);
          this.tarifaForm.controls.txtFechaCrea.setValue(res[0].sFechaRegistro);
          this.tarifaForm.controls.txtModificado.setValue(res[0].sUsrModifico);
          this.tarifaForm.controls.txtFechaMod.setValue(res[0].sFechaModifico);
          this.tarifaForm.controls.txtEstado.setValue(res[0].sEstado);

          this.tarifaForm.get('cboCliente').disable();
          this.tarifaForm.get('cboPartidaBase').disable();
          this.tarifaForm.get('cboCanal').disable();
          this.tarifaForm.get('cboCategoria').disable();
          this.tarifaForm.get('cboMoneda').disable();
          this.tarifaForm.get('txtVersion').disable();
          this.tarifaForm.get('txtImplemento').disable();
          this.tarifaForm.get('txtImplementoDet').disable();
          this.tarifaForm.get('cboVigente').disable();
          this.tarifaForm.get('txtReferencia').disable();
          // this.tarifaForm.get('txtDiaBase').disable();

          await this.fnEstructuraRemunDetalle(res[0].nIdTarifario);
          await this.fnTarifaDetalle(res[0].nIdTarifario)
          this.fnControlFab(res[0].nIdEstado);
          this.spinner.hide('spiDialog');
        },
        err => {
            this.spinner.hide('spiDialog');
            console.log(err);
        },
        () => {
            this.spinner.hide('spiDialog');
        }
    );

  }

  async fnTarifaDetalle (vTarifario) {

    var pParametro = []; //Parametros de campos vacios
    pParametro.push(vTarifario);

    try{
      const res = await this.vDatoBasicoService.fnDatoBasico(5, 2, pParametro, 1, this.url).toPromise();

      this.lTarifaDetalle = res;
      this.dataSource2 = new MatTableDataSource(res);
      this.dataSource2.paginator = this.MatPaginator2
      this.dataSource2.sort = this.sortTarifario2
      await this.fnCalcularTotales()
    }
    catch(err){
      console.log(err);
    }

  }

  async fnEstructuraRemunDetalle (vTarifa){

    var pParametro = []; //Parametros de campos vacios
    this.lEstrucRemun=[]
    pParametro.push(vTarifa);

    try {
      this.lEstrucRemun = await this.vDatoBasicoService.fnDatoBasico(6, 2, pParametro, 1, this.url).toPromise();
      this.dataSource3 = new MatTableDataSource(this.lEstrucRemun);
      this.dataSource3.paginator = this.MatPaginator3;
      this.dataSource3.sort = this.sortTarifario3;
    }
    catch(err){
      console.log(err);
    }
  }

  // **********************************************************************************************************************
  // **********************************************************************************************************************

  fnEstructuraRemuneracion = function () {

    this.submitted = true;

    if (this.tarifaForm.invalid) {
      //Si aun hay datos Obligatorios muestra mensaje y corta el proceso
      Swal.fire('¡Verificar!','Existen datos obligatorios para iniciar la asignacion del sueldo mes.','warning')
      return;
    }

    this.submitted = false;
    this.modalPartidaRemun.nativeElement.click();
  }

  async fnPartidaTarifa (vTipo, vParTarifa) {

    let vDiabase = this.tarifaForm.value.txtDiaBase
    let vPartida = this.parTarifaForm.value.cboParTarifario
    let vMontoTarifa = this.parTarifaForm.value.txtMonto
    let nNumDiaBase: number;
    let vMontoDia: number;
    let pParametro = []

    nNumDiaBase = + vDiabase
    vPartida = + vPartida

    if(this.lEstrucRemun.length==0) //Si no hay partidas de remuneracion no puede ingresar detalle de la Tarifa
    {
      Swal.fire('¡Verificar!','No se puede agregar partidas de tarifario, primero debe definir la estructura salarial (Sueldo Mes).','warning')
      return;
    }

    // ******************************************************************************
    if(vTipo == 1 ) //Cuando se tiene que mostrar el modal de partida Tarifario
    {
      this.vModifica2 = true;
      this.vModifica3 = false;

      this.parTarifaForm.controls.cboParTarifario.setValue('');
      this.parTarifaForm.controls.txtMonto.setValue('');
      this.parTarifaForm.controls.txtMontoDia.setValue(0);
      this.parTarifaForm.controls.txtDiaBase.setValue(vDiabase)
      this.parTarifaForm.get('cboParTarifario').enable();
      this.modalPartidaTarifario.nativeElement.click();

    }
    else if(vTipo == 2) //Cuando ingresa el monto por partida tarifario
    {
      vMontoDia = (vMontoTarifa / nNumDiaBase * 100 / 100)
      this.parTarifaForm.controls.txtMontoDia.setValue(vMontoDia.toFixed(4))
    }
    else if(vTipo == 3) //Cuando registra la nueva partida de tarifario
    {

      // console.log(vMontoTarifa, vPartida)
      // Primero Validamos si cuenta con monto asignado
      if (vMontoTarifa<=0 || vPartida==0 || isNaN(vPartida))
      {
        Swal.fire('¡Verificar!','Debe indicar la partida de tarifario y asignarle el importe mensual superior a cero','warning')
        return
      }

      //Buscamos la partida tarifario si ya esta registrada
      for (let index = 0; index < this.lTarifaDetalle.length; index++) {
        if(vPartida == this.lTarifaDetalle[index].nIdPartida)
        {
          Swal.fire('¡Verifique!','El concepto indicado: ya se encuentra registrado, seleccione otra partida', 'warning')
          return;
        }
      }

      //Agregamos la partida de tarifario
      let vPartidaTari: any
      for (let index = 0; index < this.lPartidaTarifa.length; index++) {
        if(vPartida == this.lPartidaTarifa[index].nIdPartida)
        {
          vPartidaTari = {nIdDetTarifario: 0, nIdTarifario: 0,	nIdPartida: vPartida,	sCodPartida: this.lPartidaTarifa[index].sCodPartida,
             sDesc: this.lPartidaTarifa[index].sDescripcion, nImpMes: vMontoTarifa, nDiaBase:	vDiabase ,nImpDia: (vMontoTarifa / nNumDiaBase * 100 / 100).toFixed(4)}
        }
      }

      this.lTarifaDetalle .push(vPartidaTari)
      this.dataSource2 = new MatTableDataSource(this.lTarifaDetalle);
      this.dataSource2.paginator = this.MatPaginator2;
      this.dataSource2.sort = this.sortTarifario2;

      //Limpiamos los controles
      this.parTarifaForm.controls.cboParTarifario.setValue('');
      this.parTarifaForm.controls.txtMonto.setValue('');
      this.parTarifaForm.controls.txtMontoDia.setValue(0);

      await this.fnCalcularTotales()

    }
    else if(vTipo == 4) //Cuando se quiere modificar la partida de tarifario
    {

      this.vTarifaDet = vParTarifa.nIdPartida
      this.parTarifaForm.controls.cboParTarifario.setValue(vParTarifa.nIdPartida);
      this.parTarifaForm.controls.txtMonto.setValue(vParTarifa.nImpMes);
      this.parTarifaForm.controls.txtMontoDia.setValue(vParTarifa.nImpDia);
      this.parTarifaForm.controls.txtDiaBase.setValue(vDiabase);

      this.parTarifaForm.get('cboParTarifario').disable();

      // this.parTarifaForm.get('cboParTarifario').disable();
      this.vModifica2 = false;
      this.vModifica3 = true;
      this.modalPartidaTarifario.nativeElement.click();
    }
    else if(vTipo == 5) //Cuando se modifica el monto de la partida de tarifario
    {

      // Primero Validamos si cuenta con monto asignado
      if (vMontoTarifa<=0 || this.vTarifaDet==0)
      {
        Swal.fire('¡Verificar!','Debe indicar la partida de tarifario y asignarle el importe mensual superior a cero','warning')
        return
      }

      // console.log('a ver id tarifa '+this.vTarifaDet)
      // console.log('a ver Monto '+vMontoTarifa)

      //Buscamos la partida tarifario si ya esta registrada
      for (let index = 0; index < this.lTarifaDetalle.length; index++) {
        if(this.lTarifaDetalle[index].nIdPartida == this.vTarifaDet)
        {
          this.lTarifaDetalle[index].nImpMes = vMontoTarifa;
          this.lTarifaDetalle[index].nImpDia = (vMontoTarifa / nNumDiaBase * 100 / 100).toFixed(4)
        }
      }

      //Actualizamos la tabla material
      this.dataSource2 = new MatTableDataSource(this.lTarifaDetalle);
      this.dataSource2.paginator = this.MatPaginator2;
      this.dataSource2.sort = this.sortTarifario2;
      await this.fnCalcularTotales()
      this.modalPartidaTarifario.nativeElement.click();

    }
  }

  async fnRegistraRemunera () {
    let vPartida = this.cboPartidaRemuneacion.value;
    let vMonto =  this.txtMontoRemuneacion.value ;

    // Primero Validamos si cuenta con monto asignado
    if (vMonto<=0 || vPartida==0 || isNaN(vPartida))
    {
      Swal.fire('¡Verificar!','Debe indicar el concepto y asignarle el importe mensual superior a cero','warning')
      return
    }

    //Buscamos la partida si ya esta registrada
    for (let index = 0; index < this.lEstrucRemun.length; index++) {
      if(vPartida == this.lEstrucRemun[index].nIdPartida)
      {
        Swal.fire('¡Verifique!','El concepto indicado:  ya se encuentra registrado, seleccione otra partida', 'warning')
        return;
      }
    }

    //Agregamos la partida
    let vPartidaRem: any
    for (let index = 0; index < this.lPartidaRemunera.length; index++) {
      if(vPartida == this.lPartidaRemunera[index].nIdPartida)
      {
        vPartidaRem = {nIdTarifarioRemun: 0, nIdTarifario: 0,	nIdPartida: vPartida,	sCodPartida: this.lPartidaRemunera[index].sCodPartida, sDesc: this.lPartidaRemunera[index].sDescripcion, nMonto: vMonto}
      }
    }

    this.lEstrucRemun.push(vPartidaRem)
    this.dataSource3 = new MatTableDataSource(this.lEstrucRemun);
    this.dataSource3.paginator = this.MatPaginator3;
    this.dataSource3.sort = this.sortTarifario3;

    //Limpiamos los controles
    this.cboPartidaRemuneacion.setValue('')
    this.txtMontoRemuneacion.setValue('')

    await this.fnCalcularTotales()
  }

  // Se guarda el dia actual antes de la modificacion
  async fnGuardarDiaActual(){
    const diasBaseActual = this.tarifaForm.get("txtDiaBase").value;
    if(diasBaseActual != '' && diasBaseActual != null){
      this.diaBaseActual = Number(diasBaseActual);
    }
    else{
      this.diaBaseActual = 1;
    }
  }

  async fnActualizarDia (){
    
    let vDia = this.tarifaForm.get("txtDiaBase").value;

    if(vDia != '' && vDia != null && Number(vDia) > 0){
      for (let index = 0; index < this.lTarifaDetalle.length; index++) {
        this.lTarifaDetalle[index].nDiaBase = vDia
        this.lTarifaDetalle[index].nImpDia = (this.lTarifaDetalle[index].nImpMes / vDia * 100 / 100).toFixed(4)
      }

      //Actualizamos la tabla material
      this.dataSource2 = new MatTableDataSource(this.lTarifaDetalle);
      this.dataSource2.paginator = this.MatPaginator2;
      this.dataSource2.sort = this.sortTarifario2;
      await this.fnCalcularTotales()
    }
    else if(Number(vDia) <= 0){
      Swal.fire('¡Verificar!','Los dias no pueden ser negativos ni ceros','warning')
      this.tarifaForm.get("txtDiaBase").setValue(this.diaBaseActual);
    }
    else{
      this.tarifaForm.get("txtDiaBase").setValue(this.diaBaseActual);
    }
  }

  async fnCalcularTotales (): Promise<void>{
    return new Promise((resolve, reject) =>{
      let vTotalSueldo: number = 0, vTotalTarifa: number = 0, vTotalFinal: number = 0, vDia: number = 0, vDiaSueldo : number = 0;
      vDia = this.tarifaForm.value.txtDiaBase

      //Total concepto de remuneracion
      for (let index = 0; index < this.lEstrucRemun.length; index++) {
        vTotalSueldo = vTotalSueldo + this.lEstrucRemun[index].nMonto;
      }

      //Total partidas de tarifario
      for (let index = 0; index < this.lTarifaDetalle.length; index++) {
        vTotalTarifa = vTotalTarifa + this.lTarifaDetalle[index].nImpMes;
      }
      //Calculando totales
      vDiaSueldo  = vTotalSueldo / vDia
      vTotalFinal = vTotalSueldo + vTotalTarifa
      this.tarifaForm.controls.txtSueldoMes.setValue((vTotalSueldo * 100 / 100).toFixed(4));
      this.tarifaForm.controls.txtSueldoDia.setValue((vDiaSueldo * 100 / 100).toFixed(4));

      this.tarifaForm.controls.txtTotalRemunera.setValue((vTotalFinal * 100 / 100).toFixed(4));
      this.tarifaForm.controls.txtTotalDia.setValue((vTotalFinal/vDia * 100 / 100).toFixed(4));
      this.txtTotal.setValue((vTotalSueldo * 100 / 100).toFixed(4));
      // (Math.round( this.lTotales[0].nDiaTotaRemunera * 100) / 100).toFixed(4)
      resolve();
    })
  }

  fnEliminaPartida = function(index) {
    //console.log('eliminar: '+ index)

    Swal.fire({
      title: '¿Desea eliminar la partida?',
      text: "Se eliminara del tarifario y cambiara el total remuneración",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar'
    }).then(async (result) => {
      if (result.isConfirmed) {

        this.lTarifaDetalle.splice(index, 1)
        this.dataSource2 = new MatTableDataSource(this.lTarifaDetalle);
        this.dataSource2.paginator = this.MatPaginator2;
        this.dataSource2.sort = this.sortTarifario2;
        await this.fnCalcularTotales()
      }
    })
  }

  fnEliminaPartidaRemu= function(index) {
    //console.log(index)
    Swal.fire({
      title: '¿Desea eliminar el concepto de remuneración?',
      text: "Se cambiara el sueldo mes",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar'
    }).then(async (result) => {
      if (result.isConfirmed) {

        this.lEstrucRemun.splice(index, 1)
        this.dataSource3 = new MatTableDataSource(this.lEstrucRemun);
        this.dataSource3.paginator = this.MatPaginator3;
        this.dataSource3.sort = this.sortTarifario3;
        await this.fnCalcularTotales()
      }
    })

  }

  async fnAccion (vTipo) {

    if(vTipo == 1) // Guardar
    {

      //Si aun hay datos Obligatorios muestra mensaje y corta el proceso
      if (this.tarifaForm.invalid) {
        Swal.fire('¡Verificar!','Existen datos obligatorios para guardar el registro.','warning')
        return;
      }

      let vDatosTarifa;
      let pParametro = [];
      vDatosTarifa = this.tarifaForm.value;

      Swal.fire({
        title: '¿Desea guardar la tarifa?',
        text: "Se guardaran los datos de la tarifa con estado 'Pendiente' para el cargo y cliente seleccionado",
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed) {

          //Ingresando los datos para el registro de la cabecera como estado Pendiente
          this.spinner.show('spiDialog')
          let Opci = this.vTarifa==0 ? 1 : 3
          if(Opci == 1)
          {
            pParametro.push(this.idEmp);
            pParametro.push(vDatosTarifa.cboCliente);
            pParametro.push(vDatosTarifa.cboPartidaBase);
            pParametro.push(vDatosTarifa.cboCategoria);
            pParametro.push(vDatosTarifa.cboCanal);
            pParametro.push(vDatosTarifa.cboMoneda);
            pParametro.push(0); //Cuando se crea no esta Vigente
            pParametro.push(vDatosTarifa.txtImplemento);
            pParametro.push(vDatosTarifa.txtDiaBase);
            pParametro.push(vDatosTarifa.txtReferencia);
            pParametro.push(this.idUser);
            pParametro.push(vDatosTarifa.txtImplementoDet);
            pParametro.push(this.pPais);
          }
          else
          {
            pParametro.push(this.vTarifa);
            pParametro.push(vDatosTarifa.txtImplemento);
            pParametro.push(vDatosTarifa.txtDiaBase);
            pParametro.push(vDatosTarifa.txtReferencia);
            pParametro.push(vDatosTarifa.txtImplementoDet);
            pParametro.push(this.idUser);
            pParametro.push(this.pPais);
          }

          var vlistaFinal: any = []

          for (let index = 0; index < this.lEstrucRemun.length; index++) {
            let vPartidaRem = {nIdTarifario: 1,	nIdPartida: this.lEstrucRemun[index].nIdPartida, nMonto: this.lEstrucRemun[index].nMonto}
            vlistaFinal.push(vPartidaRem)
          }

          for (let index = 0; index < this.lTarifaDetalle.length; index++) {
            let vPartidaTar = {nIdTarifario: 2,	nIdPartida: this.lTarifaDetalle[index].nIdPartida, nMonto: this.lTarifaDetalle[index].nImpMes}
            vlistaFinal.push(vPartidaTar)
          }

          // Registro de la cabecera
          this.vDatoBasicoService.fnTarifario(4, Opci, pParametro, vlistaFinal , this.lTarifaDetalle, this.url).subscribe(
              res => {
                  //Validar si hay error:
                  if (res == 0) {
                    Swal.fire('Error','No se pudo realizar el ingreso: Verifique su conexion a Internet','error')
                  }
                  else
                  {
                    if (Opci == 1)
                    {
                      Swal.fire({
                        position: 'center',
                        icon: 'success',
                        title: 'Se guardo correctamente',
                        showConfirmButton: false,
                        timer: 1500
                      })

                      this.vTarifa = res;
                      let vCorrelativo = '000000' + res
                      this.tarifaForm.controls.txtNumero.setValue(vCorrelativo.substr(vCorrelativo.length-7));
                      this.vOpcion = 0; //Actualizamos la variable para que no vuelva a pedir ingreso
                      this.fnVerDetalle(res)
                    }
                    else
                    {
                      Swal.fire({
                        position: 'center',
                        icon: 'success',
                        title: 'Se guardo correctamente',
                        showConfirmButton: false,
                        timer: 1500
                      })
                      //Actualizamos la data del formulario
                      this.fnVerDetalle(this.vTarifa)
                    }
                  }
              },
              err => {
                  this.spinner.hide('spiDialog');
                  console.log(err);
              },
              () => {
                  this.spinner.hide('spiDialog');
                  this.submitted = false;
            }
          );

          this.spinner.hide('spiDialog')
        }
      })


    }
    else if(vTipo==2) //Modificar
    {
      this.vModifica = false;

      this.fnControlFab(4);
      this.tarifaForm.get('txtImplemento').enable();
      this.tarifaForm.get('txtImplementoDet').enable();
      this.tarifaForm.get('txtReferencia').enable();
    }
    else if(vTipo==3) //Cancelar
    {

      Swal.fire({
        title: '¿Desea cancelar la edición?',
        text: "Se perderán los cambios realizados",
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar'
      }).then(async (result) => {
        if (result.isConfirmed) {

          this.fnVerDetalle(this.vTarifa)
          await this.fnCalcularTotales()

        }
      })

    }
    else if(vTipo==4) //Aprobar Tarifa
    {

      if(this.lTarifaDetalle.length == 0 || this.lEstrucRemun.length == 0) //Si no hay partidas de tarifario no puede Aprobar la Tarifa
      {
        Swal.fire('¡Verificar!','No se puede aprobar una tarifa que no tiene partida de tarifario ni estructura salarial.','warning')
        return;
      }
      //console.log(this.lTarifaDetalle.length,this.lEstrucRemun.length)
      Swal.fire({
        title: '¿Desea Aprobar la Tarifa?',
        text: "Esta tarifa, estara disponible para la creación de presupuestos del area comercial.",
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
          this.spinner.show('spiDialog');
          //Actualizando la tarifa para que este activada
          let pParametro = [];
          pParametro.push(this.vTarifa);
          this.vDatoBasicoService.fnDatoBasico(4, 3, pParametro, 2, this.url).subscribe(
              res => {
                  if(res == 0)
                  {
                    // Cuando devuelve error
                    Swal.fire('¡Error!','Se presentaron problemas de conexion, vuelva a intentar.','error')
                    this.spinner.hide('spiDialog');
                  }
                  else
                  {
                    Swal.fire({
                      position: 'center',
                      icon: 'success',
                      title: 'Se aprobó correctamente',
                      showConfirmButton: false,
                      timer: 1500
                    })

                    this.fnControlFab(2)
                    this.tarifaForm.controls.txtEstado.setValue('Activo');
                    this.tarifaForm.controls.cboVigente.setValue(1);
                    this.spinner.hide('spiDialog');
                  }
              },
              err => {
                  this.spinner.hide('spiDialog');
                  console.log(err);
              },
              () => {
                  this.spinner.hide('spiDialog');
              }
          );
        }
      })
    }
    else if(vTipo==5) //Duplicar
    {

      this.vTarifa = 0;

      this.tarifaForm.controls.txtNumero.setValue('');
      this.tarifaForm.controls.txtCreado.setValue('');
      this.tarifaForm.controls.txtFechaCrea.setValue('');
      this.tarifaForm.controls.txtModificado.setValue('');
      this.tarifaForm.controls.txtFechaMod.setValue('');
      this.tarifaForm.controls.txtEstado.setValue('Pendiente');

      this.tarifaForm.get('cboCliente').enable();
      this.tarifaForm.get('cboPartidaBase').enable();
      this.tarifaForm.get('cboCanal').enable();
      this.tarifaForm.get('cboCategoria').enable();
      this.tarifaForm.get('cboMoneda').enable();
      this.tarifaForm.get('txtImplemento').enable();
      this.tarifaForm.get('txtImplementoDet').enable();
      this.tarifaForm.get('txtReferencia').enable();

      this.fnControlFab(3)

      await this.fnCalcularTotales();
    }
    else if(vTipo==6) //Salir
    {
      this.fnListarTarifario()
      this.vPrincipal = true;
    }
  }

  fnPrimeraMayuscula = function(){
    // let str:string = this.tarifaForm.controls.txtReferencia.value ;

    // if(str)

    // //console.log(str);
    // str = str[0].toUpperCase() + str.slice(1).toLocaleLowerCase() ;
    // //console.log(str);
    // this.tarifaForm.controls.txtReferencia.setValue(str);
  }


  //Botones Flotantes Principal
  onToggleFabPrincipal(fab: number, stat: number) {
    stat = (stat === -1) ? (this.abListaPrincipal.length > 0) ? 0 : 1 : stat;
    this.tsListaPrincipal = (stat === 0) ? 'inactive' : 'active';
    this.abListaPrincipal = (stat === 0) ? [] : this.fbListaPrincipal;
  }

  clickFabPrincipal(index: number) {
    switch (index) {
      case 0:
        this.fnNuevaTarifa()
        break
      default:
        break
    }
  }
}




