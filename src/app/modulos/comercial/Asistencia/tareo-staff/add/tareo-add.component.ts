import { asistenciapAnimations } from '../../asistenciap/asistenciap.animations';
import { Component, OnInit } from '@angular/core';
import { DetalleTareoStaff, PersonalTareo, TmpDetalleTareo } from '../models/tareoStaff.Entity';
import { TareoStaffService } from "../services/tareostaff.service";
import { Router } from "@angular/router";
import { Inject } from "@angular/core";
import Swal from 'sweetalert2';
import { ConsultaPersonalTareo, TareoStaffCrud } from '../models/tareoStaffCrud.Entity';
import { SecurityErp } from '../models/securityErp.Entity';
import { RepositoryMensajes } from '../repository/RepositoryMensajes';
import { RepositoryEnum } from '../repository/repositoryEnum';
import { RepositoryUtilitarios } from '../repository/repositoryUtilitarios';
import { RepositoryTareo } from '../repository/repositoryTareo';
import { RepositoryCorreos } from '../repository/repositoryCorreos';
import { log } from 'console';



@Component({
  selector: "app-tareo-add",
  templateUrl: "./tareo-add.component.html",
  styleUrls: ["./tareo-add.component.css"],
  animations: [asistenciapAnimations]
})
export class TareoAddComponent implements OnInit {

  securityErp = new SecurityErp;
  consultaPersonalTareo = new ConsultaPersonalTareo;
  repositoryMensajes = new RepositoryMensajes;
  tareoStaffCrud = new TareoStaffCrud;
  repositoryUtilitarios = new RepositoryUtilitarios;
  personalTareoList: PersonalTareo[];
  detalleTareoStaff: DetalleTareoStaff[] = [];
  repositoryTareo = new RepositoryTareo;
  repositoryCorreos = new RepositoryCorreos;
  tmpDetalleTareo: TmpDetalleTareo[] = [];

  constructor(
    @Inject("BASE_URL") base_url: string,
    private router: Router, private tareoStaffService: TareoStaffService) {
    this.securityErp.baseUrl = base_url;
  }

  ngOnInit(): void {
    this.repositoryTareo.s1Empresa = this.securityErp.getEmpresa();
    this.repositoryTareo.s2Responsable = this.securityErp.getUsuarioId();
    this.usuarioSolicitante();
    this.fnLoadListEmployee();
    this.tareoStaffCrud.limpiarAniosMeses();
  }


  //#region Cargar Lista de Empleados
  async fnLoadListEmployee() {
    this.tareoStaffService.fnTareoStaffService(RepositoryEnum.ConsultaEmpleado, this.repositoryTareo.generaCadenaConsultaEmpleado(), this.securityErp.baseUrl).subscribe(value => {
      if (value.length > 0) {
        this.personalTareoList = value
      }
    });
  }
  //#endregion


  //#region Consultar por el detalle de empleado 
  fnSearchDetailEmployee($event) {
    this.tareoStaffCrud.limpiarAniosMeses();
    if ($event == undefined || $event === undefined || $event === 'undefined') {
      this.consultaPersonalTareo.limpiarPropiedades();
      this.tareoStaffCrud.limpiarAniosMeses();
      this.consultaPersonalTareo.adBotontraerCampania(true);
      this.repositoryTareo.mostrarTablaDetalleTareo = false;
    }
    else {
      this.consultaPersonalTareo.idPersonal = $event['nIdPersonal'];
      this.consultaPersonalTareo.cargoId = $event['nIdCargo'];
      this.repositoryCorreos.personal = $event['sNombres'];
      this.repositoryTareo.n3IdPersonal = this.consultaPersonalTareo.idPersonal;
      this.repositoryTareo.n4CargoPersonal = this.consultaPersonalTareo.cargoId;
      this.repositoryTareo.n13IdTareo = 0;
      this.tareoStaffService.fnTareoStaffService(RepositoryEnum.ConsultaEmpleadoDetalle, this.repositoryTareo.generaCadenaConsultaEmpleadoDetalle(), this.securityErp.baseUrl).subscribe(
        res => {
          this.tareoStaffCrud.lstMeses = [] = [];
          this.tareoStaffCrud.lstAnios = ['2021', '2020']
          this.fnConsultMonth(this.repositoryTareo.n15Anio);
          this.consultaPersonalTareo.idCargo = res[0].idCargo;
          this.consultaPersonalTareo.idPartida = res[0].idPartida;
          this.consultaPersonalTareo.codPartida = res[0].codPartida;
          this.consultaPersonalTareo.partida = res[0].partida;
          this.consultaPersonalTareo.estadoTareo = res[0].estado;
          this.consultaPersonalTareo.idQuincena = res[0].idQuincena;
          this.consultaPersonalTareo.quincena = res[0].quincena;
          this.consultaPersonalTareo.cargo = res[0].cargo;
          this.consultaPersonalTareo.idCiudad = res[0].idCiudad;
          this.consultaPersonalTareo.ciudad = res[0].ciudad;
          this.consultaPersonalTareo.nIdSucursal = res[0].nIdSucursal;
          this.consultaPersonalTareo.horaFechaRegistro;
          this.consultaPersonalTareo.horaFechaModificacion;
          this.repositoryTareo.totalfilasDetalleTareo = null;
          this.repositoryTareo.mostrarTablaDetalleTareo = false;
        });
    }
  }
  //#endregion


