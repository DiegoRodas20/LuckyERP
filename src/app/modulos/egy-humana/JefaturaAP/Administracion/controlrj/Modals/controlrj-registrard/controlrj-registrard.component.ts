import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';
import { adminpAnimations } from '../../../../Animations/adminp.animations';
import { IDeposito, IDepositoDevengue } from '../../../../Model/Icontrolrj';
import { ControlrjService } from '../../../../Services/controlrj.service';

@Component({
  selector: 'app-controlrj-registrard',
  templateUrl: './controlrj-registrard.component.html',
  styleUrls: ['./controlrj-registrard.component.css'],
  animations: [adminpAnimations]
})
export class ControlrjRegistrardComponent implements OnInit {

  @Input() fromParent;

  fbMain = [
    { icon: "save", tool: "Guardar" },
    { icon: "cancel", tool: "Cancelar" }
  ];
  abMain = [];
  tsMain = "inactive";

  data: Array<IDeposito> = new Array();
  lstDetalleDepositos: Array<IDeposito> = new Array();

  lstDepositoDevengue: Array<IDepositoDevengue> = new Array();

  aParam = [];

  devengueId: string = "";
  devengue: string = "";

  // Mat Table
  searchBC: string[] = [
    "trabajador", "tipoRetencion", "beneficiario", "importe"
  ];
  searchBS: MatTableDataSource<IDeposito>;
  @ViewChild("searchB", { static: true }) searchB: MatPaginator;
  @ViewChild(MatSort, { static: true }) tableSortB: MatSort;

  // Progress Bar
  pbRetencion: boolean;

  constructor(public activeModal: NgbActiveModal,
    private controlrjService: ControlrjService,
    private spinner: NgxSpinnerService,
    private _snackBar: MatSnackBar) {

    this.searchBS = new MatTableDataSource();
  }

  async ngOnInit(): Promise<void> {
    this.spinner.show("spi_retencion");
    this.pbRetencion = true;

    this.devengueId = this.fromParent.devengueId;
    this.devengue = this.fromParent.devengue;

    await this.cargarDepositos();

    this.pbRetencion = false;
    this.spinner.hide("spi_retencion");
  }

  async cargarDepositos() {
    this.pbRetencion = true;

    // debugger

    const param = [];

    await this.controlrjService._loadSP(8, param).then((data: any) => {
      this.data = data;

      this.lstDetalleDepositos = this.data
        .filter(
          (value, index, arr) =>
            arr.findIndex((x) => x.trabajador === value.trabajador && x.beneficiario === value.beneficiario) === index
        );

      this.searchBS = new MatTableDataSource(this.lstDetalleDepositos);
      this.searchBS.paginator = this.searchB;
      this.searchBS.sort = this.tableSortB;
    });

    this.pbRetencion = false;
  }

  onToggleFab(stat: number) {
    // debugger
    stat = stat === -1 ? (this.abMain.length > 0 ? 0 : 1) : stat;
    this.tsMain = stat === 0 ? "inactive" : "active";
    this.abMain = stat === 0 ? [] : this.fbMain;
  }

  async onClickMenu(tool: string) {
    switch (tool) {
      case "Guardar":
        await this.generarDepositos();
        break;

      case "Cancelar":
        this.activeModal.dismiss();

        this._snackBar.open('Acción cancelada por el usuario.', 'Cerrar', {
          duration: 5000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
        });
        break;

      default:
        break;
    }
  }

  async generarDepositos() {

    this.aParam = [];
    this.aParam.push("T1¡nIdDevengue!" + this.devengueId);

    await this.controlrjService._loadSP(11, this.aParam).then((data: any) => {
      this.lstDepositoDevengue = data;
    });

    if (this.lstDepositoDevengue.length > 0) {
      Swal.fire("Error:", "Ya se generaron los depositos para el devengue " + this.devengue + ".", "error");
      return;
    }

    Swal.fire({
      title: 'Información',
      text: '¿Desea generar registros de deposito?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: `Aceptar`,
      cancelButtonText: `Cancelar`
    }).then((result) => {
      if (result.isConfirmed) {

        this.pbRetencion = true;

        this.registrarDeposito();

        this.pbRetencion = false;
      }
      else if (result.dismiss === Swal.DismissReason.cancel) {
        this._snackBar.open('Acción cancelada por el usuario.', 'Cerrar', {
          duration: 5000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
        });
      }
    })
  }

  async registrarDeposito() {
    // Usuario y Fecha con hora
    const user = localStorage.getItem("currentUser");
    const uid = JSON.parse(window.atob(user.split(".")[1])).uid;

    this.aParam = [];

    this.aParam.push("T0¡nIdRegUser!" + uid);
    this.aParam.push("T0¡dtReg!GETDATE()");

    this.aParam.push("T1¡nIdDevengue!7");

    // debugger

    const result = await this.controlrjService._crudRJ(6, this.aParam);

    let lstBeneficiario: Array<IDeposito> = new Array();

    lstBeneficiario = this.data
      .filter(
        (value, index, arr) =>
          arr.findIndex((x) => x.retencionId === value.retencionId) === index
      );

    if (result[0].split("!")[0] !== "00") {
      const depositoId = result[0].split("!")[1];

      for (let index = 0; index < lstBeneficiario.length; index++) {
        const element = lstBeneficiario[index];

        const importe = 0;//this.calcularImporte(element.personalId);

        this.aParam = [];
        this.aParam.push("T1¡nIdDRJ!" + depositoId);
        this.aParam.push("T1¡nIdRetencionj!" + element.retencionId);
        this.aParam.push("T1¡nImporte!" + importe);

        const result2 = await this.controlrjService._crudRJ(7, this.aParam);
      }

      this.aParam = [];

      this.aParam.push("T1¡nIdFK!" + depositoId);
      this.aParam.push("T1¡nIdDireccion!1128");
      this.aParam.push("T1¡nIdArea!1137");
      this.aParam.push("T1¡nIdTipoDeposito!1375");
      this.aParam.push("T1¡sFileSustento!-");
      this.aParam.push("T1¡nIdEstado!2357");
      this.aParam.push("T0¡nIdRegUser!" + uid);
      this.aParam.push("T0¡dtReg!GETDATE()");

      const result3 = await this.controlrjService._crudRJ(8, this.aParam);

      if (result[0].split("!")[0] !== "00") {
        this._snackBar.open('Depositos generados correctamente.', 'Cerrar', {
          duration: 5000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
        });
      }
    } else {
      Swal.fire("Inconveniente", result[0].split("!")[1], "error");
    }
  }

}
