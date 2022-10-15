import { Component, OnInit } from "@angular/core";
import { SolicitudMovilidadService } from "../solicitud-movilidad.service";
import { ActivatedRoute } from "@angular/router";
import { Router } from "@angular/router";
import { TipoCargoUserEnum } from "../../Shared/SolicitudMovilidad/tipo_cargo_user.enum";
import { EstadoDocumentoEnum } from "../../Shared/SolicitudMovilidad/estado_documento.emun";

import { NgxSpinnerService } from "ngx-spinner";
import Swal from "sweetalert2";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { comercialAnimations } from "../../Animations/comercial.animations";
import { EstadoefectivoComponent } from './../../requerimiento/efectivo/estadoefectivo/estadoefectivo.component';
import { PersonalBanco, Estado } from './../../requerimiento/model/IEfectivo';

interface ICiudadMonto {
  id: number;
  codigo: string;
  nombre_ciudad: string;
  monto: number;
}

interface IResponseCabeceraSolicitudDetalle {
  centro_costo_id: number;
  codigo_presupuesto: string;
  estado: string;
  estado_id: string;
  solicitante: string;
  nro_movilidad: string;
  campania: string;

  zona: string;
  ciudad_id: number;

  cargo: string;
  anio: string;
  fecha_del: string;
  fecha_al: string;

  partida: string;
  partida_id: number;

  observacion: string;
  correlativo: string;
}

interface IResponsePersonalSolicitanteDetalle {
  dias_sm_id: number;
  gasto_detalle_id: number;
  ciudad: null;
  ciudad_id: null;
  personal: null;
  personal_id: null;
  cargo: null;
  cargo_id: null;
  pasaje_por_dia: number;
  todosDias: boolean;
  dia1: boolean;
  dia2: boolean;
  dia3: boolean;
  dia4: boolean;
  dia5: boolean;
  dia6: boolean;
  dia7: boolean;
  dia8: boolean;
  dia9: boolean;
  dia10: boolean;
  dia11: boolean;
  dia12: boolean;
  dia13: boolean;
  dia14: boolean;
  dia15: boolean;
  dia16: boolean;
}

@Component({
  selector: "app-detalle-solicitud-movilidad",
  templateUrl: "./detalle-solicitud-movilidad.component.html",
  styleUrls: ["./detalle-solicitud-movilidad.component.css"],
  animations: [comercialAnimations]
})
export class DetalleSolicitudMovilidadComponent implements OnInit {
  //#region declaracion variable del sistema
  id: number;
  url: string;
  pais: string;
  Empresa: string;
  lPar: number;
  //#endregion 

  //#region TIPO DE CARGO DEL USUARIO
  esDuenioPresupuesto = false;
  esDuenioPresupuestoCreador = false;
  esCreado = false;
  monto: number;
  control: number;
  //#endregion

  //#region INFROMACION DE LA SOLICITUD REGISTRADA
  cabecera: IResponseCabeceraSolicitudDetalle = null;
  //#endregion

  abLista = [];
  tsLista = 'inactive';
  fbPendiente = [
    { icon: 'save', tool: 'Guardar', status: false },
    { icon: 'person_add', tool: 'Agregar Personal', status: false },
    { icon: 'close', tool: 'Salir', status: false }
  ];
  fbEnviar = [
    { icon: 'close', tool: 'Salir', status: false },
    { icon: 'edit', tool: 'Modificar', status: false },
    { icon: 'send', tool: 'Enviar', status: false },
    { icon: 'list_alt', tool: 'Histórico de Estados', status: false },
  ];
  fbAprobado = [
    { icon: 'close', tool: 'Salir', status: false },
    { icon: 'list_alt', tool: 'Histórico de Estados', status: false },
  ];
  fbAprobar = [
    { icon: 'close', tool: 'Salir', status: false },
    { icon: 'cancel', tool: 'Rechazar', status: false },
    { icon: 'assignment_return', tool: 'Devolver', status: false },
    { icon: 'check_circle', tool: 'Aprobar', status: false },
    { icon: 'list_alt', tool: 'Histórico de Estados', status: false },
  ];

  btnImprimir: boolean = true;
  btnModificar: boolean = false;
  agregar: boolean = true;


  //#region TABLA DE PERSONAL
  displayedColumns: string[] = [
    "nombres_apellidos",
    "pasaje_por_dia",
    "dias",
    "total",
    "todosDias",
    "dia1",
    "dia2",
    "dia3",
    "dia4",
    "dia5",
    "dia6",
    "dia7",
    "dia8",
    "dia9",
    "dia10",
    "dia11",
    "dia12",
    "dia13",
    "dia14",
    "dia15",
    "dia16",
  ];
  dataSource = [];

  diasNombres: string[] = ["DO", "LU", "MA", "MI", "JU", "VI", "SA"];

  listaPersonal: IResponsePersonalSolicitanteDetalle[] = [];
  listaCiudadMonto: ICiudadMonto[] = [];
  //#endregion

