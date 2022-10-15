import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { NgxSpinnerService } from "ngx-spinner";
import { asistenciapAnimations } from "src/app/modulos/comercial/Asistencia/asistenciap/asistenciap.animations";

@Component({
  selector: "app-rentabilidad-reportes",
  templateUrl: "./rentabilidad-reportes.component.html",
  styleUrls: ["./rentabilidad-reportes.component.css"]
})
export class RentabilidadReportesComponent implements OnInit {

  constructor(
    private spinner: NgxSpinnerService,
    protected _changeDetectorRef: ChangeDetectorRef
  ) {}

  async ngOnInit(): Promise<void> {
    this.spinner.show();

    this.spinner.hide();
  }


}
