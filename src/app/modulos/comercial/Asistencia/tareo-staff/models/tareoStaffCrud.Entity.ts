export class TareoStaffCrud {
  codigoAnio: number;
  codigoMes: number;
  idTareo: number = 0;
  idCorrelativo: string;
  lstMeses: any[];
  lstAnios: string[] = ['2021', '2020'];
  porcentajeUnitario: number;
  totalDias: number;
  totalDiasPersonal: number;
  totalfilasCampanias: string;

  activarDesactivarBotones(ok: boolean) {
    if (ok) {
      (document.getElementById("btnGuardarTareo") as HTMLButtonElement).disabled = false;
      
    }
    else
      (document.getElementById("btnGuardarTareo") as HTMLButtonElement).disabled = true;
    
  }

  activarDesactivarBotonesN(ok: boolean) {
    if (ok) {
      (document.getElementById("btnGuardarTareo") as HTMLButtonElement).disabled = false;

    }
    else
      (document.getElementById("btnGuardarTareo") as HTMLButtonElement).disabled = true;

  }

  limpiarAniosMeses() {
    return this.lstAnios = [], this.lstMeses = []
  }
}


export class ConsultaPersonalTareo {
  idPersonal: number;
  cargoId: number;

  idPartida: number;
  codPartida: string;
  partida: string;
  estadoTareo: string;
  idQuincena: number;
  quincena: string;
  cargo: string;
  idCiudad: string;
  ciudad: string;
  idCargo: string;
  horaFechaRegistro: string;
  horaFechaModificacion: string;
  personal: string;
  anio: string;
  mes: string;
  codMes: string;
  nIdSucursal: number;
  displayedColumns: string[] = ['campania', 'nombreCampania', 'perfil', 'canal', 'porcentaje', 'diasEquivalente'];

  limpiarPropiedades() {
    return this.partida = null,
      this.codPartida = null,
      this.estadoTareo = null,
      this.idQuincena = null,
      this.quincena = null,
      this.idCargo = null,
      this.cargo = null,
      this.idCiudad = null,
      this.ciudad = null,
      this.horaFechaRegistro = null,
      this.horaFechaModificacion = null,
      this.idPersonal = 0
  }

  adBotontraerCampania(ok: boolean) {
    (document.getElementById("traerCampania") as HTMLButtonElement).disabled = ok;

  }
}