  //#region BANDERAS
  linealFlag = false;
  aceptadoFlag = false;
  aceptadoFlag2 = true;
  //#endregion

  flagGeneral = false;


  //#region true and false to div
  divList: boolean = true;
  divAdd: boolean = false;
  //#endregion

  vMovilidad = new Object();

  constructor(
    private solicitudMovilidadService: SolicitudMovilidadService,
    private route: ActivatedRoute,
    private router: Router,
    public dialog: MatDialog,
    private spinnerService: NgxSpinnerService
  ) {
    this.pais = localStorage.getItem('Pais');
    this.Empresa = localStorage.getItem('Empresa');
    const user = localStorage.getItem('currentUser');
    this.id = JSON.parse(window.atob(user.split('.')[1])).uid;
  }

  ngOnInit(): void {

    this.validacionGeneral().then((valor) => {
      if (valor) {
        this.obtenerTipoCargo();
        this.cargarDataAPICabecera();
        this.flagGeneral = true;
      }
    });
  }

  Agregar() {
    this.divAdd = true;
    this.divList = false;
  }

  recibirMensaje(mensaje: string) {
    if (mensaje === "salir") {
      this.agregar = true;
      this.divAdd = false;
      this.divList = true;
    }
    else {
      this.agregar = true;
      this.divAdd = false;
      this.divList = true;
      this.obtenerDataAPIPersonas();
    }
  }


  onChangeButton(obj) {

    if (obj.icon === 'close') {
      this.cancelar();
    }
    else if (obj.icon === 'save') {
      this.guardarDetalle();
    }
    else if (obj.icon === 'edit') {
      this.modificar();
    }
    else if (obj.icon === 'send') {
      this.fnEnviar();
    }
    else if (obj.icon === 'check_circle') {
      this.aprobarSM();
    }
    else if (obj.icon === 'assignment_return') {
      this.devolverSM(2054);
    }
    else if (obj.icon === 'cancel') {
      this.devolverSM(2095);
    }
    else if (obj.icon === 'person_add') {
      this.agregar = false;
      this.Agregar();
    }
    else if (obj.icon === 'list_alt') {
      this.fnVerEstado();
    }

    /*
    Swal.fire({
      title: '¿Desea enviar la solicitud de movilidad?', 
      showCancelButton: true,
      confirmButtonText: `Si`, 
      cancelButtonText: `No`,
    }).then((result) => { 
      if (result.isConfirmed) {  
        this.enviarMensajesEmail(params);
      } else{  
      }
    }) */
  }


  onToggleFab(fab: number, stat: number) {

    stat = (stat === -1) ? (this.abLista.length > 0) ? 0 : 1 : stat;
    this.tsLista = (stat === 0) ? 'inactive' : 'active';


    if (stat === 0) {
      this.abLista = []
      this.btnImprimir = true;
    }
    else if (this.cabecera.estado_id === '2051') { // pendiente
      if (!this.btnModificar) {
        this.abLista = (stat === 0) ? [] : this.fbPendiente;
      }
      else {
        this.abLista = (stat === 0) ? [] : this.fbEnviar;
        this.btnImprimir = (stat === 0) ? true : false;
      }

    }
    else if (this.cabecera.estado_id === '2052') { // enviado 


      if (this.esDuenioPresupuesto) {
        this.abLista = (stat === 0) ? [] : this.fbAprobar;
        this.btnImprimir = (stat === 0) ? true : false;
      }
      else {
        this.abLista = (stat === 0) ? [] : this.fbAprobado;
        this.btnImprimir = (stat === 0) ? true : false;
      }

    }
    else if (this.cabecera.estado_id === '2054') { // devolver por operaciones 

      if (this.esDuenioPresupuesto) {
        this.abLista = (stat === 0) ? [] : this.fbAprobado;
        this.btnImprimir = (stat === 0) ? true : false;
      }
      else {
        this.abLista = (stat === 0) ? [] : this.fbEnviar;
        this.btnImprimir = (stat === 0) ? true : false;
      }
    }
    else if (this.cabecera.estado_id === '2053') { // aprobado por operaciones  
      this.abLista = (stat === 0) ? [] : this.fbAprobado;
      this.btnImprimir = (stat === 0) ? true : false;
    }
    else if (this.cabecera.estado_id === '2100') { // devolver por operaciones  
      if (this.esDuenioPresupuesto) {
        this.abLista = (stat === 0) ? [] : this.fbAprobar;
        this.btnImprimir = (stat === 0) ? true : false;
      }
      else {
        this.abLista = (stat === 0) ? [] : this.fbEnviar;
        this.btnImprimir = (stat === 0) ? true : false;
      }
    }
    else {
      this.abLista = (stat === 0) ? [] : this.fbAprobado;
      this.btnImprimir = (stat === 0) ? true : false;
    }

  }


