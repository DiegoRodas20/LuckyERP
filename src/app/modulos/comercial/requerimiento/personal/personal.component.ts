import { MatStepper } from "@angular/material/stepper";
import { PersonalService } from "./personal.service";
import { NgxSpinnerService } from "ngx-spinner";
import * as moment from 'moment';
import { FormGroup, FormBuilder, Validators, FormControl, FormArray, ValidatorFn, ValidationErrors, } from "@angular/forms";
import { MatPaginator } from "@angular/material/paginator";
import { Requerimiento } from "./../model/requerimiento";
import { MatTableDataSource } from "@angular/material/table";
import { AfterViewInit, Component, OnInit, ViewChild, Inject } from "@angular/core";
import { SergeneralService } from "./../../../../shared/services/sergeneral.service";
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from "@angular/material/core";
import { AppDateAdapter, APP_DATE_FORMATS } from "./../../../../shared/services/AppDateAdapter";
import Swal from "sweetalert2";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { EstadoefectivoComponent } from './../efectivo/estadoefectivo/estadoefectivo.component';
import { ListaPostulanteComponent } from './listapersonal/listapostulante.component';
import { PortalModalComponent } from './portal-modal/portal-modal.component';
import { Estado } from './../model/IEfectivo';
import { asistenciapAnimations } from '../../Asistencia/asistenciap/asistenciap.animations';
import { DigcomentarioaprobacionComponent } from './../../presupuesto/digcomentarioaprobacion/digcomentarioaprobacion.component';
import fabButtonConfig from "src/app/modulos/egy-humana/JefaturaAP/SeguridadSaludT/gestionem/Clases/GestionEmCitas/FabButtonConfig";
import { MatSort } from "@angular/material/sort";
import { Moment } from "moment";

@Component({
  selector: "app-personal",
  templateUrl: "./personal.component.html",
  styleUrls: ["./personal.component.css"],
  providers: [
    { provide: DateAdapter, useClass: AppDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS },
  ],
  animations: [asistenciapAnimations]
})

export class PersonalComponent implements OnInit {

  //#region Variables del Sistema
  id: number;
  url: string;
  pais: string;
  Empresa: string;
  lPar: number;
  //#endregion 


  //#region Variables Botones
  radioAlimentos = [
    { "option": "Si", "checked": false },
    { "option": "No", "checked": false }
  ]

  abLista = [];
  tsLista = 'active';

  fbLista = [
    { icon: 'post_add', tool: 'Nuevo R. Personal' }
  ];

  abAdd = [];
  tsDetail = 'active';

  fbGuardar = [
    { icon: 'save', tool: 'Guardar' },
    { icon: 'exit_to_app', tool: 'Salir' }
  ];

  fbEditar = [
    { icon: 'save', tool: 'Grabar' },
    { icon: 'list_alt', tool: 'Histórico de Estado' },
    { icon: 'exit_to_app', tool: 'Salir' }
  ];

  fbDevuelto = [
    { icon: 'save', tool: 'Grabar' },
    { icon: 'list_alt', tool: 'Histórico de Estado' },
    { icon: 'exit_to_app', tool: 'Salir' }
  ];

  fbAtraccion = [
    { icon: 'list_alt', tool: 'Histórico de Estado' },
    { icon: 'assignment_return', tool: 'Devolver RQ' },
    { icon: 'check_circle', tool: 'Aceptar Requerimiento' },
    { icon: 'group', tool: 'Lista Personal' },
    { icon: 'exit_to_app', tool: 'Salir' },
  ];

  fbAccion = [
    { icon: 'list_alt', tool: 'Histórico de Estado' },
    { icon: 'group', tool: 'Lista Personal' },
    { icon: 'exit_to_app', tool: 'Salir' }
  ];

  fbAccionPermiso = [
    { icon: 'list_alt', tool: 'Histórico de Estado' },
    { icon: 'group', tool: 'Lista Personal' },
    { icon: 'share', tool: 'Publicar en el Portal' },
    { icon: 'exit_to_app', tool: 'Salir' }
  ];
  //#endregion


  //#region Variables
  sTitulo: string;
  idPersonal: any;
  nIdPuesto: number;
  opcion: number;
  perfil: string;
  objPresupuesto: any;
  objRequerimientos: any;
  objRequerimientoEditar: any;
  objDetalle: any;
  objMensualBruto: any
  objPlanilla: any;
  isLinear = false;
  ofertaRadioBtn: number;
  Cantidad: number;
  accionStepper: string = "cancel";
  //#endregion


  //#region Declaracion Formularios Reactivos
  presupuestoFormGroup: FormGroup;
  planillaFormGroup: FormGroup;
  ofertaFormGroup: FormGroup;
  horarioTrabajoFormGroup: FormGroup;
  diasSemanaFormGroup: FormGroup;
  sanidadFormGroup: FormGroup;
  documentoFormGroup: FormGroup;
  requerimientoFormGroup: FormGroup;
  mensualFormGroup: FormGroup;
  tipoMensualFormGroup: FormGroup;
  diarioFormGroup: FormGroup;
  herramientasFormGroup: FormGroup;
  //#endregion


  //#region  Listas
  sltCanal: any;
  sltMotivo: any;
  sltSexo: any;
  sltSucursal: any;
  sltGrupo: any;
  sltCargo: any;
  sltSubCanal: any;
  sltPuesto: any;
  sltIngreso: any;
  sltSalida: any;
  sltRefrigerio: any;
  sltCuenta: any;
  sltContrato: any;
  sltPlanilla: any;
  sltSubMotivo: any;
  listaHerramientas = []
  arraySucursal = new Object();
  //#endregion


  //#region Datos Logicos(Boolean)
  BtnP: boolean = true;
  BtnPermiso: boolean = true;
  BtnCrear: boolean = false;
  isDisabled: boolean = false
  isColgate: boolean = false
  //#endregion


  //#region Tablas
  dataSource: MatTableDataSource<any>;
  displayedColumns: string[] = ["Opciones", "sCodRQ", "sCodCC", "sDescCC", "sMotivo", "sSolicitante", 'sEstado', 'dFechaCreacion']
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  @ViewChild("stepper") stepper: MatStepper;

  //Table Herramientas
  listaHerramientasTableData: MatTableDataSource<any>;
  @ViewChild('listaHerramientasPaginator', { static: true }) listaHerramientasPaginator: MatPaginator;
  @ViewChild(MatSort) listaHerramientasSort: MatSort;
  listaHerramientasTableColumns: string[] = ['opcion', 'sNombreHerramienta'];

  //#endregion


  /* Fechas */
  todayDate: Date = new Date();
  todayDateFin: Date = new Date();


  constructor(
    private _formBuilder: FormBuilder,
    private vSerGeneral: SergeneralService,
    private vPersonalService: PersonalService,
    public dialog: MatDialog,
    private spinner: NgxSpinnerService,

    @Inject("BASE_URL") baseUrl: string
  ) {
    this.url = baseUrl;
    const user = localStorage.getItem("currentUser");
    this.id = JSON.parse(window.atob(user.split(".")[1])).uid;
    this.perfil = JSON.parse(window.atob(user.split(".")[1])).perfil;
    this.pais = localStorage.getItem('Pais');
    this.Empresa = localStorage.getItem('Empresa');
  }

  ngOnInit() {

    this.documentoFormGroup = this._formBuilder.group({
      NroDocumento: [{ value: null, disabled: true }],
      Nombre: [{ value: null, disabled: true }],
      Correo: [{ value: null, disabled: true }],
      Cargo: [{ value: null, disabled: true }],
      Telefono: [{ value: null, disabled: true }],
      Estado: [{ value: null, disabled: true }],
    });

    this.requerimientoFormGroup = this._formBuilder.group({
      NroRequerimiento: [{ value: null, disabled: true }],
      FechaCreacion: [{ value: null, disabled: true }],
      Estado: [{ value: null, disabled: true }],
    });

    let lAtraccion = ['Contactador', 'Selector', 'Fidelizador', 'Administrador Atraccion talento'];

    if (lAtraccion.includes(this.perfil.toString()) == true) {
      this.BtnPermiso = true;
      this.BtnP = true;
      this.BtnCrear = false;
      this.sTitulo = 'Atención de Requerimientos de Personal'
    }
    else {
      this.BtnPermiso = false;
      this.BtnCrear = true;
      this.BtnP = false;
      this.sTitulo = 'Requerimiento de Personal'
    }

    //Abrir Botonera
    this.onToggleFab(1, -1);
    this.fnIniciarFormularios();

    /* LLENADO DE SELECT */
    this.fnGetdatos(1760, 0);
    this.fnGetdatos(524, 0);
    this.fnHorario(0);
    this.fnHorario(1);
    this.fnHorario(2);

    //PLANILLA
    this.fnRQPersonal(5, 1);

    // VALIDACIONES
    // this.fnOferta();
    this.fnCarneSanidad(-1);
    this.fnValidarHorario();

    //GRUPOS, CARGOS, PUESTOS
    this.fnRQPersonal(1, 0);
    this.fnRQPersonal(4, 0);
    this.fnGetdatos(1708, 0);

    //Obteniendo Empresas que pagan en mensual bruto
    this.fnListaEmpresasBruto()

  }

