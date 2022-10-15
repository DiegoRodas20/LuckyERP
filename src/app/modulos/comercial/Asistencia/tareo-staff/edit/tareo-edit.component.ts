import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Inject } from "@angular/core";
import Swal from 'sweetalert2';
import { ConsultaCampaniaTareo, DetalleTareoStaff, PersonalTareo, TmpDetalleTareo } from '../models/tareoStaff.Entity';
import { TareoStaffService } from "../services/tareostaff.service";
import { SecurityErp } from '../models/securityErp.Entity';
import { ConsultaPersonalTareo, TareoStaffCrud } from '../models/tareoStaffCrud.Entity';
import { asistenciapAnimations } from '../../asistenciap/asistenciap.animations';
import { RepositoryEnum } from '../repository/repositoryEnum';
import { RepositoryMensajes } from '../repository/RepositoryMensajes';
import { RepositoryCorreos } from '../repository/repositoryCorreos';
import { RepositoryTareo } from '../repository/repositoryTareo';
import { RepositoryUtilitarios } from '../repository/repositoryUtilitarios';
import { Empresa } from '../../../../control-costos/centroCosto/Models/centroCostos/ICentroCosto';

@Component({
  selector: "app-tareo-edit",
  templateUrl: "./tareo-edit.component.html",
  styleUrls: ["./tareo-edit.component.css"],
  animations: [asistenciapAnimations]
})

export class TareoEditComponent implements OnInit {
  securityErp = new SecurityErp;
  consultaPersonalTareo = new ConsultaPersonalTareo;
  repositoryUtilitarios = new RepositoryUtilitarios;
  tareoStaffCrud = new TareoStaffCrud;
  repositoryMensajes = new RepositoryMensajes;
  repositoryCorreos = new RepositoryCorreos;
  lstCampaniaTareo: ConsultaCampaniaTareo[];
  detalleTareoStaff: DetalleTareoStaff[] = [];
  tmpDetalleTareo: TmpDetalleTareo[] = [];
  detalleTareoEnviar: any[] = [];
  repositoryTareo = new RepositoryTareo;
  adMetodos: boolean = false;

  constructor(
    @Inject("BASE_URL") base_url: string,
    private router: Router, private tareoStaffService: TareoStaffService,
    private route: ActivatedRoute
  ) {
    this.securityErp.baseUrl = base_url;
  }

  ngOnInit(): void {
    this.repositoryTareo.s1Empresa = this.securityErp.getEmpresa();
    this.repositoryTareo.s2Responsable = this.securityErp.getUsuarioId();
    this.usuarioSolicitante();
    this.route.params.subscribe(params => {
      this.repositoryTareo.s1Empresa = this.securityErp.getEmpresa();
      this.repositoryTareo.n3IdPersonal = +params.id;
      this.repositoryTareo.n4CargoPersonal = +params.idCargo;
      this.repositoryTareo.n13IdTareo = +params.idPersonal;
      this.consultaEmpleadoDetalle();
      this.consultaCampaniaTareo();
    });

  }

  consultaEmpleadoDetalle() {
    this.tareoStaffService.fnTareoStaffService(RepositoryEnum.ConsultaEmpleadoTareoEdit, this.repositoryTareo.generaCadenaConsultaEmpleadoDetalle(), this.securityErp.baseUrl).subscribe(
      res => {
        this.consultaPersonalTareo.cargoId = res[0].codcargo;
        this.consultaPersonalTareo.cargo = res[0].cargo;
        this.consultaPersonalTareo.idPartida = res[0].idPartida;
        this.repositoryTareo.nPartidaId = res[0].idPartida;
        this.consultaPersonalTareo.codPartida = res[0].codPartida;
        this.consultaPersonalTareo.partida = res[0].partida;
        this.consultaPersonalTareo.idQuincena = 2;
        this.consultaPersonalTareo.quincena = "Quincena";
        this.consultaPersonalTareo.idCiudad = res[0].idCiudad;
        this.consultaPersonalTareo.ciudad = res[0].ciudad;
        this.consultaPersonalTareo.horaFechaRegistro = res[0].fechaCreate;
        this.consultaPersonalTareo.horaFechaModificacion = res[0].fechaMod;
        this.consultaPersonalTareo.idPersonal = res[0].idPersonal;
        this.consultaPersonalTareo.personal = res[0].personal;
        this.consultaPersonalTareo.anio = res[0].anio;
        this.consultaPersonalTareo.codMes = res[0].idMes;
        this.consultaPersonalTareo.mes = res[0].mes;
        this.consultaPersonalTareo.estadoTareo = res[0].estado;
        this.tareoStaffCrud.idCorrelativo = res[0].nro;
        // this.cargarDetalleTareo();
      });

    this.habilitarbtnEditar();
  }

