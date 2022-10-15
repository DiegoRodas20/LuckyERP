import {
  MatDialog,
  MAT_DIALOG_DATA,
  MatDialogRef,
} from "@angular/material/dialog";
import {
  FormControl,
  FormGroup,
  FormBuilder,
  Validators,
} from "@angular/forms";
import { Component, OnInit, Inject, ViewChild } from "@angular/core";
import { AtcMatrizGcpService } from "./../atc-matriz-gcp.service";
import Swal from "sweetalert2";

@Component({
  selector: "app-atc-matriz-gcp-modal",
  templateUrl: "./atc-matriz-gcp-modal.component.html",
  styleUrls: ["./atc-matriz-gcp-modal.component.css"],
})
export class AtcMatrizGcpModalComponent implements OnInit {
  url: string;
  sPais: string;
  nIdUsuario: number;
  nIdEmpresa: number;
  nOpcionModal: number;
  nIdPuesto: number;
  nIdEspecializacion: number;

  //Formularios
  formCargo: FormGroup;
  formPuesto: FormGroup;
  formEspecializacion: FormGroup;

  listaGrupos = [];
  listaCargos = [];

  nTipoModal: number;
  sTituloModal: string;
  sAccionModal: string;
  sOpcionModal: string;

  constructor(
    public dialogRef: MatDialogRef<AtcMatrizGcpModalComponent>,
    @Inject("BASE_URL") baseUrl: string,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private fb: FormBuilder,
    private vSerAtcMatrizGcp: AtcMatrizGcpService
  ) {
    this.url = baseUrl;
  }

  ngOnInit(): void {
    this.sPais = localStorage.getItem("Pais");
    this.nIdEmpresa = parseInt(localStorage.getItem("Empresa"));
    const user = localStorage.getItem("currentUser");
    this.nIdUsuario = JSON.parse(window.atob(user.split(".")[1])).uid;

    this.nTipoModal = this.data.tipomodal;
    this.sAccionModal = this.data.accion == 0 ? "AGREGAR" : "EDITAR";

    this.nOpcionModal = this.data.opcion;
    this.sOpcionModal = this.nOpcionModal == 1 ? "CARGO Y PUESTO" : "PUESTO";


    this.formCargo = this.fb.group({
      nIdGrupo: "",
      sNombreCargo: "",
      bEstado: "",
    });

    this.formPuesto = this.fb.group({
      nIdGrupo: ["", Validators.required],
      nIdCargo: "",
      sNombreCargo: "",
      sPuesto: ["", Validators.required],
      sNombrePuesto: "",
      bEstado: ["true", Validators.required],
    });

    this.formEspecializacion = this.fb.group({
      nIdPuesto: ["", Validators.required],
      sNombreEspecializacion: ["", Validators.required],
      bEstado: "",
    });

    //Tipo Modal - 1:Puesto / 2:Especialización
    if (this.nTipoModal == 1) {
      this.fnListarGrupos();

      //Opcion - 1: Cargo y Puesto / 2: Puesto
      if (this.nOpcionModal == 2) {
        this.fnListarCargos();
        this.fnDeshabilitarControles();
      }

      //Accion - 0: Agregar / 1: Editar
      if (this.data.accion == 0) {
        this.nIdPuesto = 0
        this.formPuesto.controls.nIdGrupo.setValue(this.data.grupo);
        this.formPuesto.controls.nIdCargo.setValue(this.data.cargo);
      }
      else if (this.data.accion == 1) {
        this.nIdPuesto = this.data.puesto;
      }

    }
    else if (this.nTipoModal == 2) {
      this.nIdPuesto = this.data.puesto;

      if (this.data.accion == 1) {
        this.nIdEspecializacion = this.data.cargo
        this.fnCargarEspecializacion();
      }
      else {
        this.nIdEspecializacion = 0
      }
    }

  }

  //#region Deshabilitar Controles
  fnDeshabilitarControles() {
    this.formPuesto.get('nIdGrupo').disable();
    this.formPuesto.get('nIdCargo').disable();
  }
  //#endregion

  //#region Guardar Puesto
  async onSubmitPuesto() {
    if ((await this.fnValidarCargo()) == false) {
      return Swal.fire({
        icon: "warning",
        title: "Falta ingresar Cargo",
      });
    } else {
      if (this.formPuesto.valid) {
        let result: any;

        result = {
          nIdGrupo: this.formPuesto.get("nIdGrupo").value,
          nIdCargo: this.formPuesto.get("nIdCargo").value,
          sNombreCargo: this.formPuesto.get("sNombreCargo").value,
          sPuesto: this.formPuesto.get("sPuesto").value,
          bEstado: this.formPuesto.get("bEstado").value,
          nIdPuesto: this.nIdPuesto,
        };

        this.dialogRef.close(result);
      }
    }
  }
  //#endregion

