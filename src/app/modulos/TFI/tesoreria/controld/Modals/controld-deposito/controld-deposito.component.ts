import { SPACE, Z } from '@angular/cdk/keycodes';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatStep, MatStepper } from '@angular/material/stepper';
import { MatTableDataSource } from '@angular/material/table';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { adminpAnimations } from 'src/app/modulos/egy-humana/JefaturaAP/Animations/adminp.animations';
import Swal from 'sweetalert2';
import { ControldService } from '../../../Services/controld.service';

@Component({
  selector: 'app-controld-deposito',
  templateUrl: './controld-deposito.component.html',
  styleUrls: ['./controld-deposito.component.css', './controld-deposito.component.scss'],
  animations: [adminpAnimations]
})
export class ControldDepositoComponent implements OnInit {

  @Input() fromParent;

  MontoFiltrado: any;
  BancoSeleccionado = '';
  lstTrabajadores: any[];
  lstDetalleBancos: any[];
  urlDocumento = '';
// Fab Button
  toggleControld = 1;
  nIdBancoFab = 0;
  nIdHistoricoFab = 0;
  tadaControld = 'inactive';
  fbControld = [
    {icon: 'file_download', tool: 'Generar txt', dis: true} ,
    {icon: 'picture_as_pdf', tool: 'Sustentar', dis: true} ,
    {icon: 'cancel', tool: 'Cancelar', dis: false} ,
  ];

  abControld = [];
  tsControld = 'inactive';

  // FormGroup
  fgInfoDeposito: FormGroup;
  fgInfoBanco: FormGroup;



  BancoDC: string[] = ['visualizar', 'banco', 'ntrabajadores', 'total' , 'icono' ];
  BancoDS2: MatTableDataSource<any> = new MatTableDataSource([]);
  @ViewChild('BancoB', { static: true }) BancoB: MatPaginator;
  @ViewChild('stepLeft', { static: true }) stepLeft: MatStepper;

  TrabajadoresDC: string[] = ['trabajador', 'tipoDocumento', 'nroDocumento' , 'importe' ];
  TrabajadoresDS: MatTableDataSource<any> = new MatTableDataSource([]);
  @ViewChild('pagTrabajadores', { static: true }) pagTrabajadores: MatPaginator;

  constructor(public activeModal: NgbActiveModal, public service: ControldService, private spi: NgxSpinnerService,
    private fb: FormBuilder, private _modalService: NgbModal) {

    this.InitFormDeposito();
    this.InitFormBanco();
     }

    async ngOnInit(): Promise<void>  {
      this.spi.show('spi_controld');
      this.BancoDS2 = new MatTableDataSource();
      this.TrabajadoresDS = new MatTableDataSource();
      const element = this.fromParent.element;
      this.fgInfoDeposito.controls['sDireccion'].setValue(element.direccion);
      this.fgInfoDeposito.controls['sArea'].setValue(element.area);
      this.fgInfoDeposito.controls['sTipoDeposito'].setValue(element.tipoDeposito);
      this.fgInfoDeposito.controls['sPersonas'].setValue(element.nPersonas);
      this.fgInfoDeposito.controls['sTotal'].setValue(this.financial(element.nTotal));
      this.GetDetalleBancos();
      this.spi.hide('spi_controld');
      this.onToggleFab(1, 1);
    }

    InitFormDeposito() {
      this.fgInfoDeposito = this.fb.group({
        sDireccion: [{ value: '' , disabled: true }],
        sArea: [{ value: '' , disabled: true }],
        sTipoDeposito: [{ value: '' , disabled: true }],
        sPersonas: [{ value: 0 , disabled: true }],
        sTotal: [{ value: 0 , disabled: true }],
        sFechaDeposito: [{ value: '' , disabled: true }],
      });
    }

    InitFormBanco() {
      this.fgInfoBanco = this.fb.group({
        sUsuario: [{ value: '' , disabled: true }],
        sFechaDeposito: [{ value: '' , disabled: true }],
      });
    }

  onToggleFab(fab: number, stat: number) {
    switch (fab) {
      //// Configurar boton flotante vista principal
      case 1:
        stat = ( stat === -1 ) ? ( this.abControld.length > 0 ) ? 0 : 1 : stat;
        this.tsControld = ( stat === 0 ) ? 'inactive' : 'active';
        this.abControld = ( stat === 0 ) ? [] : this.fbControld;
        break;
    }
  }