  habilitarbtnEditar(): boolean {
    return this.consultaPersonalTareo.estadoTareo == 'PENDIENTE' ? true : false;
  }



  public async cargarDetalleTareo() {
    this.adMetodos = true;
    Swal.fire({
      title: 'Desea editar el tareo, se procedera a reiniciar todo y volvera a cargar los tareos.',
      showCancelButton: true,
      confirmButtonText: `Si`,
      cancelButtonText: `No`,
    }).then((result) => {
      if (result.isConfirmed) {
        this.repositoryTareo.nPartidaId = this.consultaPersonalTareo.idPartida
        this.repositoryTareo.n15Anio = parseInt(this.consultaPersonalTareo.anio);
        this.repositoryTareo.s1Empresa = this.securityErp.getEmpresa();
        this.repositoryTareo.n14IdMes = parseInt(this.consultaPersonalTareo.codMes);

        this.tareoStaffService
          .fnTareoStaffService(RepositoryEnum.ConsultaCampanias, this.repositoryTareo.generaCadenaConsultaLineas(), this.securityErp.baseUrl)
          .subscribe((data: DetalleTareoStaff[]) => {
            if (data.length > 0) {
              this.detalleTareoStaff = data;
              this.repositoryTareo.totalfilasDetalleTareo = data.length.toString() + " Campañas validas.";
              this.repositoryTareo.mostrarTablaDetalleTareo = true;
              this.repositoryTareo.sumaTotalPorcentajesEquivalentes = 0;
              this.repositoryTareo.sumaTotalDiasEquivalentes = 0;
              this.repositoryTareo.n9DiasMaximoPermitido = data[0].nDiasMaxPer;
              (document.getElementById("btnEditarTareo") as HTMLButtonElement).disabled = false;
              console.log((document.getElementById("btnEditarTareo") as HTMLButtonElement).disabled = false);
            }
            else {
              return Swal.fire({
                icon: 'error',
                title: this.repositoryMensajes.mensajeError(),
                text: this.repositoryMensajes.mensajeSinTareos()
              });
            }
          });
      }
    }
    )

  }



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
            this.tareoStaffCrud.activarDesactivarBotones(false);
            this.repositoryTareo.sumaTotalPorcentajesEquivalentes -= this.detalleTareoStaff[this.repositoryTareo.indexDetalleTareo].porcentaje;
            this.repositoryTareo.sumaTotalDiasEquivalentes -= this.detalleTareoStaff[this.repositoryTareo.indexDetalleTareo].diasEquivalente;
            this.detalleTareoStaff[this.repositoryTareo.indexDetalleTareo].porcentaje = 0;
            this.detalleTareoStaff[this.repositoryTareo.indexDetalleTareo].diasEquivalente = 0;
          }
          else {
            this.onValidarPorcentajes();
          }
        });
  }

  onValidarPorcentajes(): boolean {
    if (this.totalPorcentajes() == 100) {
      this.tareoStaffCrud.activarDesactivarBotones(true);
      return true;
    } else {
      this.tareoStaffCrud.activarDesactivarBotones(false);
    }
  }
  devuelveIndex(event) {
    this.repositoryTareo.indexDetalleTareo = this.detalleTareoStaff.indexOf(event);
  }

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

  consultaCampaniaTareo() {
    this.tareoStaffService.fnTareoStaffService(RepositoryEnum.ConsultaCampaniaTareo, this.repositoryTareo.generaCadenaConsultaCampaniaTareo(), this.securityErp.baseUrl)
      .subscribe((data) => {
        this.lstCampaniaTareo = data;
        this.repositoryTareo.totalfilasDetalleTareo = data.length.toString() + " Campañas validas.";
      })

    setTimeout(() => {
      this.sumaTotales()
    }, 1000);
  }

  sumaTotales() {
    let porcentaje = 0;
    let dias = 0;
    this.lstCampaniaTareo.forEach((x) => {
      porcentaje = porcentaje + x.nPorcentaje
      dias = dias + x.nDiasPropor
    })
    this.repositoryTareo.sumaTotalDiasEquivalentes = dias;
    this.repositoryTareo.sumaTotalPorcentajesEquivalentes = porcentaje;
  }


  usuarioSolicitante() {
    this.tareoStaffService.fnTareoStaffService(RepositoryEnum.ConsultaUsuarioSistema, this.repositoryTareo.generaCadenaConsultaUsuarioSistema(), this.securityErp.baseUrl).subscribe(
      res => {
        this.securityErp.sysUsuario = res[0]["sNombres"];
      });
  }

  Correo() {
    this.repositoryCorreos.responsable = this.securityErp.sysUsuario;
    this.repositoryCorreos.personal = this.consultaPersonalTareo.personal
    this.tareoStaffService.fnTareoStaffService(RepositoryEnum.EnvioCorreo, this.repositoryCorreos.envioCorreo(), this.securityErp.baseUrl).toPromise();
  }



  validaTotal(): boolean {
    let porcentaje = 0;
    let dias = 0;
    this.tmpDetalleTareo.forEach((x) => {
      porcentaje = porcentaje + x.nPorcentaje
      dias = dias + x.nDiasPropor
    })

    this.repositoryTareo.sumaTotalDiasEquivalentes = dias;
    this.repositoryTareo.sumaTotalPorcentajesEquivalentes = porcentaje;

    if (this.repositoryTareo.sumaTotalPorcentajesEquivalentes <= 0 && this.repositoryTareo.sumaTotalDiasEquivalentes <= 0) {
      Swal.fire({
        icon: 'warning',
        title: '¡Verificar!',
        text: 'Falta ingresar el detalle de Tareo.',
      })
      return false;
    }
    return true;
  }

  guardar() {

    // if (this.validaTotal() == false) {
    //   return;
    // }
    // else {
    //   this.guardarTareo();
    // }

    if (this.adMetodos == true) {
      if (this.validaTotal() == false) {
        return;
      }
      else {
        this.guardarTareo();
      }
    }
    else
      this.enviarTareo();
  }

  enviar() {

    if (this.adMetodos == true) {
      if (this.validaTotal() == false) {
        return;
      }
      else {
        this.enviarTareo()
      }
    }
    else {
      if (this.repositoryTareo.sumaTotalPorcentajesEquivalentes > 0) {
        this.guardarTareo();
        setTimeout(() => {
          this.enviarTareo();
        }, 2000);
      }
      else
        Swal.fire({
          icon: 'warning',
          title: '¡Verificar!',
          text: 'Falta ingresar el detalle de Tareo.',
        })
    }

  }

  guardarTareo() {
    this.repositoryTareo.s8EstadoTareo = 'P';
    Swal.fire({
      title: this.repositoryMensajes.mensajePregunta('guardar'),
      showCancelButton: true,
      confirmButtonText: `Si`,
      cancelButtonText: `No`,
    }).then((result) => {
      if (result.isConfirmed) {
        this.repositoryTareo.n6Porcentaje = this.totalPorcentajes();
        this.repositoryTareo.s7UsuarioRegistro = this.securityErp.getUsuarioId();

        this.repositoryTareo.n12AnioConsulta = 0;
        this.repositoryTareo.nIdSucursal = this.consultaPersonalTareo.nIdSucursal;

        const lineas = [];
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

        this.tareoStaffService.fnTareoStaffService(99, this.repositoryTareo.generaCadenaTareo(), this.securityErp.baseUrl).subscribe(
          res => {
            this.repositoryTareo.n13IdTareo = res[0].id;
            // this.repositoryCorreos.correlativo = res[0].tareo;

            this.tareoStaffCrud.idCorrelativo = res[0].correlativo;
            this.consultaPersonalTareo.estadoTareo = res[0].estado;
            this.consultaPersonalTareo.horaFechaModificacion = res[0].usuario + ' - ' + new Date().toLocaleString();
            Swal.fire({
              title: this.repositoryMensajes.mensajeGuardar(),
              confirmButtonText: `Ok`,
            })
          }
        )
      };
    })
  }

  enviarTareo() {

    let param = [];
    param.push(this.repositoryTareo.n13IdTareo);
    param.push(2052);
    param.push(this.securityErp.getUsuarioId());
    Swal.fire({
      title: this.repositoryMensajes.mensajePregunta('Enviar'),
      showCancelButton: true,
      confirmButtonText: `Si`,
      cancelButtonText: `No`,
    }).then((result) => {
      if (result.isConfirmed) {
        this.tareoStaffService.fnTareoStaffService(100, param, this.securityErp.baseUrl).subscribe(
          res => {
            this.repositoryTareo.n13IdTareo = res[0].id;
            // this.repositoryCorreos.correlativo = res[0].tareo;
            this.tareoStaffCrud.idCorrelativo = res[0].correlativo;
            this.consultaPersonalTareo.estadoTareo = res[0].estado;
            this.consultaPersonalTareo.horaFechaModificacion = res[0].usuario + ' - ' + new Date().toLocaleString();
            Swal.fire({
              title: this.repositoryMensajes.mensajeEnviar(),
              confirmButtonText: `Ok`,
            })
          }
        )
      };
    })
    
  }


  salir() {
    this.router.navigate(['/comercial/asistencia/tareo-list']);
  }

}//Final de Programa