  public aprobarSM() {
    const user = localStorage.getItem("currentUser");
    var idUser = JSON.parse(window.atob(user.split(".")[1])).uid;
    var idPais = localStorage.getItem("Pais");
    var params = [];
    params.push(idUser); // user logeado
    params.push(this.route.snapshot.paramMap.get("id")); // id_gasto_costo
    params.push(idPais); //pais
    params.push(2053); // nuevo estado - enviado

    Swal.fire({
      title: '¿Desea aprobar la solicitud?',
      showCancelButton: true,
      confirmButtonText: `Si`,
      cancelButtonText: `No`,
    }).then((result) => {
      if (result.isConfirmed) {

        this.spinnerService.show();
        if (this.totalPasaje() > this.monto) {
          this.spinnerService.hide();
          return Swal.fire({
            title: "Atención",
            text: "No puede aprobar, excede del monto aprobación",
            icon: "info",
            confirmButtonText: "Ok",
          });;
        }
        else {
          this.solicitudMovilidadService
            .crudSolicitudesMovilidad(17, params, "|")
            .then((res: any) => {
              this.onToggleFab(1, 0);

              this.cabecera.estado = "Aprobado Operaciones";
              this.cabecera.estado_id = '2053';

              Swal.fire({
                title: "Éxito!",
                text: "La solicitud fue aprobada.",
                icon: "success",
                confirmButtonText: "Ok",
              });
              this.onToggleFab(1, -1);
            });
          this.spinnerService.hide();
        }
      } else {
      }
    })


  }


  public devolverSM(estado) {
    let mensaje;

    if (estado === 2054) {
      mensaje = '¿Desea devolver el solicitud?';
    }
    else if (estado === 2095) {
      mensaje = '¿Desea rechazar el solicitud?';
    }

    Swal.fire({
      title: mensaje,
      input: 'text',
      inputAttributes: {
        autocapitalize: 'off'
      },
      showCancelButton: true,
      confirmButtonText: `Si`,
      cancelButtonText: `No`,
      showLoaderOnConfirm: true,
      preConfirm: (rest) => {
        return this.validacionText(rest).then(val => {
          if (val) {
            return rest
          }
          else {
            throw new Error()
          }

        }).catch(error => {
          Swal.showValidationMessage(
            `El motivo es obligatorio`
          )
        })
      },
      allowOutsideClick: () => !Swal.isLoading()
    }).then((result) => {
      if (result.isConfirmed) {
        this.spinnerService.show();
        if (this.totalPasaje() > this.monto) {
          this.spinnerService.hide();
          return Swal.fire({
            title: "Atención",
            text: "No puede aprobar, excede del monto aprobación",
            icon: "info",
            confirmButtonText: "Ok",
          });;
        }
        else {
          const user = localStorage.getItem("currentUser");
          var idUser = JSON.parse(window.atob(user.split(".")[1])).uid;
          var idPais = localStorage.getItem("Pais");
          var params = [];
          params.push(idUser); // user logeado
          params.push(this.route.snapshot.paramMap.get("id")); // id_gasto_costo
          params.push(idPais); //pais
          params.push(2054); // nuevo estado - enviado
          params.push(result.value);
          this.solicitudMovilidadService
            .crudSolicitudesMovilidad(17, params, "|")
            .then((res: any) => {
              this.onToggleFab(1, 0);

              if (estado === 2054) {
                this.cabecera.estado = "Devuelto por Operaciones";
                this.cabecera.estado_id = '2054';
              }
              else if (estado === 2095) {
                this.cabecera.estado = "Rechazado por Operaciones";
                this.cabecera.estado_id = '2095';
              }

              Swal.fire({
                title: "Éxito!",
                text: "Ls solicitud fue " + this.cabecera.estado,
                icon: "success",
                confirmButtonText: "Ok",
              });
              this.onToggleFab(1, -1);
            });
          this.spinnerService.hide();
        }
      } else {
      }
    })


  }

  private async validacionText(valor) {
    var flag: boolean = false;
    if (valor.length != 0) {
      flag = true;
    }
    return flag;
  }

  //#region Validacion general
  private async validacionGeneral() {
    // verificar si existe la solicitud: enviamos el id_solicitud y el solicitante
    // verificar si tiene permisos de ver la solicitud
    var flag = false;
    const user = localStorage.getItem("currentUser");
    var idUser = JSON.parse(window.atob(user.split(".")[1])).uid;
    var id_solicitud = this.route.snapshot.paramMap.get("id");
    var params = [];
    params.push(idUser);
    params.push(id_solicitud);
    await this.solicitudMovilidadService
      .crudSolicitudesMovilidad(22, params, "|")
      .then((data: any) => {
        if (data !== null) {
          var res = data.data.split("|");
          if (res[0] === "1") {
            flag = true;
          } else {
            Swal.fire({
              icon: "error",
              title: "Oops...",
              text: res[1],
              confirmButtonColor: "#334d6e",
            });
          }
        }
      });

    return flag;
  }
  //#endregion

