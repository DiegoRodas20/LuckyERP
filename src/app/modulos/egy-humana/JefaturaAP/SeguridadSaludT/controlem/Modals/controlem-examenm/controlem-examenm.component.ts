import { Component, Input, OnInit } from "@angular/core";
import { FormControl } from "@angular/forms";
import { ErrorStateMatcher } from "@angular/material/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { NgxSpinnerService } from "ngx-spinner";
import { adminpAnimations } from "../../../../Animations/adminp.animations";
import { ControlemService } from "../../../../Services/controlem.service";
import { IExamenMedicoTablaDpCEM } from "../../Utils/ControlemDetailp/ExamenMedicoTabla/IExamenMedicoTablaDpCEM";
import EstadosModalExamenmCEM from "../../Utils/ControlemExamenm/EstadosModalExamenmCEM";
import FbEmCEM from "../../Utils/ControlemExamenm/Fb/FbEmCEM";
import InformacionEmCEM from "../../Utils/ControlemExamenm/InformacionPersonal/InformacionEmCEM";

class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null): boolean {
    return !!(control && control.invalid);
  }
}

@Component({
  selector: "app-controlem-examenm",
  templateUrl: "./controlem-examenm.component.html",
  styleUrls: [
    "./controlem-examenm.component.css",
    "./controlem-examenm.component.scss",
  ],
  animations: [adminpAnimations],
})
export class ControlemExamenmComponent implements OnInit {
  @Input() nIdEstadoModal: number = 0;
  @Input() nIdPersonal: number = 0;
  @Input() sNombresResp: string = "";
  @Input() nIdExamenMedico: number = 0;
  @Input() examenSeleccionado: IExamenMedicoTablaDpCEM = null;

  urlDocumento: string = "";
  matcher = new MyErrorStateMatcher();
  estadoModal: EstadosModalExamenmCEM = new EstadosModalExamenmCEM(this);
  recargarCerrarMadal = false;

  fb: FbEmCEM = new FbEmCEM(this);
  infoPersonal: InformacionEmCEM = new InformacionEmCEM(this);

  constructor(
    public service: ControlemService,
    public activeModal: NgbActiveModal,
    public spi: NgxSpinnerService,
    public snackBar: MatSnackBar
  ) {}

  async ngOnInit(): Promise<void> {
    await this.estadoModal.ejecutar(this.nIdEstadoModal);
  }

  public closeModal() {
    const oReturn = new Object();
    oReturn["status"] = this.recargarCerrarMadal;
    this.activeModal.close(oReturn);
  }
}