  //#region Listar Botones
  onToggleFab(fab: number, stat: number) {
    switch (fab) {

      case 1:
        stat = (stat === -1) ? (this.abLista.length > 0) ? 0 : 1 : stat;
        this.tsLista = (stat === 0) ? 'inactive' : 'active';
        this.abLista = (stat === 0) ? [] : this.fbLista;
        break;

      case 2:
        stat = (stat === -1) ? (this.abAdd.length > 0) ? 0 : 1 : stat;
        this.tsDetail = (stat === 0) ? 'inactive' : 'active';

        let lEstado = [1612, 1613, 1618, 1616];
        let lEstadoAtra = [1613, 1612, 1614, 1618];

        if (this.BtnPermiso) {
          if (this.objRequerimientoEditar.nEstado == 1612) {
            this.abAdd = (stat === 0) ? [] : this.fbAccionPermiso;
          }
          if (this.objRequerimientoEditar.nEstado == 1618) {
            this.abAdd = (stat === 0) ? [] : this.fbAccion;
          }
          else {
            this.abAdd = (stat === 0) ? [] : this.fbAtraccion;
          }
        }
        else if (this.opcion === 0) {
          this.abAdd = (stat === 0) ? [] : this.fbGuardar;
        }
        else {
          if (lEstado.includes(this.objRequerimientoEditar.nEstado) == true) {
            this.abAdd = (stat === 0) ? [] : this.fbAccion;
          }
          else {
            if (this.objRequerimientoEditar.nEstado === 1614) {
              this.abAdd = (stat === 0) ? [] : this.fbDevuelto;
            }
            if (this.objRequerimientoEditar.nEstado === 1615) {
              this.abAdd = (stat === 0) ? [] : this.fbEditar;
            }
          }
        }

        break;

      default:
        break;
    }
  }
  //#endregion


  //#region Inicializar Formularios
  fnIniciarFormularios = function () {
    this.objPresupuesto = undefined;
    this.sltPuesto = undefined;

    this.requerimientoFormGroup = this._formBuilder.group({
      NroRequerimiento: [{ value: null, disabled: true }],
      FechaCreacion: [{ value: null, disabled: true }],
      Estado: [{ value: null, disabled: true }],
    });

    /* STEPPER FORM GROUPS */
    this.presupuestoFormGroup = this._formBuilder.group({
      Motivo: [{ value: "", disabled: this.BtnP }, Validators.required],
      SubMotivo: [{ value: "", disabled: this.BtnP }, Validators.required],
      Cliente: [{ value: "", disabled: this.BtnP }, Validators.required],
      NroPresupuesto: [{ value: "", disabled: this.BtnP }, Validators.required],
      Descripcion: [{ value: "", disabled: this.BtnP }, Validators.required],
      Marca: [{ value: "", disabled: this.BtnP }, Validators.required],
      Canal: [{ value: "", disabled: this.BtnP }, Validators.required],
      SubCanal: [{ value: "", disabled: this.BtnP }, Validators.required],
    });

    this.planillaFormGroup = this._formBuilder.group({
      Sucursal: [{ value: "", disabled: this.BtnP }, Validators.required],
      Cargo: [{ value: "", disabled: this.BtnP }, Validators.required],
      NombreCargo: [{ value: "", disabled: this.BtnP }],
      Puesto: [{ value: "", disabled: this.BtnP }, Validators.required],
      TipoContrato: [{ value: "", disabled: this.BtnP }, Validators.required],
      Vacantes: [{ value: "", disabled: this.BtnP }, [Validators.required, Validators.min(1)]],
      BackUp: [{ value: 0, disabled: this.BtnP }],
      Planilla: [{ value: "", disabled: this.BtnP }, Validators.required],
      InicioActividad: [{ value: "", disabled: this.BtnP }, Validators.required],
      FinActividad: [{ value: "", disabled: this.BtnP }, Validators.required],
      Genero: [{ value: "", disabled: this.BtnP }, Validators.required],
    });

    this.ofertaFormGroup = this._formBuilder.group({
      OfertaRadioBtn: [{ value: "", disabled: this.BtnP }, Validators.required],
      ofertaMensual: [{ value: "", disabled: this.BtnP }, Validators.required],
    });

    this.mensualFormGroup = this._formBuilder.group({
      TotalBruto: [{ value: null, disabled: this.BtnP }, [Validators.required, Validators.min(10), Validators.max(2500)]],
      TotalNeto: [{ value: null, disabled: this.BtnP }, [Validators.required, Validators.min(10), Validators.max(1800)]],
    });

    this.diarioFormGroup = this._formBuilder.group({
      DiarioNeto: [{ value: null, disabled: this.BtnP }, [Validators.required, Validators.min(10), Validators.max(200)]],
    });

    this.horarioTrabajoFormGroup = this._formBuilder.group({
      Entrada: [{ value: "", disabled: this.BtnP }, Validators.required],
      Salida: [{ value: "", disabled: this.BtnP }, Validators.required],
      Refrigerio: [{ value: "", disabled: this.BtnP }],
    });

    this.diasSemanaFormGroup = this._formBuilder.group({
      LunesChk: [{ value: "", disabled: this.BtnP }],
      MartesChk: [{ value: "", disabled: this.BtnP }],
      MiercolesChk: [{ value: "", disabled: this.BtnP }],
      JuevesChk: [{ value: "", disabled: this.BtnP }],
      ViernesChk: [{ value: "", disabled: this.BtnP }],
      SabadoChk: [{ value: "", disabled: this.BtnP }],
      DomingoChk: [{ value: "", disabled: this.BtnP }],
    });

    this.sanidadFormGroup = this._formBuilder.group({
      CarneSanidad: [{ value: "", disabled: this.BtnP }, Validators.required],
      LimaMetropolitana: [{ value: "", disabled: this.BtnP }, Validators.required],
      SanIsidro: [{ value: "", disabled: this.BtnP }, Validators.required],
      Callao: [{ value: "", disabled: this.BtnP }, Validators.required],
      Alimentos: [{ value: "", disabled: this.BtnP }, Validators.required],
      Caracteristicas: [{ value: "", disabled: this.BtnP }],
    });

    this.herramientasFormGroup = this._formBuilder.group({
      herramienta: [{ value: "", disabled: this.BtnP }, Validators.required],
      selectHerramienta: [{ value: "", disabled: this.BtnP }]
    });

    this.fnCarneSanidad(-1);
  };
  //#endregion


  //#region Filtrar Tabla
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
  //#endregion


  fnGetdatos = function (dad, cod) {

    this.vSerGeneral
      .fnSystemElements(1, dad, "1", "nElecod,cElenam", "", this.url)
      .subscribe(
        (res) => {
          let tipoElemento;
          tipoElemento = res.find((x) => x.codigo == cod);

          if (dad == 1760) {
            this.sltMotivo = res;
            /*  } else if (dad == 1764) {
               this.sltGrupo = res; */
          } else if (dad == 427) {
            //this.sltCanal = res;

            this.presupuestoFormGroup.get("Canal").setValue(tipoElemento.valor);
          } else if (dad == 524) {

            this.sltSexo = res;
          } else if (dad == 1708) {
            this.sltContrato = res;

          }

        },
        (err) => {
          console.log(err);
        },
        () => {
          //  this.spinner.hide();
        }
      );
  };

