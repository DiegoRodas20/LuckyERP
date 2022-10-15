import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';
import { DetalleAsignacionActivoTableTIDTO } from '../../api/models/activoAsignacionTITDO';
import { InformacionArticuloTIDTO } from '../../api/models/articuloDTO';
import { PerfilEquipoService } from '../../api/services/perfil-equipo.service';

@Component({
  selector: 'app-ti-detalle-activo-asigna',
  templateUrl: './ti-detalle-activo-asigna.component.html',
  styleUrls: ['./ti-detalle-activo-asigna.component.css']
})
export class TiDetalleActivoAsignaComponent implements OnInit {

  formActivo: FormGroup;
  inputDialog: DetalleAsignacionActivoTableTIDTO;
  lInformacionArticulo: InformacionArticuloTIDTO[] = [];
  separatorKeysCodes: number[] = [ENTER, COMMA];

  constructor(
    private spinner: NgxSpinnerService,
    private formBuilder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) private data: DetalleAsignacionActivoTableTIDTO,
    public dialogRef: MatDialogRef<TiDetalleActivoAsignaComponent>,
    public dialog: MatDialog,
    private _perfilEquipoService: PerfilEquipoService,

  ) {
    this.fnInicializarForm();
    this.inputDialog = this.data;
  }
  ngOnInit(): void {
    this.GetInformacionArticulo(this.inputDialog.nIdArticulo);

    this.formActivo.controls.txtPerfil.setValue(this.inputDialog.sNombrePerfil);
    this.formActivo.controls.txtArticulo.setValue(this.inputDialog.sCodArticulo+'-' + this.inputDialog.sNombreProducto);
  }

  fnInicializarForm() {
    this.formActivo = this.formBuilder.group({
      txtPerfil: [''],
      txtArticulo: [''],
      cboInformacion: [''],
    })
  }

  async GetInformacionArticulo(idArticulo: number) {
    this.lInformacionArticulo = [];
    let response = await this._perfilEquipoService.GetInformacionArticulo(idArticulo)
    this.lInformacionArticulo = response.response.data
  }

  fnVerImagen(sArticulo: string, sRutaArchivo: string) {

    if (sRutaArchivo != '' && sRutaArchivo != null) {
      Swal.fire({
        text: sArticulo,
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

}
