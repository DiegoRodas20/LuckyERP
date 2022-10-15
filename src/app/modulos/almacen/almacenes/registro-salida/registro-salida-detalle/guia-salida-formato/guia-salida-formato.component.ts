import { Component, Inject, Input, OnInit } from '@angular/core';
import moment from 'moment';
import { Articulo_Guia_Salida, Guia_Salida } from '../../models/formatoGS.model';
import { RegistroSalidaService } from '../../registro-salida.service';

@Component({
  selector: 'app-guia-salida-formato',
  templateUrl: './guia-salida-formato.component.html',
  styleUrls: ['./guia-salida-formato.component.css']
})
export class GuiaSalidaFormatoComponent implements OnInit {

  @Input() pIdRegistro: number;
  url: string; //variable de un solo valor

  listaDetalle: Articulo_Guia_Salida[] = [];
  listaCabecera: Guia_Salida;
  nPesoTotal = 0;

  fechaActual: string;
  nNumerosrestantes = [];
  constructor(
    private vRegSalida: RegistroSalidaService,
    @Inject('BASE_URL') baseUrl: string
  ) { this.url = baseUrl; }

  async ngOnInit(): Promise<void> {
    await this.fnListarCabecera(this.pIdRegistro);
    await this.fnListarArticulo(this.pIdRegistro);

    this.listaDetalle.forEach(item => {
      this.nPesoTotal += item.nPesoTotal
    })

    moment.locale('es');
    this.fechaActual = moment().format('D MMM YYYY')
    this.fechaActual = this.fechaActual.toLocaleUpperCase();
    // for (let index = 0; index < 29; index++) {
    //   this.listaDetalle.push(this.listaDetalle[0]);
    // }
    this.nNumerosrestantes = Array(30 - this.listaDetalle.length).fill(0).map((x, i) => i);
  }

  async fnListarCabecera(nIdRegistro: number) {

    var pEntidad = 6;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 1;

    pParametro.push(nIdRegistro);

    try {
      const lCabecera = await this.vRegSalida.fnRegistroSalida(pEntidad, pOpcion, pParametro, pTipo, null, this.url).toPromise();
      this.listaCabecera = lCabecera[0];
    } catch (error) {
      console.log(error);
    }
  }


  async fnListarArticulo(nIdRegistro: number) {

    var pEntidad = 6;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 2;

    pParametro.push(nIdRegistro);

    try {
      this.listaDetalle = await this.vRegSalida.fnRegistroSalida(pEntidad, pOpcion, pParametro, pTipo, null, this.url).toPromise();
    } catch (error) {
      console.log(error);
    }
  }

}
