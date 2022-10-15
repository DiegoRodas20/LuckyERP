import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';
import { ParametroService } from '../../../parametro.service';
import { DialogTopeCargoComponent } from '../dialog-tope-cargo/dialog-tope-cargo.component';

@Component({
  selector: 'app-topes-por-cargo',
  templateUrl: './topes-por-cargo.component.html',
  styleUrls: [ './topes-por-cargo.component.css' ]
})
export class TopesPorCargoComponent implements OnInit {
  listaGeneral: any;
  listaCargoLima: any [];
  listaCargoProvincia: any;
  idPais: any;
  constructor(private parametroService: ParametroService, public dialog: MatDialog,
    private cdRef: ChangeDetectorRef,
    private spinner: NgxSpinnerService ) { }

  async ngOnInit() {
    this.idPais = localStorage.getItem('Pais');
    this.listaGeneral = await  this.parametroService.obtenerParametrosCRUD(6,`${this.idPais}|`);
    this.cargarListaLima();
    this.cargarListaProvincia();
  }

  cargarListaLima() {
    this.listaCargoLima = this.listaGeneral.filter(resp => resp.bEsCentral === 1);
  }

  cargarListaProvincia() {
    this.listaCargoProvincia = this.listaGeneral.filter(resp => resp.bEsCentral === 0);
  }

  async agregarCargo(event) {
    if (event === 1) {
      // Aquí es cuando el cargo es general
      const dialogRef = this.dialog.open(DialogTopeCargoComponent, {
        width: '85%',
        height: '65%',
        data: this.listaCargoLima
      });
      dialogRef.afterClosed().subscribe(result => {
        if ( result ) {
          const formulario = result as FormGroup;
          const id = formulario.get('id').value ;
          const topediario = formulario.get('diario').value;
          const topeMensual = formulario.get('mensual').value;
          const nAplica = formulario.get('aplica').value;
          const isCentral = 1;
          const codigo = formulario.get('codigo').value;
          const cargo = formulario.get('cargo').value;
          const send = `${id}|${topediario}|${topeMensual}|${nAplica}|${isCentral}`;
          this.spinner.show();
          this.parametroService.insertOrUpdateParametrosMovil(4, send).then((resp) => {
            console.log(resp);
            console.log('lista', this.listaCargoLima);
            this.listaCargoLima.push({
              nId: resp,
              sCod: codigo,
              sDescripcion: cargo,
              diario: topediario,
              mensual: topeMensual,
              bAplica: nAplica,
              bEsCentral: isCentral
            });
            this.cdRef.detectChanges();
            this.cdRef.reattach();
          });
          Swal.fire({
            icon: 'success',
            title: 'El cargo se añadió correctamente',
            showConfirmButton: false,
            timer: 1500
          });
          this.spinner.hide();
        }
      });
    } else {
      // Aquí el cargo es para sucursal
      const dialogRef = this.dialog.open(DialogTopeCargoComponent, {
        width: '85%',
        height: '65%',
        data: this.listaCargoProvincia
      });
      dialogRef.afterClosed().subscribe(result => {
        if ( result ) {
          const formulario = result as FormGroup;
          const id = formulario.get('id').value ;
          const topediario = formulario.get('diario').value;
          const topeMensual = formulario.get('mensual').value;
          const nAplica = formulario.get('aplica').value;
          const isCentral = 0;
          const codigo = formulario.get('codigo').value;
          const cargo = formulario.get('cargo').value;
          const send = `${id}|${topediario}|${topeMensual}|${nAplica}|${isCentral}`;
          this.spinner.show();
          this.parametroService.insertOrUpdateParametrosMovil(4, send).then((resp) => {
            this.listaCargoProvincia.push({
              nId: '',
              sCod: codigo,
              sDescripcion: cargo,
              diario: topediario,
              mensual: topeMensual,
              bAplica: nAplica,
              bEsCentral: isCentral
            });
          });
          Swal.fire({
            icon: 'success',
            title: 'El cargo se añadió correctamente',
            showConfirmButton: false,
            timer: 1500
          });
          this.spinner.hide();
        }
      });
    }
  }

  async cleanLima() {
    this.spinner.show();
    this.listaGeneral = await  this.parametroService.obtenerParametrosCRUD(6, `${this.idPais}|`);
    this.cargarListaLima();
    this.spinner.hide();
  }

  async cleanProvincia() {
    this.spinner.show();
    this.listaGeneral = await  this.parametroService.obtenerParametrosCRUD(6, `${this.idPais}|`);
    this.cargarListaProvincia();
    this.spinner.hide();
  }

}