  async ClickBanco(element: any) {
    // const NombreUsuario = this.fromParent.NombreUsuario;
    const element2 = this.fromParent.element;
    if(element.bExport === 1 ) {
      this.nIdBancoFab = element.bancoId;
      this.nIdHistoricoFab = element.nId;
      this.fbControld[0].dis = false;
    } else {
      this.fbControld[0].dis = true;
    }
    if(element.sFileSustento === '' ){
      this.fbControld[1].dis = false;
    } else {
      this.fbControld[1].dis = true;
    }
    this.nIdBancoFab = element.bancoId;
    this.BancoSeleccionado = element.banco;
    this.fgInfoBanco.controls['sUsuario'].setValue(element.sUsuarioDeposito);
    this.fgInfoBanco.controls['sFechaDeposito'].setValue(element.dFechaDeposito);
    this.urlDocumento = element.sFileSustento;
    await this.ListaTrabajadoresBanco(element.bancoId, element2.tipoDepositoId, element2.historicoDepositoId);
    this.stepLeft.next();
  }

  async GetDetalleBancos() {
    const element = this.fromParent.element;
    const historicoDepositoId = element.historicoDepositoId;
    await this.service.GetDetalleBancos(historicoDepositoId).then((response: any) => {
      if (response.status === 200) {
        const datos = response.body.response.data;
        this.lstDetalleBancos = response.body.response.data;
        datos.forEach(x => {
          if (x.dFechaDeposito === '0') {
              x.icon = 1;
          } else {
            x.icon = 2;
          }
        });
        this.BancoDS2 = new MatTableDataSource(datos);
        this.BancoDS2.paginator = this.BancoB;
      }
    });
  }

  CerrarModal() {
    const oReturn = new Object();
    oReturn['modal'] = 'realizarDeposito';
    oReturn['value'] = 'loadAgain';
    this.activeModal.close(oReturn);
  }
    financial( num: any ) {
    return Number.parseFloat(num).toFixed(2);
  }

  SumarFiltrado() {
    this.MontoFiltrado = 0 ;
     this.TrabajadoresDS.filteredData.forEach(
      (detalle) => {
          this.MontoFiltrado += detalle.nImporte;
      });
      this.MontoFiltrado = this.financial(this.MontoFiltrado);
      return this.MontoFiltrado;
  }

  async ListaTrabajadoresBanco(bancoId: any, tipoDepositoId: any, historicoDepositoId: any) {
    this.spi.show('spi_controld');
    this.MontoFiltrado = 0 ;
    let param2Tabla = 0;
    let res;

    await this.service.GetnParamTabla(tipoDepositoId).then((response: any) => {
      if (response.status === 200) {
        res = response.body.response.data;
        param2Tabla = res[0];
      }
    });
    await this.service.DetalleDepositos(param2Tabla, historicoDepositoId).then((response: any) => {
      if (response === undefined) {
        this.TrabajadoresDS = null;
      } else {
        if (response.status === 200) {
          this.lstTrabajadores = response.body.response.data;
          this.lstTrabajadores = this.lstTrabajadores.filter(x => x.bancoId === bancoId );
            this.TrabajadoresDS = new MatTableDataSource(this.lstTrabajadores);
            this.TrabajadoresDS.paginator = this.pagTrabajadores;
        }
      }
      this.spi.hide('spi_controld');
    });
  }

  async InsertarDetalleDeposito(nIdHistDeposito: number , bancoId: number, sFileSustento: string, nIdRegUser: number ) {
    await this.service.InsertDetalleDeposito(nIdHistDeposito, bancoId, sFileSustento, nIdRegUser).then((response: any) => {
      if (response.status === 200) {
        Swal.fire({
          icon: 'success',
          title: 'Registro correcto.',
          text: 'Se registro el sustento correctamente!'
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error al grabar sustento.',
          text: 'Contacte con el administrador!'
        });
      }
    });
  }