  //#region Guardar Especializacion
  onSubmitEspecializacion() {

    this.formEspecializacion.get("nIdPuesto").setValue(this.nIdPuesto);
    let sNombreEsp = this.formEspecializacion.get("sNombreEspecializacion").value

    if (this.formEspecializacion.valid) {
      let result: any;
      result = {
        nIdPuesto: this.formEspecializacion.get("nIdPuesto").value,
        sNombreEspecializacion: sNombreEsp,
        bEstado: this.formEspecializacion.get("bEstado").value,
        nIdEspecializacion: this.nIdEspecializacion
      };
      this.dialogRef.close(result);
    }
  }
  //#endregion

  //#region Listar Grupos
  async fnListarGrupos() {
    let pParametro = [];
    pParametro.push(this.sPais);

    await this.vSerAtcMatrizGcp.fnMatrizGCP(2, pParametro, this.url).then(
      (value: any[]) => {

        this.listaGrupos = value;
      },
      (error) => {
        console.log(error);
      }
    );
  }
  //#endregion

  //#region Listar Cargos
  async fnListarCargos() {
    let pParametro = [];
    pParametro.push(this.sPais);

    await this.vSerAtcMatrizGcp.fnMatrizGCP(3, pParametro, this.url).then(
      (value: any[]) => {

        this.listaCargos = value;

        //Cargar Datos al Editar Puesto
        if (this.data.accion == 1) {
          this.fnCargarDatos();
        }


      },
      (error) => {
        console.log(error);
      }
    );
  }
  //#endregion

  //#region Cargar Datos
  async fnCargarDatos() {
    let sEstado: string;
    let pParametro = [];
    pParametro.push(this.nIdPuesto);

    await this.vSerAtcMatrizGcp.fnMatrizGCP(4, pParametro, this.url).then(
      (value: any[]) => {

        this.formPuesto.controls.nIdGrupo.setValue(value[0].nIdGrupo);
        this.formPuesto.controls.nIdCargo.setValue(value[0].nIdCargo);
        this.formPuesto.controls.sPuesto.setValue(value[0].sPuesto);

        sEstado = value[0].bEstado ? "true" : "false";
        this.formPuesto.controls.bEstado.setValue(sEstado);

        this.fnNombrePuesto();

      },
      (error) => {
        console.log(error);
      }
    );

  }
  //#endregion

  //#region Validar Cargo
  async fnValidarCargo() {
    //cargo y puesto nOpcion = 1 / Puesto : nOpcion :2
    let bValido: boolean = true;

    if (this.nOpcionModal == 1) {
      if (this.formPuesto.get("sNombreCargo").value == "") {
        bValido = false;
      }
    } else if (this.nOpcionModal == 2) {
      if (this.formPuesto.get("nIdCargo").value == "") {
        bValido = false;
      }
    }

    return bValido;
  }
  //#endregion

  //#region Cerrar
  onNoClick() {
    this.dialogRef.close();
  }
  //#endregion

  //#region Asignar Nombre Puesto
  async fnNombrePuesto() {
    let sCargo, sPuesto, sNombrePuesto;

    if (this.nOpcionModal == 1) {
      sCargo = this.formPuesto.get("sNombreCargo").value;
      sPuesto = this.formPuesto.get("sPuesto").value;

    }
    else if (this.nOpcionModal == 2) {
      let nIdCargo = this.formPuesto.get("nIdCargo").value;
      if (this.listaCargos.length > 0) {
        for (let i = 0; i < this.listaCargos.length; i++) {
          if (nIdCargo == this.listaCargos[i].nIdCargo) {
            sCargo = this.listaCargos[i].sNombreCargo;
            break;
          }
        }
      }
      if (sCargo == undefined) {
        sCargo = "";
      }

      sPuesto = this.formPuesto.get("sPuesto").value;
    }

    sNombrePuesto = sCargo + ' de ' + sPuesto
    if (sCargo == "") {
      sNombrePuesto = ""
    }
    this.formPuesto.get("sNombrePuesto").setValue(sNombrePuesto)

  }
  //#endregion

  //#region Cargar Especializacion
  async fnCargarEspecializacion() {
    let sEstado: string;
    let pParametro = [];
    pParametro.push(this.nIdEspecializacion);

    await this.vSerAtcMatrizGcp.fnMatrizGCP(11, pParametro, this.url).then(
      (value: any[]) => {

        this.nIdEspecializacion = value[0].nIdEspecializacion
        this.formEspecializacion.controls.nIdPuesto.setValue(value[0].nIdPuesto);
        this.formEspecializacion.controls.sNombreEspecializacion.setValue(value[0].sNombreEspecializacion);

        sEstado = value[0].bEstado ? "true" : "false";
        this.formEspecializacion.controls.bEstado.setValue(sEstado);

      },
      (error) => {
        console.log(error);
      }
    );

  }
  //#endregion

}

export interface DialogData {
  accion: number;
  opcion: number;
  grupo: any;
  cargo: any;
  puesto: any;
  estado: any;
  tipomodal: number;
}