  //#region Funcionalidad Botones
  onOpenStepper(accion: string, req) {

    this.accionStepper = accion;

    if (accion === "post_add") {

      this.fnRQPersonal(2, this.id);
      this.opcion = 0;

      //Abrir Botonera
      this.onToggleFab(2, -1);
      this.fnEstado(accion)
    }

    else if (accion === "mostrar") {

      this.opcion = 1;
      this.objRequerimientoEditar = req;

      //trae usuario de RQ
      this.fnRQPersonal(2, req.nIdUsrCreacion);
      this.fnEditarFormularios();
      this.onToggleFab(2, -1);
      this.fnEstado(accion)
    }

    else if ((accion = "cancel")) {

      this.onToggleFab(2, -1);
      this.objPresupuesto = undefined;
      this.fnRQPersonal(4, 0);
      this.Cantidad = undefined;
      this.sltSucursal = [];
      this.sltPuesto = [];
      this.sltCargo = [];
      this.fnIniciarFormularios();
      this.fnEstado(accion)
    }
  }

  clickFab(op, Obj) {

    if (Obj.tool === "Salir") {
      this.onOpenStepper('cancel', '');
    }
    else if (Obj.tool === "Lista Personal") {
      this.fnVerPersonal()
    }
    else if (Obj.tool === "Guardar") {
      this.fnGuardar(0)
    }
    else if (Obj.tool === "Comentario devolución") {
      this.fnVercomentario();
    }
    else if (Obj.tool === "Devolver RQ") {
      this.fnDevolver();
    }
    else if (Obj.tool === "Aceptar Requerimiento") {
      this.fnAprobar();
    }
    else if (Obj.tool === "Grabar") {
      this.fnGuardar(1)
    }
    else if (Obj.tool === "Histórico de Estado") {
      this.fnVerEstado();
    }
    else if (Obj.tool === "Publicar en el Portal") {
      this.fnAbrirModal();
    }

  }
  //#endregion


  //#region Elegir Si/No Carne de Sanidad
  async fnCarneSanidad(opcion: number) {
    /* SI : 1    NO: 0    AMBOS: 2   NO SELECCIONADO : -1 */

    this.sanidadFormGroup.controls.LimaMetropolitana.setValue("");
    this.sanidadFormGroup.controls.SanIsidro.setValue("");
    this.sanidadFormGroup.controls.Callao.setValue("");
    this.sanidadFormGroup.controls.Alimentos.setValue("");

    if (opcion == -1) {
      this.sanidadFormGroup.get("LimaMetropolitana").disable();
      this.sanidadFormGroup.get("SanIsidro").disable();
      this.sanidadFormGroup.get("Callao").disable();
      this.sanidadFormGroup.get("Alimentos").disable();
    } else if (opcion == 0) {
      this.sanidadFormGroup.get("LimaMetropolitana").disable();
      this.sanidadFormGroup.get("SanIsidro").disable();
      this.sanidadFormGroup.get("Callao").disable();
      this.sanidadFormGroup.get("Alimentos").disable();
    } else if (opcion == 1) {
      this.sanidadFormGroup.get("LimaMetropolitana").enable();
      this.sanidadFormGroup.get("SanIsidro").enable();
      this.sanidadFormGroup.get("Callao").enable();
      this.sanidadFormGroup.get("Alimentos").enable();
    } else if (opcion == 2) {
      this.sanidadFormGroup.get("LimaMetropolitana").enable();
      this.sanidadFormGroup.get("SanIsidro").enable();
      this.sanidadFormGroup.get("Callao").enable();
      this.sanidadFormGroup.get("Alimentos").enable();
    }
  }
  //#endregion


  fnOferta() {

    let opcion = this.ofertaFormGroup.value.OfertaRadioBtn;
    let ofertaMensual = this.ofertaFormGroup.value.ofertaMensual

    if (opcion == 1709) {

      this.mensualFormGroup.controls.TotalBruto.setValue(null)
      this.mensualFormGroup.controls.TotalBruto.clearValidators()
      this.mensualFormGroup.controls.TotalNeto.setValue(null)
      this.mensualFormGroup.controls.TotalNeto.clearValidators()

      this.diarioFormGroup.controls.DiarioNeto.setValidators([Validators.required, Validators.min(10), Validators.max(200)])

    }
    else if (opcion == 1710) {

      this.diarioFormGroup.controls.DiarioNeto.setValue(null)
      this.diarioFormGroup.controls.DiarioNeto.clearValidators()

      if (ofertaMensual == 2594) {
        this.mensualFormGroup.controls.TotalNeto.setValue(null);
        this.mensualFormGroup.controls.TotalNeto.clearValidators()

        this.mensualFormGroup.controls.TotalBruto.setValidators([Validators.required, Validators.min(10), Validators.max(2500)])
      }
      else if (ofertaMensual == 2621) {
        this.mensualFormGroup.controls.TotalBruto.setValue(null);
        this.mensualFormGroup.controls.TotalBruto.clearValidators()

        this.mensualFormGroup.controls.TotalNeto.setValidators([Validators.required, Validators.min(10), Validators.max(1800)])
      }

    }
  }

  fnOfertaMensual() {

    let opcion = this.ofertaFormGroup.value.ofertaMensual

    if (opcion == 2594) {
      this.mensualFormGroup.controls.TotalNeto.setValue(null);
    }
    else if (opcion == 2621) {
      this.mensualFormGroup.controls.TotalBruto.setValue(null);
    }
  }