  async UpdateHistoricoDeposito(nIdHistDeposito: number , nIdEstado: number ) {
    await this.service.UpdateHistoricoDeposito(nIdHistDeposito, nIdEstado ).then((response: any) => {
      if (response.status === 200) {
        console.log('Actualizado');
      } else {
      }
    });
  }

  zfill(number, width) {
    const numberOutput = Math.abs(number); /* Valor absoluto del número */
    const length = number.toString().length; /* Largo del número */
    const zero = '0'; /* String de cero */
    if (width <= length) {
        if (number < 0) {
             return ('-' + numberOutput.toString());
        } else {
             return numberOutput.toString();
        }
    } else {
        if (number < 0) {
            return ('-' + (zero.repeat(width - length)) + numberOutput.toString());
        } else {
            return ((zero.repeat(width - length)) + numberOutput.toString());
        }
    }
}

async ArmarTxt(nIdBanco: any) {
  const dFechaActual = new Date();
  let nroCuentaXBanco = '';
  let TipoPago = '';
  let xSumNroCuentas = '';
  let detalleTipoBanco = '';
  let cabecera = '';
  let detalle = '';
  let spacios = '';

  if (nIdBanco === 1) {
    nroCuentaXBanco = '1911118288037';
    TipoPago = 'PAGO DE PRUEBA';
    xSumNroCuentas = '011337743558543';
    detalleTipoBanco = 'BCP TELECREDITO';
    cabecera = '1';
    cabecera = cabecera + this.zfill(this.lstTrabajadores.length.toString(), 6);
              cabecera = cabecera + dFechaActual.getFullYear().toString() + this.zfill((dFechaActual.getMonth() + 1), 2).toString()
              + dFechaActual.getDate().toString() + 'XC0001' + nroCuentaXBanco.padEnd(20);
              cabecera = cabecera + this.MontoFiltrado.padStart(17, '0');
              cabecera = cabecera + TipoPago.padEnd(40);
              cabecera = cabecera + xSumNroCuentas + '\n';
              this.lstTrabajadores.forEach(x => {
                detalle += '2A';
                detalle += x.sNroCuenta.padEnd(20);
                detalle += x.nIdTipoDoc + x.nroDocumento.padEnd(15);
                detalle += x.trabajador.toUpperCase().padEnd(75);
                detalle += TipoPago.padEnd(40);
                detalle += detalleTipoBanco.padEnd(20);
                detalle += '0001' + this.financial(x.nImporte).padStart(17, '0') + 'S' + '\n';
              });
  }
  if (nIdBanco === 15) {
    TipoPago = 'PAGO  REMUNERACIONES';
    this.lstTrabajadores.forEach(x => {
      detalle += x.trabajadorId.toString().padStart(8, '0');
      detalle += x.trabajador.toUpperCase().padEnd(30);
      detalle += TipoPago;
      detalle += dFechaActual.getFullYear().toString() + this.zfill((dFechaActual.getMonth() + 1), 2).toString()
      + dFechaActual.getDate().toString();
      detalle += (this.financial(x.nImporte).replace('.', '')).padStart(11, '0');
      detalle += '3';
      detalle += x.sNroCuenta.replace('-', '').substring(0, 10);
      detalle += x.nroDocumento.padEnd(8) + '\n';
    });
  }
  if (nIdBanco === 16) {
    TipoPago = 'HABERES';
    cabecera += '700';
    cabecera += '00110377950100042445';
    cabecera += 'PEN';
    cabecera += (this.MontoFiltrado.replace('.', '')).padStart(15, '0');
    cabecera += 'A';
    cabecera += spacios.padEnd(9);
    cabecera += TipoPago.padEnd(25);
    cabecera += (this.MontoFiltrado.length).toString().padStart(6, '0');
    cabecera += 'S';
    cabecera += spacios.padEnd(68);
    cabecera += '\n';
    this.lstTrabajadores.forEach(x => {
      detalle += '002';
      if (x.nIdTipoDoc === 1) {
        detalle += 'L';
      } else {
        detalle += 'E';
      }
      detalle += x.nroDocumento.padEnd(12);
      detalle += 'P';
      if (x.sNroCuenta.length < 20) {
        detalle += x.sNroCuenta.replace('-', '').padEnd(20, '0');
      } else {
        detalle += x.sNroCuenta.replace('-', '').padEnd(20);
      }
      detalle += x.trabajador.toUpperCase().padEnd(40);
      detalle += (this.financial(x.nImporte).replace('.', '')).padStart(15, '0');
      detalle += spacios.padEnd(40);
      detalle += spacios.padEnd(1);
      detalle += spacios.padEnd(50);
      detalle += spacios.padEnd(2);
      detalle += spacios.padEnd(30);
      detalle += spacios.padEnd(18);
      detalle += '\n';
    });
  }
  return cabecera + detalle;
}