  //#region Consulta de Meses
  fnConsultMonth(event) {
    this.repositoryTareo.n15Anio = event;
    this.tareoStaffService.fnTareoStaffService(RepositoryEnum.ConsultaMesesTareo, this.repositoryTareo.generaCadenaConsultaEmpleadoMeses(), this.securityErp.baseUrl).subscribe(res => {
      let x = {};
      this.tareoStaffCrud.lstMeses = res.filter(o => x[o.cEleNam] ? false : x[o.cEleNam] = true);
    });
  }
  //#endregion


  //#region Obtener Codigo de Mes
  fnGetMonthCod(event) {
    if (event.value == undefined || event.value === undefined || event.value === 'undefined') {
      this.consultaPersonalTareo.adBotontraerCampania(true);
    }
    else {
      this.repositoryTareo.n14IdMes = event.value;
      this.consultaPersonalTareo.adBotontraerCampania(false);
    }
  }
  //#endregion


  //#region Cargar Detalle del Tareo 
  public async fnLoadDetailTareo() {
    this.repositoryTareo.nPartidaId = this.consultaPersonalTareo.idPartida
    await this.tareoStaffService
      .fnTareoStaffService(RepositoryEnum.ConsultaCampanias, this.repositoryTareo.generaCadenaConsultaLineas(), this.securityErp.baseUrl)
      .subscribe((data: DetalleTareoStaff[]) => {
        if (data.length > 0) {
          this.detalleTareoStaff = data;
          this.repositoryTareo.totalfilasDetalleTareo = data.length.toString() + " Campañas validas.";
          this.repositoryTareo.mostrarTablaDetalleTareo = true;
          this.repositoryTareo.sumaTotalPorcentajesEquivalentes = 0;
          this.repositoryTareo.sumaTotalDiasEquivalentes = 0;
          this.repositoryTareo.n9DiasMaximoPermitido = data[0].nDiasMaxPer;
        }
        else {
          return Swal.fire({
            icon: 'error',
            title: this.repositoryMensajes.mensajeError(),
            text: this.repositoryMensajes.mensajeSinTareos()
          });
        }
      });
    if (this.consultaPersonalTareo.estadoTareo === "NUEVO") {
      this.tareoStaffCrud.activarDesactivarBotonesN(false);
      return;
    }
  }
  //#endregion


  //#region Validar Porcentajes
  onValidatePorcentajes(): boolean {
    if (this.totalPorcentajes() == 100) {
      this.tareoStaffCrud.activarDesactivarBotonesN(true);
      return true;
    } else {
      this.tareoStaffCrud.activarDesactivarBotonesN(false);
    }
  }
  //#endregion


  //#region Devolver Index
  returnIndex(event) {
    this.repositoryTareo.indexDetalleTareo = this.detalleTareoStaff.indexOf(event);
  }
  //#endregion


  //#region Consultar Costo Empresa Dias Disponibles
  async consultaCostoEmpresaDiasDisponible(event) {
    let cadena = Object.values(event)
    cadena.pop();
    this.repositoryTareo.sLineasConsultas = cadena.toString();
    await this.tareoStaffService.fnTareoStaffService(RepositoryEnum.ConsultaCostoEmpresaDiasDisponible,
      this.repositoryTareo.generaCadenaLineasConsultas(), this.securityErp.baseUrl).subscribe(
        (res) => {
          console.log(res);
          let valida = 0;
          this.tmpDetalleTareo.map((e) => {
            if (e.nId === res.nId) {
              e.nSaldoDias = res.nSaldoDias
              e.nSaldoDinero = res.nSaldoDinero
              e.nPorcentaje = res.nPorcentaje
              e.nDiasPropor = res.nDiasPropor
              e.nCostoEmpPropor = res.nCostoEmpPropor
              valida = 1
            }
          })

          let arrayLineas = this.tmpDetalleTareo
          if (valida === 0) {
            arrayLineas.push(res)
          }

          this.tmpDetalleTareo = arrayLineas
          console.log(this.tmpDetalleTareo);

          if (res.mensaje != 'OK') {
            Swal.fire({
              icon: 'error',
              title: 'AVISO',
              text: res.mensaje
            });
            this.tareoStaffCrud.activarDesactivarBotonesN(false);
            this.repositoryTareo.sumaTotalPorcentajesEquivalentes -= this.detalleTareoStaff[this.repositoryTareo.indexDetalleTareo].porcentaje;
            this.repositoryTareo.sumaTotalDiasEquivalentes -= this.detalleTareoStaff[this.repositoryTareo.indexDetalleTareo].diasEquivalente;
            this.detalleTareoStaff[this.repositoryTareo.indexDetalleTareo].porcentaje = 0;
            this.detalleTareoStaff[this.repositoryTareo.indexDetalleTareo].diasEquivalente = 0;
          }
          else {
            this.onValidatePorcentajes();
          }
        });
  }
  //#endregion


