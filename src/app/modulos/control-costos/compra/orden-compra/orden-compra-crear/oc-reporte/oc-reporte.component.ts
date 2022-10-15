import { Component, Inject, Input, OnInit } from '@angular/core';
import { CompraService } from '../../../compra.service';

export interface CabeceraModel {
  ruc: string;
  razon_social: string;
  direccion: string;
  distrito: string;
  provincia: string;
  departamento: string;
  contacto_nombre: string;
  contacto_cargo: string;
  contacto_telefono: string;
  contacto_email: string;
  cuenta_banco: string;
  cuenta_nro: string;
  comprador: string;
  email: string;
  cliente: string;
  ppto: string;
  solicitante: string;
  lugar_entrega: string;
  plazo_pago: string;
  moneda: string;
  observaciones: string;
  fecha_entrega: string;
  subtotal: number;
  servicios: number;
  igv: number;
  total: number;
  usuario: string;
  sDocumento?: string;
  sSimboloMoneda?: string;
  igvPorc?: number;
  servicioPorc?: number;
  sTipoOC?: string;
  sFechaEmision?: string;
  nIdEmp?: number;
  sRucEmpresa?: string;
  sDireccionEmp?: string;
  sEmpresa?: string;
  sEstado?: string;
}

export interface DetalleModel {
  item: number;
  codigo: number;
  descripcion: string;
  detalle: string;
  cant: number;
  u_med: number;
  precio: number;
  total: number;
}

@Component({
  selector: 'app-oc-reporte',
  templateUrl: './oc-reporte.component.html',
  styleUrls: ['./oc-reporte.component.css']
})
export class OcReporteComponent implements OnInit {

  idUser: number; //id del usuario
  pNom: string;    //Nombre Usr
  idEmp: string;  //id de la empresa del grupo Actual
  pPais: string;

  listaCabecera: CabeceraModel; // Prueba Para el reporte de cabecera
  listaDetalle: DetalleModel[] = []; // Prueba Para el reporte de detalle
  horaActual;
  url;

  presupuesto;

  @Input() idGastoCosto: string;

  constructor(
    private service: CompraService,
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

    var pEntidad = 1;
    var pOpcion = 2;
    var pTipo = 4;

    pParametro.push(this.idGastoCosto)
    //console.log(pParametro);
    this.service.fnDatosOrdenCompras(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe((data) => {
      var gastoCosto = data[0];
      this.listaCabecera = this.fnMapearGastoCosto(gastoCosto);

      //console.log(this.listaCabecera)
      this.fnListarDetalle();
    })
  }

  fnListarDetalle() {
    var pParametro = []

    var pEntidad = 1
    var pOpcion = 2
    var pTipo = 5;
    pParametro.push(this.idGastoCosto)

    this.service.fnDatosOrdenCompras(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe((data: any) => {
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
    //console.log(data);

    this.presupuesto = data.sCampana.split("-")[0];;

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
      servicios: data.nServicio ,

      // igv: this.fnRedondear(Number(data.nIgv)),
      igv: data.nIgv,
      subtotal: data.nSubTotal,
      total: data.total,
      sDocumento: data.sDocumento,
      usuario: this.pNom,
      sSimboloMoneda: data.sSimboloMoneda,
      igvPorc: Number(data.igv) ,
      servicioPorc: Number(data.servicio) ,
      sTipoOC: data.sTipoOC,
      sFechaEmision: data.sFechaEmision,
      nIdEmp: data.nIdEmp,
      sRucEmpresa: data.sRucEmpresa,
      sDireccionEmp: data.sDireccionEmp,
      sEmpresa: data.sEmpresa,
      sEstado: data.sEstado
    }

  }

  fnRedondear(num) {
    //debugger
    var pow = Math.pow(10, 2);
    return Math.round(num * pow) / pow;
  }

}
