import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import { asistenciapAnimations } from '../../../../comercial/Asistencia/asistenciap/asistenciap.animations';
import { ParametroService } from '../../parametro.service';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-parametro',
  templateUrl: './parametro.component.html',
  styleUrls: ['./parametro.component.css'],
  providers: [DecimalPipe],
  animations: [asistenciapAnimations]
})
export class ParametroComponent implements OnInit {
  idUser: number;
  pPais: string;
  form: FormGroup;
  abLista = [];
  tsLista = 'active'; 
  listaCostoFijo: any;
  fbLista = [
    {icon: 'save', tool: 'Guardar'},
    {icon: 'clear', tool: 'Cancelar'}
  ];
  format = "1.2-2";
  format2 = '1.2-2';
  format3 = '4.0-10';
  parametros: any;
  step = 0;
  constructor(private fb: FormBuilder, private parametroService: ParametroService, private spinner: NgxSpinnerService, private decimalPipe: DecimalPipe) { 
    this.crearFormulario();
  }


  crearFormulario() {
    this.form = this.fb.group({
        item1: ['', [ Validators.required, Validators.min(1),Validators.max(100)]], // Porcentaje de Resguardo General Presupuseto
        item2: ['', [ Validators.required, Validators.min(1)]], // PrecioFotocheck
        item3: ['', [ Validators.required, Validators.min(1)]], // Monto Maximo Solicitud efectivo
        item4: ['', [ Validators.required, Validators.min(1)]], // Cantidad máxima Efectivo Pendiente Central
        item5: ['', [ Validators.required, Validators.min(1),Validators.max(100)]], // Porcentaje de Reguardo por Partida Presupuesto
        item6: ['', [ Validators.required, Validators.min(1),Validators.max(100)]], // Porcentaje de Gasto Reparado
        item7: ['', [ Validators.required, Validators.min(1)]], // Monto Reembolso automatico
        item8: ['', [ Validators.required, Validators.min(1)]], // Cantidad màxima Efectivo Pendiente Sucursal,
        item9: ['', [ Validators.required, Validators.min(1)]], // días de vigencia RR
        item10: [null, [ Validators.required]], // Centro de costo útiles
        item11: ['', [ Validators.required, Validators.min(1),Validators.max(100)]], // Porcentaje Implemento tarifario 
        item12: ['', [ Validators.required, Validators.min(1),Validators.max(100)]], // Porcentaje implemento tarifario detal
        item13: ['', [Validators.required,Validators.min(1),Validators.max(100)]] // Porcentaje Facturado
    });
    // this.isDisabled= true;
  }

  onToggleFab(fab: number, stat: number) {
    
    stat = ( stat === -1 ) ? ( this.abLista.length > 0 ) ? 0 : 1 : stat;
    this.tsLista = ( stat === 0 ) ? 'inactive' : 'active';
    this.abLista = ( stat === 0 ) ? [] : this.fbLista;
 
  }

  async ngOnInit() {
    let user = localStorage.getItem('currentUser');
    this.idUser = JSON.parse(window.atob(user.split('.')[1])).uid;
    this.pPais = localStorage.getItem('Pais');
    this.onToggleFab(1,-1);
    this.spinner.show();
    this.parametros = await this.parametroService.obtenerParametrosCRUD(1,'');
    this.listaCostoFijo = await this.parametroService.obtenerParametrosCRUD(8,'');
    this.inicializarFormulario();
    this.spinner.hide();
  }
  inicializarFormulario() {
    //debugger;
    this.form.reset({
      'item1': this.decimalPipe.transform(this.parametros.nResguardoGeneral,this.format),
      'item2': this.parametros.nPrecioFotoCheck.toFixed(2),
      'item3': this.parametros.nReComercialControl.toFixed(2),
      'item4': this.parametros.nReMaxCentral,
      'item5': this.decimalPipe.transform( this.parametros.nResguardoPartida, this.format),
      'item6': this.decimalPipe.transform(this.parametros.nGastoReparado, this.format),
      'item7': this.decimalPipe.transform(this.parametros.nMontoReem, this.format),
      'item8': this.parametros.nReMaxCiudad,
      'item9': this.parametros.nVigenciaRR,
      'item10': this.parametros.nIdCentroCostoNU,
      'item11': this.parametros.nTarifaImplemento.toFixed(4),
      'item12': this.parametros.nTarifaImplementoDet.toFixed(4),
      'item13': this.decimalPipe.transform(this.parametros.nPorcenFacturado,this.format),
    });
  }

