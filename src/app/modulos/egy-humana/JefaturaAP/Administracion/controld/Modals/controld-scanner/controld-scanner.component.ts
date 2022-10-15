import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatAccordion, MatExpansionPanel } from '@angular/material/expansion';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { nsDigid } from '../../../../Model/Idigid';
import { adminpAnimations } from '../../../../Animations/adminp.animations';
import { ControldService } from '../../../../Services/controld.service';
import * as moment from 'moment';
import Swal from 'sweetalert2';

import { WebTwain } from 'dwt/dist/types/WebTwain';
import Dynamsoft from 'dwt';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { DeviceConfiguration } from 'dwt/dist/types/WebTwain.Acquire';
import { RuntimeSettings, TextResults, TextResult } from 'dwt/dist/types/Addon.BarcodeReader';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ErrorStateMatcher } from '@angular/material/core';
import { ValidadoresService } from '../../../../Validators/validadores.service';

function between(x: number, min: number, max: number) {
  return x >= min && x <= max;
}

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null): boolean {
    return !!(control && control.invalid);
  }
}
@Component({
  selector: 'app-controld-scanner',
  templateUrl: './controld-scanner.component.html',
  styleUrls: ['./controld-scanner.component.css'],
  providers: [ControldService],
  animations: [ adminpAnimations ]
})


export class ControldScannerComponent implements OnInit {

  //#region Variables
  minCuota: 1;
  matcher = new MyErrorStateMatcher();
  // Progress Bar
  pbScanner: boolean;

  // Fab
  fbScan_1 = [
    {icon: 'scanner', tool: 'Iniciar', badge: 0, dis: true}
  ];
  fbScan_2 = [
    {icon: 'save', tool: 'Guardar', badge: 0, dis: false},
    {icon: 'fast_forward', tool: 'Siguiente página', badge: 0, dis: true},
    {icon: 'fast_rewind', tool: 'Página anterior', badge: 0, dis: true},
    {icon: 'report_gmailerrorred', tool: 'Páginas no leídas', badge: 0, dis: true},
    {icon: 'cleaning_services', tool: 'Limpiar', badge: 0, dis: false}
  ];

  abScanner = [];
  tsScanner = 'inactive';
  toggleScanner = 1;

  // FormGroup
  fgInfoScan: FormGroup;
  fgInfoDoc: FormGroup;

  // Expansion panel
  disabled_Documento = true;
  @ViewChild('maMain', {static: true}) maMain: MatAccordion;
  @ViewChild('mep_documento') mep_documento: MatExpansionPanel;

  // Url
  urlDocumento = '';

  // Combobox
  cboDevice = new Array();
  cboAccion = new Array();
  // Array
  aDataPersonal = [];
  aDataDocument = [];
  aDataDocPer = [];
  aSelectIndex: number[] = [];

  // Scanner
  PrintScanner: nsDigid.Dispositvo[];

  barcodeResults = [];
  indexDevice: number;
  public scanOptions = {
    IfShowUI: false,
    PixelType: Dynamsoft.EnumDWT_PixelType.TWPT_BW, // "black and white"
    Resolution: 300,
    IfFeederEnabled: true,
    IfDuplexEnabled: true,
    IfDisableSourceAfterAcquire: false,
    IfGetImageInfo: false,
    IfGetExtImageInfo: false,
    extendedImageInfoQueryLevel: 0
  };

  //#endregion


  //#region Dynamsoft
  DWObject: WebTwain;
  containerId = 'dwtcontrolContainer';

  //#endregion

  constructor(public activeModal: NgbActiveModal, private spi: NgxSpinnerService,
    private fb: FormBuilder, private service: ControldService, private valid: ValidadoresService,
    private _snackBar: MatSnackBar) {
      this.new_fgInfoScan();
      this.new_fgInfoDoc();

    }


