import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormControlName, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { NgxSpinnerService } from 'ngx-spinner';
import { SecurityErp } from 'src/app/modulos/AAHelpers';
import Swal from 'sweetalert2';
import { AddendaUnoTIDTO, DetalleAddendaArticuloTableTIDTO, DetalleAddendaTableTIDTO, TipoDispositivoParteTIDTO } from '../../../api/models/addendaTIDTO';
import { ArticuloTIDTO } from '../../../api/models/articuloDTO';
import { AddendaService } from '../../../api/services/addenda.service';

export interface inputDialogActivoDetalleAddenda {
  detalleAddenda: DetalleAddendaTableTIDTO
  addenda: AddendaUnoTIDTO,
  detalleArticuloAddenda: DetalleAddendaArticuloTableTIDTO[],
  bEditar: boolean
}

@Component({
  selector: 'app-ti-dialog-activo-detalle-addenda',
  templateUrl: './ti-dialog-activo-detalle-addenda.component.html',
  styleUrls: ['./ti-dialog-activo-detalle-addenda.component.css']
})
export class TiDialogActivoDetalleAddendaComponent implements OnInit {

  formElemento: FormGroup;
  lElemento: TipoDispositivoParteTIDTO[] = [];
  //Lista filtrada para el combo
  lElementoCombo: TipoDispositivoParteTIDTO[] = [];

  lArticulo: ArticuloTIDTO[] = [];
  storageData: SecurityErp;

  //Elementos para la tabla material
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  dataSource: MatTableDataSource<DetalleAddendaArticuloTableTIDTO>;
  displayedColumns = ['opcion', 'sTipoDispositivo', 'sArticulo', 'sPartNumber', 'imagen'];
  lDetalle: DetalleAddendaArticuloTableTIDTO[] = [];

  constructor(
    private spinner: NgxSpinnerService,
    private _addendaService: AddendaService,
    public dialogRef: MatDialogRef<TiDialogActivoDetalleAddendaComponent>,
    @Inject(MAT_DIALOG_DATA) public data: inputDialogActivoDetalleAddenda,
    private fb: FormBuilder,
  ) {
    this.storageData = new SecurityErp()
    this.inicializarForm();
  }