  async modificarDatos() {
    // this.isDisabled = false;
    if (this.form.invalid) {
      await Swal.fire({
        icon: 'warning',
        title: 'Hay un error con los campos, por favor revisar',
        showConfirmButton: false,
        timer: 1500
      });
      return Object.values(this.form.controls).forEach(control => {
        control.markAllAsTouched();
      });
    }
    /*  
      // id | 
      resguardoGeneral | 
      fotocheck | 
      comercial control |
      max central |
      resguardoPartida |
      gasto reparado |
      monto reem |
      max ciudad |
      userId |
      paisId |
    */
    
    const param = `${this.parametros.nIdParam}|${this.form.get('item1').value}|${this.form.get('item2').value}|${this.form.get('item3').value}|${this.form.get('item4').value}|${this.form.get('item5').value}|${this.form.get('item6').value}|${this.form.get('item7').value}|${this.form.get('item8').value}|${this.form.get('item9').value}|${this.form.get('item10').value}|${this.form.get('item11').value}|${this.form.get('item12').value}|${this.form.get('item13').value}|${this.idUser}|${this.pPais}`;
    this.spinner.show();
    await this.parametroService.insertOrUpdateParametrosMovil(7, param);
    this.spinner.hide();
    await Swal.fire({
      icon: 'success',
      title: 'Los parametros de actualizaron correctamente',
      showConfirmButton: false,
      timer: 1500
    });
  }

  trunc (x, posiciones = 0) {
    var s = x.toString()
    var l = s.length
    var decimalLength = s.indexOf('.') + 1
    var numStr = s.substr(0, decimalLength + posiciones)
    return Number(numStr)
  }

  async cancelarDatos() {
    this.spinner.show();
    this.parametros = await this.parametroService.obtenerParametrosCRUD(1,'');
    this.inicializarFormulario();
    this.spinner.hide();
  }

  save() {
    console.log('guardo')
  }

  clickFab(index: number) {
    switch (index) {
      case 0:
        this.modificarDatos();
        break;
      case 1:
        this.cancelarDatos();
        break;
      default:
        break;
    }
  }

  setStep(index: number) {
    this.step = index;
  }

  get form1Item1() {
    return this.form.get('item1').invalid && this.form.get('item1').touched;
  }

  get form1Item2() {
    return this.form.get('item2').invalid && this.form.get('item2').touched;
  }

  get form1Item3() {
    return this.form.get('item3').invalid && this.form.get('item3').touched;
  }

  get form1Item4() {
    return this.form.get('item4').invalid && this.form.get('item4').touched;
  }

  get form2Item1() {
    return this.form.get('item5').invalid && this.form.get('item5').touched;
  }

  get form2Item2() {
    return this.form.get('item6').invalid && this.form.get('item6').touched;
  }

  get form2Item3() {
    return this.form.get('item7').invalid && this.form.get('item7').touched;
  }

  get form2Item4() {
    return this.form.get('item8').invalid && this.form.get('item8').touched;
  }

  get validacionItem9() {
    return this.form.get('item9').invalid && this.form.get('item9').touched;
  }

  get validacionItem10() {
    return this.form.get('item10').invalid && this.form.get('item10').touched;
  }

  get validacionItem11() {
    return this.form.get('item11').invalid && this.form.get('item11').touched;
  }

  get validacionItem12() {
    return this.form.get('item12').invalid && this.form.get('item12').touched;
  }

  get validacionItem13() {
    return this.form.get('item13').invalid && this.form.get('item13').touched;
  }

}