  //#region  TIPO DE CARGO DEL USUARIO
  private async obtenerTipoCargo() {
    var params = [];
    params.push(this.route.snapshot.paramMap.get("id")); //id centro costo gasto
    params.push(this.id); //user id
    params.push(this.Empresa); //user id
    params.push(this.pais);

    await this.solicitudMovilidadService
      .crudSolicitudesMovilidad(20, params, "|")
      .then((data: any) => {
        if (data !== null) {
          var res = data.msg.split("|");


          if (res[0] == "1") {
            if (res[2] == "creador") {
              this.vMovilidad["dueño"] = 1
              this.esDuenioPresupuestoCreador = true;
              this.esDuenioPresupuesto = false;
            }
            else {
              this.vMovilidad["dueño"] = 2
              this.esDuenioPresupuestoCreador = false;
              this.esDuenioPresupuesto = true;
            }
          }
          else {
            this.vMovilidad["dueño"] = 0
            this.esCreado = true;
          }

          this.vMovilidad["monto"] = res[3]
          this.vMovilidad["control"] = res[4]
          this.monto = res[3]
          this.control = res[4];
        }
      });
  }
  //#endregion

  //#region CARGAR INFORMACION DE LA SOLICITUD REGISTRADA
  private cargarDataAPICabecera() {
    const user = localStorage.getItem("currentUser");
    var idUser = JSON.parse(window.atob(user.split(".")[1])).uid;
    var idPais = localStorage.getItem("Pais");
    var params = [];
    this.vMovilidad["idGasto"] = this.route.snapshot.paramMap.get("id")
    params.push(idUser); //user1
    params.push(this.route.snapshot.paramMap.get("id")); // id de solicitud
    params.push(idPais); // id pais

    this.solicitudMovilidadService
      .crudSolicitudesMovilidad(8, params, "|")
      .then((data: IResponseCabeceraSolicitudDetalle) => {
        this.cabecera = data;
        this.vMovilidad["cabecera"] = this.cabecera;
        if (this.cabecera.estado_id === '2051' ||
          this.cabecera.estado_id === '2054' ||
          this.cabecera.estado_id === '2094' ||
          this.cabecera.estado_id === '2100') {
          if (this.esDuenioPresupuestoCreador) {
            this.btnModificar = false;
          }
          else if (this.esCreado) {
            this.btnModificar = false;
          }
          else {
            this.btnModificar = true;
          }
        }
        else {
          this.btnModificar = true;
        }
        // this.esDuenioPresupuestoCreador
        //this.esDuenioPresupuesto
        this.onToggleFab(1, 0);
        this.obtenerDataAPIPersonas();
        this.onToggleFab(1, -1)
      });
  }

  private _convertFecha(valor: string): string {
    var nuevo_valor = valor.replace(/-/g, "/");

    return nuevo_valor;
  }
  //#endregion

  //#region TABLA DE PERSONAL
  public obtenerDataAPIPersonas() {
    var params = [];
    //params.push(1); //user1
    params.push(this.route.snapshot.paramMap.get("id")); // id de solicitud
    this.solicitudMovilidadService
      .crudSolicitudesMovilidad(9, params, "|")
      .then((data: IResponsePersonalSolicitanteDetalle[]) => {
        this
        this.listaPersonal = data;
        let dia_inicio: number = +this.cabecera.fecha_del.split("/")[0];
        let dia_fin: number = +this.cabecera.fecha_al.split("/")[0];
        this.eliminarColumnasDias(dia_inicio, dia_fin);
        this.cargandoDataPersonalTabla();
      });
  }

  private cargandoDataPersonalTabla() {
    this.dataSource = [];

    this.listaPersonal.forEach((item) => {
      var valor = {};
      valor["ciudad_id"] = item.ciudad_id;
      valor["ciudad"] = item.ciudad;
      valor["dias_sm_id"] = item.dias_sm_id;
      valor["gasto_detalle_id"] = item.gasto_detalle_id;
      valor["nombres_apellidos"] = item.personal;
      valor["personal_id"] = item.personal_id;
      valor["pasaje_por_dia"] = item.pasaje_por_dia;
      valor["dias"] = 0;
      valor["dia1"] = item.dia1;
      valor["dia2"] = item.dia2;
      valor["dia3"] = item.dia3;
      valor["dia4"] = item.dia4;
      valor["dia5"] = item.dia5;
      valor["dia6"] = item.dia6;
      valor["dia7"] = item.dia7;
      valor["dia8"] = item.dia8;
      valor["dia9"] = item.dia9;
      valor["dia10"] = item.dia10;
      valor["dia11"] = item.dia11;
      valor["dia12"] = item.dia12;
      valor["dia13"] = item.dia13;
      valor["dia14"] = item.dia14;
      valor["dia15"] = item.dia15;
      valor["dia16"] = item.dia16;
      valor["cargo_id"] = item.cargo;
      valor["editar"] = false;
      valor["cargo_id"] = item.cargo_id;
      this.dataSource.push(valor);
      this.fnChangeTodosDias(valor, 0,1);
    });


  }

  private eliminarColumnasDias(dia_inicio, dia_fin) {
    this.displayedColumns = [
      "ciudad",
      "nombres_apellidos",
      "pasaje_por_dia",
      "dias",
      "total",
      "todosDias"
    ];

    if (dia_inicio > 15) {
      dia_inicio = dia_inicio - 15;
      dia_fin = dia_fin - 15;
    }

    for (let index = dia_inicio; index <= dia_fin; index++) {
       this.displayedColumns.push("dia" + index);
    }
  }