  async ngOnInit(): Promise<void> {
    this.spi.show('spi_scanner');
    Dynamsoft.WebTwainEnv.Containers = [{ WebTwainId: 'dwtObject', ContainerId: this.containerId, Width: '100%', Height: '400px' }];
    Dynamsoft.WebTwainEnv.RegisterEvent('OnWebTwainReady', () => { this.Dynamsoft_OnReady(); });
    Dynamsoft.WebTwainEnv.ProductKey = 't0068UwAAAFlcBdnAYu4KjAA1gOrNMfmMdv6z1fnkZmz9ievinopKRAd8XcZJuwRCllNbQpUxqIziL5jb/DeeXZnGsi/L/hI=';
    Dynamsoft.WebTwainEnv.ResourcesPath = '../../../assets/dwt-resources';

    const checkScript = () => {
      if (Dynamsoft.Lib.detect.scriptLoaded) {
        Dynamsoft.WebTwainEnv.Load();
      } else {
        setTimeout(() => checkScript(), 100);
      }
    };
    checkScript();

    await this.cboGetAccion();

    this.onToggleFab(1, 1);
  }
  //#region Scanner

  Dynamsoft_OnReady(): void {
    this.DWObject = Dynamsoft.WebTwainEnv.GetWebTwain(this.containerId);
    this.DWObject.Viewer.singlePageMode = true;
    this.DWObject.Viewer.cursor = 'default';

    const sources = this.DWObject.GetSourceNames();
    this.cboDevice = sources;
    this.spi.hide('spi_scanner');
  }

  handleDevice(indexDevice: number) {
    if ( indexDevice !== undefined ) {
      this.DWObject.SelectSourceByIndex(indexDevice);
      this.indexDevice = indexDevice;
      this.fbScan_1[0].dis = false;
    } else {
      this.fbScan_1[0].dis = true;
    }
  }

  acquireDevice(config: DeviceConfiguration): Promise<any> {
    return new Promise((res, rej) => {

      this.DWObject.SetOpenSourceTimeout(3000);

      if (this.DWObject.OpenSource()) {
        this.DWObject.AcquireImage(<DeviceConfiguration> config, () => {
          this.DWObject.CloseSource();
          this.DWObject.CloseWorkingProcess();
          res(true);
        }, (errCode, errString) => {
          rej(errCode);
        });
      } else {
        rej(this.DWObject.ErrorCode);
      }
    });
  }

  readBarcodes(imageIndex: number): Promise<any> {
    return new Promise((res, rej) => {

      const self = this;

      this.DWObject.Addon.BarcodeReader.getRuntimeSettings()
        .then(function(runtimeSettings: RuntimeSettings) {
          runtimeSettings.expectedBarcodesCount = 1;
          runtimeSettings.barcodeFormatIds = Dynamsoft.EnumBarcodeFormat.BF_QR_CODE;
          return self.DWObject.Addon.BarcodeReader.updateRuntimeSettings(runtimeSettings);
        }, function(error) {
          rej(error);
        })
        .then(function(runtimeSettings) {
          Dynamsoft.WebTwainEnv.OnWebTwainPostExecute();
          self.DWObject.Addon.BarcodeReader.decode(imageIndex)
          .then(function(value: TextResults) {

            if (value.length === 0) {
              self.barcodeResults.push({
                group: 0,
                index: imageIndex,
                code: '',
                valid: true,
                filter: 0,
                option: 0,
                id: 0
              });
            } else {
              for (let i = 0; i < value.length; i++) {
                const val = value[i] as TextResult;
                self.barcodeResults.push({
                  group: 0,
                  index: imageIndex,
                  code: val.barcodeText,
                  valid: true,
                  filter: 0,
                  option: 0,
                  id: 0
                });
              }
            }
            res(true);

          }, function(error) {
            Dynamsoft.WebTwainEnv.OnWebTwainPostExecute();
            rej(error);
          });
        }, function(error) {
          rej(error);
        });

    });

  }

  groupResults(aResult: Array<any>) {

    let nGroup = 1;

    aResult.forEach( (x: any, index: number) => {
      const aCode = aResult[index].code as string;
      if ( aCode !== '' ) {
        const nPag = Number(aCode.split('|')[2]);

        let iSave: number;
        for (let i = index; i < (index + nPag); i++) {
          aResult[i].group = nGroup;
          iSave = i;
        }

        // Es impar
        // if ( Math.abs(nPag % 2) === 1 ) {
        //   aResult[iSave + 1].group = -1;
        // }

        nGroup = nGroup + 1;
      }
    });
  }

