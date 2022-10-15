import { Component, Input, OnInit, ViewChild } from "@angular/core";
import { MatPaginator } from "@angular/material/paginator";
import { NgbActiveModal, NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { NgxSpinnerService } from "ngx-spinner";
import { adminpAnimations } from "../../../../Animations/adminp.animations";
import { ControlemService } from "../../../../Services/controlem.service";
import ExamenMedicoTablaDpCEM from "../../Utils/ControlemDetailp/ExamenMedicoTabla/ExamenMedicoTablaDpCEM";
import FbCpCEM from "../../Utils/ControlemDetailp/FbCpCEM";
import InfoPersonalDpCEM from "../../Utils/ControlemDetailp/InfoPersonal/InfoPersonalDpCEM";

@Component({
  selector: "app-controlem-detailp",
  templateUrl: "./controlem-detailp.component.html",
  styleUrls: [
    "./controlem-detailp.component.css",
    "./controlem-detailp.component.scss",
  ],
  animations: [adminpAnimations],
})
export class ControlemDetailpComponent implements OnInit {
  @Input() nIdPersonal: number = 0;
  @Input() sNombresResp: string = "";

  infoPersonal: InfoPersonalDpCEM = new InfoPersonalDpCEM(this);
  fb: FbCpCEM = new FbCpCEM(this);

  @ViewChild("paginacionExamenesMedicos", { static: true })
  paginacionExamenesMedicos: MatPaginator;
  examenMedTabla: ExamenMedicoTablaDpCEM = new ExamenMedicoTablaDpCEM(this);

  recargarCerrarMadal = false;

  constructor(
    public service: ControlemService,
    public activeModal: NgbActiveModal,
    public spi: NgxSpinnerService,
    public modalService: NgbModal
  ) {}

  async ngOnInit(): Promise<void> {
    this.spi.show("spi_detalle_personal");
    await this.infoPersonal.cargarInformacionServicio();
    await this.examenMedTabla.cargarDataServicio();
    this.spi.hide("spi_detalle_personal");
  }

  ngAfterViewInit() {
    this.examenMedTabla.paginar();
  }

  public closeDetail() {
    const oReturn = new Object();
    oReturn["status"] = this.recargarCerrarMadal;
    this.activeModal.close(oReturn);
  }
}