  private calcularNumeroDias(item) { 
    var numeroDiasSeleccionados = 0;
    if (item.dia1) numeroDiasSeleccionados++;
    if (item.dia2) numeroDiasSeleccionados++;
    if (item.dia3) numeroDiasSeleccionados++;
    if (item.dia4) numeroDiasSeleccionados++;
    if (item.dia5) numeroDiasSeleccionados++;
    if (item.dia6) numeroDiasSeleccionados++;
    if (item.dia7) numeroDiasSeleccionados++;
    if (item.dia8) numeroDiasSeleccionados++;
    if (item.dia9) numeroDiasSeleccionados++;
    if (item.dia10) numeroDiasSeleccionados++;
    if (item.dia11) numeroDiasSeleccionados++;
    if (item.dia12) numeroDiasSeleccionados++;
    if (item.dia13) numeroDiasSeleccionados++;
    if (item.dia14) numeroDiasSeleccionados++;
    if (item.dia15) numeroDiasSeleccionados++;
    if (item.dia16) numeroDiasSeleccionados++;
    item.dias = numeroDiasSeleccionados;
    return numeroDiasSeleccionados;
  }

  public nombreColumnas(nombre: string): string {
    switch (nombre) {
      case "ciudad":
        return "Sucursal";
      case "nombres_apellidos":
        return "Nombres y Apellidos";
      case "pasaje_por_dia":
        return "Pasaje por Dia";
      case "dias":
        return "Dias";
      case "todosDias":
        return "Todos Dias";
      case "dia1":
        return this.nombreCamposDia("dia1");
      case "dia2":
        return this.nombreCamposDia("dia2");
      case "dia3":
        return this.nombreCamposDia("dia3");
      case "dia4":
        return this.nombreCamposDia("dia4");
      case "dia5":
        return this.nombreCamposDia("dia5");
      case "dia6":
        return this.nombreCamposDia("dia6");
      case "dia7":
        return this.nombreCamposDia("dia7");
      case "dia8":
        return this.nombreCamposDia("dia8");
      case "dia9":
        return this.nombreCamposDia("dia9");
      case "dia10":
        return this.nombreCamposDia("dia10");
      case "dia11":
        return this.nombreCamposDia("dia11");
      case "dia12":
        return this.nombreCamposDia("dia12");
      case "dia13":
        return this.nombreCamposDia("dia13");
      case "dia14":
        return this.nombreCamposDia("dia14");
      case "dia15":
        return this.nombreCamposDia("dia15");
      case "dia16":
        return this.nombreCamposDia("dia16");
      case "total":
        return "Total Depos.";

      default:
        return nombre;
    }
  }

  public nombreCamposDia(nombre: string): string {
    if (this.cabecera == null) {
      return "";
    }
    var fechaDiaMesAnio = this.cabecera.fecha_del.split("/");
    var numero_dia_columna = +nombre.substr(3);
    var dia_inicial = +fechaDiaMesAnio[0];

    if (dia_inicial > 15) {
      numero_dia_columna = numero_dia_columna + 15;
    }

    var fecha: Date = new Date(
      fechaDiaMesAnio[1] + " " + numero_dia_columna + " " + fechaDiaMesAnio[2]
    );
    var nombre_dia = this.diasNombres[fecha.getDay()];

    return nombre_dia + " " + numero_dia_columna;
  }

  public deshabilitarDiasPasados(nombreColumna: string): boolean {
    var numero_columna: number = +nombreColumna.substr(3);
    var dia_inicial: number = +this.cabecera.fecha_del.split("/")[0];
    if (dia_inicial > 15) {
      dia_inicial = dia_inicial - 15;
    }
    if (numero_columna >= dia_inicial) {
      return false;
    }
    return true;
  }

  //#endregion

  //#region VALORES CALCULADOS
  public totalPasaje(): number {
    var total: number = 0.0;
    this.dataSource.forEach((item) => {
      var dias: number = this.calcularNumeroDias(item);
      var pasaje: number = item.pasaje_por_dia;
      total = total + this.redondearDinero(pasaje * dias);
    });

    return total;
  }

  public redondearDinero(valor: number): number {
    var monto: number = valor;

    var decimal = monto - Math.floor(monto);
    //Si la parte decimal es < 0.5 entonces total a depositar sera el entero anterior
    if (decimal < 0.5) {
      monto = Math.floor(monto);
    }

    //Si la parte decimal es >0.49 entonces el total a depostiar será el entero anterior +0.5
    if (decimal > 0.49 && decimal < 0.99) {
      monto = Math.floor(monto) + 0.5;
    }

    return monto;
  }

  public totalDias(): number {
    var total: number = 0.0;
    this.dataSource.forEach((item) => {
      var dias: number = this.calcularNumeroDias(item);
      total = total + dias;
    });
    return total;
  }

