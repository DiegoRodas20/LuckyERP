import { Component, Inject, Input, OnInit } from '@angular/core';
import { CabeceraModel, DetalleModel } from '../models/reportOrdenCompraSc';
import { CompraScService } from '../services/compra-sc.service';
export interface Tile {
  color: string;
  cols: number;
  rows: number;
  text: string;
}

@Component({
  selector: 'app-oc-sc-reporte',
  templateUrl: './oc-sc-reporte.component.html',
  styleUrls: ['./oc-sc-reporte.component.css']
})




export class OcScReporteComponent implements OnInit {

  idUser: number; //id del usuario
  pNom: string;    //Nombre Usr
  idEmp: string;  //id de la empresa del grupo Actual
  pPais: string;
  listaCabecera: CabeceraModel; // Prueba Para el reporte de cabecera
  listaDetalle: DetalleModel[] = []; // Prueba Para el reporte de detalle
  horaActual;
  url;

  

  @Input() codigoGastoCosto: number;

  constructor(
    private service: CompraScService,
    @Inject('BASE_URL') baseUrl: string,
  ) {
    this.url = baseUrl;
  }

  ngOnInit(): void {

    let user = localStorage.getItem('currentUser'); //encriptacion del usuario 
    this.idUser = JSON.parse(window.atob(user.split('.')[1])).uid;
    this.pNom = JSON.parse(window.atob(user.split('.')[1])).uno;
    this.idEmp = localStorage.getItem('Empresa');
    this.pPais = localStorage.getItem('Pais');

    let hoy = new Date();
    this.horaActual = hoy.getDate() + '/' + (hoy.getMonth() + 1) + '/' + hoy.getFullYear(); + ' ' + hoy.getHours() + ':' + hoy.getMinutes() + ':' + hoy.getSeconds();
    this.fnListarOC();
  }

  fnListarOC() {
    var pParametro = []
    var pOpcion = 19;
    pParametro.push(this.codigoGastoCosto)
    this.service.fnDatosOrdenCompras(pOpcion, pParametro).subscribe((data) => {
      var gastoCosto = data[0];
      this.listaCabecera = this.fnMapearGastoCosto(gastoCosto);      
      this.fnListarDetalle();
    })
  }

  fnListarDetalle() {
    var pParametro = []
    var pOpcion = 20
    pParametro.push(this.codigoGastoCosto)

    this.service.fnDatosOrdenCompras(pOpcion, pParametro).subscribe((data: any) => {
      this.listaDetalle = data.map(item => {
        return {
          item: 1,
          codigo: item.sArtiruclo.split('-')[0].trim(),
          descripcion: item.sArtiruclo.split('-')[1].trim(),
          detalle: "",
          cant: item.cantidad,
          u_med: item.sUMed,
          precio: item.precio,
          total: item.nTotal,
        }
      })
    })
  }

  fnMapearGastoCosto(data): CabeceraModel {        
    return {
      ruc: data.sRUCProv,
      razon_social: data.sProveedor,
      direccion: data.sDireccionProv,
      distrito: data.sDistrito,
      provincia: data.sProvincia,
      departamento: data.sDepartamento,
      contacto_nombre: data.sContacto,
      contacto_cargo: data.sContactoCargo,
      contacto_telefono: data.sContactoTelefono,
      contacto_email: data.sContactoCorreo,
      cuenta_banco: data.sBanco,
      cuenta_nro: data.sNumCuentaProv,
      comprador: data.sComprador,
      email: data.sEmailComprador,
      cliente: data.sCliente,
      ppto: data.sCampana,
      solicitante: data.sSolic,
      lugar_entrega: data.sdireccion,
      plazo_pago: data.nPlazoPago,
      moneda: data.sMoneda,
      observaciones: "",
      fecha_entrega: data.sFecha,
      servicios: data.nServicio,

      // igv: this.fnRedondear(Number(data.nIgv)),
      igv: data.nIgv,
      subtotal: data.nSubTotal,
      total: data.total,
      sDocumento: data.sDocumento,
      usuario: this.pNom,
      sSimboloMoneda: data.sSimboloMoneda,
      igvPorc: Number(data.igv),
      servicioPorc: Number(data.servicio),
      sTipoOC: data.sTipoOC,
      sFechaEmision: data.sFechaEmision,
      nIdEmp: data.nIdEmp,
      sRucEmpresa: data.sRucEmpresa,
      sDireccionEmp: data.sDireccionEmp,
      sEmpresa: data.sEmpresa,
      sEstado: data.sEstado,
      scVinculada: data.scVinculada
    }

  }

  fnRedondear(num) {    
    var pow = Math.pow(10, 2);
    return Math.round(num * pow) / pow;
  }

  tiles: Tile[] = [
    {text: 'One', cols: 3, rows: 1, color: 'lightblue'},
    {text: 'Two', cols: 1, rows: 2, color: 'lightgreen'},
    {text: 'Three', cols: 1, rows: 1, color: 'lightpink'},
    {text: 'Four', cols: 2, rows: 1, color: '#DDBDF1'},
  ];

}
