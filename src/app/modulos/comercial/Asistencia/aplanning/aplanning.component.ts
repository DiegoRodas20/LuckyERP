import { Component, Inject, OnInit, Type, ViewChild } from "@angular/core";
import { ErrorStateMatcher } from "@angular/material/core";

import {
  AbstractControl,
  FormBuilder,
  Validators,
  FormControl,
  FormGroup,
  FormArray,
} from "@angular/forms";
import { NgbModal, NgbModalOptions } from "@ng-bootstrap/ng-bootstrap";
import Swal from "sweetalert2";
import { MatSnackBar } from "@angular/material/snack-bar";

import { adminpAnimations } from "src/app/modulos/egy-humana/JefaturaAP/Animations/adminp.animations";
import { DetAplanningComponent } from "./det-aplanning/det-aplanning.component";
import { AplanningServiceService } from "./services/aplanning-service.service";
import { nsPlanningT } from "./Models/nsPlanning";

declare var jQuery: any;

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null): boolean {
    return !!(control && control.invalid);
  }
}

const MODALS: { [name: string]: Type<any> } = {
  bonot: DetAplanningComponent,
};

@Component({
  selector: "app-aplanning",
  templateUrl: "./aplanning.component.html",
  styleUrls: ["./aplanning.component.css", "./aplanning.component.scss"],
  animations: [adminpAnimations],
  providers: [AplanningServiceService],
})
export class AplanningComponent implements OnInit {
  user = localStorage.getItem("currentUser");
  uid = JSON.parse(window.atob(this.user.split(".")[1])).uid;
  nIdEmp = JSON.parse(localStorage.getItem("Empresa"));
  nPais = JSON.parse(localStorage.getItem("Pais"));

  matcher = new MyErrorStateMatcher();
  panelOpenState = true;
  panelOpenDis = true;
  expandedMore: nsPlanningT.IMain;

  //#region ModalOption
  ngbModalOptions: NgbModalOptions = {
    size: "l",
    centered: true,
    scrollable: true,
    keyboard: false,
    backdrop: "static",
    windowClass: "modal-holder",
  };
  //#endregion

  // Progress Bar
  pbMain: boolean;

  // Animaciones Tada
  tadaMain = "inactive";

  // Service GET && POST
  url: string;
  aParam = [];
  aParaml = [];

  // Fab
  fbMain = [{ icon: "request_page", tool: "Nuevo registro" }];
  abMain = [];
  tsMain = "inactive";

  formFilter: FormGroup;

  initFormFilter(): void {
    this.formFilter = this._fs.group({
      sClient: "",
      sCentrocosto: "",
      dFechaDevengue: "",
      sNombre: "",
      nEstado: 0,
      nCanal: 0,
      nPerfil: 0,
    });
  }

  constructor(
    public service: AplanningServiceService,
    private _snackBar: MatSnackBar,
    private _modalService: NgbModal,
    private _fs: FormBuilder,
    @Inject("BASE_URL") baseUrl: string
  ) {
    (this.url = baseUrl), this.initFormFilter();
  }

  ngOnInit(): void {
    console.log(this.uid);
  }

  onToggleFab(fab: number, stat: number) {
    switch (fab) {
      case 1:
        stat = stat === -1 ? (this.abMain.length > 0 ? 0 : 1) : stat;
        this.tsMain = stat === 0 ? "inactive" : "active";
        this.abMain = stat === 0 ? [] : this.fbMain;
        break;
    }
  }

  async clickFab(opc: number, index: number) {
    switch (opc) {
      case 1:
        switch (index) {
          case 0:
            this.showModal(1);
            break;
        }
        break;
    }
  }

  async showModal(opc: number, pushParam?: any, index?: number) {
    const param = [];
    switch (opc) {
      case 1:
        Swal.fire({
          title: "Bono Trimestral [Operaciones]",
          text: "Ingresar el N° del centro de costo en donde se cargará el bono.",
          input: "text",
          inputPlaceholder: "Escribir centro de costo aquí...",
          showCancelButton: true,
          confirmButtonColor: "#ff4081",
          confirmButtonText: "Aceptar",
          cancelButtonText: "Cancelar",
          allowOutsideClick: false,
          inputValidator: (nIdCentroCosto) => {
            if (nIdCentroCosto === undefined || nIdCentroCosto === "") {
              return "Ingresar centro de costo";
            }
          },
        }).then(async (resultado) => {
          if (resultado.isConfirmed) {
            this.pbMain = true;

            let lError = false;
            lError = await this.loadCentroCosto(resultado.value as string);
            console.log(lError);

            if (lError) {
              this._snackBar.open("N° de centro de costo inválido.", "Cerrar", {
                horizontalPosition: "right",
                verticalPosition: "top",
                duration: 2500,
              });
              this.pbMain = false;
              return;
            }

            if (this.expandedMore.lPersonal.length === 0) {
              this._snackBar.open(
                "El responsable no cuenta con personal a su cargo.",
                "Cerrar",
                {
                  horizontalPosition: "right",
                  verticalPosition: "top",
                  duration: 2500,
                }
              );
              this.pbMain = false;
              return;
            }

            this.openModal("bonot");
            this.pbMain = false;
          }
        });
        break;
    }
  }

  async loadCentroCosto(sCodCC: string) {
    let bReturn = true;
    const param = [];

    param.push(this.nIdEmp);
    param.push(sCodCC);
    param.push(this.uid);
    param.push(this.nPais);

    await this.service
      ._loadPlanning(1, param, this.url)
      .then((value: nsPlanningT.IMain) => {
        if (value.nCentroCosto != 0) {
          this.expandedMore = value;
          bReturn = false;
        }
      });

    return bReturn;
  }

  openModal(name: string) {
    switch (name) {
      case "bonot":
        this.ngbModalOptions.size = "xl";
        break;
      case "responsable":
        this.ngbModalOptions.size = "l";
        break;
    }

    const modalRef = this._modalService.open(
      MODALS[name],
      this.ngbModalOptions
    );
    const obj = new Object();
    switch (name) {
      case "responsable":
        const uid_modal = 0;
        obj["uid_modal"] = uid_modal;
        modalRef.componentInstance.fromParent = obj;
        break;
      case "bonot":
        obj["fgCentroCosto"] = this.expandedMore;
        modalRef.componentInstance.fromParent = obj;
        break;
    }
  }
}