  public numeroPersonas(): number {
    return this.dataSource.length;
  }

  public cantidadPersonasPorDia(numero_dia: number) {
    var total: number = 0.0;
    this.dataSource.forEach((item) => {
      if (item["dia" + numero_dia]) total = total + 1;
    });
    return total;
  }
  //#endregion

  //#region CAMBIAR PASAJE DEL PERSONAL
  public enviandoDataEditada(personal) { 
    
    if (personal.pasaje_por_dia === null) {
      personal.pasaje_por_dia = 0;
    }
    this.validandoMontoMaximoPasaje(personal).then((valor) => {
      if (valor) {
        personal.editar = false;
      } else {
        personal.pasaje_por_dia = 0;
      }
    });
  }

  private async validandoMontoMaximoPasaje(personal) {
    var params = [];
    var flag: boolean = false;

    params.push(personal.personal_id); // personal id
    //params.push(146); // personal id

    params.push(personal.cargo_id); // cargo planilla id
    //params.push(42); // cargo planilla id

    params.push(this.cabecera.centro_costo_id); // id_centro_costos
    params.push(1);

    await this.solicitudMovilidadService
      .crudSolicitudesMovilidad(19, params, "|")
      .then((data: any) => {
        if (data !== null) {
          if (+data.monto >= +personal.pasaje_por_dia) {
            flag = true;
          } else {
            Swal.fire({
              title: "No se puede!",
              text: "Excede el monto establecido",
              icon: "info",
              confirmButtonText: "Ok",
            });
          }
        } else {
          Swal.fire({
            title: "No se puede!",
            text: "Excede el monto asignado a esta persona",
            icon: "info",
            confirmButtonText: "Ok",
          });
        }
      });

    return flag;
  }
  //#endregion

  //#region ACCIONES
  public async guardarDetalle() {

    /* if (await this.fnValidarCheck(this.dataSource) == false) {
      this.spinnerService.hide();
      return false;      
    } */

    let params = [];
    params.push(this.id);
    params.push(this.Empresa);
    params.push(this.cabecera.codigo_presupuesto);
    params.push(this.cabecera.partida_id);


    Swal.fire({
      title: '¿Desea guardar la solicitud de movilidad?',
      showCancelButton: true,
      confirmButtonText: `Si`,
      cancelButtonText: `No`,
    }).then((result) => {
      /* Read more about isConfirmed, isDenied below */
      if (result.isConfirmed) {
        this.guardar(params);
      } else {
      }
    })

  }

  async guardar(obj) {
    this.spinnerService.show();
    await this.solicitudMovilidadService
      .crudSolicitudesMovilidad(18, obj, "|")
      .then((data: ICiudadMonto[]) => {
        this.guardarInformacionDetalle(data);
      });
  }

  public async guardarInformacionDetalle(obj: ICiudadMonto[]) {
    const user = localStorage.getItem("currentUser");
    var idUser = JSON.parse(window.atob(user.split(".")[1])).uid;
    var pais = localStorage.getItem("Pais");
    var params = [];
    let arrayCiudad = [];
    let arrayTotal = [];



    this.dataSource.forEach((personal) => {
      let total = 0;
      total = +personal.pasaje_por_dia * +personal.dias;
      arrayCiudad.push({ ciudad_id: personal.ciudad_id, ciudad: personal.ciudad });
      arrayTotal.push({ ciudad: personal.ciudad, total: total });

      params.push(
        idUser + //user_logeado
        "|" +
        personal.gasto_detalle_id +
        "|" +
        pais +
        "|" +
        personal.dias_sm_id +
        "|" +
        personal.pasaje_por_dia +
        "|" +
        personal.dia1 +
        "|" +
        personal.dia2 +
        "|" +
        personal.dia3 +
        "|" +
        personal.dia4 +
        "|" +
        personal.dia5 +
        "|" +
        personal.dia6 +
        "|" +
        personal.dia7 +
        "|" +
        personal.dia8 +
        "|" +
        personal.dia9 +
        "|" +
        personal.dia10 +
        "|" +
        personal.dia11 +
        "|" +
        personal.dia12 +
        "|" +
        personal.dia13 +
        "|" +
        personal.dia14 +
        "|" +
        personal.dia15 +
        "|" +
        personal.dia16 +
        "|" +
        this.route.snapshot.paramMap.get("id")
      );
    });



    arrayCiudad = [...new Set(arrayCiudad)];
    let flagPartida: boolean = true;


    arrayCiudad.map((eCi) => {
      let total = 0
      arrayTotal.map((eTo) => {
        if (eTo.ciudad === eCi.ciudad) {
          total += eTo.total
        }
      })

      obj.forEach((ele: ICiudadMonto) => {
        if (ele.codigo === eCi.ciudad_id.toString()) {
          if (total > ele.monto) {
            flagPartida = false;
            this.spinnerService.hide();
            return Swal.fire({
              title: "Atención",
              text: "El monto de la solicitud supera el presupuesto",
              icon: "info",
              confirmButtonText: "Ok",
            });
          }
        }
      });



    })


    if (!flagPartida) {
      return this.spinnerService.hide();
      ;
    }
    else {
      await this.solicitudMovilidadService
        .crudSolicitudesMovilidad(10, params, "*")
        .then((data) => {
          this.btnModificar = true;
          this.onToggleFab(1, 0);
          if (data !== null) {
            Swal.fire({
              title: "Éxito!",
              text: "La informacion ha sido guardada",
              icon: "success",
              confirmButtonText: "Ok",
            });
            this.aceptadoFlag = true;
            this.aceptadoFlag2 = true;
          }
          this.onToggleFab(1, -1);
        });
      this.spinnerService.hide();
    }
  }

