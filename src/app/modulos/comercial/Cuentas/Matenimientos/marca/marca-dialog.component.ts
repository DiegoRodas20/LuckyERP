import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { FormControl, FormGroup, FormBuilder, Validators } from "@angular/forms";
import { Component, OnInit, Inject, ViewChild } from "@angular/core";
import { SermarcaService } from "./sermarca.service";
import { NgxSpinnerService } from 'ngx-spinner';


@Component({
  selector: "dialog-overview-example-dialog",
  templateUrl: "dialog.html",
  styleUrls: ["./marca.component.css"],
})
export class DialogCatalogoComponent implements OnInit {
  //Formularios
  formCategoria: FormGroup;
  formLinea: FormGroup;
  formMarca: FormGroup;

  lcboCategoria: any;
  lcboCategoriaLinea: any;
  lblMarca: any;
  lcboLinea: any;

  valLinea: number;
  url: string;

  constructor(
    public dialogRef: MatDialogRef<DialogCatalogoComponent>,
    @Inject("BASE_URL") baseUrl: string,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private fb: FormBuilder,
    private vSerMarca: SermarcaService,
    private spinner: NgxSpinnerService
  ) {
    this.url = baseUrl;
  }

  ngOnInit(): void {

    this.fnCatalogoCategoria();
    this.fnCatalogoCategoriaXLinea();
    this.formCategoria = this.fb.group({
      descripcion: new FormControl(this.data.categoria !== undefined
        ? this.data.categoria.descripcion
        : "", [
        Validators.required, Validators.pattern(/^[\w\s]+$/)
      ]),
      estado: [
        this.data.categoria !== undefined
          ? this.data.categoria.estado.toString()
          : "",
        Validators.required,
      ],
    });

    this.formLinea = this.fb.group({
      categoria: [
        this.data.linea !== undefined
          ? this.data.linea.categoria.toString()
          : "",
        Validators.required,
      ],
      descripcion: new FormControl(this.data.linea !== undefined ? this.data.linea.descripcion : "",
        [Validators.required, Validators.pattern(/^[\w\s]+$/)]),

      estado: [
        this.data.linea !== undefined ? this.data.linea.estado.toString() : "",
        Validators.required,
      ],
    });

    this.formMarca = this.fb.group({
      categoria: [
        this.data.marca !== undefined
          ? this.data.marca.categoria.toString()
          : "",
        Validators.required,
      ],
      linea: [
        this.data.marca !== undefined ? this.data.marca.linea.toString() : "",
        Validators.required,
      ],
      descripcion: new FormControl(this.data.marca !== undefined ? this.data.marca.descripcion : "", [
        Validators.required])
      ,
      estado: [
        this.data.marca !== undefined ? this.data.marca.estado.toString() : "",
        Validators.required,
      ],
    });
  }

  async fnCatalogoCategoria() {
    let parametro = [];
    parametro.push(2020);
    parametro.push(0);
    await this.vSerMarca
      .fnCatalogoMarca(2, parametro, this.url)
      .then((res) => {

        this.lcboCategoria = res;
        this.fnCatalogoLinea();
      })
      .catch((err) => { });
  }

  async fnCatalogoCategoriaXLinea() {
    let parametro = [];
    parametro.push(2020);
    parametro.push(1);

    await this.vSerMarca
      .fnCatalogoMarca(2, parametro, this.url)
      .then((res) => {

        this.lcboCategoriaLinea = res;
        this.fnCatalogoLinea();
      })
      .catch((err) => { });

  }

  async fnCatalogoLinea() {
    let idCat = this.formMarca.get("categoria").value;
    let parametros = [];
    parametros.push(Number(idCat));

    await this.vSerMarca
      .fnCatalogoMarca(4, parametros, this.url)
      .then((res) => {

        this.lcboLinea = res;
        try {

          let valorDefault;

          if (this.data.marca.linea != undefined) {
            valorDefault = this.data.marca.linea.toString();
          }
          else {
            valorDefault = this.lcboLinea[0].codigo.toString();
          }

          this.formMarca.get('linea').setValue(valorDefault);
        } catch (ex) {
          // console.log(ex)
        }
      })
      .catch((err) => {

      });
  }

  //#region Cerrar
  onNoClick() {
    this.dialogRef.close();
  }
  //#endregion

  //#region Guardar Categoria
  onSubmitCategoria() {
    if (this.formCategoria.valid) {
      let result: any;
      result = {
        descripcion: this.formCategoria.get("descripcion").value,
        estado: this.formCategoria.get("estado").value,
        accion: this.data.accion,
        codCategoria: this.data.categoria.codCategoria,
      };

      this.dialogRef.close(result);
    }
  }
  //#endregion

  //#region Guardar Linea
  onSubmitLinea() {
    if (this.formLinea.valid) {
      let result: any;

      result = {
        categoria: this.formLinea.get("categoria").value,
        descripcion: this.formLinea.get("descripcion").value,
        estado: this.formLinea.get("estado").value,
        codLinea: this.data.linea.codLinea,
        codDetCat: this.data.linea.codDetCat,
        accion: this.data.accion,
      };

      this.dialogRef.close(result);
    }
  }
  //#endregion

  //#region Guardar Marca
  onSubmitMarca() {
    if (this.formMarca.valid && this.valLinea !== 0) {
      let result: any;
      result = {
        categoria: this.formMarca.get("categoria").value,
        linea: this.formMarca.get("linea").value,
        descripcion: this.formMarca.get("descripcion").value,
        estado: this.formMarca.get("estado").value,
        codMarca: this.data.marca.codMarca,
        codDetCat: this.data.marca.codDetCat,
        accion: this.data.accion,
      };
      this.dialogRef.close(result);
    }
  }
  //#endregion

  //#region Limpiar Linea en dialog marca
  async fnChangeCategoriaMarca() {
    if (this.data.marca !== undefined) {
      this.formMarca.get('linea').setValue('');
    }
  }
  //#endregion

}

export interface DialogData {
  accion: string;
  categoria: any;
  linea: any;
  marca: any;
}