  fnGuardar(op) {

    // op = 0 INSERT   op = 1 UPDATE

    if (this.fnValidar()) {
      let paramsOferta = this.fnObtenerOfertaString();
      let paramsDias = this.fnObtenerDiasString();
      let vPlanilla = this.planillaFormGroup.value;
      let estadoRQ: number;

      if (op == 0) {
        Swal.fire({
          title: '¿Desea enviar el requerimiento?',
          icon: 'success',
          showDenyButton: true,
          showCancelButton: true,
          confirmButtonText: `Enviar`,
          denyButtonText: `No enviar.`,
          cancelButtonText: 'Cancelar'
        }).then((result) => {
          if (!result.isDismissed) {

            if (!result.isDenied) {
              estadoRQ = 1616;
            }
            else if (result.isDenied) {
              estadoRQ = 1615;
            }

            let reqEnviar = {
              idPresupuesto: this.objPresupuesto.nIdCentroCosto, // id presupuesto
              idSolicitante: this.idPersonal, // id Solicitante
              motivo: this.presupuestoFormGroup.get("Motivo").value, // motivo
              subMotivo: this.presupuestoFormGroup.get("SubMotivo").value, // SubMotivo             
              idPartida: this.planillaFormGroup.get("Cargo").value, // id personal
              vacantes: this.planillaFormGroup.get("Vacantes").value, // vacantes
              backup: this.planillaFormGroup.get("BackUp").value, // backup
              contrato: this.planillaFormGroup.get("TipoContrato").value, // tipo de contrato
              planilla: this.sltPlanilla.find(x => x.valor == (this.planillaFormGroup.controls.Planilla.value)).codigo, //planilla
              inicio:
                typeof this.planillaFormGroup.get("InicioActividad").value == 'string' ? this.planillaFormGroup.get("InicioActividad").value :
                  (moment(this.planillaFormGroup.get("InicioActividad").value, 'MM-DD-YYYY HH:mm:ss', true).format("YYYY/MM/DD")).toString(),
              fin:
                this.planillaFormGroup.get("FinActividad").value == null ? null :
                  (moment(this.planillaFormGroup.get("FinActividad").value, 'MM-DD-YYYY HH:mm:ss', true).format("YYYY/MM/DD")).toString(),
              genero: this.planillaFormGroup.get("Genero").value,       // genero
              opOferta: this.ofertaFormGroup.get("OfertaRadioBtn").value, //tipo oferta
              oferta: paramsOferta,
              dias: paramsDias,
              entrada: this.horarioTrabajoFormGroup.get("Entrada").value,    //hora entrada
              salida: this.horarioTrabajoFormGroup.get("Salida").value,     //hora salida
              refrigerio: this.horarioTrabajoFormGroup.get("Refrigerio").value, // hora refrigerio
              carneSanidad: this.sanidadFormGroup.get("CarneSanidad").value,      //carné
              lima: this.sanidadFormGroup.get("LimaMetropolitana").value, // carné lima
              sanIsidro: this.sanidadFormGroup.get("SanIsidro").value,         // carne san isidro
              callao: this.sanidadFormGroup.get("Callao").value,            // carné callao
              alimentos: this.sanidadFormGroup.get("Alimentos").value,         // Alimentos
              caracteristicas: this.sanidadFormGroup.get("Caracteristicas").value,   // características
              idUsuario: this.id,
              rqEstado: estadoRQ,
              numVac: this.Cantidad,
              sucursal: vPlanilla.Sucursal,
              empresa: this.Empresa,
              pais: this.pais
            };

            let parametros = Object.values(reqEnviar);

            this.fnRQPersonal(3, parametros);
          }
        });

      } else if (op == 1) {
        Swal.fire({
          title: '¿Desea enviar el requerimiento?',
          icon: 'success',
          showDenyButton: true,
          showCancelButton: true,
          confirmButtonText: 'Enviar',
          denyButtonText: `No enviar.`,
          cancelButtonText: 'Cancelar'
        }).then((result) => {
          if (!result.isDismissed) {

            if (!result.isDenied) {
              estadoRQ = 1616;
            }
            else if (result.isDenied) {
              estadoRQ = 1615;
            }
            let reqEnviar = {
              idPresupuesto: this.objPresupuesto.nIdCentroCosto, // id presupuesto
              idSolicitante: this.idPersonal, // id Solicitante
              motivo: this.presupuestoFormGroup.get("Motivo").value,    // motivo              
              subMotivo: this.presupuestoFormGroup.get("SubMotivo").value, // Submotivo
              idPartida: this.planillaFormGroup.get("Cargo").value,        // id personal
              vacantes: this.planillaFormGroup.get("Vacantes").value,     // vacantes
              backup: this.planillaFormGroup.get("BackUp").value,       // backup
              contrato: this.planillaFormGroup.get("TipoContrato").value, // tipo de contrato
              planilla: this.sltPlanilla.find(x => x.valor == (this.planillaFormGroup.controls.Planilla.value)).codigo, //planilla
              inicio:
                typeof this.planillaFormGroup.get("InicioActividad").value == 'string' ? this.planillaFormGroup.get("InicioActividad").value :
                  (moment(this.planillaFormGroup.get("InicioActividad").value, 'MM-DD-YYYY HH:mm:ss', true).format("YYYY/MM/DD")).toString(),
              fin:
                typeof this.planillaFormGroup.get("FinActividad").value == 'string' ? this.planillaFormGroup.get("FinActividad").value :
                  (moment(this.planillaFormGroup.get("FinActividad").value, 'MM-DD-YYYY HH:mm:ss', true).format("YYYY/MM/DD")).toString(),
              genero: this.planillaFormGroup.get("Genero").value,         // genero
              opOferta: this.ofertaFormGroup.get("OfertaRadioBtn").value,   //tipo oferta
              oferta: paramsOferta,
              dias: paramsDias,
              entrada: this.horarioTrabajoFormGroup.get("Entrada").value,      //hora entrada
              salida: this.horarioTrabajoFormGroup.get("Salida").value,       //hora salida
              refrigerio: this.horarioTrabajoFormGroup.get("Refrigerio").value,   //hora refrigerio
              carneSanidad: this.sanidadFormGroup.get("CarneSanidad").value,        //carné (si/no)
              lima: this.sanidadFormGroup.get("LimaMetropolitana").value,   //carné lima
              sanIsidro: this.sanidadFormGroup.get("SanIsidro").value,           //carné san isidro
              callao: this.sanidadFormGroup.get("Callao").value,              //carné callao
              alimentos: this.sanidadFormGroup.get("Alimentos").value,           //alimentos (1/0)
              caracteristicas: this.sanidadFormGroup.get("Caracteristicas").value,  //características
              idUsuario: this.id,
              rqEstado: estadoRQ,
              numVac: this.Cantidad,
              sucursal: vPlanilla.Sucursal,
              empresa: this.Empresa,
              pais: this.pais

            };

            let paramEditar = Object.values(reqEnviar);
            paramEditar.push(this.objRequerimientoEditar.nIdReqPe);

            this.fnRQPersonal(8, paramEditar);


          }
        });
      }
    }
  }

  fnValidar() {

    if (this.objPresupuesto != undefined) {

      debugger
      let ofertaOpcion = this.ofertaFormGroup.value.OfertaRadioBtn
      let ofertaMensual = this.ofertaFormGroup.value.ofertaMensual
      let totalBrutoValidacion = false
      let totalNetoValidacion = false
      //Validacion Seccion Presupuesto
      let presupuestoValidacion = !this.presupuestoFormGroup.valid;

      //Validacion Seccion Planilla
      let planillaValidacion = !this.planillaFormGroup.valid;
      let fechaValidacion = !this.fnValidarFechas()

      //Validacion Seccion Oferta

      let ofertaValidacion = !(ofertaOpcion === 1709 || ofertaOpcion === 1710)
      let diarioValidacion = !(ofertaOpcion === 1710 || (ofertaOpcion == 1709 && this.diarioFormGroup.valid))

      if (ofertaMensual == 2594) {
        totalBrutoValidacion = !(ofertaOpcion === 1709 || (ofertaOpcion == 1710 && ofertaMensual == 2594 && this.mensualFormGroup.controls.TotalBruto.valid))
      }
      else if (ofertaMensual == 2621) {
        totalNetoValidacion = !(ofertaOpcion === 1709 || (ofertaOpcion == 1710 && ofertaMensual == 2621 && this.mensualFormGroup.controls.TotalNeto.valid))
      }

      //Validacion Seccion Dias de Trabajo
      let diasValidacion = !this.fnAlmenosUno(this.diasSemanaFormGroup.value);
      let horarioValidacion = !this.horarioTrabajoFormGroup.valid;
      let entradaValidacion = !this.fnValidarHorario();
      let refrigerioValidacion = !this.fnValidarRefrigerio();

      //Validacion Sanidad
      let sanidadValidacion = !this.sanidadFormGroup.valid;


      // Validacion Seccion Presupuesto
      if (presupuestoValidacion) {
        Swal.fire('¡Atención!', 'Debe completar la sección Presupuesto.', 'warning')
        return false;
      }

      // Validacion Seccion Planilla
      else if (planillaValidacion) {
        Swal.fire('¡Atención!', 'Debe completar la sección Planilla.', 'warning')
        return false;
      }

      else if (fechaValidacion) {
        Swal.fire('¡Atención!', 'La fecha de inicio de actividad debe ser mayor o igual a la fecha de fin de actividad.', 'warning')
        return false;
      }

      //Validacion Seccion Oferta
      else if (ofertaValidacion) {
        Swal.fire('¡Atención!', 'Debe escoger tipo de pago.', 'warning')
        return false;
      }

      else if (diarioValidacion) {
        Swal.fire('¡Atención!', 'Debe llenar el sueldo diario.', 'warning')
        return false;
      }

      else if (totalBrutoValidacion) {
        Swal.fire('¡Atención!', 'Debe llenar el sueldo mensual bruto.', 'warning')
        return false;
      }

      else if (totalNetoValidacion) {
        Swal.fire('¡Atención!', 'Debe llenar el sueldo mensual neto.', 'warning')
        return false;
      }

      //Validacion Seccion Dias de Trabajo
      else if (diasValidacion) {
        Swal.fire('¡Atención!', 'Debe escoger mínimo un día.', 'warning')
        return false;
      }

      else if (horarioValidacion) {
        Swal.fire('¡Atención!', 'Debe llenar el horario.', 'warning')
        return false;
      }

      else if (entradaValidacion) {
        Swal.fire('¡Atención!', 'La entrada debe ser antes que la salida.', 'warning')
        return false;
      }

      else if (refrigerioValidacion) {
        Swal.fire('¡Atención!', 'El refrigerio debe estar en el horario de trabajo.', 'warning')
        return false;
      }


      //Validacion Seccion Sanidad
      else if (sanidadValidacion) {
        Swal.fire('¡Atención!', 'Debe llenar datos del carné de sanidad.', 'warning')
        return false;
      }

      //Pasa las Validaciones
      return true;
    }

    //Si no ingreso un presupuesto
    else {
      Swal.fire('¡Atención!', 'Seleccione un presupuesto.', 'warning')
    }
  }