  async fnEnviar() {

    if (await this.fnValidarCheck(this.dataSource) == false) {
      //this.spinnerService.hide();
      return false;
    }

    const user = localStorage.getItem("currentUser");
    var idUser = JSON.parse(window.atob(user.split(".")[1])).uid;
    var idPais = localStorage.getItem("Pais");
    var params = [];
    params.push(idUser); // user logeado
    params.push(this.route.snapshot.paramMap.get("id")); // id_gasto_costo
    params.push(idPais); //pais
    params.push(2052); // nuevo estado - enviado 

    Swal.fire({
      title: '¿Desea enviar la solicitud de movilidad?',
      showCancelButton: true,
      confirmButtonText: `Si`,
      cancelButtonText: `No`,
    }).then((result) => {
      /* Read more about isConfirmed, isDenied below */
      if (result.isConfirmed) {
        this.enviarMensajesEmail(params);
      } else {
      }
    })
  }

  public async enviarMensajesEmail(params) {



    let totalVal = 0
    this.dataSource.forEach((personal) => {
      let total = 0;
      total = +personal.pasaje_por_dia * +personal.dias;

      if (total <= 0) {
        totalVal = 0;
        return Swal.fire({
          title: "Atención",
          text: "Por favor, seleccionar los días del postulante " + personal.nombres_apellidos,
          icon: "info",
          confirmButtonText: "Ok",
        });
      }
      else {
        totalVal = 1;
      }
    });

    if (totalVal <= 0) {
    }
    else {
      this.spinnerService.show();

      await this.solicitudMovilidadService
        .crudSolicitudesMovilidad(17, params, "|")
        .then((res: any) => {


          this.cabecera.estado = "Enviado";
          this.cabecera.estado_id = EstadoDocumentoEnum.Enviado;

          if (this.esDuenioPresupuesto) {
            if (this.control === 1) {
              this.aprobarAutomaticaSiEsGerente();
            }
            else if (this.totalPasaje() > this.monto) {
              this.onToggleFab(1, 0);
              Swal.fire({
                title: "Éxito",
                text: "La solicitud fue enviada para su aprobación.",
                icon: "success",
                confirmButtonText: "Ok",
              });
              this.onToggleFab(1, -1);
            }
            else {
              this.aprobarAutomaticaSiEsGerente();
            }
          } else {
            this.onToggleFab(1, 0);
            Swal.fire({
              title: "Éxito",
              text: "La solicitud fue enviada para su aprobación.",
              icon: "success",
              confirmButtonText: "Ok",
            });
            this.onToggleFab(1, -1);
          }
        });

      this.spinnerService.hide();
    }
  }

  public async aprobarAutomaticaSiEsGerente() {
    var params = [];

    const user = localStorage.getItem("currentUser");
    var idUser = JSON.parse(window.atob(user.split(".")[1])).uid;
    var idPais = localStorage.getItem("Pais");
    params.push(idUser); // user logeado
    params.push(this.route.snapshot.paramMap.get("id")); // id_gasto_costo
    params.push(idPais); //pais
    params.push(2053); // nuevo estado - enviado 

    await this.solicitudMovilidadService
      .crudSolicitudesMovilidad(17, params, "|")
      .then((res: any) => {


        this.onToggleFab(1, 0);
        this.cabecera.estado = "Aprobado Operaciones";
        this.cabecera.estado_id = EstadoDocumentoEnum.Aprobado_por_operaciones;
        Swal.fire({
          title: "Éxito!",
          text: "Debido a su cargo, fue aprobado de forma automática",
          icon: "success",
          confirmButtonText: "Ok",
        });
        this.onToggleFab(1, -1);
      });
  }

  public modificar() {
    //this.guardarInformacionDetalle();
    this.btnModificar = false;
    this.onToggleFab(1, 0);
    this.aceptadoFlag = false;
    this.aceptadoFlag2 = false;
    this.onToggleFab(1, -1);
  }

  public imprimir() {
    alert("Imprimiendo");
  }

  public cancelar() {
    this.router.navigateByUrl(
      "comercial/requerimiento/solicitud_movilidad/ver"
    );
  }
  public salir() {
    this.router.navigateByUrl(
      "comercial/requerimiento/solicitud_movilidad/ver"
    );
  }
  //#endregion

