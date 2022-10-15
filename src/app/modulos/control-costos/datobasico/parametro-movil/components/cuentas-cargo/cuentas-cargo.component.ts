import { AfterViewInit, Component, Inject, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';
import { asistenciapAnimations } from '../../../../../comercial/Asistencia/asistenciap/asistenciap.animations';
import { ParametroService } from '../../../parametro.service';
import { DialogCuentaCargoClienteComponent } from './dialog-cuenta-cargo-cliente/dialog-cuenta-cargo-cliente.component';



@Component({
  selector: 'app-cuentas-cargo',
  templateUrl: './cuentas-cargo.component.html',
  styleUrls: [ './cuentas-cargo.component.css'],
  animations: [asistenciapAnimations]
})
export class CuentasCargoComponent implements OnInit, AfterViewInit {
  listaCargosCliente: any;
  constructor(public dialogRef: MatDialogRef<CuentasCargoComponent>,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any, private parametroService: ParametroService, private spinner: NgxSpinnerService) { 
    console.log('DATA', this.data);
  }

  async ngOnInit() {
    // this.spinner.show();
    this.listaCargosCliente = await  this.parametroService.obtenerParametrosCRUD(7, `${this.data.nId}|`);
    console.log('Lista Cargo', this.listaCargosCliente);
    // this.spinner.hide();
  }

  ngAfterViewInit() {
  }


  agregarCliente(event) {
    const dialogRef = this.dialog.open(DialogCuentaCargoClienteComponent, {
      width: '85%',
      height: '60%',
      data: this.data
    });
    dialogRef.afterClosed().subscribe(result => {
      if ( result ) {
        console.log('Result',result);
        const formulario = result as FormGroup;
        const idDepartment = formulario.get('idDepartment').value;
        const idCliente = formulario.get('idCliente').value ;
        const diario = formulario.get('diario').value;
        const mensual = formulario.get('mensual').value;
        const bEstado = 1;
        const cliente = formulario.get('cliente').value;
        const ruc = formulario.get('ruc').value;
        const send = `${idDepartment}|${idCliente}|${diario}|${mensual}|${bEstado}`;
        this.spinner.show();
        this.parametroService.insertOrUpdateParametrosMovil(5, send).then((resp) => {
          console.log(resp);
          this.listaCargosCliente.push({
            nIdDetMovCli: resp,
            nId: this.data.nId,
            diario: diario,
            mensual: mensual,
            ruc: ruc,
            sDescripcion: cliente
          });
        });
        Swal.fire({
          icon: 'success',
          title: 'El cliente se añadió correctamente',
          showConfirmButton: false,
          timer: 1500
        });
        this.spinner.hide();
      }
    });
  }

  onNoClick() {
    this.dialogRef.close();
  }

}
