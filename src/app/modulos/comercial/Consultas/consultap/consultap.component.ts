import { Component, Inject, OnInit, SecurityContext, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { consultapAnimations } from './consultap.animations';
import { SearchPerson } from '../../Models/Iconsultap';
import { ConsultapService } from './consultap.service';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { AppDateAdapter, APP_DATE_FORMATS } from './../../../../shared/services/AppDateAdapter';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { NgxSpinnerService } from 'ngx-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
// import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import printJS from 'print-js';

// Utilizar javascript [1]
declare var jQuery: any;

@Component({
  selector: 'app-consultap',
  templateUrl: './consultap.component.html',
  styleUrls: ['./consultap.component.css', 'consultap.component.scss'],
  providers: [ ConsultapService,
    {provide: DateAdapter, useClass: AppDateAdapter},
    {provide: MAT_DATE_FORMATS , useValue: APP_DATE_FORMATS} ],
  animations: [ consultapAnimations ]
})
export class ConsultapComponent implements OnInit {

  //#region Variables
  //#region declaracion variable del sistema
  idUser:number; 
  Empresa:string;
  valor:string;
  divDocuments:boolean;
  //#endregion 

  // Service GET && POST
  url: string;
  aParam = [];

  // Animaciones Tada
  tadaMain = 'inactive';

  // Fab
  fbMain = [
    {icon: 'person_search', tool: 'Buscar personal'}
  ];
  abMain = [];
  tsMain = 'inactive';

  // Progress Bar
  pbMain: boolean;
  pbSearch: boolean;

  @ViewChild(MatSort, {static: true}) tableSort: MatSort;

  searchDC: string[] = [ 'action', 'sNombres', 'sCodPlla', 'sTipo', 'sDocumento' ];
  searchDS: MatTableDataSource<SearchPerson> = new MatTableDataSource([]);
  @ViewChild('searchP', {static: true}) searchP: MatPaginator;

  fcNombres = new FormControl('Datos personales');
  fcIdentidad = new FormControl('Identidad');
  fgInfo: FormGroup;
  fgLab: FormGroup;
  fgOrg: FormGroup;
  fgCont: FormGroup;

  fgSearch: FormGroup;

  tabLab = new FormControl(0);
  aDocuments = new Array();
  aDocPerso = new Array();

  disListDoc = true;

  // iFrame
  // iframe_url: any;

  //#endregion

  constructor(public service: ConsultapService, @Inject('BASE_URL') baseUrl: string,
              private fb: FormBuilder, private spi: NgxSpinnerService,
              private _snackBar: MatSnackBar) {

    const user = localStorage.getItem('currentUser');
    this.idUser = JSON.parse(window.atob(user.split('.')[1])).uid;  
    this.Empresa = localStorage.getItem('Empresa');
    // SERVICE GET && POST
    this.url = baseUrl;

    this.new_fgInfo();
    this.new_fgLab();
    this.new_fgOrg();
    this.new_fgCont();
    this.new_fgSearch();
  }

  async ngOnInit(): Promise<void> {

    this.spi.show('spi_main');

    await this.listDocuments();
    await this.ViewUser(5);

    this.spi.hide('spi_main');
    this.animate(1);
  }

  //#region FormGroup

  new_fgInfo() {
    this.fgInfo = this.fb.group({
      nIdPersonal: 0,
      nIdPerLab: 0,
      nIdTipoDoc: 0,
      cEntNamSecond: [{ value: '', disabled: true }],
      cEntNamThird: [{ value: '', disabled: true }],
      cEntNamFourth: [{ value: '', disabled: true }],
      sDireccion: [{ value: '', disabled: true }],
      sReferencia: [{ value: '', disabled: true }],
      sBanco: [{ value: '', disabled: true }],
      sNroCuenta: [{ value: '', disabled: true }],
      nPerCod: 0
    });
  }

  new_fgLab() {
    this.fgLab = this.fb.group({
      nIdPlla: 0,
      sPlanilla: [{ value: '', disabled: true }],
      dFechIng: [{ value: null, disabled: true }],
      sResp: [{ value: '', disabled: true }],
      dFechIniCont: [{ value: null, disabled: true }],
      dFechFinCont: [{ value: null, disabled: true }]
    });
  }

  new_fgOrg() {
    this.fgOrg = this.fb.group({
      sCamp: [{ value: '', disabled: true }],
      sCli: [{ value: '', disabled: true }],
      sCanal: [{ value: '', disabled: true }]
    });
  }

  new_fgCont() {
    this.fgCont = this.fb.group({
      sNumPer: [{ value: '', disabled: true }],
      sNumEmp: [{ value: '', disabled: true }],
      sMailPer: [{ value: '', disabled: true }],
      sMailEmp: [{ value: '', disabled: true }]
    });
  }

  new_fgSearch() {
    this.fgSearch = this.fb.group({
      sNombres: ''
    });

    this.fgSearch.valueChanges.subscribe( value => {
      const filter = {...value, name: value.sNombres.trim().toLowerCase()} as string;
      this.searchDS.filter = filter;

      if (this.searchDS.paginator) {
        this.searchDS.paginator.firstPage();
      }
    });
  }

  get getSearch() { return this.fgSearch.controls; }

  //#endregion

  //#region General

  onToggleFab(fab: number, stat: number) {
    switch (fab) {
      case 1:
        stat = ( stat === -1 ) ? ( this.abMain.length > 0 ) ? 0 : 1 : stat;
        this.tsMain = ( stat === 0 ) ? 'inactive' : 'active';
        this.abMain = ( stat === 0 ) ? [] : this.fbMain;
        break;
    }
  }

  async clickFab(opc: number, index: number) {
    switch (opc) {
      case 1:
        const param = [];
        if(this.valor === '1'){
          param.push('2¡sCodPlla!0'); 
          this.divDocuments = false; 
        }
        else{
          param.push('1¡sCodPlla!2,3,5'); 
          this.divDocuments = true; 
        }

        await this.service._loadSP( 1, param, this.url).then( (value: SearchPerson[]) => {

          this.searchDS = new MatTableDataSource(value);
          this.searchDS.paginator = this.searchP;
          this.searchDS.sort = this.tableSort;
          this.searchDS.filterPredicate = function(data: SearchPerson, filter: string): boolean {
            return data.sNombres.trim().toLowerCase().includes(filter) || data.sDocumento.trim().toLowerCase().includes(filter);
          };

          this.searchDS.filterPredicate = ((data: SearchPerson, filter: SearchPerson ) => {
            // tslint:disable-next-line: max-line-length
            const a = !filter.sNombres || ( data.sNombres.toLowerCase().includes(filter.sNombres.toLowerCase()) || data.sDocumento.toLowerCase().includes(filter.sNombres.toLowerCase()) );
            return a;
          }) as (PeriodicElement, string) => boolean;

          this.fgSearch.controls['sNombres'].setValue('');

          ( function($) {
            $('#ModalSearch').modal('show');
          })(jQuery);
        });
        break;
    }
  }

  selectTab(opc: number) {
    const value = this.tabLab.value;
    switch (opc) {
      case 0:
        this.tabLab.setValue( ( value === 0 ) ? 0 : value - 1 );
        break;

      case 1:
        this.tabLab.setValue( ( value === 3 ) ? 3 : value + 1 );
        break;
    }
  }

  //#endregion

  //#region Load

  async listDocuments() {

    const param = [];
    await this.service._loadSP( 3, param, this.url).then( (value: Array<any>) => {
      value.forEach( x => {
        this.aDocuments.push({
          sCategoria: x.sCategoria,
          nId: x.nId,
          sDesc: x.sDesc,
          nStat: 1,
          dis: true,
        });
      });
    });
  }

  async selectPerson(item: SearchPerson) {

    this.pbSearch = true;

    this.fgInfo.reset();
    this.fgLab.reset();
    this.fgOrg.reset();
    this.fgCont.reset();

    // Limpiar aDocuments
    const aFilter = this.aDocuments.filter( x => x.nStat === 1 );
    aFilter.forEach(x => x.dis = true );
    this.aDocuments = aFilter;

    this.fcNombres.setValue(item.sNombres);
    this.fcIdentidad.setValue(item.sDscTipo + ' : ' + item.sDocumento);

    const nIdPersonal = item.nIdPersonal;
    const nIdPerLab = item.nIdPerLab;
    const nIdPlla = item.nIdPlla;
    const nIdTipoDoc = item.nIdTipoDoc;
    const nPerCod = item.nPerCod;

    let param = [];
    param.push('0¡A.nIdPersonal!' + nIdPersonal + '-0¡nIdPerLab!' + nIdPerLab + '-0¡nIdPlla!' + nIdPlla);
    param.push('0¡nIdTipoDoc!' + nIdTipoDoc);
    param.push('0¡bValid!1');

    await this.service._loadSP( 2, param, this.url).then( (value: any[]) => {
      Object.values ( value ).forEach( (lista: Array<any>, iLista: number) => {
        if ( lista.length > 0 ) {

          switch (iLista) {
            // Resultado personal
            case 0:

              this.fgInfo.patchValue({
                nIdPersonal: nIdPersonal,
                nIdPerLab: nIdPerLab,
                nIdTipoDoc: nIdTipoDoc,
                cEntNamSecond: lista[0].sDepartamento,
                cEntNamThird: lista[0].sProvincia,
                cEntNamFourth: lista[0].sDistrito,
                sDireccion: lista[0].sDireccion,
                sReferencia: lista[0].sReferencia,
                sBanco: lista[0].sBanco,
                sNroCuenta: lista[0].sNroCuenta,
                nPerCod: nPerCod
              });

              this.fgLab.patchValue({
                nIdPlla: item.nIdPlla,
                sPlanilla: item.sDscPlla,
                dFechIng: item.dFechIni,
                sResp: lista[0].sResp,
                dFechIniCont: lista[0].dFechIniCont,
                dFechFinCont: lista[0].dFechFinCont
              });

              this.fgOrg.patchValue({
                sCamp: lista[0].sCamp,
                sCli: lista[0].sCli,
                sCanal: lista[0].sCanal
              });

              this.fgCont.patchValue({
                sNumPer: lista[0].nTelMovil,
                sNumEmp: lista[0].sNumEmp,
                sMailPer: lista[0].sCorreo,
                sMailEmp: lista[0].sMailEmp
              });

              break;

            // Resultado contrato
            case 1:

              this.aDocuments.push({
                sCategoria: lista[0].sCategoria,
                nId: lista[0].nId,
                sDesc: lista[0].sDesc,
                nStat: 0,
                dis: false
              });

              this.fgLab.patchValue({
                dFechIniCont: lista[0].dFechIni,
                dFechFinCont: lista[0].dFechFin
              });

              break;
          }

        }
      });
    });

    // Conseguimos la url de los documentos
    param = [];

    let nDocTypCod = '';
    let nIdDocumento = '';

    this.aDocuments.forEach( x => {
      if (x.sCategoria === 'Reclutamiento') {
        nDocTypCod = nDocTypCod + x.nId.toString() + ',';
      } else {
        nIdDocumento = nIdDocumento + x.nId.toString() + ',';
      }
    });

    nDocTypCod = ( nDocTypCod.length > 0 ) ? nDocTypCod.substring(0, nDocTypCod.length - 1) : '';
    nIdDocumento = ( nIdDocumento.length > 0 ) ? nIdDocumento.substring(0, nIdDocumento.length - 1) : '';

    param.push('1¡nDocTypCod!' + nDocTypCod);
    param.push('0¡nPerCod!' + nPerCod + '-0¡nIdPerLab!' + nIdPerLab);
    param.push('1¡nIdDocumento!' + nIdDocumento);

    await this.service._loadSP( 4, param, this.url).then( (value: Array<any>) => {
      this.aDocPerso = value;
    });

    this.disListDoc = false;
    this.aDocuments.forEach( x => x.dis = false );

    const self = this;
    ( function($) {
      $('#ModalSearch').modal('hide');
      $('#ModalSearch').on('hidden.bs.modal', function () {
        self.onToggleFab(1, 0);
      });
    })(jQuery);

    this.pbSearch = false;
  }

  viewDoc(item: any) {

    const nId = item.nId;
    const iDocPerso = this.aDocPerso.findIndex( x => x.nId === nId );

    if ( iDocPerso > -1 ) {

      this.spi.show('spi_main');

      const sDocumento = this.aDocPerso[iDocPerso].sDocumento;
      printJS({
        printable: sDocumento,
        type: 'pdf',
        showModal: true,
        modalMessage: 'Recuperando documento',
        onLoadingEnd: () => {
          this.spi.hide('spi_main');
        }
      });
    } else {
      this._snackBar.open('El personal no presenta el documento seleccionado.', 'Cerrar', {
        horizontalPosition: 'right',
        verticalPosition: 'top',
        duration: 2500
      });
    }

  }

  //#endregion

  //#region Extra

  async delay(ms: number) {
    await new Promise<void>(resolve => setTimeout(() => resolve(), ms)).then();
  }

  animate(nTada: number) {
    switch (nTada) {
      case 1:
        this.tadaMain = 'active';
        break;
    }

    this.delay(2000).then(any => {
      switch (nTada) {
        case 1:
          this.tadaMain = 'inactive';
          break;
      }
    });
  }

  //#endregion

  
  async ViewUser(opc: number) { 
    const param = []; 
    param.push('6¡US.nCodUser!'+this.idUser);
    param.push('6¡nIdEmp!'+this.Empresa);
    await this.service._loadSP( opc, param, this.url).then( (value: any) => {
      this.valor = value[0]; 
    }); 


  }

}
