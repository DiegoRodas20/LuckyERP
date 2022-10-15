import { DatePipe } from '@angular/common';
import { AfterViewChecked, AfterViewInit, ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SelPostulantesService } from '../sel-postulantes/sel-postulantes.service';

@Component({
  selector: 'app-dialog-nueva-contactacion',
  templateUrl: './dialog-nueva-contactacion.component.html',
  styleUrls: ['./dialog-nueva-contactacion.component.css']
})

export class DialogNuevaContactacionComponent implements OnInit {

  listPostulacion: any = [];
  primero: string;
  today: Date;
  hoy: any;
  url: string;
  pais: string;
  nIdUsuario: number;

  NuevaContactacion: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<DialogNuevaContactacionComponent>,
    private cdRef: ChangeDetectorRef,
    public datepipe: DatePipe,
    private vSerContacto: SelPostulantesService,

    @Inject(MAT_DIALOG_DATA) public data: any,
    @Inject('BASE_URL') baseUrl: string,
  ) {
    this.url = baseUrl;
  }

  ngOnInit(): void {

    const user = localStorage.getItem('currentUser');
    this.nIdUsuario = JSON.parse(window.atob(user.split('.')[1])).uid;
    this.pais = localStorage.getItem('Pais');

    this.NuevaContactacion = this.formBuilder.group({
      Pri: [null, Validators.required],
      fechaPost: [null, Validators.required]
    });

    // this.listPostulacion = [
    //   {
    //     id: '010101',
    //     puesto: 'Mercaderista'
    //   },
    //   {
    //     id: '010102',
    //     puesto: 'Vendedor(a) de campo'
    //   },
    //   {
    //     id: '010103',
    //     puesto: 'Promotor(a)'
    //   },
    //   {
    //     id: '010104',
    //     puesto: 'Impulsador(a)'
    //   }
    // ]

    this.today = new Date();
    this.hoy = this.datepipe.transform(this.today, 'd/MM/yyyy')

    this.fnListarPuestos()
  }

  async fnListarPuestos() {
    let pParametro = [];

    pParametro.push(this.pais);

    await this.vSerContacto.fnReclutamiento(31, pParametro, this.url).then(
      data => {
        console.log(data)
        this.listPostulacion = data
      },
      error => {
        console.log(error);
      }
    )
  }

  onNoClick() {
    this.dialogRef.close();
  }

  async fnSeleccionar() {

    let pParametro = [];
    pParametro.push(this.pais);
    pParametro.push(1);
    pParametro.push('');
    pParametro.push(this.data.pCodPostulante);
    pParametro.push('');
    pParametro.push(this.nIdUsuario);
    pParametro.push(this.NuevaContactacion.controls.Pri.value);

    await this.vSerContacto.fnReclutamiento(1, pParametro, this.url).then(
      (value: any[]) => {
        console.log(value)
      }, error => {
        console.log(error);
      });

    this.dialogRef.close(/* {data: ObjUbi} */);
  }
}