  fnHorario = function (val) {
    let pParametro = [];
    pParametro.push(val);
    this.vPersonalService.fnRequerimientoPersonal(0, pParametro, this.url).then(
      (res) => {
        if (val == 0) {
          this.sltIngreso = res;
        } else if (val == 1) {
          this.sltSalida = res;
        } else if (val == 2) {
          this.sltRefrigerio = res;
        }
      },
      (err) => {
        console.log(err);
      },
      () => {
        //this.spinner.hide();
      }
    );
  };

  async fnRQPersonal(op, param) {
    let params = [];
    if (op == 4) {
      this.spinner.show();
      params.push(this.id);
      params.push(this.Empresa);
    } else if (op == 3 || op == 8) {
      this.spinner.show();
      params = param;
    } else if (op == 2) {
      params.push(param);
    } else if (op == 5) {
      params.push(param);
    } else if (op == 7) {
      this.spinner.show();
      params.push(this.id);
      params.push(this.objRequerimientoEditar.nIdReqPe)

    }

    await this.vPersonalService.fnRequerimientoPersonal(op, params, this.url).then(
      (res: any) => {

        if (op == 1) {

          this.objPlanilla = res;
        } else if (op == 2) {
          this.idPersonal = res[0].idPersonal;
          this.documentoFormGroup.controls.Nombre.setValue(res[0].nombre);
          this.documentoFormGroup.controls.Correo.setValue(res[0].correo);
          this.documentoFormGroup.controls.NroDocumento.setValue(res[0].nroDoc);
          this.documentoFormGroup.controls.Cargo.setValue(res[0].cargo);
          this.documentoFormGroup.controls.Telefono.setValue(res[0].movil);
        } else if (op == 3) {
          Swal.fire({
            title: "CORRECTO",
            html: res.split("|")[1],
          });
          //this.stepper.reset();
          this.onToggleFab(1, -1);
          this.onOpenStepper('cancel', '');
          this.spinner.hide();
        } else if (op == 8) {
          Swal.fire({
            title: "CORRECTO",
            html: res.split("|")[1],
          });
          //this.stepper.reset();
          this.onToggleFab(1, -1);
          this.onOpenStepper('cancel', '');
          this.spinner.hide();
        } else if (op == 4) {
          this.objRequerimientos = res;
          this.dataSource = new MatTableDataSource(res);
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
          this.spinner.hide();

        } else if (op == 5) {
          this.sltPlanilla = res;
        } else if (op == 7) {
          this.objDetalle = res;

          this.spinner.hide();

        }
      },
      (err) => {
        if (op == 3 || op == 8) {
          Swal.fire({
            title: "CORRECTO",
            html: err.error.text.split("|")[1],
          });
          this.fnRQPersonal(4, 0)
          //this.stepper.reset();
          this.onOpenStepper("cancel", '');
        }
        this.spinner.hide();
      }
    );
  }

  fnObtenerPresupuesto(op, Pre) {
    let vDatos = this.presupuestoFormGroup.value;
    let params = [];
    params.push(this.id);
    params.push(this.Empresa);

    if (op === 1) {
      params.push(vDatos.NroPresupuesto);
    }
    else {
      params.push(Pre);
    }

    this.spinner.show()
    this.vPersonalService.fnRequerimientoPersonal(6, params, this.url).then((res: any) => {

      if (op === 1) {

        if (res.nAccion.toString() === '0') {
          this.Cantidad = 0;
          this.sltSucursal = [];
          this.sltPuesto = [];
          this.sltCargo = [];
          this.presupuestoFormGroup.get("Descripcion").setValue('');
          this.presupuestoFormGroup.get("Cliente").setValue('');
          this.presupuestoFormGroup.get("Marca").setValue('');
          this.presupuestoFormGroup.get("NroPresupuesto").setValue('');
          this.presupuestoFormGroup.get("Canal").setValue('');
          this.presupuestoFormGroup.get("SubCanal").setValue('');
          return Swal.fire('Atención', res.sMensaje == null ? 'No se encontro información del ppto indicado, por favor verifique o avise a sistemas.' : res.sMensaje, 'warning')
        }
        else {
          this.presupuestoFormGroup.get("Descripcion").setValue(res.sDescCC);
          this.presupuestoFormGroup.get("Cliente").setValue(res.sNombreComercial);
          this.presupuestoFormGroup.get("Marca").setValue(res.desMar);
          this.presupuestoFormGroup.get("NroPresupuesto").setValue(res.sCodCC);
          this.presupuestoFormGroup.get("Canal").setValue(res.sCanal);
          this.presupuestoFormGroup.get("SubCanal").setValue(res.ssCanal);

          this.sltSucursal = res.listSuc
          this.objPresupuesto = res
          this.sltSucursal.forEach(element => {
            this.arraySucursal[element.nIdCCS] = element.listPartidaPer
          });

          this.sltPuesto = [];
          this.sltCargo = [];

          this.planillaFormGroup.get("Puesto").setValue('');
          this.planillaFormGroup.get("Cargo").setValue('');
          this.planillaFormGroup.get("NombreCargo").setValue('');

        }
      }
      else {
        this.presupuestoFormGroup.get("Descripcion").setValue(res.sDescCC);
        this.presupuestoFormGroup.get("Cliente").setValue(res.sNombreComercial);
        this.presupuestoFormGroup.get("Marca").setValue(res.desMar);
        this.presupuestoFormGroup.get("NroPresupuesto").setValue(res.sCodCC);
        this.presupuestoFormGroup.get("Canal").setValue(res.sCanal);
        this.presupuestoFormGroup.get("SubCanal").setValue(res.ssCanal);
        this.sltSucursal = res.listSuc
        this.objPresupuesto = res
        this.sltSucursal.forEach(element => {
          this.arraySucursal[element.nIdCCS] = element.listPartidaPer
        });
        this.fnChangeSucursal();
        this.fnChangePuesto();
        this.fnCargarCombos();
        //this.fnChangeCargo();
      }
    });

    this.spinner.hide()
  }

  //#region Cambiar de Sucursal
  async fnChangeSucursal() {
    let lpartida = [];
    let lista = [];
    let vPla = this.planillaFormGroup.value;

    let element = this.planillaFormGroup.get("Sucursal").value;
    let listaDatos = []

    //Obtiene las partidas segun sucursal
    this.arraySucursal[vPla.Sucursal].forEach(element => {
      lpartida.push(element.nIdPartida.toString())
    });

    //Obtiene los puestos
    this.objPlanilla.listPuesto.forEach(elePuesto => {
      elePuesto.listCargo.forEach(eleCargo => {
        if (lpartida.includes(eleCargo.idPartida.toString()) == true) {
          lista.push(elePuesto);
        }
        else {
        }
      });

    });

    let sinRepetidos = [...new Set(lista)];
    this.sltPuesto = sinRepetidos

    if (this.opcion == 0) {
      listaDatos = this.arraySucursal[element]

      this.planillaFormGroup.get("Puesto").setValue('');
      this.planillaFormGroup.get("NombreCargo").setValue('');

      if (this.sltPuesto.length == 0 || listaDatos[0].nCantPersonal == 0) {
        this.planillaFormGroup.get("Sucursal").setValue('');
        this.sltPuesto = []
        this.planillaFormGroup.controls.Vacantes.setValue('');
        this.planillaFormGroup.controls.BackUp.setValue(0);

        return Swal.fire({
          icon: 'warning',
          title: '¡Advertencia!',
          text: 'Esta ciudad no tiene partidas de personal'
        });
      }

      /* 
      if (listaDatos[0].nCantPersonal == 0) {
        return Swal.fire({
          icon: 'warning',
          title: '¡Advertencia!',
          text: 'Esta ciudad no tiene partidas de personal'
        }); 
      }*/

    }

  }
  //#endregion


  //#region Cambiar de Puesto
  fnChangePuesto() {

    let vPla = this.planillaFormGroup.value;
    let lpartida = [];
    let lista = [];

    this.arraySucursal[vPla.Sucursal].forEach(element => {
      lpartida.push(element.nIdPartida.toString())
    });

    //Obtiene los Cargos
    this.sltPuesto.forEach(element => {
      if (element.partCod === vPla.Puesto) {
        element.listCargo.forEach(eleCargo => {
          if (lpartida.includes(eleCargo.idPartida.toString()) == true) {
            lista.push(eleCargo);
          }
          else {
          }
        });
      }
    });

    this.sltCargo = lista

    this.planillaFormGroup.get("Cargo").setValue(this.sltCargo[0].idPE);
    this.planillaFormGroup.get("NombreCargo").setValue(this.sltCargo[0].carDesc);

    if (this.opcion == 0) {
      this.fnChangeCargo();
    }
  }
  //#endregion