  async getDataResults(aResult: Array<any>) {

    let nIdAuthDesc_ = '';
    let length_ = 0;
    aResult.forEach( (x: any, index: number) => {
      const aCode = aResult[index].code as string;
      if ( aCode !== '' ) {
        length_ = aResult.length;
        const nIdAuthDesc = aCode.split('|')[1];
        if ( nIdAuthDesc_.includes(nIdAuthDesc) === false ) {
          nIdAuthDesc_ = nIdAuthDesc_ + nIdAuthDesc + ',';
        }
      }
    });
    nIdAuthDesc_ = (nIdAuthDesc_.length > 0 ) ?  nIdAuthDesc_.substring(0, nIdAuthDesc_.length - 1) : '';

    if ( nIdAuthDesc_.length > 0 ) {

      const param = [];
      param.push('0¡ta.nIdAuthDesc!' + nIdAuthDesc_ );

      await this.service._loadSP( 7, param, '').then( (value: any[]) => {
        // Object.values ( value ).forEach( (lista: any) => {
          this.aDataPersonal = value;
        // });
      });

    }

  }

  validResults(aResult: Array<any>) {
    aResult.forEach( x => {

      const nGroup = x.group;
      const aCode = x.code as string;

      if ( aCode !== '' ) {

        const nIdPersonal = aCode.split('|')[1];
        const iPersonal = this.aDataPersonal.findIndex( z => z.nIdPersonal === Number(nIdPersonal) );
        const nIdPerLab = this.aDataPersonal[iPersonal].nIdPerLab;

        const nIdDocumento = aCode.split('|')[0];

        const sFechIni = aCode.split('|')[3] as string;
        const aFechIni = sFechIni.split('/');
        const nFechIni = Number(aFechIni[2] + aFechIni[1] + aFechIni[0]);

        const sFechFin = aCode.split('|')[4] as string;
        const aFechFin = sFechFin.split('/');
        const nFechFin = Number(aFechFin[2] + aFechFin[1] + aFechFin[0]);

        let nSame = 0;

        const aFilter = this.aDataDocPer.filter( y => {
          const a = y.nIdPerLab === nIdPerLab;
          const b = y.nIdDocumento === Number(nIdDocumento);
          return a && b;
        });

        if ( aFilter.length > 0 ) {

          const iData = aFilter.findIndex( y => {

            const dNewIni = moment(y.dFechIni);
            const nNewIni = Number(dNewIni.format('YYYYMMDD'));

            const dNewFin = moment(y.dFechFin);
            const nNewFin = Number(dNewFin.format('YYYYMMDD'));

            nSame = ( nNewIni === nFechIni && nNewFin === nFechFin ) ? 1 : 0;

            const a = between( nNewIni, nFechIni, nFechFin );
            const b = between( nNewFin, nFechIni, nFechFin );
            const c = between( nFechIni, nNewIni, nNewFin );
            const d = between( nFechFin, nNewIni, nNewFin );

            return ( ( a || b || c || d ) ) ? true : false;

          });

          if ( iData > -1 ) {
            x.valid = false;
            x.filter = nSame;
            x.id = aFilter[iData].nIdPLD;
          }

        }

      }

    });
  }

  handleDocument(iDoc: number) {
    const aFind = this.barcodeResults.find( x => x.index === iDoc );

    const nGroup = ( aFind !== undefined ) ? aFind.group : -1;
    const fg_nGroup = this.fgInfoDoc.controls['nGroup'].value;
    if (nGroup > -1) {

      const aFilter = this.barcodeResults.filter( x => x.group === nGroup );
      const nTotalPag = aFilter.length;
      const nPag = aFilter.findIndex( x => x.index === iDoc ) + 1;
      const sPag = 'Página ' + nPag.toString() + ' de ' + nTotalPag.toString();
      this.fgInfoDoc.controls['sPag'].setValue(sPag);

      const aCode = aFind.code as string;
      if ( aCode !== '' ) {

        const nIdAuthDesc = aCode.split('|')[1];

        if (fg_nGroup !== nGroup) {
          const iDocument = this.aDataPersonal.findIndex( x => x.nIdAuthDesc === Number(nIdAuthDesc) );

          let valid;
          if (this.aDataPersonal[iDocument].sCantDesc > 0) {
              valid = false;
          } else {
            valid = true;
          }
          this.fgInfoDoc.patchValue({
            nGroup: nGroup,
            nIdPersonal: this.aDataPersonal[iDocument].nIdPersonal,
            nIdAuthDesc: this.aDataPersonal[iDocument].nIdAuthDesc,
            nombre_personal: this.aDataPersonal[iDocument].nombre_personal,
            direccion: this.aDataPersonal[iDocument].direccion,
            area: this.aDataPersonal[iDocument].area,
            motivo: this.aDataPersonal[iDocument].motivo,
            nImporte: this.aDataPersonal[iDocument].nImporte,
            Plla: this.aDataPersonal[iDocument].sCodPlla + ' ' + this.aDataPersonal[iDocument].sDesc ,
            sPag: sPag,
            bValid: valid,
            nFilter: this.aDataPersonal[iDocument].canT_DOC,
            nOption: 0,
            sFile: this.aDataPersonal[iDocument].sFile,
            nIdDescuento: this.aDataPersonal[iDocument].nIdDescuento,
          });
        }

      }

    } else {
      this.fgInfoDoc.reset();
      this.fgInfoDoc.patchValue({
        nGroup: 0,
        sPag: 'Página en blanco'
      });
    }
  }