  async ngOnInit(): Promise<void> {
    await this.GetTipoDispositivoParte();
    this.lDetalle = this.data.detalleArticuloAddenda.filter(item => item.nIdDetAddenda == this.data.detalleAddenda.nIdDetAddenda)

    //Si el boton editar esta activo que no se pueda modificar
    if (this.data.bEditar) {
      this.displayedColumns = ['sTipoDispositivo', 'sArticulo', 'sPartNumber', 'imagen'];
    }

    this.lDetalle.forEach(item => {
      this.lElementoCombo = this.lElementoCombo.filter(elemento => elemento.nIdDispositivoParte != item.nIdTipoDispositivo)
    })
    this.dataSource = new MatTableDataSource(this.lDetalle);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  inicializarForm() {
    this.formElemento = this.fb.group({
      cboElemento: [null, Validators.required],
      cboArticulo: [null, Validators.required],
    })
  }

  async GetTipoDispositivoParte() {
    let response = await this._addendaService.GetAllTipoDispositivoParte(this.data.detalleAddenda.nIdTipoDispositivo)
    this.lElemento = response.response.data
    this.lElementoCombo = this.lElemento.filter(item => item.nIdDispositivoParte != 0);
  }

  async GetArticulo(nIdTipoDispositivo) {
    this.formElemento.controls.cboArticulo.setValue(null);
    this.lArticulo = [];
    let response = await this._addendaService.GetAllArticulo(this.storageData.getPais(), nIdTipoDispositivo);

    this.lArticulo = response.response.data
  }


  fnAnadirArticulo() {
    if (this.formElemento.invalid) {
      Swal.fire({
        icon: 'warning',
        title: 'Advertencia',
        text: 'Revise los campos.',
      });
      return;
    }
    let vDatos = this.formElemento.value;

    let validar = this.lDetalle.find(item => item.nIdTipoDispositivo == vDatos.cboElemento);
    if (validar) {
      Swal.fire({
        icon: 'warning',
        title: 'Advertencia',
        text: 'El tipo dispositivo indicado ya ha sido ingresado.',
      });
      this.fnLimpiarControles()
      return;
    }

    let vArticulo = this.lArticulo.find(item => item.nIdArticulo == vDatos.cboArticulo)
    let vTipoArticulo = this.lElemento.find(item => item.nIdDispositivoParte == vDatos.cboElemento)


    let row: DetalleAddendaArticuloTableTIDTO = {
      nIdDetAddendaArticulo: 0,
      sRutaArchivo: vArticulo.sRutaArchivo,
      nIdTipoDispositivo: vDatos.cboElemento,
      sTipoDispositivo: vTipoArticulo.sDescripcionParte,
      nIdArticulo: vArticulo.nIdArticulo,
      sArticulo: vArticulo.sCodArticulo + ' - ' + vArticulo.sNombreProducto,
      sPartNumber: vArticulo.sPartNumber,
      nIdDetAddenda: this.data.detalleAddenda.nIdDetAddenda
    }
    this.lDetalle.push(row);
    this.dataSource = new MatTableDataSource(this.lDetalle);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.fnLimpiarControles();

    //Quitamos el tipo dispositivo de la lista
    this.lDetalle.forEach(item => {
      this.lElementoCombo = this.lElementoCombo.filter(elemento => elemento.nIdDispositivoParte != item.nIdTipoDispositivo)
    })
    //this.lElementoCombo = this.lElemento.filter(item => item.nIdDispositivoParte != vDatos.cboElemento)
  }

  fnLimpiarControles() {
    this.formElemento.controls.cboElemento.setValue(null);
    this.formElemento.controls.cboArticulo.setValue(null);
    this.lArticulo = [];
    this.formElemento.controls.cboElemento.markAsUntouched()
    this.formElemento.controls.cboArticulo.markAsUntouched()
  }

  fnAnadirTiposDisp() {

    //validamos que se hayan ingresado todos los tipos dispositivos obligatorios
    for (var elemento of this.lElemento) {
      if (!elemento.bOpcional) {
        var detalle = this.lDetalle.find(item => item.nIdTipoDispositivo == elemento.nIdDispositivoParte)

        if (!detalle) {
          Swal.fire({
            icon: 'warning',
            title: 'Advertencia',
            text: `El tipo de dispositivo: ${elemento.sDescripcionParte}, es obligatorio. Ingréselo para poder continuar.`,
          });
          return;
        }
      }
    }

    this.data.detalleArticuloAddenda = this.data.detalleArticuloAddenda.filter(item => item.nIdDetAddenda != this.data.detalleAddenda.nIdDetAddenda);
    this.data.detalleArticuloAddenda.push(...this.lDetalle);
    this.dialogRef.close(this.data.detalleArticuloAddenda);
  }

  fnVerImagen(sArticulo: string, sRutaArchivo: string) {

    if (sRutaArchivo != '' && sRutaArchivo != null) {
      Swal.fire({
        title: sArticulo.substring(0, 6),
        text: sArticulo.substring(9, 120),
        imageUrl: sRutaArchivo,
        imageWidth: 250,
        imageHeight: 250,
      })
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Este artículo no contiene una imagen',
        showConfirmButton: false,
        timer: 1500
      });
    }
  }

  fnEliminar(row: DetalleAddendaArticuloTableTIDTO) {
    this.lDetalle = this.lDetalle.filter(item => item.nIdTipoDispositivo != row.nIdTipoDispositivo)
    this.dataSource = new MatTableDataSource(this.lDetalle);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.fnLimpiarControles();
    let elemento = this.lElemento.find(item => item.nIdDispositivoParte == row.nIdTipoDispositivo)

    if (elemento) {
      this.lElementoCombo.push(elemento);
      //this.lElementoCombo.sort()
    }
  }

}
