import { Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';

import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import { SecurityErp } from '../../../../AAHelpers/securityErp.Entity';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { asistenciapAnimations } from 'src/app/modulos/comercial/Asistencia/asistenciap/asistenciap.animations';
import { Utilitarios } from 'src/app/modulos/control-costos/compra/orden-compra-sc/repository/utilitarios';
import { RptAnio, RptCuentaCorriente, RptProveedor } from '../../orden-compra-sc/models/reporte.entity';
import { CompraScService } from '../../orden-compra-sc/services/compra-sc.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { log } from 'console';


@Component({
  selector: 'app-report-orden-compra-sc',
  templateUrl: './report-orden-compra-sc.component.html',
  styleUrls: ['./report-orden-compra-sc.component.css'],
  animations: [asistenciapAnimations],
})

export class OrdenCompraScReportComponent implements OnInit, OnDestroy {
  securityErp = new SecurityErp;
  utilitarios = new Utilitarios();
  subRef$: Subscription;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  ListCuentaCorriente: MatTableDataSource<RptCuentaCorriente>;
  excelCuentaCorriente: RptCuentaCorriente[];
  ListAnio: RptAnio[];
  ListProveedor: RptProveedor[];
  formulario: FormGroup;
  constructor(private service: CompraScService, private router: Router, private fb: FormBuilder, private spinner: NgxSpinnerService,) {

    this.formulario = this.fb.group({
      cboAnio: ['', [Validators.required]],
      cboProveedor: ['', [Validators.required]]
    })
  }

  ngOnInit(): void {
    this.listaAnio();
    this.listaProveedor();
    this.consultaPerfilUsuario();
  }


  listaCuentaCorriente() {

    if (this.formulario.value.cboProveedor == null || this.formulario.value.cboAnio == null) {
      Swal.fire({
        icon: 'warning',
        title: '¡Verificar!',
        text: 'Seleccione datos a filtrar.',
      })
      return;
    }

    this.spinner.show();
    let pParametro = [];
    pParametro.push(this.formulario.get('cboAnio').value);
    pParametro.push((this.formulario.get('cboProveedor').value));
    this.subRef$ = this.service.fnReporte(3, pParametro).subscribe((data: any) => {
      console.log(data);

      if (data.lista !== null) {
        this.utilitarios.totalfilas = "Total registros: " + data.lista.length.toString();
        this.excelCuentaCorriente = data.lista;
        this.ListCuentaCorriente = new MatTableDataSource<RptCuentaCorriente>(data.lista);
        this.ListCuentaCorriente.paginator = this.paginator;
        this.ListCuentaCorriente.sort = this.sort;
        this.spinner.hide();
      }
      else {
        this.spinner.hide();
        Swal.fire({
          icon: 'warning',
          title: '¡Verificar!',
          text: 'No se encontraron datos.',
        })
        this.ListCuentaCorriente = null;
        return;
      }
    })
  }

  listaAnio() {
    this.spinner.show();
    let pParametro = [];
    pParametro.push(this.securityErp.getEmpresa());
    this.subRef$ = this.service.fnReporte(1, pParametro).subscribe((data: any) => {
      this.ListAnio = data;
      this.spinner.hide();
    })
  }

  listaProveedor() {
    this.spinner.show();
    let pParametro = [];
    pParametro.push(this.securityErp.getEmpresa());

    this.subRef$ = this.service.fnReporte(2, pParametro).subscribe((data: any) => {
      this.ListProveedor = data;
      this.spinner.hide();
    })
  }

  consultaPerfilUsuario() {
    this.utilitarios.pParametro = [];
    this.utilitarios.pOpcion = 21
    this.utilitarios.pParametro.push(this.securityErp.getUsuarioId());
    this.subRef$ = this.service.fnDatosOrdenCompras(this.utilitarios.pOpcion, this.utilitarios.pParametro).subscribe(data => {
      this.utilitarios.perfil = data[0].nId;
    })
  }


  fnDescargarExcel() {

    if (this.formulario.invalid) {
      return Object.values(this.formulario.controls).forEach(
        control => {
          if (control instanceof FormGroup) {
            Object.values(control.controls).forEach(control => control.markAsTouched())
          }
          else {
            control.markAsTouched()
            Swal.fire('Atención', 'Mensaje', 'warning')
          }
        }
      )
    }


    if (this.excelCuentaCorriente.length > 0) {
      Swal.fire({
        title: 'Atencion',
        text: "¿Desea descargar los archivos adjuntos?",
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Si, !Descargar!'
      }).then((result) => {
        if (result.isConfirmed) {

          this.spinner.show();
          let pParametro = [];
          pParametro.push(this.formulario.get('cboAnio').value);
          pParametro.push((this.formulario.get('cboProveedor').value));
          this.subRef$ = this.service.fnDescargarExcelReporteSc(3, pParametro, this.securityErp.baseUrl).subscribe((data: any) => {
            console.log(data)
            if (data.size == 14) {
              Swal.fire('Atención', 'Debe seleccionar un proveedor o todos.', 'warning')
              this.spinner.hide()
              return
            }
            else { this.downloadFile(data) }
            this.spinner.hide();
          })
        }
        else { Swal.fire('Correcto', 'Se descargo el archivo', 'success'); }
      });
    }

    else { Swal.fire('¡Verificar!', 'No se encontraron registros', 'warning') }
  }

  public downloadFile(response: any) {
    let name = 'Reporte';
    var blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    saveAs(blob, name + '.xlsx')
    this.spinner.hide();
  }


  fnSalir() { this.router.navigate(["/inicio"]) }
  consultaReporte() {
    this.listaCuentaCorriente();
  }

  ngOnDestroy(): void {
    if (this.subRef$) { this.subRef$.unsubscribe(); }
  }
}