  async saveDocument(aGroup: Array<any>) {

    this.spi.show('spi_scanner');

    const aResult = new Array();

    for (let index = 0; index < aGroup.length; index++) {
      const element = aGroup[index];

      if ( element > 0 ) {
        const aFilter = this.barcodeResults.filter( y => y.group === element );

        const aFind = this.barcodeResults.find( y => {
          const a = y.group === element;
          const b = y.code !== '';
          return a && b;
        });

        const aCode = aFind.code;
        const bValid = aFind.valid;
        const nOption = aFind.option;
        const nId = aFind.id;

        if ( bValid === true ) {

          this.DWObject.SelectImages([]);

          const sIndex = [];
          aFilter.forEach( z => {
            sIndex.push(z.index);
          });

          const nIdDocumento = aCode.split('|')[0];
          const nIdAuthDesc = aCode.split('|')[1];
          const iPersonal = this.aDataPersonal.findIndex( z => z.nIdAuthDesc === Number(nIdAuthDesc) );
          const nIdDescuento = this.aDataPersonal[iPersonal].nIdDescuento;
          const nIdPersonal = this.aDataPersonal[iPersonal].nIdPersonal;
          const sDescripcion = this.aDataPersonal[iPersonal].motivo;
          const dFechIni = this.fgInfoDoc.controls['sFecha'].value;
          const nImporte = this.aDataPersonal[iPersonal].nImporte;
          const nCuota = this.fgInfoDoc.controls['sCuotas'].value;
          let sFilep = this.aDataPersonal[iPersonal].sFile;



          let UploadFile: any;

          await this.saveBase64(sIndex).then( async (base64String: string) => {
            const iFile = base64String.indexOf(',') + 1;
            const sFile = base64String.substring(iFile, base64String.length);
            UploadFile = await this.service._uploadFile(sFile, 8, 'documento', 'application/pdf');
          }, err => console.log(err));

          const param = [];
//#region  case
          let pOpcion = 0;

          switch (nOption) {
            // Nuevo
            case 0:
              pOpcion = 4;
              break;

              // Actualizar
            case 2282:
              pOpcion = 5;
              break;
            // Reemplazar
            case 2283:
              pOpcion = 6;
              break;

          }
//#endregion
          const user = localStorage.getItem('currentUser');
          const uid = JSON.parse(window.atob(user.split('.')[1])).uid;

          // nOption : 0 > Nuevo
          // nOption : 2284 > Adicionar
          // nOption : 2283 > Reemplazar
          if ( nOption === 0  ) {
            const fechaparam = moment(dFechIni).format('DD/MM/YYYY');
            param.push('T1¡nIdPersonal!' + nIdPersonal);
            param.push('T1¡nIdAuthDesc!' + nIdAuthDesc);
            param.push('T1¡sDescripcion!' + sDescripcion);
            param.push('T1¡dFechIni!' +  dFechIni);
            param.push('T1¡nImporte!' + nImporte);
            param.push('T1¡nCuota!' + nCuota);
            param.push('T1¡bEstado!' + 1);


            param.push('T1¡nIdRegUser!' + uid);
            param.push('T1¡dtReg!GETDATE()');
            param.push('T1¡sFile!' + UploadFile.fileUrl);

            param.push('W2¡nIdAuthDesc!' + nIdAuthDesc);
            param.push('S2¡bEstado!1');
          }

           // nOption : 2282 > Actualizar
           if (nOption === 2282) {
            param.push('T1¡nIdDescuento!' + nIdDescuento);
            param.push('T1¡nIdModUser!' + uid);
            param.push('T1¡dtMod!GETDATE()');
            param.push('T1¡sFile!' + UploadFile.fileUrl);

          }

          // nOption : 2283 > Reemplazar
          if (nOption === 2283) {
            param.push('T1¡nIdPersonal!' + nIdPersonal);
            param.push('T1¡nIdAuthDesc!' + nIdAuthDesc);
            param.push('T1¡sDescripcion!' + sDescripcion);
            param.push('T1¡dFechIni!' +  dFechIni);
            param.push('T1¡nImporte!' + nImporte);
            param.push('T1¡nCuota!' + nCuota);
            param.push('T1¡bEstado!' + 1);
            param.push('T1¡nIdRegUser!' + uid);
            param.push('T1¡dtReg!GETDATE()');
            param.push('T1¡sFile!' + UploadFile.fileUrl);

            param.push('T2¡nIdDescuento!' + nIdDescuento);
          }

          const result = await this.service._crudCD( pOpcion, param);
          // const result = await this.service._crudDD( pOpcion, param);

          Object.keys( result ).forEach ( valor => {
            aResult.push(result[valor]);
          });

          // Eliminar archivo anterior
          // nOption : 2283 > Reemplazar
          // nOption : 2282 > Actualizar
          if (nOption === 2283 || nOption === 2282) {
            // let sDocumento = this.aDataDocPer.find( x => x.nIdPLD === nId ).sDocumento;
            sFilep = sFilep.split('/')[4];
            await this.service._deleteFile(sFilep, 'application/pdf', 8);
          }

        }
      }
    }

    this.spi.hide('spi_scanner');

    if (aResult.length > 0) {

      Swal.fire({
        title: '¿ Continuar digitalizando documentos  ?',
        text: 'Documentos digitalizados correctamente.',
        icon: 'question',
        showCancelButton: true,
        cancelButtonText: 'No',
        confirmButtonColor: '#ff4081',
        confirmButtonText: 'Si, continuar!',
        allowOutsideClick: false
      }).then((result) => {
        if (result.isConfirmed) {
          this.clickFab(2, 4);
        } else {
          this.activeModal.dismiss();
        }
      });

    }
 }

