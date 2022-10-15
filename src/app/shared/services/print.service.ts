import { Injectable } from "@angular/core";
import { Router } from "@angular/router";

import { SergeneralService } from "./sergeneral.service";

@Injectable({
  providedIn: "root",
})
export class PrintService {
  isPrinting = false;

  constructor(private router: Router, private vSerGeneral: SergeneralService) {}

  printDocument(documentName: string, documentData: string[]) {
    this.vSerGeneral.changeCabeceraBoolean(false);
    this.isPrinting = true;
    this.router.navigate([
      "/comercial/consultas/cartastienda/",
      {
        outlets: {
          print: ["print", documentName, documentData.join()],
        },
      },
    ]);
  }

  onDataReady() {
    setTimeout(() => {
      window.print();
      this.isPrinting = false;
      this.router.navigate(
        ["/comercial/consultas/cartastienda/", { outlets: { print: null } }],
        {
          replaceUrl: true,
        }
      );

      this.vSerGeneral.changeCabeceraBoolean(true);
    });
  }
}