  async clickFab(opc: number, index: number, nIdBancoFab: any) {

    switch (opc) {
      // Fab Main
      // Fab Incentivo ( New 2 )
      case 1:
        switch (index) {
          case 0:
            const dFechaActual = new Date();
            if (this.lstTrabajadores.length > 0 ) {
              const archivotxt = await this.ArmarTxt(nIdBancoFab);
              const NameArchivo = this.BancoSeleccionado + '-' + dFechaActual.getFullYear().toString() + '-' +
              this.zfill((dFechaActual.getMonth() + 1), 2).toString() + '-' +
              dFechaActual.getDate().toString();
              const blob = new Blob([archivotxt], {type: 'text/plain;charset=utf-8'});
              saveAs(blob, NameArchivo + '.txt');
            } else {
              Swal.fire({
                icon: 'error',
                title: 'Lista vacia.',
                text: 'Lista de trabajadores vacia!'
              });
            }
          break;
          case 1:
            Swal.fire({
              title: '¿ Estas seguro de subir el archivo de sustento?',
              text: 'Acción no podrá ser deshecha, por el momento',
              icon: 'question',
              showCancelButton: true,
              confirmButtonColor: '#ff4081',
              confirmButtonText: 'Confirmar !',
              allowOutsideClick: false,
            }).then(async (result) => {
              (function ($) {
                $("#uploadFile").click();
              })(jQuery);
            });
            break;
          case 2:
            this.CerrarModal();
          break;
        }
        break;
    //#endregion
    }
  }

  async uploadFile(event) {
    if (event.target.files[0]) {
      this.spi.show('spi_controld');
      const sDocumento = event.target.files[0];
      const sFile = await this.getStringFromFile(sDocumento);
      const iFile = sFile.indexOf(',') + 1;
      const sFileSustento = sFile.substring(iFile, sFile.length);
      const UploadFile: any = await this.service._uploadFile(
        sFileSustento,
        8,
        'documento',
        'application/pdf'
      );
      const bancoId = this.nIdBancoFab;
      const nIdHistorico = this.nIdHistoricoFab;
      const user = localStorage.getItem('currentUser');
      const uid = JSON.parse(window.atob(user.split('.')[1])).uid;
      await this.InsertarDetalleDeposito(nIdHistorico, bancoId, UploadFile.fileUrl, uid);
      this.urlDocumento = UploadFile.fileUrl;
      this.fbControld[1].dis = true;
      await this.GetDetalleBancos();
      await this.actualizarEstadoTablaHistorica();
      const elemento = this.lstDetalleBancos.filter(x => x.nId === nIdHistorico && x.bancoId === bancoId);
      this.fgInfoBanco.controls['sUsuario'].setValue(elemento[0].sUsuarioDeposito);
      this.fgInfoBanco.controls['sFechaDeposito'].setValue(elemento[0].dFechaDeposito);
      this.spi.hide('spi_controld');
    }
  }

  async actualizarEstadoTablaHistorica() {
    const Total = this.lstDetalleBancos.filter(x => x.bExport === 1).length;
    let actual = 0;
    this.lstDetalleBancos.filter(x => x.bExport === 1).forEach(a => {
      if (a.sFileSustento !== '') {
        actual += 1;
      }
    });

    if (Total === actual) {
      this.UpdateHistoricoDeposito(this.nIdHistoricoFab, 2358);
      console.log('Completado');
    } else {
      this.UpdateHistoricoDeposito(this.nIdHistoricoFab, 2357)
      console.log('En proceso');
    }

  }

  async getStringFromFile(fSustento: File) {
    return new Promise<any>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(fSustento);
      reader.onload = () => {
        resolve(reader.result);
      };
    });
  }


}