  saveLocal(indices: number[], index: number): Promise<any> {
    return new Promise((res, rej) => {

      this.DWObject.SelectImages(indices);

      const saveInner = (_path): Promise<any> => {
        return new Promise((_res, _rej) => {
          const s = () => {
            res({ path: _path });
          }, f = (errCode, errStr) => rej(errStr);
          this.DWObject.SaveSelectedImagesAsMultiPagePDF(_path, s, f );
        });
      };

      this.DWObject.IfShowFileDialog = false;
      const filePath = 'C:\\Users\\afloresv.LUCKYSAC\\Desktop\\save\\grupo_' + index.toString() + '.pdf';
      res(saveInner(filePath));

    });
  }

  saveBlob(indices: number[]): Promise<any> {
    return new Promise((res, rej) => {
      this.DWObject.SelectImages(indices);
      this.DWObject.ConvertToBlob(indices, 4, (result, _indices, type) => {
        res(result);
      }, (errCode, errString) => {
        rej(errString);
      });
    });
  }

  saveBase64(indices: number[]): Promise<any> {
    return new Promise((res, rej) => {
      this.DWObject.SelectImages(indices);
      this.DWObject.ConvertToBase64(indices, 4, (result, _indices, type) => {
        const _result = result.getData(0, result.getLength());
        res('data:application/pdf;base64,' + _result);
      }, (errCode, errString) => {
        rej(errString);
      });
    });
  }

  //#endregion

  //#region General

