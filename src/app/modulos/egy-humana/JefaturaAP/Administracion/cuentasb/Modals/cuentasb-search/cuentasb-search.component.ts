import { Component, Inject, Input, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { MatPaginator } from "@angular/material/paginator";
import { MatTableDataSource } from "@angular/material/table";
import {
  NgbActiveModal,
  NgbModal,
  NgbModalOptions,
} from "@ng-bootstrap/ng-bootstrap";
import { NgxSpinnerService } from "ngx-spinner";
import { nsAtencionp } from "../../../../Model/Iatencionp";
import { IDetail, IMain } from "../../../../Model/Icuentasb";
import { CuentasbService } from "../../../../Services/cuentasb.service";
import { CuentasbDetailComponent } from "../cuentasb-detail/cuentasb-detail.component";

@Component({
  selector: "app-cuentasb-search",
  templateUrl: "./cuentasb-search.component.html",
  styleUrls: [
    "./cuentasb-search.component.css",
    "./cuentasb-search.component.scss",
  ],
  providers: [CuentasbService],
})
export class CuentasbSearchComponent implements OnInit {
  //#region GENERAL
  url: string;
  //#endregion

  //#region BUSCADOR
  formSearch: FormGroup;
  pbSearch: boolean;
  //#endregion

  //#region TABLA (Lista de personal)
  SearchDC: string[] = [
    "action",
    "sNombres",
    "sCodPlla",
    "sTipo",
    "sDocumento",
  ];
  SearchDS: MatTableDataSource<IMain>;
  @ViewChild("pagSearch", { static: true }) pagSearch: MatPaginator;
  //#endregion

  //#region MODAL
  ngbModalOptions: NgbModalOptions = {
    size: "xl",
    centered: true,
    scrollable: true,
    keyboard: false,
    backdrop: "static",
    windowClass: "modal-holder",
  };
  //#endregion
  constructor(
    public spi: NgxSpinnerService,
    public activeModal: NgbActiveModal,
    private fb: FormBuilder,
    public service: CuentasbService,
    private modalService: NgbModal,
    @Inject("BASE_URL") baseUrl: string
  ) {
    this.url = baseUrl;
  }

  async ngOnInit(): Promise<void> {
    this.spi.show("spi_cuentasb_search");
    await this.buildAndListenFormSearch();
    await this.loadSearch();
    this.spi.hide("spi_cuentasb_search");
  }

  //#region BUSCADOR
  buildAndListenFormSearch() {
    this.formSearch = this.fb.group({
      sNombres: [""],
    });

    this.formSearch.valueChanges.subscribe((value) => {
      const filter = {
        ...value,
        name: value.sNombres.trim().toLowerCase(),
      } as string;
      this.SearchDS.filter = filter;

      if (this.SearchDS.paginator) {
        this.SearchDS.paginator.firstPage();
      }
    });
  }

  get getSearch() {
    return this.formSearch.controls;
  }

  async loadSearch() {
    const param = [];
    await this.service._loadSP(4, param, this.url).then((value: IMain[]) => {
      this.SearchDS = new MatTableDataSource(value);
      this.SearchDS.paginator = this.pagSearch;
      this.SearchDS.filterPredicate = function (data, filter: string): boolean {
        return (
          data.sNombres.trim().toLowerCase().includes(filter) ||
          data.sDocumento.trim().toLowerCase().includes(filter)
        );
      };

      this.SearchDS.filterPredicate = ((data: IMain, filter: IMain) => {
        // tslint:disable-next-line: max-line-length
        const a =
          !filter.sNombres ||
          data.sNombres.toLowerCase().includes(filter.sNombres.toLowerCase()) ||
          data.sDocumento.toLowerCase().includes(filter.sNombres.toLowerCase());
        return a;
      }) as (PeriodicElement, string) => boolean;
    });
  }
  //#endregion

  //#region TABLA (Lista de personal)
  selectPerso(item: nsAtencionp.SearchPerson) {
    const oReturn = new Object();

    oReturn["modal"] = "search";
    oReturn["value"] = "select";
    oReturn["item"] = item;

    // Envia la data seleccionada;
    this.activeModal.close(oReturn);

    const modalRefDetailPerson = this.modalService.open(
      CuentasbDetailComponent,
      this.ngbModalOptions
    );
    modalRefDetailPerson.componentInstance.data = item;
  }
  //#endregion
}
