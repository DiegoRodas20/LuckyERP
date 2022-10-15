import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { SecurityErp } from 'src/app/modulos/AAHelpers';
import Swal from 'sweetalert2';
import { ArticuloRqHerramientaDTO, HerramientaRqDetalleTable, PartidaRqHerramientaDTO, PersonalRqHerramientaDTO } from '../../../api/models/requerimientoHerramienta.model';
import { RequerimientoHerramientaService } from '../../../api/services/requerimiento-herramienta.service';

@Component({
  selector: 'app-ti-dialog-detalle-rq-herramienta',
  templateUrl: './ti-dialog-detalle-rq-herramienta.component.html',
  styleUrls: ['./ti-dialog-detalle-rq-herramienta.component.css']
})
export class TiDialogDetalleRqHerramientaComponent implements OnInit {

  formDetalleRQ: FormGroup;
  storageData: SecurityErp;

  listaSolicitantes: PersonalRqHerramientaDTO[] = [];
  listaArticulo: ArticuloRqHerramientaDTO[] = []

  listaPartida: PartidaRqHerramientaDTO[] = [];

  // Flags
  bPlanDatosMinutos: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<TiDialogDetalleRqHerramientaComponent>,
    private formBuilder: FormBuilder,
    private spinner: NgxSpinnerService,
    private _requerimientoHerramientaService: RequerimientoHerramientaService,
    @Inject(MAT_DIALOG_DATA) public data: {
      lista: HerramientaRqDetalleTable[],
      idPresupuesto: number,
      sAnio: string,
      nMes: number
    },
  ) {
    this.inicializarForm();
  }

  ngOnInit(): void {
    this.storageData = new SecurityErp();
  }

  async ngAfterViewInit() {
    setTimeout(async () => {

      //Para que no haya error de ngAfterContentChecked
      this.spinner.show();
      await this.GetSolicitantes()

      this.spinner.hide();

    });
  }

  //#region Listados
  async GetSolicitantes() {
    let response = await this._requerimientoHerramientaService.GetSolicitante(
      Number(this.storageData.getUsuarioId()),
      Number(this.storageData.getEmpresa()),
      this.data.idPresupuesto)

    this.listaSolicitantes = response.response.data
  }

  async GetArticulos(nIdCargo: number) {
    this.listaArticulo = [];
    this.listaPartida = [];
    this.formDetalleRQ.patchValue({
      articulo: null,
      precio: null,
      precioUnidad: null,
      unidades: null,
      partida: null
    })

    this.spinner.show()
    let response = await this._requerimientoHerramientaService.GetArticulos(nIdCargo)
    this.spinner.hide()

    this.listaArticulo = response.response.data
  }

  async GetPartida(nIdArticulo: number) {
    this.listaPartida = [];
    this.formDetalleRQ.controls.partida.setValue(null);

    this.spinner.show()
    let response = await this._requerimientoHerramientaService.GetPartidaByArticulo(nIdArticulo, this.storageData.getPais())
    this.spinner.hide()

    this.listaPartida = response.response.data

    if (this.listaPartida.length == 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Advertencia',
        text: 'No hay partidas para la herramienta indicada.',
      });
    }
  }

  async fnValidarSaldo(nIdPartida: number) {

    let datos = this.formDetalleRQ.value;
    let articulo = this.listaArticulo.find(item => item.nIdArticulo == datos.articulo);
    let personal = this.listaSolicitantes.find(item => item.nIdPersonal == datos.personal);
    let partida = this.listaPartida.find(item => item.nIdPartida == datos.partida);

    let total = (articulo.nPrecio * Number(this.formDetalleRQ.get("unidades").value));

    this.data.lista.forEach(item => {
      //Sumamos items con partida y sucursal que ya se hayan agregado
      if (item.nIdSucursal == personal.nIdSucursal && item.nIdPartida == nIdPartida) {
        total += (item.nPrecio * item.nUnidades);
      }
    })

    this.spinner.show()

    let response = await this._requerimientoHerramientaService.ValidarSaldoPpto(
      this.data.idPresupuesto, personal.nIdSucursal,
      partida.nIdPartida, this.data.sAnio, this.data.nMes, total);

    this.spinner.hide()

    return response.response.data[0] ?? 'Error de conexión'
  }

  async fnValidarActivoAsignado(nIdArticulo: number) {

    let datos = this.formDetalleRQ.value;
    this.spinner.show()

    let response = await this._requerimientoHerramientaService.ValidacionActivoAsignado(
      datos.personal, nIdArticulo);

    this.spinner.hide()

    return response.response.data[0]
  }

  //#endregion

  inicializarForm() {
    this.formDetalleRQ = this.formBuilder.group({
      personal: [null, Validators.compose([Validators.required])],
      cargo: [null],
      articulo: [null, Validators.compose([Validators.required])],
      precio: [null],
      precioUnidad: [null],
      unidades: [null, Validators.compose([Validators.required, Validators.min(1)])],
      partida: [null, Validators.compose([Validators.required])],
      sucursal: [null]
    })
  }

  async fnSeleccionarPersonal(nIdPersonal: number) {
    let personal = this.listaSolicitantes.find(item => item.nIdPersonal == nIdPersonal);
    if (personal) {
      this.formDetalleRQ.patchValue({
        cargo: personal.sCargo,
        sucursal: personal.sSucursal
      })
    }
    await this.GetArticulos(personal.nIdCargo);
  }


  async fnSeleccionarArticulo(nIdArticulo: number) {
    let articulo = this.listaArticulo.find(item => item.nIdArticulo == nIdArticulo);
    if (articulo) {
      this.formDetalleRQ.patchValue({
        precioUnidad: articulo.nPrecio.toFixed(2),
        precio: (articulo.nPrecio * articulo.nUnidades).toFixed(2),
        unidades: articulo.nUnidades,
        partida: null,
      })
    }

    // Revisamos si son minutos
    this.bPlanDatosMinutos = articulo.bPlanDatos;

    if(this.bPlanDatosMinutos){
      this.formDetalleRQ.get("unidades").setValidators(Validators.compose([Validators.required, Validators.min(1)]));
    }
    else{
      this.formDetalleRQ.get("unidades").clearValidators();
    }
    this.formDetalleRQ.get("unidades").updateValueAndValidity();

    let validacion = await this.fnValidarActivoAsignado(nIdArticulo);
    if (validacion != '') {
      Swal.fire({
        icon: 'warning',
        title: 'Advertencia',
        html: validacion,
      });

      //Vaciamos los controles
      this.formDetalleRQ.patchValue({
        articulo: null,
        precio: null,
        precioUnidad: null,
        unidades: null,
        partida: null
      })

      return;
    }

    await this.GetPartida(nIdArticulo);
  }

  fnActualizarPrecioTotal(){
    this.formDetalleRQ.patchValue({
      precio: (this.formDetalleRQ.get("unidades").value * this.formDetalleRQ.get("precioUnidad").value).toFixed(2)
    })
  }

  async fnSeleccionarPartida(nIdPartida: number) {
    let validacion = await this.fnValidarSaldo(nIdPartida);
    if (validacion != '') {
      Swal.fire({
        icon: 'warning',
        title: 'Advertencia',
        html: validacion,
      });
      return;
    }
  }

  async fnAgregarHerramienta() {

    if (this.formDetalleRQ.invalid) {
      Swal.fire({
        icon: 'warning',
        title: 'Advertencia',
        text: 'Revise los datos ingresados.',
      });
      this.formDetalleRQ.markAllAsTouched();
      return;
    }

    if (Number(this.formDetalleRQ.get("precio").value) <= 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Advertencia',
        text: 'El precio final no puede ser 0.',
      });
      this.formDetalleRQ.markAllAsTouched();
      return;
    }

    let datos = this.formDetalleRQ.value;

    let validar = this.data.lista.find(item => item.nIdArticulo == datos.articulo && datos.nIdPersonal == item.nIdDepositario)
    if (validar) {
      Swal.fire({
        icon: 'warning',
        title: 'Advertencia',
        text: 'El artículo y el asignado indicados ya han sido ingresados.',
      });
      return;
    }

    //Validacion de saldo
    let validacionSaldo = await this.fnValidarSaldo(datos.partida);
    if (validacionSaldo != '') {
      Swal.fire({
        icon: 'warning',
        title: 'Advertencia',
        html: validacionSaldo,
      });
      return;
    }

    //Validacion asignacion
    let validacionAsignacion = await this.fnValidarActivoAsignado(datos.articulo);
    if (validacionAsignacion != '') {
      Swal.fire({
        icon: 'warning',
        title: 'Advertencia',
        html: validacionAsignacion,
      });
      return;
    }

    let articulo = this.listaArticulo.find(item => item.nIdArticulo == datos.articulo);
    let personal = this.listaSolicitantes.find(item => item.nIdPersonal == datos.personal);
    let partida = this.listaPartida.find(item => item.nIdPartida == datos.partida);

    let nIdMax = 0

    this.data.lista.forEach(item => {
      if (item.nIdDetalle > nIdMax) {
        nIdMax = item.nIdDetalle;
      }
    })

    let data: HerramientaRqDetalleTable = {
      nIdDetalle: nIdMax + 1,
      nIdDepositario: personal.nIdPersonal,
      sDepositario: personal.sNombreCompleto,
      nIdCargo: personal.nIdCargo,
      sCargo: personal.sCargo,
      nIdSucursal: personal.nIdSucursal,
      sSucursal: personal.sSucursal,
      nIdArticulo: articulo.nIdArticulo,
      sHerramienta: articulo.sHerramienta,
      nIdPartida: partida.nIdPartida,
      sPartida: partida.sCodPartida + ' - ' + partida.sPartida,
      nUnidades: articulo.nUnidades,
      nPrecio: articulo.nPrecio,
      nTotal: articulo.nPrecio * articulo.nUnidades
    }

    this.dialogRef.close(data);
  }

  fnValidarCaracteresNumericos(event){

    const invalidChars = ["-","+","e","."];

    if (invalidChars.includes(event.key)) {
      event.preventDefault();
    }
  }

  fnValidarCaracteresNumericosClipboard(event: ClipboardEvent){

    const invalidChars = ["-","+","e","."];

    let clipboardData = event.clipboardData;
    let pastedText = clipboardData.getData('text');
    console.log(clipboardData)
    console.log(pastedText)
    const valor = pastedText.split('')

    invalidChars.map((letra)=>{
      if (valor.includes(letra)) {
        event.preventDefault();
      }
    })
  }
}