  onToggleFab(fab: number, stat: number) {
    switch (fab) {
      case 1:
        stat = ( stat === -1 ) ? ( this.abScanner.length > 0 ) ? 0 : 1 : stat;
        this.tsScanner = ( stat === 0 ) ? 'inactive' : 'active';
        this.abScanner = ( stat === 0 ) ? [] : this.fbScan_1;
        break;

      case 2:
        stat = ( stat === -1 ) ? ( this.abScanner.length > 0 ) ? 0 : 1 : stat;
        this.tsScanner = ( stat === 0 ) ? 'inactive' : 'active';
        this.abScanner = ( stat === 0 ) ? [] : this.fbScan_2;
        break;
    }
  }

  async clickFab(opc: number, index: number) {

    let nCant = 0;
    let nActive = 0;

    switch (opc) {

      case 1:

        switch (index) {
          case 0:
            // this.doScan(0);
            this.spi.show('spi_scanner');

            await this.acquireDevice(this.scanOptions).then(async _ => {

              this.DWObject.Viewer.first();
              this.DWObject.Viewer.fitWindow('width');
              this.DWObject.Viewer.zoom = 0.25;

              this.fgInfoScan.controls['sDispositivo'].disable();

              nCant = this.DWObject.HowManyImagesInBuffer;

              // Leer código QR
              for (let i = 0; i <= nCant - 1; i++) {
                await this.readBarcodes(i);
              }

              // Agrupar resultados
              this.groupResults(this.barcodeResults);

              // Obtener información
              await this.getDataResults(this.barcodeResults);

              // Validar información
              // this.validResults(this.barcodeResults);

              nActive = this.DWObject.CurrentImageIndexInBuffer;

              this.handleDocument(nActive);

              const aButton = this.barcodeResults.filter( x => x.code !== '' );
              if (aButton.length === 0) {
                this.fbScan_2[0].dis = true;
              }

              this.spi.hide('spi_scanner');

              this.disabled_Documento = false;
              this.mep_documento.open();

              if ( nCant - 1 > nActive ) {
                this.fbScan_2[1].dis = false;
              }

              this.abScanner = [];
              this.delay(250).then(any => {
                this.abScanner = this.fbScan_2;
                this.tsScanner = 'active';
              });

              this.toggleScanner = 2;
            }, err => {
              this.spi.hide('spi_scanner');

              this.DWObject.SelectSourceByIndex(-1);
              this.handleDevice(this.indexDevice);

              this._snackBar.open('Intentelo nuevamente en unos segundos.', 'Cerrar', {
                horizontalPosition: 'right',
                verticalPosition: 'top',
                duration: 2500
              });
            });
            break;
        }

        break;

      case 2:

        nCant = this.DWObject.HowManyImagesInBuffer;
        nActive = this.DWObject.CurrentImageIndexInBuffer;

        switch (index) {

          // Guardar
          case 0:
            if (this.fgInfoDoc.invalid) {
              Swal.fire(
                'No se puede guardar',
                'Por favor, verificar que todos los campos se encuentren correctamente ingresados.',
                'error'
              );
              // this.pbRenuncia = false;
              return;
            }
            const aGroup = [];
            this.barcodeResults.forEach( x => {
              const nGroup = x.group;
              const bValid = x.valid;

              if ( nGroup > 0 && bValid === true ) {
                const iGroup = aGroup.findIndex( y => y === nGroup);
                if ( iGroup === -1 ) {
                  aGroup.push(nGroup);
                }
              }

            });

            if (aGroup.length > 0 ) {

              Swal.fire({
                title: '¿ Estas seguro de guardar los documentos escaneados ?',
                text: 'Documentos a digitalizar : ' + aGroup.length + ', se omitirán los documentos inválidos.',
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#ff4081',
                confirmButtonText: 'Confirmar !',
                allowOutsideClick: false
              }).then((result) => {
                if (result.isConfirmed) {
                  this.saveDocument(aGroup);
                  return;
                }
              });

            } else {
              this._snackBar.open('Sin documentos válidos a registrar.', 'Cerrar', {
                horizontalPosition: 'right',
                verticalPosition: 'top',
                duration: 2500
              });
            }
            break;

          // Siguiente página
          case 1:

            if ( nCant - 1 === nActive + 1 ) {
              this.fbScan_2[1].dis = true;
            }
            this.fbScan_2[2].dis = false;

            this.DWObject.Viewer.next();
            this.handleDocument(this.DWObject.CurrentImageIndexInBuffer);
            break;

          // Página anterior
          case 2:

            if ( nActive - 1 === 0 ) {
              this.fbScan_2[2].dis = true;
            }
            this.fbScan_2[1].dis = false;

            this.DWObject.Viewer.previous();
            this.handleDocument(this.DWObject.CurrentImageIndexInBuffer);
            break;

          // Páginas no leidas
          case 3:
            break;

          // Limpiar
          case 4:
            this.DWObject.RemoveAllImages();
            this.fgInfoScan.controls['sDispositivo'].enable();

            this.DWObject.SelectSourceByIndex(-1);

            this.handleDevice(this.indexDevice);

            this.barcodeResults = [];

            this.abScanner = [];
            this.delay(250).then(any => {
              this.abScanner = this.fbScan_1;
              this.tsScanner = 'active';
            });

            this.fgInfoDoc.reset();
            this.mep_documento.close();
            this.disabled_Documento = true;

            this.aDataPersonal = [];
            this.aDataDocument = [];
            this.aDataDocPer = [];

            this.toggleScanner = 1;
            break;
        }

        break;

    }

  }

