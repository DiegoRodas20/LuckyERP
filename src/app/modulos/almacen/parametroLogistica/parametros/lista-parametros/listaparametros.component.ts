import {
  Component,
  OnInit,
  Output,
  Input,
  EventEmitter,
  ChangeDetectorRef,
  Inject,
} from "@angular/core";
import { MatDialog, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { NgxSpinnerService } from "ngx-spinner";

@Component({
  selector: "app-listaparametros",
  templateUrl: "./listaparametros.component.html",
  styleUrls: ["./listaparametros.component.css"],
})
export class ListaparametrosComponent implements OnInit {

  constructor(private ref: ChangeDetectorRef,
    private spinner: NgxSpinnerService,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data // Recuperamos data del componente padre
  ) {}

  ngOnInit(): void {
  }

  ngAfterContentChecked() {
    this.ref.detectChanges();
  }
}
