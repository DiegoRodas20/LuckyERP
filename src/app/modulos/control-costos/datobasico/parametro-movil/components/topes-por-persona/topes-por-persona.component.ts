import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { ParametroService } from '../../../parametro.service';
import { DialogTopePersonaAddComponent } from '../dialog-tope-persona/dialog-tope-persona-add/dialog-tope-persona-add.component';
import { FormGroup } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-topes-por-persona',
  templateUrl: './topes-por-persona.component.html',
  styleUrls: [ './topes-por-persona.component.css'
  ]
})
export class TopesPorPersonaComponent implements OnInit {
  listaPersonal: any;
  idEmp: any;
  constructor(private parametroService: ParametroService, 
    public dialog: MatDialog,
    private cdRef: ChangeDetectorRef,
    private spinner: NgxSpinnerService ) {
  }

  async ngOnInit() {
    this.idEmp  = localStorage.getItem('Empresa');
    this.listaPersonal = await this.parametroService.obtenerParametrosCRUD(5,`${this.idEmp}`);
    // console.log('Personal',this.listaPersonal);
  }

  agregarPersonal(event){
    if(event === 3) {
      const dialogRef = this.dialog.open(DialogTopePersonaAddComponent, {
        width: '85%',
        height: '65%',
      });
      dialogRef.afterClosed().subscribe(result => {
        if ( result ) {
          const formulario = result as FormGroup;
          console.log('DATA',result);
          const id = formulario.get('id').value ;
          const topediario = formulario.get('diario').value;
          const topeMensual = formulario.get('mensual').value;
          const nAplica = formulario.get('aplica').value;
          const dni = formulario.get('dni').value;
          const sDescripcion = formulario.get('nombre').value;
          const send = `${id}|${topediario}|${topeMensual}|${nAplica}`;
          //console.log(send);
          this.spinner.show();
          this.parametroService.insertOrUpdateParametrosMovil(2, send).then((resp) => {
            //console.log(resp);
            this.listaPersonal.push({
              nId: resp,
              dni: dni,
              diario: topediario,
              mensual: topeMensual,
              bAplica: nAplica,
              sDescripcion: sDescripcion
            });
          });
          Swal.fire({
            icon: 'success',
            title: 'El personal se añadió correctamente',
            showConfirmButton: false,
            timer: 1500
          });
          this.spinner.hide();
        }
      });
    }
  }

  async cleanPersona() {
    this.spinner.show();
    this.listaPersonal = await this.parametroService.obtenerParametrosCRUD(5,`${this.idEmp}|`);
    this.spinner.hide();
  }

}