  //#region Seleccionar variable Cargo
  fnChangeCargo() {

    let vPla = this.planillaFormGroup.value;
    let partida;

    //Obtiene el nIdParCargo = nIdPE
    this.sltCargo.map((ele) => {
      if (ele.idPE === vPla.Cargo) {
        partida = ele.idPartida
      }
    });

    this.arraySucursal[vPla.Sucursal].map((ele) => {
      if (ele.nIdPartida === partida) {
        this.Cantidad = ele.nCantPersonal
      }
    });


  }
  //#endregion


  //#region Validar Horarios
  fnValidarHorario(): boolean {
    let horario = this.horarioTrabajoFormGroup.value;
    let entrada = Number(horario.Entrada.split(":")[0]);
    let salida = Number(horario.Salida.split(":")[0]);

    if (entrada < salida) return true;
    else return false;
  }

  fnValidarRefrigerio() {
    let horario = this.horarioTrabajoFormGroup.value;
    let entrada = Number(horario.Entrada.split(":")[0]);
    let salida = Number(horario.Salida.split(":")[0]);
    let refrigerio = Number(horario.Refrigerio.split(":")[0]);
    if (salida > 13) {
      if (refrigerio > entrada && refrigerio < salida) return true;
      else return false;
    } else {
      return true;
    }
  }
  //#endregion


  //#region Validar Fechas
  fnValidarFechas() {

    if (this.isDisabled) {
      return true
    }
    else {

      if (!(this.planillaFormGroup.value.InicioActividad == "" || this.planillaFormGroup.value.FinActividad == "")) {
        let fechaIni = new Date(this.planillaFormGroup.value.InicioActividad);
        let fechaFin = new Date(this.planillaFormGroup.value.FinActividad);

        if (fechaFin >= fechaIni) return true;
        else {
          this.planillaFormGroup.get("FinActividad").setValue("");
          Swal.fire({
            title: "ERROR",
            html: "La fecha de fin debe ser mayor o igual que la fecha de inicio",
          });
          return false;
        }
      }
      else {
        return false;
      }
    }
  }

  fnValidarFechaFin() {
    this.todayDateFin = this.planillaFormGroup.value.InicioActividad
  }

  convertUTCDateToLocalDate(date) {
    var newDate = new Date(date.getTime() + date.getTimezoneOffset() * 60 * 1000);

    var offset = date.getTimezoneOffset() / 60;
    var hours = date.getHours();

    newDate.setHours(hours - offset);

    return newDate;
  }

  //#endregion

  fnAlmenosUno(obj: Object): boolean {

    for (let v of Object.values(obj)) {
      if (v == true) return true;
    }
    return false;
  }

  fnValidarVacantes(campo: string) {

    let vPla = this.planillaFormGroup.value;
    let nVacantes: number = vPla.Vacantes
    let nBackUp: number = vPla.BackUp

    if (nVacantes == undefined) {
      nVacantes = 0;
    }
    if (nBackUp == undefined) {
      nBackUp = 0;
    }

    let suma = nVacantes + nBackUp

    if (vPla.Puesto === '') {
      this.planillaFormGroup.controls.Vacantes.setValue('');
      this.planillaFormGroup.controls.BackUp.setValue(0);
      return Swal.fire({ title: "ERROR", html: "Debe seleccionar un puesto" });
    }
    else {
      if (suma > this.Cantidad) {

        if (campo === 'Vacantes') {
          this.planillaFormGroup.controls.Vacantes.setValue('');
        }

        else {
          this.planillaFormGroup.controls.BackUp.setValue(0);
        }

        return Swal.fire({
          title: "ERROR",
          html:
            "El máximo de vacantes " +
            " es " +
            this.Cantidad,
        });
      }
      else {

      }
    }

    if (campo == 'Vacantes' && nVacantes < 0) {
      this.planillaFormGroup.controls.Vacantes.setValue(0);
      return Swal.fire({ title: "ERROR", icon: 'error', html: "El número de Vacantes no puede ser negativo" });
    }
    if (campo == 'BackUp' && nBackUp < 0) {
      this.planillaFormGroup.controls.BackUp.setValue(0);
      return Swal.fire({ title: "ERROR", icon: 'error', html: "El número de BackUp no puede ser negativo" });
    }

  }

  fnObtenerOfertaString() {

    let tipoSalario = this.ofertaFormGroup.get("OfertaRadioBtn").value
    let tipoOferta = this.ofertaFormGroup.get("ofertaMensual").value
    let str = [];

    if (tipoSalario == 1709) {
      str.push("1834,true," + this.diarioFormGroup.value.DiarioNeto)
    }

    else if (tipoSalario == 1710) {
      let mensual = this.mensualFormGroup.value;

      if (tipoOferta == 2594) {
        str.push(tipoOferta + "," + true + "," + mensual.TotalBruto)
      }
      else if (tipoOferta == 2621) {
        str.push(tipoOferta + "," + true + "," + mensual.TotalNeto)
      }
      return str.join("-");
      // str.push("2594," + 1 + "," + (vMensual.TotalBruto == null ? 0 : vMensual.TotalBruto) + "," + (vMensual.TotalNeto == null ? 0 : vMensual.TotalNeto) + "," + tipoMensual);
    }

    return str.join();
  }

  fnObtenerDiasString() {
    let str = "";

    if (this.diasSemanaFormGroup.get("LunesChk").value) str += 1826;

    if (this.diasSemanaFormGroup.get("MartesChk").value)
      str += (str == "" ? "" : ",") + 1827;

    if (this.diasSemanaFormGroup.get("MiercolesChk").value)
      str += (str == "" ? "" : ",") + 1828;

    if (this.diasSemanaFormGroup.get("JuevesChk").value)
      str += (str == "" ? "" : ",") + 1829;

    if (this.diasSemanaFormGroup.get("ViernesChk").value)
      str += (str == "" ? "" : ",") + 1830;

    if (this.diasSemanaFormGroup.get("SabadoChk").value)
      str += (str == "" ? "" : ",") + 1831;

    if (this.diasSemanaFormGroup.get("DomingoChk").value)
      str += (str == "" ? "" : ",") + 1832;

    return str;
  }


