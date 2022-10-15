import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SolicitudMovilidadService } from '../../../../../comercial/SolicitudMovilidad/solicitud-movilidad.service';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';
import { FormGroup, FormBuilder } from '@angular/forms';
import { PresupuestosService } from '../../../presupuestos.service';
import { respuestaAlerta } from '../requerimiento-re/requerimiento-re.component';
import { asistenciapAnimations } from '../../../../../comercial/Asistencia/asistenciap/asistenciap.animations';
import { DialogHistorialDocumentosComponent } from '../dialog-historial-documentos/dialog-historial-documentos.component';
import { MatDialog } from '@angular/material/dialog';

interface IResponseCabeceraSolicitudDetalle {
  centro_costo_id: number;
  codigo_presupuesto: string;
  estado: string;
  estado_id: string;
  solicitante: string;
  nro_movilidad: string;
  campania: string;


  ciudad: string;
  ciudad_id: number;

  cargo: string;
  nCargo: number;
  anio: string;
  fecha_del: string;
  fecha_al: string;

  partida: string;
  partida_id: number;

  observacion: string;
  correlativo: string;
  creado_por: string;
  enviado_por: string;
  aprobado_por: string;
  devuelto_por: string;
  terminado_por: string;
  zona: string;
}

interface IResponsePersonalSolicitanteDetalle {
  dias_sm_id: number;
  gasto_detalle_id: number;
  personal: null;
  ciudad: null;
  personal_id: null;
  cargo: null;
  cargo_id: null;
  pasaje_por_dia: number;
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
  selector: 'app-requerimiento-sm',
  templateUrl: './requerimiento-sm.component.html',
  styleUrls: ['./requerimiento-sm.component.css', '../dialog-edit-aprobacion/dialog-edit-aprobacion.component.css'],
  animations: [asistenciapAnimations]
})
export class RequerimientoSmComponent implements OnInit {
  vVerReporteSM: boolean = false;
  //#region TIPO DE CARGO DEL USUARIO
  esDuenioPresupuesto = false;
  //#endregion

  //#region INFROMACION DE LA SOLICITUD REGISTRADA
  cabecera: IResponseCabeceraSolicitudDetalle = null;
  //#endregion