  async delay(ms: number) {
    await new Promise<void>(resolve => setTimeout(() => resolve(), ms)).then();
  }

  //#endregion

  //#region FormGroup

  new_fgInfoScan() {
    this.fgInfoScan = this.fb.group({
      sDispositivo: [{ value: '', disabled: false }]
    });
  }



  new_fgInfoDoc() {
    const today = new Date();

    // const fechaActual = today.getFullYear() + '-' + (today.getMonth() + 1 ) + '-' + today.getDate() + 'T00:00:00';
    const fechaActual = moment(today).format('YYYY-MM-DD') + 'T00:00:00';
    // 2020-10-4T00:00:00
    this.fgInfoDoc = this.fb.group({
      nGroup: [{ value: 0}],
      nIdPersonal: [{ value: 0}],
      nIdAuthDesc: [{ value: '', disabled: true }],
      nombre_personal: [{ value: 0}],
      direccion: [{ value: '', disabled: true }],
      area: [{ value: '', disabled: true }],
      motivo: [{ value: '', disabled: true }],
      nImporte: [{ value: '', disabled: true }],
      Plla: [{ value: '', disabled: true }],
      sCuotas: [{ value: 0, disabled: false }, [Validators.required , this.valid.vMonto  ]] ,
      sFecha: [{ value: fechaActual , disabled: false }],
      sPag: [{ value: '', disabled: true }],
      bValid: [{ value: true }],
      nFilter: [{ value: 0}],
      nOption: [{ value: 0}],
      sFile: [{ value: '' }],
      nIdDescuento: [{ value: 0}],
    });
  }

  get getInfoScan() { return this.fgInfoScan.controls; }
  get getDeviceName() {
    let sDevice = '';

    const index = this.getInfoScan.sDispositivo.value;
    if ( index !== undefined && index !== null ) {
      sDevice = this.cboDevice[index];
    }

    return sDevice;
  }

  get getInfoDoc() { return this.fgInfoDoc.controls; }

  //#endregion

  //#region Combobox

  async cboGetAccion () {
    const param = [];
    param.push('0¡nEleCodDad!2281');
    param.push('0¡bStatus!1');

    await this.service._loadSPDoc( 8, param).then( (value: any[]) => {
      this.cboAccion = value;
    });
    // this.cboAccion[0].sParam = 0 ;
    this.cboAccion.splice(2, 1 );

  }

  filterAccion(array: Array<any>): Array<any> {
    const nFilter = this.fgInfoDoc.controls['nFilter'].value;
    const aFilter = array.filter( x => Number(x.sParam) === nFilter );
    return aFilter;
  }

  changeAccion(nEleCod: number) {
    const nGroup = this.fgInfoDoc.controls['nGroup'].value;
    const aFind = this.barcodeResults.find( x => {
      const a = x.group === nGroup;
      const b = x.code !== '';
      return a && b;
    });

    aFind.option = ( nEleCod === undefined ) ? 0 : nEleCod;
    aFind.valid = ( nEleCod === undefined ) ? false : true;
  }

  //#endregion

}
