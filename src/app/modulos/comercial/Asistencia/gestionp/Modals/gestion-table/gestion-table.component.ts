import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  ViewChild,
} from "@angular/core";
import { MatPaginator } from "@angular/material/paginator";
import { MatTableDataSource } from "@angular/material/table";
import { adminpAnimations } from "src/app/modulos/egy-humana/JefaturaAP/Animations/adminp.animations";
import { nsGestionPlanning } from "../../../gestionap/Models/nsGestionPlanning";
import { GestionpService } from "../../services/gestionp.service";

@Component({
  selector: "app-gestion-table",
  templateUrl: "./gestion-table.component.html",
  styleUrls: [
    "./gestion-table.component.css",
    "../gestionp-detail/gestionp-detail.component.scss",
  ],
  animations: [adminpAnimations],
  providers: [GestionpService],
})
export class GestionTableComponent implements OnInit {
  TableDt: MatTableDataSource<nsGestionPlanning.E_Lista_Detalle_Persona> =
    new MatTableDataSource([]);
  @ViewChild("pagExpanded", { static: false }) paginator: MatPaginator;
  MainDC: string[] = [
    "position",
    "sNombreCompleto",
    "nIdPlla",
    "sPlanilla",
    "sTDoc",
    "sDocumento",
    "sSucursal",
    "sHoraIni",
    "sHoraFin",
    "sCanal",
    "sPerfil",
    "nDias",
  ];
  listTable: nsGestionPlanning.E_Lista_Detalle_Persona[] = [];
  nIdEmp = JSON.parse(localStorage.getItem("Empresa"));
  @Input() data;
  centro: nsGestionPlanning.ICentro_Costo;
  person: nsGestionPlanning.ILista_Persona[] = [];
  lista_persona: nsGestionPlanning.E_Lista_Detalle_Persona[] = [];

  constructor(private _service: GestionpService) {
    console.log(this.data);
  }

  ngOnInit(): void {}
}