  fnEditarFormularios = async function () {

    //Traer Detalle 
    await this.fnRQPersonal(7, 0);

    //Setear presupuesto
    await this.fnObtenerPresupuesto(0, this.objRequerimientoEditar.sCodCC);

    this.documentoFormGroup.get('Estado').setValue(this.objRequerimientoEditar.sEstado);

    this.planillaFormGroup.get("Sucursal").setValue(this.objRequerimientoEditar.sOficina);
    this.planillaFormGroup.get("Puesto").setValue(this.objRequerimientoEditar.partCod);
    this.planillaFormGroup.get("Cargo").setValue(this.objRequerimientoEditar.nIdPE);
    this.planillaFormGroup.get("Vacantes").setValue(this.objRequerimientoEditar.nVacante);
    this.planillaFormGroup.get("BackUp").setValue(this.objRequerimientoEditar.nBack);

    //Contrato y planilla
    this.planillaFormGroup.controls.TipoContrato.setValue(this.objRequerimientoEditar.nTipoContrato.toString());
    this.planillaFormGroup.controls.Planilla.setValue(this.objRequerimientoEditar.sCodPlla.toString());
    this.planillaFormGroup.controls.Genero.setValue(this.objRequerimientoEditar.nIdGenero.toString());

    let fei = this.convertUTCDateToLocalDate(new Date(this.objRequerimientoEditar.dFecIni.toString()));
    let fef = this.convertUTCDateToLocalDate(new Date(this.objRequerimientoEditar.dFecFin.toString()));

    this.planillaFormGroup.controls.InicioActividad.setValue(fei);
    this.planillaFormGroup.controls.FinActividad.setValue(fef);

    this.presupuestoFormGroup.controls.Motivo.setValue(this.objRequerimientoEditar.nIdMotivo.toString());
    this.presupuestoFormGroup.controls.SubMotivo.setValue(this.objRequerimientoEditar.nIdSubMotivo);

    //OFERTA
    this.ofertaFormGroup.get('OfertaRadioBtn').setValue(this.objDetalle.oferta[0].nTipoSalario)

    if (this.objDetalle.oferta[0].nTipoSalario == 1709) {
      this.diarioFormGroup.controls.DiarioNeto.setValue(this.objDetalle.oferta[0].nSalario)
    }
    else if (this.objDetalle.oferta[0].nTipoSalario == 1710) {

      this.ofertaFormGroup.get('ofertaMensual').setValue(this.objDetalle.oferta[0].nTipoOferta)

      if (this.objDetalle.oferta[0].nTipoOferta == 2594) {
        this.mensualFormGroup.get('TotalBruto').setValue(this.objDetalle.oferta[0].nSalario)
      }

      else if (this.objDetalle.oferta[0].nTipoOferta == 2621) {
        this.mensualFormGroup.get('TotalNeto').setValue(this.objDetalle.oferta[0].nSalario)
      }
    }

    // DIAS
    this.objDetalle.dia.forEach(obj => {
      if (obj.nDia == 1826) {
        this.diasSemanaFormGroup.controls.LunesChk.setValue(1);
      } else if (obj.nDia == 1827) {
        this.diasSemanaFormGroup.controls.MartesChk.setValue(1);
      } else if (obj.nDia == 1828) {
        this.diasSemanaFormGroup.controls.MiercolesChk.setValue(1);
      } else if (obj.nDia == 1829) {
        this.diasSemanaFormGroup.controls.JuevesChk.setValue(1);
      } else if (obj.nDia == 1830) {
        this.diasSemanaFormGroup.controls.ViernesChk.setValue(1);
      } else if (obj.nDia == 1831) {
        this.diasSemanaFormGroup.controls.SabadoChk.setValue(1);
      } else if (obj.nDia == 1832) {
        this.diasSemanaFormGroup.controls.DomingoChk.setValue(1);
      }
    });

    this.horarioTrabajoFormGroup.controls.Entrada.setValue(this.objRequerimientoEditar.sEntrada)
    this.horarioTrabajoFormGroup.controls.Salida.setValue(this.objRequerimientoEditar.sSalida)
    this.horarioTrabajoFormGroup.controls.Refrigerio.setValue(this.objRequerimientoEditar.sRefrigerio)

    let opcion;

    this.sanidadFormGroup.controls.CarneSanidad.setValue(this.objDetalle.sanidad[0].sOpcion)

    if (!this.BtnP) {
      if (this.objDetalle.sanidad[0].sOpcion === 'si') {
        this.sanidadFormGroup.get("LimaMetropolitana").enable();
        this.sanidadFormGroup.get("SanIsidro").enable();
        this.sanidadFormGroup.get("Callao").enable();
        this.sanidadFormGroup.get("Alimentos").enable();

      } else if (this.objDetalle.sanidad[0].sOpcion == 'no') {
        this.fnCarneSanidad(0)
      }
    }

    this.requerimientoFormGroup.controls.NroRequerimiento.setValue(this.objRequerimientoEditar.sCodRQ)
    this.requerimientoFormGroup.controls.FechaCreacion.setValue(this.objRequerimientoEditar.dFechaCreacion)
    this.requerimientoFormGroup.controls.Estado.setValue(this.objRequerimientoEditar.sEstado)

    this.sanidadFormGroup.controls.LimaMetropolitana.setValue((this.objDetalle.sanidad.find(x => x.nTipoCarnet == 530).bEstado ? 'si' : 'no'))
    this.sanidadFormGroup.controls.SanIsidro.setValue((this.objDetalle.sanidad.find(x => x.nTipoCarnet == 532).bEstado ? 'si' : 'no'))
    this.sanidadFormGroup.controls.Callao.setValue((this.objDetalle.sanidad.find(x => x.nTipoCarnet == 531).bEstado ? 'si' : 'no'))

    this.sanidadFormGroup.controls.Alimentos.setValue(this.objDetalle.sanidad[0].nAlimentos)
    this.sanidadFormGroup.controls.Caracteristicas.setValue(this.objRequerimientoEditar.sComentario);

  }

  fnPlanillaChange() {

    if (this.planillaFormGroup.controls.TipoContrato.value == '1711') {
      this.planillaFormGroup.controls.Planilla.setValue(
        this.sltPlanilla.filter(x => x.codigo == 4)[0].valor.toString()
      )
    } else if (this.planillaFormGroup.controls.TipoContrato.value == '2096') {
      this.planillaFormGroup.controls.Planilla.setValue(
        this.sltPlanilla.filter(x => x.codigo == 3)[0].valor.toString()
      )
    }

  }


  //#region Abrir Modal Comentario
  fnVercomentario() {
    var vData = new Object();
    vData["idPresupuesto"] = this.objRequerimientoEditar.nIdReqPe;
    vData["estado"] = 0;
    vData["perfil"] = 0

    const dialogRef = this.dialog.open(DigcomentarioaprobacionComponent, {
      width: '650px',
      height: '420px',
      disableClose: true,
      data: vData,
    });

    dialogRef.afterClosed().subscribe(result => {

      if (!result) {
        return;
      }
      if (!result.data) {
        return;
      }

    });
  }
  //#endregion


  //#region Aprobar Rq
  fnAprobar() {

    let pParametro = [];
    pParametro.push(this.id);
    pParametro.push(this.pais);
    pParametro.push(this.objRequerimientoEditar.nIdReqPe);

    Swal.fire({
      title: '¿Estas seguro de recibir el requerimiento?',
      showCancelButton: true,
      confirmButtonText: `Si`,
      cancelButtonText: `No`,
    }).then((result) => {
      /* Read more about isConfirmed, isDenied below */
      if (result.isConfirmed) {
        this.fnGuardarApro(12, pParametro);
        this.onToggleFab(2, -1);
      } else {
      }
    })
  }
  //#endregion


  fnGuardarApro(op, paramentro) {

    this.spinner.show();

    this.vPersonalService.fnRequerimientoPersonal(op, paramentro, this.url).then(
      (res: any) => {

        let Result = res.cod.split("-");

        if (Result[0].toString() === "0") {
          Swal.fire({ title: "ERROR", html: Result[1] });
        }
        else {
          this.requerimientoFormGroup.controls.Estado.setValue(Result[1]);
          this.objRequerimientoEditar.nEstado = 1612;
          this.objRequerimientoEditar.sEstado = Result[1];
          this.onToggleFab(2, -1);
        }

        this.spinner.hide();
      },
      err => {
        console.log(err);
        this.spinner.hide();
      },
    );
  }


  //#region Devolver Rq
  fnDevolver() {
    var vData = new Object();
    vData["idPresupuesto"] = this.objRequerimientoEditar.nIdReqPe;
    vData["estado"] = 0;
    if (this.BtnPermiso) {
      vData["perfil"] = 1;
    }
    else {
      vData["perfil"] = 0;
    }

    const dialogRef = this.dialog.open(DigcomentarioaprobacionComponent, {
      width: '650px',
      height: '420px',
      disableClose: true,
      data: vData,
    });

    dialogRef.afterClosed().subscribe(result => {

      if (!result) {
        return;
      }
      if (!result.data) {
        return;
      }

      this.requerimientoFormGroup.controls.Estado.setValue(result.data);
      this.objRequerimientoEditar.nEstado = 1614;
      this.objRequerimientoEditar.sEstado = result.data;
      this.onToggleFab(2, -1);

    });
  }
  //#endregion


  //#region Historico de estado
  async fnVerEstado() {
    let vRQ = this.objRequerimientoEditar.nIdReqPe;
    let pParametro = [];
    pParametro.push(vRQ);

    if (vRQ != '') {
      this.spinner.show();
      await this.vPersonalService.fnRequerimientoPersonal(9, pParametro, this.url).then((value: Estado[]) => {

        const dialogRef = this.dialog.open(EstadoefectivoComponent, {
          width: '38.7rem',
          data: value,
        });

        dialogRef.afterClosed().subscribe(result => {
        });
      }, error => {
        console.log(error);
      });
      this.spinner.hide();
    }

  }
  //#endregion