  //#region VALIDACIONES
  public async validacionGuardarInformacionDetalle(ciudad: number, total: number) {
    var flag: boolean = false;
    var params = [];

    params.push(this.cabecera.centro_costo_id);
    params.push(total);
    params.push(ciudad);
    params.push(this.cabecera.partida_id);


    await this.solicitudMovilidadService
      .crudSolicitudesMovilidad(18, params, "|")
      .then((data: any) => {
        if (data !== null) {
          var res = data.data.split("|");
          if (res[0] === "1") {
            flag = true;
          } else {
            Swal.fire({
              title: "Atención",
              text: res[1],
              icon: "info",
              confirmButtonText: "Ok",
            });
            this.spinnerService.hide();
          }
        }
      });
    return flag;
  }

  public estadoPendiente(): boolean {
    if (this.cabecera !== null) {
      return this.cabecera.estado_id === EstadoDocumentoEnum.Pendiente;
    }
    return false;
  }

  public estadoEnviado(): boolean {
    if (this.cabecera !== null) {
      if (this.cabecera.estado_id === EstadoDocumentoEnum.Enviado) {
        return true;
      }
    }
    return false;
  }

  public estadoAprobado(): boolean {
    if (this.cabecera !== null) {
      if (
        this.cabecera.estado_id === EstadoDocumentoEnum.Aprobado_por_operaciones
      ) {
        return true;
      }
    }
    return false;
  }

  public estadoDevuelto(): boolean {
    if (this.cabecera !== null) {
      if (
        this.cabecera.estado_id === EstadoDocumentoEnum.Devuelto_por_operaciones
      ) {
        return true;
      }
    }
    return false;
  }

  public estadoTerminado(): boolean {
    if (this.cabecera !== null) {
      if (this.cabecera.estado_id === EstadoDocumentoEnum.Terminado_tesoreria) {
        return true;
      }
    }
    return false;
  }

  public estadoPorAprobar(): boolean {
    if (this.cabecera !== null) {
      if (this.cabecera.estado_id === EstadoDocumentoEnum.Pendiente) {
        return true;
      }
    }
    return false;
  }

  //#endregion
  async fnVerEstado() {
    let idGasto = this.route.snapshot.paramMap.get("id")
    let pParametro = [];
    pParametro.push(idGasto);

    this.spinnerService.show();
    await this.solicitudMovilidadService.crudSolicitudesMovilidad(27, pParametro, "|").then((value: Estado[]) => {

      const dialogRef = this.dialog.open(EstadoefectivoComponent, {
        width: '620px',
        data: value,
      });

      dialogRef.afterClosed().subscribe(result => {
      });
    }, error => {
      console.log(error);
    });
    this.spinnerService.hide();

  }

  async ValidarDia(persona: number, iddetalle: number, estado: boolean, columna: string, lista) {
    if (!estado) estado = true;
    else estado = false;
    //console.log(persona, iddetalle, estado, columna);
    const param = [];
    param.push(persona);
    param.push(iddetalle);
    param.push(estado);
    param.push(columna);

    
    await this.fnChangeTodosDias(lista, estado, 0);

  }

  //#region Validar Todos los Días
  async ValidarTodosDias(persona: number, iddetalle: number, estado: boolean, lista) {
    
    let dia_inicio: number = +this.cabecera.fecha_del.split("/")[0];
    let dia_fin: number = +this.cabecera.fecha_al.split("/")[0];
    if (dia_inicio > 15) {
      dia_inicio = dia_inicio - 15;
      dia_fin = dia_fin - 15;
    }

    if (!estado) {
      estado = true; 
      for (let index = dia_inicio; index <= dia_fin; index++) {  
        lista["dia" + index] = true; 
      } 
    }
    else {
      estado = false; 
      for (let index = 1; index <= 16; index++) {  
        lista["dia" + index] = false; 
      } 
    }

  }

  fnChangeTodosDias(lista, estado, tipo) {

    //Tipo 0: Al Cambio
    if (tipo == 0) {
      if (lista.dias == 15 && estado == true) {
        if (!lista.todosDias)
          lista.todosDias = true;
      }
      else {
        lista.todosDias = false;
      }

    }

    //Tipo 1: Al Cargar
    if (tipo == 1) {
      if (lista.dia1 && lista.dia2 && lista.dia3 && lista.dia4 && lista.dia5 && lista.dia6 && lista.dia7 && lista.dia8 &&
        lista.dia9 && lista.dia10 && lista.dia11 && lista.dia12 && lista.dia13 && lista.dia14 && lista.dia15 && lista.dia16) {
        lista.todosDias = true;
      }
      else {
        lista.todosDias = false;
      }
    }


  }

  //#endregion


  async fnValidarCheck(lista) {
    let bValido: boolean = true;
    for (let i = 0; i < lista.length; i++) {

      if (lista[i].dias == 0) {

        bValido = false;
        Swal.fire({
          title: "Advertencia!",
          text: "Hay personas sin dias marcados o sin total, verifique.",
          icon: "warning",
          confirmButtonText: "Ok",
        });

        break;

      }


    }
    return bValido
  }

}
