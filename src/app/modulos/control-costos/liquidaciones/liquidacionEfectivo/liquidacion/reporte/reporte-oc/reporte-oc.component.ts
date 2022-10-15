import { Component, OnInit } from '@angular/core';

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
  email:string;
  cliente:string;
  ppto: string;
  solicitante: string;
  lugar_entrega: string;
  plazo_pago: string;
  moneda: string;
  observaciones: string;
  fecha_entrega:string;
  subtotal:number;
  servicios: number;
  igv:number;
  total: number;
  usuario: string;
}

export interface DetalleModel {
  item:number;
  codigo:number;
  descripcion:string;
  detalle:string;
  cant:number;
  u_med:number;
  precio:number;
  total:number;
}

@Component({
  selector: 'app-reporte-oc',
  templateUrl: './reporte-oc.component.html',
  styleUrls: ['./reporte-oc.component.css']
})
export class ReporteOCComponent implements OnInit {

  idEmp: string;  //id de la empresa del grupo Actual
  listaCabecera: CabeceraModel; // Prueba Para el reporte de cabecera
  listaDetalle: DetalleModel[] = []; // Prueba Para el reporte de detalle
  horaActual;

  constructor() { }

  ngOnInit(): void {
    this.idEmp  = localStorage.getItem('Empresa'); 
    this.listaCabecera = {
      ruc: "1060653118",
      razon_social: "CERNA CARDENAS JOSE LUIS",
      direccion: "Jr.Cañete 785 km.11",
      distrito: "COMAS",
      provincia: "LIMA",
      departamento: "LIMA",
      contacto_nombre: "CAROL",
      contacto_cargo: "CAROL",
      contacto_telefono: "999999/",
      contacto_email: "ROPAPUBLICITARA@GMAIL.COM",
      cuenta_banco: "DE CREDITO DEL PERU",
      cuenta_nro: "194-255488366-0-42",
      comprador: "SANCHEZ ESTRADA RAUL",
      email: "RSANCHEZ@LUCKY.COM.PE",
      cliente: "BANCO DE CREDITO DEL PERU",
      ppto: "20330 COMPRA DE EPPS PISCO Y TACNA",
      solicitante: "ESCOBAL MERTZ DANUEL ISABEL",
      lugar_entrega: "LIMA - LA VICTORIA AV.MANCO CAPAC 1239",
      plazo_pago: "45 DIAS",
      moneda: "SOL",
      observaciones: "",
      fecha_entrega: "18/12/2020",
      subtotal:420.00,
      servicios: 0.00,
      igv: 75.6,
      total: 495.6,
      usuario:"EDUARDO BARRIOS QUIRHUAYO"
    }

    this.listaDetalle = [
      {
        item:1,
        codigo:130420,
        descripcion:"MASCARILLA DE TELA CON LOGO YAPE.",
        detalle:"",
        cant:48.000,
        u_med:0,
        precio:8.50000,
        total:408.00
      },
      {
        item:2,
        codigo:13052,
        descripcion:"GUANTES BLANCOS",
        detalle:"",
        cant:2,
        u_med:0,
        precio:6.00,
        total:12.00
      },
      {
        item:1,
        codigo:130420,
        descripcion:"MASCARILLA DE TELA CON LOGO YAPE.",
        detalle:"",
        cant:48.000,
        u_med:0,
        precio:8.50000,
        total:408.00
      },
      {
        item:2,
        codigo:13052,
        descripcion:"GUANTES BLANCOS",
        detalle:"",
        cant:2,
        u_med:0,
        precio:6.00,
        total:12.00
      },
      {
        item:1,
        codigo:130420,
        descripcion:"MASCARILLA DE TELA CON LOGO YAPE.",
        detalle:"",
        cant:48.000,
        u_med:0,
        precio:8.50000,
        total:408.00
      },
      {
        item:2,
        codigo:13052,
        descripcion:"GUANTES BLANCOS",
        detalle:"",
        cant:2,
        u_med:0,
        precio:6.00,
        total:12.00
      },
      {
        item:1,
        codigo:130420,
        descripcion:"MASCARILLA DE TELA CON LOGO YAPE.",
        detalle:"",
        cant:48.000,
        u_med:0,
        precio:8.50000,
        total:408.00
      },
      {
        item:2,
        codigo:13052,
        descripcion:"GUANTES BLANCOS",
        detalle:"",
        cant:2,
        u_med:0,
        precio:6.00,
        total:12.00
      },
      {
        item:1,
        codigo:130420,
        descripcion:"MASCARILLA DE TELA CON LOGO YAPE.",
        detalle:"",
        cant:48.000,
        u_med:0,
        precio:8.50000,
        total:408.00
      },
      {
        item:2,
        codigo:13052,
        descripcion:"GUANTES BLANCOS",
        detalle:"",
        cant:2,
        u_med:0,
        precio:6.00,
        total:12.00
      },
      {
        item:1,
        codigo:130420,
        descripcion:"MASCARILLA DE TELA CON LOGO YAPE.",
        detalle:"",
        cant:48.000,
        u_med:0,
        precio:8.50000,
        total:408.00
      },
      {
        item:2,
        codigo:13052,
        descripcion:"GUANTES BLANCOS",
        detalle:"",
        cant:2,
        u_med:0,
        precio:6.00,
        total:12.00
      },
      {
        item:1,
        codigo:130420,
        descripcion:"MASCARILLA DE TELA CON LOGO YAPE.",
        detalle:"",
        cant:48.000,
        u_med:0,
        precio:8.50000,
        total:408.00
      },
      {
        item:2,
        codigo:13052,
        descripcion:"GUANTES BLANCOS",
        detalle:"",
        cant:2,
        u_med:0,
        precio:6.00,
        total:12.00
      },
      {
        item:1,
        codigo:130420,
        descripcion:"MASCARILLA DE TELA CON LOGO YAPE.",
        detalle:"",
        cant:48.000,
        u_med:0,
        precio:8.50000,
        total:408.00
      },
      {
        item:2,
        codigo:13052,
        descripcion:"GUANTES BLANCOS",
        detalle:"",
        cant:2,
        u_med:0,
        precio:6.00,
        total:12.00
      },
      {
        item:1,
        codigo:130420,
        descripcion:"MASCARILLA DE TELA CON LOGO YAPE.",
        detalle:"",
        cant:48.000,
        u_med:0,
        precio:8.50000,
        total:408.00
      },
      {
        item:2,
        codigo:13052,
        descripcion:"GUANTES BLANCOS",
        detalle:"",
        cant:2,
        u_med:0,
        precio:6.00,
        total:12.00
      },
      {
        item:1,
        codigo:130420,
        descripcion:"MASCARILLA DE TELA CON LOGO YAPE.",
        detalle:"",
        cant:48.000,
        u_med:0,
        precio:8.50000,
        total:408.00
      },
      {
        item:2,
        codigo:13052,
        descripcion:"GUANTES BLANCOS",
        detalle:"",
        cant:2,
        u_med:0,
        precio:6.00,
        total:12.00
      },
      {
        item:1,
        codigo:130420,
        descripcion:"MASCARILLA DE TELA CON LOGO YAPE.",
        detalle:"",
        cant:48.000,
        u_med:0,
        precio:8.50000,
        total:408.00
      },
      {
        item:2,
        codigo:13052,
        descripcion:"GUANTES BLANCOS",
        detalle:"",
        cant:2,
        u_med:0,
        precio:6.00,
        total:12.00
      },
      {
        item:1,
        codigo:130420,
        descripcion:"MASCARILLA DE TELA CON LOGO YAPE.",
        detalle:"",
        cant:48.000,
        u_med:0,
        precio:8.50000,
        total:408.00
      },
      {
        item:2,
        codigo:13052,
        descripcion:"GUANTES BLANCOS",
        detalle:"",
        cant:2,
        u_med:0,
        precio:6.00,
        total:12.00
      },
      {
        item:1,
        codigo:130420,
        descripcion:"MASCARILLA DE TELA CON LOGO YAPE.",
        detalle:"",
        cant:48.000,
        u_med:0,
        precio:8.50000,
        total:408.00
      },
      {
        item:2,
        codigo:13052,
        descripcion:"GUANTES BLANCOS",
        detalle:"",
        cant:2,
        u_med:0,
        precio:6.00,
        total:12.00
      },
      {
        item:1,
        codigo:130420,
        descripcion:"MASCARILLA DE TELA CON LOGO YAPE.",
        detalle:"",
        cant:48.000,
        u_med:0,
        precio:8.50000,
        total:408.00
      },
      {
        item:2,
        codigo:13052,
        descripcion:"GUANTES BLANCOS",
        detalle:"",
        cant:2,
        u_med:0,
        precio:6.00,
        total:12.00
      },
      {
        item:1,
        codigo:130420,
        descripcion:"MASCARILLA DE TELA CON LOGO YAPE.",
        detalle:"",
        cant:48.000,
        u_med:0,
        precio:8.50000,
        total:408.00
      },
      {
        item:2,
        codigo:13052,
        descripcion:"GUANTES BLANCOS",
        detalle:"",
        cant:2,
        u_med:0,
        precio:6.00,
        total:12.00
      },
      {
        item:1,
        codigo:130420,
        descripcion:"MASCARILLA DE TELA CON LOGO YAPE.",
        detalle:"",
        cant:48.000,
        u_med:0,
        precio:8.50000,
        total:408.00
      },
      {
        item:2,
        codigo:13052,
        descripcion:"GUANTES BLANCOS",
        detalle:"",
        cant:2,
        u_med:0,
        precio:6.00,
        total:12.00
      }
    ]
    let hoy = new Date();
    this.horaActual = hoy.getDate() + '/' + (hoy.getMonth() + 1 ) + '/' + hoy.getFullYear(); + ' ' + hoy.getHours() + ':' + hoy.getMinutes() + ':' + hoy.getSeconds();

  }

}