  //#region Total Porcentajes
  public totalPorcentajes(): number {
    let resultadodias = 0;
    let resultado = 0
    this.repositoryTareo.sumaTotalDiasEquivalentes = parseFloat((this.detalleTareoStaff[this.repositoryTareo.indexDetalleTareo].porcentaje * (this.repositoryTareo.n9DiasMaximoPermitido / 100)).toFixed(2));
    this.detalleTareoStaff[this.repositoryTareo.indexDetalleTareo].diasEquivalente = this.repositoryTareo.sumaTotalDiasEquivalentes;

    this.detalleTareoStaff.map((item) => { resultado = resultado + item.porcentaje })
    this.repositoryTareo.sumaTotalPorcentajesEquivalentes = resultado;

    this.detalleTareoStaff.map((item) => { resultadodias = resultadodias + item.diasEquivalente })
    this.repositoryTareo.sumaTotalDiasEquivalentes = resultadodias;
    return resultado;
  }
  //#endregion


  //#region Guardar
  fnSave() {
    if (this.tmpDetalleTareo.length <= 0) {
      Swal.fire({
        icon: 'warning',
        title: '¡Verificar!',
        text: 'Falta ingresar el detalle de Tareo.',
      })
      return;
    }

    Swal.fire({
      title: this.repositoryMensajes.mensajePregunta('guardar'),
      showCancelButton: true,
      confirmButtonText: `Si`,
      cancelButtonText: `No`,
    }).then((result) => {
      if (result.isConfirmed) {
        this.repositoryTareo.n6Porcentaje = this.totalPorcentajes();
        this.repositoryTareo.s7UsuarioRegistro = this.securityErp.getUsuarioId();
        this.repositoryTareo.s8EstadoTareo = 'P';
        this.repositoryTareo.n12AnioConsulta = 0;
        this.repositoryTareo.n13IdTareo = 0;
        this.repositoryTareo.nIdSucursal = this.consultaPersonalTareo.nIdSucursal;

        const lineas = [];
        console.log(this.tmpDetalleTareo);

        this.tmpDetalleTareo.forEach((detalle) => {
          let fila = [];
          fila.push(detalle.nIdCentroCosto);
          fila.push(detalle.nIdCanal);
          fila.push(detalle.nIdPerfil);
          fila.push(detalle.nSaldoDias);
          fila.push(detalle.nSaldoDinero);
          fila.push(detalle.nPorcentaje);
          fila.push(detalle.nDiasPropor);
          fila.push(detalle.nCostoEmpPropor);
          lineas.push(fila.join(","));
        });
        this.repositoryTareo.s16LineasDetalle = lineas.join('/');
        console.log(this.repositoryTareo.generaCadenaTareo());
        console.log('detalle a enviar')


        this.tareoStaffService.fnTareoStaffService(RepositoryEnum.Transaccion, this.repositoryTareo.generaCadenaTareo(), this.securityErp.baseUrl).subscribe(
          res => {
            this.repositoryTareo.n13IdTareo = res[0].id;
            //  this.repositoryCorreos.correlativo = res[0].tareo;
            this.tareoStaffCrud.idCorrelativo = res[0].correlativo;
            this.consultaPersonalTareo.estadoTareo = res[0].estado;
            this.consultaPersonalTareo.horaFechaRegistro = res[0].usuario + ' - ' + new Date().toLocaleString();
            Swal.fire({
              title: this.repositoryMensajes.mensajeGuardar(),
              confirmButtonText: `Ok`,
            })
            setTimeout(() => {
              this.router.navigate(['/comercial/asistencia/tareo-edit', this.repositoryTareo.n3IdPersonal, this.repositoryTareo.n4CargoPersonal, res[0].id]);
            }, 1000)
          }

        )
      }
      ;
    })
  }
  //#endregion


  //#region Enviar Correo
  Correo() {
    this.repositoryCorreos.responsable = this.securityErp.sysUsuario;
    this.tareoStaffService.fnTareoStaffService(RepositoryEnum.EnvioCorreo, this.repositoryCorreos.envioCorreo(), this.securityErp.baseUrl).toPromise();
  }
  //#endregion


  //#region Usuario solicitante
  usuarioSolicitante() {
    this.tareoStaffService.fnTareoStaffService(RepositoryEnum.ConsultaUsuarioSistema, this.repositoryTareo.generaCadenaConsultaUsuarioSistema(), this.securityErp.baseUrl).subscribe(
      res => {
        this.securityErp.sysUsuario = res[0]["sNombres"];
      });
  }
  //#endregion


  //#region Salir
  fnExit() {
    this.router.navigate(['/comercial/asistencia/tareo-list']);
  }
  //#endregion


}