  //#region TABLA DE PERSONAL
  displayedColumns: string[] = [
    "nombres_apellidos",
    "sucursal",
    "pasaje_por_dia",
    "dias",
    "total",
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
  //#endregion

  //#region BANDERAS
  linealFlag = false;
  aceptadoFlag = false;
  aceptadoFlag2 = true;
  //#endregion

  flagGeneral = false;

  //Parametros
  @Output() campoActualizado: EventEmitter<any>;
  @Input() data: any;
  form: FormGroup;
  formHistorial: FormGroup;
  ncampana: any;
  abLista = [];
  tsLista = 'active';
  fbLista = [
    {icon: 'save', tool: 'Crear'}
  ];
  listaHistorial: any;
  listaEstado: any;
  estado: any;
  sucursal: any;
  totalDetalle: any;
  ocultarBotones: boolean = true;

  // Booleano impresion
  vVerReporteImpresionSm = false;

  // Booleano para ver si se esta usando en celular
  vDispEsCelular = false;

  constructor(
    public dialog: MatDialog,
    private solicitudMovilidadService: SolicitudMovilidadService,
    private route: ActivatedRoute,
    private router: Router,
    private spinnerService: NgxSpinnerService,
    private presupuestoService: PresupuestosService,
    private fb: FormBuilder
  ) {
    this.campoActualizado = new EventEmitter();
    this.crearFormulario();
    this.crearFormularioHistorial();
  }

  verReporte() {
    this.vVerReporteSM = true;
  }

  async ngOnInit() {
    this.spinnerService.show();

    // Detectamos el dispositivo (Mobile o PC)
    this.fnDetectarDispositivo();

    await this.validacionGeneral().then((valor) => {
      if(valor) {
        this.obtenerTipoCargo();
        this.cargarDataAPICabecera();
        this.flagGeneral = true;
      }
    })
    this.listaHistorial = await this.presupuestoService.listarDocumentosParaAprobacion(5,`${this.data.nIdGastoCosto}|`);
    await this.inicializarFormularioHistorial(this.listaHistorial);
    this.estado = this.data.nEstado;
    this.sucursal = this.data.ciudad;
    await this.listarEstadoPorCabecera();
    this.verReporte();
    this.spinnerService.hide();
  }

  onToggleFab(fab: number, stat: number) {

    stat = ( stat === -1 ) ? ( this.abLista.length > 0 ) ? 0 : 1 : stat;
    this.tsLista = ( stat === 0 ) ? 'inactive' : 'active';
    this.abLista = ( stat === 0 ) ? [] : this.fbLista;

  }

  crearFormulario() {
    this.form = this.fb.group({
      'nroMovilidad': [''],
      'solicitante': [''],
      'ciudad': [''],
      'campana': [''],
      'fechaInicio': [''],
      'fechaFin': [''],
      'year': [''],
      'cargo': [''],
      'partida': [''],
      'estado': [''],
      'zona': ['']
    })
  }

  crearFormularioHistorial() {
    this.formHistorial = this.fb.group({
      'userAprobacionComer': [''],
      'userAprobacion': [''],
      'userRechazado': [''],
      'userDevuelto': [''],
    })
  }

  llenarFormulario(data: IResponseCabeceraSolicitudDetalle) {
    this.form.reset({
      'nroMovilidad': `SM - ${data.correlativo}`,
      'solicitante': data.solicitante,
      'ciudad': data.ciudad,
      'campana': this.ncampana + ' - ' + data.campania,
      'fechaInicio': data.fecha_del,
      'fechaFin': data.fecha_al,
      'year': data.anio,
      'cargo': `${data.cargo}`,
      'partida': data.partida,
      'estado': data.estado,
      'zona': data.zona
    })
  }

  inicializarFormularioHistorial(historial: any) {
    this.formHistorial.reset({
      'userAprobacionComer': historial.aprobadoComercial,
      'userAprobacion': historial.aprobadoPresupuesto,
      'userRechazado': historial.rechazadoPresupuesto,
      'userDevuelto': historial.devueltoPresupuesto,
    })
  }

  listarEstadoPorCabecera() {
    switch(this.estado){
      case 2053: //Enviado
        this.listaEstado = [
          {name: 'Aprobar', codigo: 2055, disabled: false, accion: 1, icon: 'check'},
          {name: 'Devolver', codigo: 2100, disabled: false, accion: 2, icon: 'undo'},
          {name: 'Rechazar', codigo: 2056, disabled: false, accion: 3, icon: 'clear'},
        ];
        break;
      case 2055: // Aprobado
        this.listaEstado = [
          {name: 'Aprobar', codigo: 2055, disabled: true, accion: 1, icon: 'check'},
          {name: 'Devolver',codigo: 2100, disabled: false, accion: 2, icon: 'undo'},
          {name: 'Rechazar', codigo: 2056, disabled: true, accion: 3, icon: 'clear'},
        ];
        break;
      case 2100: // Devuelto
        this.listaEstado = [
          {name: 'Aprobar', codigo: 2055, disabled: true, accion: 1, icon: 'check'},
          {name: 'Devolver',codigo: 2100, disabled: true, accion: 2, icon: 'undo' },
          {name: 'Rechazar', codigo: 2056, disabled: true, accion: 3, icon: 'clear'},
        ];
        break;
      case 2056: // Rechazado
        this.listaEstado = [
          {name: 'Aprobar', codigo: 2055, disabled: true, accion: 1, icon: 'check'},
          {name: 'Devolver',codigo: 2100, disabled: true, accion: 2, icon: 'undo' },
          {name: 'Rechazar', codigo: 2056, disabled: true, accion: 3, icon: 'clear'},
        ];
        break;
      case 4:
        this.listaEstado = [
          {name: 'Aprobar', codigo: 2055, disabled: true, accion: 1,icon: 'check'},
          {name: 'Devolver',codigo: 2100, disabled: true, accion: 2,icon: 'undo' },
          {name: 'Rechazar', codigo: 2056, disabled: true, accion: 3,icon: 'clear'},
        ];
        break;

    }

  }

  // actualizarEstado(event) {
  //   if(event === 4) {
  //     this.campoActualizado.emit(event);

  //   }
  // }

  async actualizarEstado(tipo) {
    const user = localStorage.getItem('currentUser');
    const idUser = JSON.parse(window.atob(user.split('.')[1])).uid;
    const pPais = localStorage.getItem('Pais');
    const pEmpresa = localStorage.getItem('Empresa');
    const tipoDoc = this.data.sTipoDoc;
    const nIdGastoCosto = this.data.nIdGastoCosto;
    let idEstado: number;
    let resp: any;
    let respSwet: any;
    /* tipo
      1: Aprobar
      2: Devolver
      3: Rechazar
      4: Cancelar
      0: Cancelar
    */
    switch (tipo) {
      case 1:
        idEstado = 2055;
        respSwet = await this.actualizarMensaje(idEstado, 'Aprobado', 'Aprobar');
        if (respSwet.resp === 1) {
          resp = await this.presupuestoService.actualizarDocumentoAprobar(1, `${this.data.nIdGastoCosto}|${idEstado}|${idUser}|${pPais}|${this.data.nIdUserRegistro}|SM|${respSwet.observacion}|${pEmpresa}`);
          if (resp) {
            // this.campoActualizado.emit(this.data.nIdGastoCosto);
            this.data = await this.presupuestoService.listarDocumentosParaAprobacion(2, `${nIdGastoCosto}|${tipoDoc}` );
            this.campoActualizado.emit(this.data);
          }
        }
        break;
      case 2:
        idEstado = 2100;
        respSwet = await this.actualizarMensaje(idEstado, 'Devuelto', 'Devolver');
        if ( respSwet.resp === 1) {
          resp = await this.presupuestoService.actualizarDocumentoAprobar(1, `${this.data.nIdGastoCosto}|${idEstado}|${idUser}|${pPais}|${this.data.nIdUserRegistro}|SM|${respSwet.observacion}|${pEmpresa}`);
          if (resp) {
            // this.campoActualizado.emit(this.data.nIdGastoCosto);
            this.data = await this.presupuestoService.listarDocumentosParaAprobacion(2, `${nIdGastoCosto}|${tipoDoc}` );
            this.campoActualizado.emit(this.data);
          }
        }
        break;
      case 3:
        idEstado = 2056;
        respSwet = await this.actualizarMensaje(idEstado, 'Rechazado', 'Rechazar');
        if ( respSwet.resp === 1) {
          resp = await this.presupuestoService.actualizarDocumentoAprobar(1, `${this.data.nIdGastoCosto}|${idEstado}|${idUser}|${pPais}|${this.data.nIdUserRegistro}|SM|${respSwet.observacion}|${pEmpresa}`);
          if (resp) {
            // this.campoActualizado.emit(this.data.nIdGastoCosto);
            this.data = await this.presupuestoService.listarDocumentosParaAprobacion(2, `${nIdGastoCosto}|${tipoDoc}` );
            this.campoActualizado.emit(this.data);
          }
        }
        break;
      case 4:
        idEstado = 0;
        this.campoActualizado.emit(0);
        break;
      default:
        idEstado = 0;
        break;
    }
  }

  async actualizarMensaje(id: number, msj: string, estado: string) {
    let respuestaAlerta: respuestaAlerta;
    let resp = 0;
    let obs = '';
    if(msj === 'Aprobado') {
      await Swal.fire({
        title: `¿Desea ${estado} la solicitud de movilidad?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Aceptar',
        cancelButtonText: 'Cancelar'
      }).then(async (result) => {
        if (result.isConfirmed) {
          Swal.fire({
            title: 'Actualizado',
            text: 'El requerimiento fue '  + msj,
            icon: 'success',
            timer: 1500
          });
          resp = 1;
        }
      });
    } else {
      await Swal.fire({
        title: `¿Desea ${estado} la solicitud de movilidad?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Aceptar'
      }).then(async (result) => {
        if (result.isConfirmed) {
          const {value: observacion } = await Swal.fire({
            title: 'Ingrese el motivo' ,
            input: 'textarea',
            showCancelButton: true,
            confirmButtonText: 'Aceptar',
            cancelButtonColor: '#d33',
            cancelButtonText: 'Cancelar',
            inputValidator: (value) => {
              if(!value) {
                resp = 0;
                return 'El motivo es obligatorio';
              }

              for (let i = 0; i < value.length; i++) {
                const element = value.charAt(i);
                if(element === '|' || element === '/') {
                  resp = 0;
                  return 'El motivo no puede contener estos caracteres "|" "/"';
                }

              }
            }
          })

          if(observacion) {
            Swal.fire({
              title: 'Actualizado',
              text: 'El requerimiento fue '  + msj,
              icon: 'success',
              timer: 1500
            });
            resp = 1;
            obs = observacion.toString();
          }

          // Swal.fire({
          //   title: 'Actualizado',
          //   text: 'El requerimiento fue '  + msj,
          //   icon: 'success',
          //   timer: 1500
          // });
          // resp = 1;
        }

      });


    }
    respuestaAlerta = {
      resp: resp,
      observacion: obs
    };
    return respuestaAlerta;
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

  private async validacionGeneral() {
    // verificar si existe la solicitud: enviamos el id_solicitud y el solicitante
    // verificar si tiene permisos de ver la solicitud
    var flag = false;
    const user = localStorage.getItem("currentUser");
    var idUser = JSON.parse(window.atob(user.split(".")[1])).uid;
    // var id_solicitud = this.route.snapshot.paramMap.get("id");
    var id_solicitud = this.data.nIdGastoCosto;
    var params = [];
    params.push(idUser);
    params.push(id_solicitud);
    await this.solicitudMovilidadService
      .crudSolicitudesMovilidad(22, params, "|")
      .then((data: any) => {
        if (data !== null) {
          var res = data.data.split("|");
          // if (res[0] === "1") {
          //   flag = true;
          // } else {
          //   Swal.fire({
          //     icon: "error",
          //     title: "Oops...",
          //     text: res[1],
          //     confirmButtonColor: "#334d6e",
          //   });
          // }
          flag = true;
        }
      });

    return flag;
  }

  private async obtenerTipoCargo() {
    const user = localStorage.getItem("currentUser");
    var idUser = JSON.parse(window.atob(user.split(".")[1])).uid;
    var idEmpresa = localStorage.getItem("Empresa");

    var params = [];
    // params.push(this.route.snapshot.paramMap.get("id")); //id centro costo gasto
    params.push(this.data.nIdGastoCosto); //id centro costo gasto
    params.push(idUser); //user id

    await this.solicitudMovilidadService
      .crudSolicitudesMovilidad(20, params, "|")
      .then((data: any) => {
        if (data !== null) {
          var res = data.msg.split("|");
          if (res[0] == "1") {
            this.esDuenioPresupuesto = true;
          }
        }
      });
  }

  //#region CARGAR INFORMACION DE LA SOLICITUD REGISTRADA
  private cargarDataAPICabecera() {
    const user = localStorage.getItem("currentUser");
    var idUser = JSON.parse(window.atob(user.split(".")[1])).uid;
    var idPais = localStorage.getItem("Pais");
    var params = [];
    params.push(idUser); //user1
    // params.push(this.route.snapshot.paramMap.get("id")); // id de solicitud
    params.push(this.data.nIdGastoCosto); // id de solicitud

    params.push(idPais); // id pais
    this.presupuestoService.
      listarDocumentosParaAprobacion(7,`${idUser}|${this.data.nIdGastoCosto}|${idPais}`).
      then((data: IResponseCabeceraSolicitudDetalle) => {
        this.cabecera = data;
        this.sucursal = data.ciudad;
        this.ncampana = this.cabecera.codigo_presupuesto;
        this.llenarFormulario(this.cabecera);
        this.obtenerDataAPIPersonas(this.sucursal);
    });
    // this.solicitudMovilidadService
    //   .crudSolicitudesMovilidad(8, params, "|")
    //   .then((data: IResponseCabeceraSolicitudDetalle) => {

    //     this.cabecera = data;
    //     this.sucursal = data.ciudad;
    //     this.llenarFormulario(this.cabecera);
    //     this.ncampana = this.cabecera.codigo_presupuesto;
    //     this.obtenerDataAPIPersonas(this.sucursal);
    //   });
  }

  private _convertFecha(valor: string): string {
    var nuevo_valor = valor.replace(/-/g, "/");
    return nuevo_valor;
  }

  public obtenerDataAPIPersonas(sucursal: any) {
    var params = [];
    //params.push(1); //user1
    // params.push(this.route.snapshot.paramMap.get("id")); // id de solicitud
    params.push(this.data.nIdGastoCosto); // id de solicitud
    this.solicitudMovilidadService
      .crudSolicitudesMovilidad(9, params, "|")
      .then((data: IResponsePersonalSolicitanteDetalle[]) => {
        this.listaPersonal = data;

        var dia_inicio: number = +this.cabecera.fecha_del.split("/")[0];
        var dia_fin: number = +this.cabecera.fecha_al.split("/")[0];
        this.eliminarColumnasDias(dia_inicio, dia_fin);

        this.cargandoDataPersonalTabla(sucursal);
        let totalPersonal = 0;
        this.listaPersonal.forEach((item) => {
          totalPersonal += this.calcularNumeroDias(item) * item.pasaje_por_dia;
        });
        this.totalDetalle = totalPersonal;
      });
  }

  private eliminarColumnasDias(dia_inicio, dia_fin) {
    this.displayedColumns = [
      "nombres_apellidos",
      "ciudad",
      "pasaje_por_dia",
      "dias",
      "total",
    ];

    if (dia_inicio > 15) {
      dia_inicio = dia_inicio - 15;
      dia_fin = dia_fin - 15;
    }

    for (let index = dia_inicio; index <= dia_fin; index++) {
      this.displayedColumns.push("dia" + index);
    }
  }

  private cargandoDataPersonalTabla(sucursal: any) {
    this.dataSource = [];

    this.listaPersonal.forEach((item) => {
      var valor = {};
      valor["dias_sm_id"] = item.dias_sm_id;
      valor["gasto_detalle_id"] = item.gasto_detalle_id;
      valor["nombres_apellidos"] = item.personal;
      valor["ciudad"] = item.ciudad;
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
    });

  }

  public nombreColumnas(nombre: string): string {
    switch (nombre) {

      case "nombres_apellidos":
        return "Nombres y Apellidos";
      case "ciudad":
        return "Ciudad";
      case "pasaje_por_dia":
        return "Pasaje por Dia";
      case "dias":
        return "Dias";
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

  verHistorial(): void {
    const dialogRef = this.dialog.open(DialogHistorialDocumentosComponent, {
      width: '90%',
      height: '65%',
      data: {
        'listaHistorial': this.listaHistorial,
        'cabecera': {
          'presupuesto': `${this.data.sCodCC}  ${this.data.numeroCabecera}` ,
          'documento': `${this.data.numeroCabecera}`,
          'cliente': `${this.data.sNombreComercial}`,
          'titulo': `${this.data.sTitulo}`
        },
        'tipo': 2
      }
    });
    dialogRef.afterClosed().subscribe(async result => {
      if(result) {

      }
    })
  }

  /*fnImprimirSm(){
    this.vVerReporteImpresionSm = true;
    // Agregar nombre al documento
    const tempTitle = document.title;
    document.title = 'Solicitud de Movilidad';
    // Impresion
    setTimeout(()=>{
      window.print();
      this.vVerReporteImpresionSm = false;
    })
    document.title = tempTitle;
    return;
  }*/

  fnImprimirReporteSm (){
    const pdfFrame = document.getElementById('pdf-frame') as HTMLIFrameElement;
    const reporte = document.getElementById('print-reporte-rq').innerHTML;
    pdfFrame.contentWindow.document.open();
    pdfFrame.contentWindow.document.write(reporte);
    pdfFrame.contentWindow.document.close();
    pdfFrame.contentWindow.print();
  }


  async fnImprimirCelularReporteSm(){
    const divText = document.getElementById("print-reporte-rq").outerHTML;
    const myWindow = window.open('','','width=985,height=1394');
    const doc = myWindow.document;
    doc.open();
    doc.write(divText);
    doc.close();
    doc.title = 'Solicitud de Movilidad';
  }

  // Detectar el dispositivo
  fnDetectarDispositivo(){
    const dispositivo = navigator.userAgent;
    if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i.test(dispositivo)){
      this.vDispEsCelular = true;
    }
    else{
      this.vDispEsCelular = false;
    }
  }


}
