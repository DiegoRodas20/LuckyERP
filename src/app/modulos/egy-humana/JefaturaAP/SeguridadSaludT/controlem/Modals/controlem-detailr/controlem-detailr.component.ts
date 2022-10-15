import { Component, Input, OnInit, ViewChild } from "@angular/core";
import { MatPaginator } from "@angular/material/paginator";
import { NgbActiveModal, NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { NgxSpinnerService } from "ngx-spinner";
import { adminpAnimations } from "../../../../Animations/adminp.animations";
import { ControlemService } from "../../../../Services/controlem.service";
import FbDrCEM from "../../Utils/ControlemDetailr/FbDrCEM";
import InfoResponsableDrCEM from "../../Utils/ControlemDetailr/InfoResponsable/InfoResponsableDrCEM";
import PersonalDelResponsableTablaDrCEM from "../../Utils/ControlemDetailr/PersonalDelResponsableTabla/PersonalDelResponsableTablaDrCEM";
import RangoResponsableTablaDrCEM from "../../Utils/ControlemDetailr/RangoResponsableTabla/RangoResponsableTablaDrCEM";

@Component({
  selector: "app-controlem-detailr",
  templateUrl: "./controlem-detailr.component.html",
  styleUrls: [
    "./controlem-detailr.component.css",
    "./controlem-detailr.component.scss",
  ],
  animations: [adminpAnimations],
})
export class ControlemDetailrComponent implements OnInit {
  @Input() nIdResponsable: number = 0;
  @Input() sFechaDevengueSeleccionado: string = "";

  infoResp: InfoResponsableDrCEM = new InfoResponsableDrCEM(this.servicio);
  fb: FbDrCEM = new FbDrCEM(this);

  @ViewChild("paginacionHistorialRangos", { static: true })
  paginacionHistorialRangos: MatPaginator;
  histRangos: RangoResponsableTablaDrCEM = new RangoResponsableTablaDrCEM(this);

  @ViewChild("paginacionPersonalRango", { static: true })
  paginacionPersonalRango: MatPaginator;
  personalRango: PersonalDelResponsableTablaDrCEM = new PersonalDelResponsableTablaDrCEM(
    this
  );

  constructor(
    public servicio: ControlemService,
    public activeModal: NgbActiveModal,
    public modalService: NgbModal,
    public spi: NgxSpinnerService
  ) {}

  async ngOnInit(): Promise<void> {
    this.spi.show("spi_nuevo_rango");
    await this.infoResp.cargarInformacionServicio(this.nIdResponsable);
    await this.histRangos.cargarDataServicio();
    await this.personalRango.filtro.cargarCombos();
    this.spi.hide("spi_nuevo_rango");
  }

  ngAfterViewInit() {
    this.histRangos.paginar();
    this.personalRango.paginar();
  }

  public closeDetail() {
    const oReturn = new Object();
    this.activeModal.close(oReturn);
  }
}
