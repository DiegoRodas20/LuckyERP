import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { PrintService } from "../../../../../shared/services/print.service";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";

//#region STORE
import { Store, Select, UpdateState } from "@ngxs/store";
import { Observable } from "rxjs";
import { ImprimirModel } from "../../store/carta_tienda/imprimir/imprimir.model";
//#endregion

@Component({
  selector: "app-documento",
  templateUrl: "./documento.component.html",
  styleUrls: ["./documento.component.css"],
})
export class DocumentoComponent implements OnInit {
  documentoIds: string[];
  documentoDetails: Promise<any>[];

  //#region DATA PARA IMPRIMIR
  public listaDocumentos: Observable<ImprimirModel[]>;
  public listaDocumentosEstatica: ImprimirModel[] = [];
  //#endregion

  constructor(
    route: ActivatedRoute,
    private printService: PrintService,
    private store: Store,
    private sanitizer: DomSanitizer
  ) {
    this.documentoIds = route.snapshot.params["documentoIds"].split(",");
  }

  ngOnInit() {
    this.documentoDetails = this.documentoIds.map((id) =>
      this.getDocumentoDetails(id)
    );
    Promise.all(this.documentoDetails).then(() =>
      this.printService.onDataReady()
    );

    this.listaDocumentos = this.store.select(
      (state) => state.imprimir.documentos
    );

    this.listaDocumentos.subscribe((data) => {
      this.listaDocumentosEstatica = data;
    });
  }

  getDocumentoDetails(documentoId) {
    const amount = Math.floor(Math.random() * 100);
    return new Promise((resolve) =>
      setTimeout(() => resolve({ amount }), 1000)
    );
  }

  renderizarHTMLPrevisualizar(contenido: string): SafeHtml {
    var html: SafeHtml;
    html = this.sanitizer.bypassSecurityTrustHtml(contenido);
    //console.log(this.contenido);

    return html;
  }
}