  async fnVerPersonal() {
    let vRQ = this.objRequerimientoEditar.nIdReqPe;
    let pParametro = [];
    pParametro.push(vRQ);

    if (vRQ != '') {
      this.spinner.show();
      await this.vPersonalService.fnRequerimientoPersonal(13, pParametro, this.url).then((value: Estado[]) => {

        const dialogRef = this.dialog.open(ListaPostulanteComponent, {
          width: '600px',
          data: value,
        });

        dialogRef.afterClosed().subscribe(result => {
        });
      }, error => {
        console.log(error);
      });
      this.spinner.hide();
    }


  }

  //#region Obtener Usuarios del Requerimiento
  async fnListarSubMotivos() {

    let vPpto = this.presupuestoFormGroup.value;

    let pParametro = [];
    pParametro.push(vPpto.Motivo);
    pParametro.push(this.opcion);

    await this.vPersonalService.fnRequerimientoPersonal(14, pParametro, this.url).then((value: any) => {

      this.sltSubMotivo = value;

    }, error => {
      console.log(error);
    });

  }
  //#endregion


  //#region Cargar Combos
  async fnCargarCombos() {
    this.fnListarSubMotivos();
  }
  //#endregion


  //#region Suma de Totales Oferta Mensual
  async fnCalcularTotales() {
    let vMensual = this.mensualFormGroup.value;
    let sumaBruto, sumaNeto;

    sumaBruto =
      (vMensual.BasicoBruto == null || vMensual.BasicoBruto == '' ? 0 : vMensual.BasicoBruto) +
      (vMensual.AsignacionBruto == null || vMensual.AsignacionBruto == '' ? 0 : vMensual.AsignacionBruto) +
      (vMensual.VariableBruto == null || vMensual.VariableBruto == '' ? 0 : vMensual.VariableBruto) +
      (vMensual.MovilidadBruto == null || vMensual.MovilidadBruto == '' ? 0 : vMensual.MovilidadBruto) +
      (vMensual.ProvisBruto == null || vMensual.ProvisBruto == '' ? 0 : vMensual.ProvisBruto);

    sumaNeto =
      (vMensual.BasicoNeto == null || vMensual.BasicoNeto == '' ? 0 : vMensual.BasicoNeto) +
      (vMensual.AsignacionNeto == null || vMensual.AsignacionNeto == '' ? 0 : vMensual.AsignacionNeto) +
      (vMensual.VariableNeto == null || vMensual.VariableNeto == '' ? 0 : vMensual.VariableNeto) +
      (vMensual.MovilidadNeto == null || vMensual.MovilidadNeto == '' ? 0 : vMensual.MovilidadNeto) +
      (vMensual.ProvisNeto == null || vMensual.ProvisNeto == '' ? 0 : vMensual.ProvisNeto);

    this.mensualFormGroup.get("TotalBruto").setValue(sumaBruto);
    this.mensualFormGroup.get("TotalNeto").setValue(sumaNeto);
  }
  //#endregion


  //#region Abrir Modal
  async fnAbrirModal() {

    let vPla = this.planillaFormGroup.value
    let nIdDetSucursal;

    //Obtener Puesto
    this.sltPuesto.forEach(element => {
      if (element.partCod === vPla.Puesto) {
        element.listCargo.forEach(eleCargo => {
          this.nIdPuesto = eleCargo.idPartida
        });
      }
    });

    nIdDetSucursal = vPla.Sucursal;

    const dialogRef = this.dialog.open(PortalModalComponent, {
      width: '60rem',
      maxWidth: '100vw',
      maxHeight: '44vw',
      // disableClose: true,

      data: {
        nIdPuesto: this.nIdPuesto,
        nIdDetSucursal: nIdDetSucursal
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result !== undefined) {
        //this.fnListarCategorias();
      }
    });
  }
  //#endregion


  controlTipoContrato(event) {

    //Eventual
    if (event.value == 1711) {
      this.planillaFormGroup.controls.FinActividad.setValidators([Validators.required])

      this.ofertaFormGroup.get('OfertaRadioBtn').setValue(1710)

      this.diarioFormGroup.controls.DiarioNeto.setValue(null)
      this.mensualFormGroup.controls.TotalBruto.setValue(null)
      this.mensualFormGroup.controls.TotalNeto.setValue(null)

      this.diarioFormGroup.controls.DiarioNeto.clearValidators()
      this.mensualFormGroup.controls.TotalBruto.clearValidators()
      this.mensualFormGroup.controls.TotalNeto.clearValidators()

      this.isDisabled = false

      // Si es que esta en la lista Mensual Bruto
      let validar = this.objMensualBruto.find(item => item.nParam == this.objPresupuesto.nIdCliente);
      if (validar) {
        this.ofertaFormGroup.get('ofertaMensual').setValue(2594)
        this.mensualFormGroup.controls.TotalBruto.setValidators([Validators.required, Validators.min(10), Validators.max(2500)])
        this.isColgate = true

      }

      //Si no esta es Mensual Neto
      else {
        this.ofertaFormGroup.get('ofertaMensual').setValue(2621)
        this.mensualFormGroup.controls.TotalNeto.setValidators([Validators.required, Validators.min(10), Validators.max(1800)])
        this.isColgate = false
      }
    }

    //Permanente
    else if (event.value == 2096) {
      this.planillaFormGroup.controls.FinActividad.clearValidators()
      this.planillaFormGroup.controls.FinActividad.setValue(null)

      this.ofertaFormGroup.get('OfertaRadioBtn').setValue(1710)

      this.diarioFormGroup.controls.DiarioNeto.setValue(null)
      this.mensualFormGroup.controls.TotalBruto.setValue(null)
      this.mensualFormGroup.controls.TotalNeto.setValue(null)

      this.diarioFormGroup.controls.DiarioNeto.clearValidators()
      this.mensualFormGroup.controls.TotalBruto.clearValidators()
      this.mensualFormGroup.controls.TotalNeto.clearValidators()

      let validar = this.objMensualBruto.find(item => item.nParam == this.objPresupuesto.nIdCliente);
      if (validar) {
        this.ofertaFormGroup.get('ofertaMensual').setValue(2594)
        this.mensualFormGroup.controls.TotalBruto.setValidators([Validators.required, Validators.min(10), Validators.max(2500)])
        this.isColgate = true
        this.isDisabled = true
      }

      //Si no esta es Mensual Neto
      else {
        this.ofertaFormGroup.get('ofertaMensual').setValue(2621)
        this.mensualFormGroup.controls.TotalNeto.setValidators([Validators.required, Validators.min(10), Validators.max(1800)])
        this.isColgate = false
        this.isDisabled = true
      }
    }
  }

  fnEstado(accion: string) {

    let lEstado = [1612, 1613, 1616, 1618];

    if (accion === "post_add") {

      this.BtnP = false
      this.fnIniciarFormularios()
    }

    else if (accion === "mostrar") {

      if (lEstado.includes(this.objRequerimientoEditar.nEstado) == true) {
        this.BtnP = true;
        this.fnIniciarFormularios()
      }
      else {
        this.BtnP = false;
        this.fnIniciarFormularios()
      }
    }

    else if ((accion = "cancel")) {

      this.objRequerimientoEditar = null
      this.BtnP = false;
      this.fnIniciarFormularios()
    }
  }

  fnListaEmpresasBruto() {
    let params = [];

    params.push(this.pais);

    this.vPersonalService.fnRequerimientoPersonal(23, params, this.url).then(
      (res: any) => {
        this.objMensualBruto = res
      })
  }

  //#region Listar Herramientas T.I
  async fnListarHerramientas(nIdCargo) {

  }
  //#endregion

  //#region Agregar Herramienta
  fnAgregarHerramienta(nIdArticulo, sHerramienta) {

  }
  //#endregion

  //#region Quitar Herramienta
  async fnQuitarHerramienta(nIdArticulo, sHerramienta) {

    /* this.listaRequisitosDisp.push(
      {
        nIdRequisito: nIdRequisito,
        sNombreRequisito: sNombreRequisito
      }) */

    /* this.listaRequisitosActuales = this.listaRequisitosActuales.filter(function (index) {
      return index.nIdArticulo !== nIdArticulo;
    }); */

    //Actualizar Tablas
    /* this.fnGenerarReqDisp();
    this.fnGenerarReqActual() */
  }
  //#endregion
}
