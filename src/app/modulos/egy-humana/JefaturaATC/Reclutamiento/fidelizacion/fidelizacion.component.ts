import { Component, OnInit, Injectable, Inject, ElementRef, ViewChild } from '@angular/core';
import { NgForm, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Combo, Reclutamiento, DialogData } from '../../Model/IATC';
import { SergeneralService } from '../../../../../shared/services/sergeneral.service';
import Swal from 'sweetalert2';
import { NgxSpinnerService } from 'ngx-spinner';
import { SerfidelizacionService } from './serfidelizacion.service';
import { FidDocumentoComponent } from './fid-documento/fid-documento.component';
import { HistoricoComponent } from './../historico/historico.component';
import { FidEnviarComponent } from './fid-enviar/fid-enviar.component';
import { FidListaEnviarComponent } from './fid-lista-enviar/fid-lista-enviar.component';

import { Estado } from '../../Model/IEstado';
import { EstadoefectivoComponent } from './../../../../comercial/requerimiento/efectivo/estadoefectivo/estadoefectivo.component';

import { Router } from '@angular/router';

import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import {
  MAT_MOMENT_DATE_FORMATS,
  MomentDateAdapter,
  MAT_MOMENT_DATE_ADAPTER_OPTIONS,
} from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';


import { AppDateAdapter, APP_DATE_FORMATS } from '../../../../../shared/services/AppDateAdapter';
import { FichatecnicaComponent } from '../fichatecnica/fichatecnica.component';

@Component({
  selector: 'app-fidelizacion',
  templateUrl: './fidelizacion.component.html',
  styleUrls: ['./fidelizacion.component.css'],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'ja-JP' },
    { provide: DateAdapter, useClass: AppDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS }
  ],
})

export class FidelizacionComponent implements OnInit {
  url: string;
  pais: string;
  Empresa: string;
  estado: Combo[];
  proceso: Combo[];
  CodUsuario: string;
  bDocumentosValidos: boolean;
  bRQPersValido: boolean;

  sCodRQ: string;
  Enviado: string;


  dataSource: MatTableDataSource<Reclutamiento>;

  txtControl = new FormControl();


  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  displayedColumns = ['pCodPostulacion', 'pTipDoc', 'pNumDoc', 'pNom', 'pCorreo', 'pPuesto', 'pPuestoCon'
    , 'pFechaCita', 'pEvaluador', 'pEstadoFidelizador', 'pFirmo'
  ];

  lListaCombo: any;
  lListaComboH: any;
  lListaResul: any;
  lListaReqPers: any;

  lCboTipoDocumento: any;
  lCboTipoFuente: any;
  lCboMedioCont: any;
  lCboMotNoCita: any;
  lCboMotNoCont: any;
  lCboHorario: any;
  lCboPuesto: any

  lListaFidelizador: any;

  nIdPostulacion: number;
  nIdPostulante: number;

  puntPre: number;
  vpuntPre: string;
  puntHabi: any;
  vpuntHabi: string;
  nEstadoRQ: number

  lFecha: string;
  lFechaVal: string;

  divList: boolean = true;
  divCreate: boolean = false;

  CambioCitaFormGroup: FormGroup;
  DatosFormGroup: FormGroup;
  ContactoFormGroup: FormGroup;
  CitaFormGroup: FormGroup;
  formEvaluacion: FormGroup;
  FidelizacionFormGroup: FormGroup;

  animal: string;
  name: string;

  constructor(
    private spinner: NgxSpinnerService,
    private _adapter: DateAdapter<any>,
    private vSerGeneral: SergeneralService,
    private formBuilder: FormBuilder,
    private vRouter: Router,
    private vSerFidelizacion: SerfidelizacionService,
    public dialog: MatDialog,
    @Inject('BASE_URL') baseUrl: string) {
    this.url = baseUrl;
  }

  ngOnInit(): void {

    if (localStorage.getItem('currentUser') == null) {
      this.vRouter.navigateByUrl('/login');
    }
    let user = localStorage.getItem('currentUser');
    this.Empresa = localStorage.getItem('Empresa');
    this.CodUsuario = JSON.parse(window.atob(user.split('.')[1])).uid;

    this._adapter.setLocale('fr')
    this.pais = localStorage.getItem('Pais')

    this.DatosFormGroup = this.formBuilder.group({
      TipoDoc: ['', Validators.required],
      NumDoc: ['', Validators.required],
      PrimerMombre: ['', Validators.required],
      SegundoMombre: [''],
      PrimerApellido: ['', Validators.required],
      SegundoApellido: ['', Validators.required],
      Celular: ['', Validators.required],
      CelularOpc: ['', Validators.required],
      Correo: ['', Validators.required],
      Puesto: [{ value: '', disabled: true }],
      Direccion: ['', Validators.required],
      Distrito: ['']
    });
    this.ContactoFormGroup = this.formBuilder.group({
      MedioContactacion: ['', Validators.required],
      Contactado: ['', Validators.required],
      Fuente: ['', Validators.required],
      Referido: ['', Validators.required],
      NoContactacion: ['', Validators.required]
    });
    this.CitaFormGroup = this.formBuilder.group({
      Citado: ['', Validators.required],
      Fecha: ['', Validators.required],
      Hora: ['', Validators.required],
      Turno: ['', Validators.required],
      Nocitado: ['', Validators.required],
      UltEstCont: ['', Validators.required]
    });

    this.CambioCitaFormGroup = this.formBuilder.group({
      PuestoConsi: [''],
      Motivo: [''],
    });

    this.formEvaluacion = this.formBuilder.group({
      cboContextura: ['', Validators.required],
      cboSonrisa: ['', Validators.required],
      cboImagen: ['', Validators.required],
      cboComunicacion: ['', Validators.required],
      cboOrientacion: ['', Validators.required],
      cboNegociacion: ['', Validators.required],
      cboFlexibilidad: ['', Validators.required],
      cboExperiencia: ['', Validators.required],
      cboEstEva: ['', Validators.required],
      cboFil: ['', Validators.required]
    });

    this.FidelizacionFormGroup = this.formBuilder.group({
      idFide: [''],
      PuestoFi: [''],
      nFirmo: [''],
      nEntrevistado: [''],
      nSeleccion: [''],
      nValidado: [''],
      Envio: [{ value: '', disabled: true }],
      nProceso: ['', Validators.required],
      nEstadoFid: ['', Validators.required],
      RQ: [{ value: '', disabled: true }],
    });


    this.DatosFormGroup.disable();
    this.ContactoFormGroup.disable();
    this.CitaFormGroup.disable();

    this.fnGetCombo();
    this.fnGetHorario();
    this.fnGetTipoDocumento();
    this.fnGetTipoFuente();
    this.fnGetMedioContacto();
    this.fnGetMotivoNoCita();
    this.fnGetMotivoNoCont();
    this.fnGetPuesto();
    this.fnGetFidelizador();

    this.fnListaReclutamiento();

  }

  fnGetFidelizador = function () {
    this.vSerGeneral.fnSystemElements(1, '1', '1', 'nElecod,cElenam', 'FIDELIZADOR', this.url).subscribe(
      res => {
        this.lListaFidelizador = res;
      },
      err => {
        console.log(err);
      },
      () => {
        // this.spinner.hide();
      }
    )
  }

  //#region Obtener Puestos 
  fnGetPuesto = function () {

    let pParametro = [];
    pParametro.push('');

    this.vSerFidelizacion.fnReclutamiento(19, pParametro, this.url)
      .then((value: any[]) => {
        this.lCboPuesto = value;
      }, error => {
        console.log(error);
      });

  }
  //#endregion 

  fnGetCombo = function () {

    this.estado =
      [
        { id: '', valor: 'Seleccione' },
        { id: '0', valor: 'No' },
        { id: '1', valor: 'Si' },
      ];

    this.proceso =
      [
        { id: '', valor: 'Seleccione' },
        { id: '0', valor: 'Virtual' },
        { id: '1', valor: 'Presencial' },
      ];

    this.lListaCombo =
      [
        { id: '', valor: 'Seleccione' },
        { id: '1', valor: '1' },
        { id: '2', valor: '2' },
        { id: '3', valor: '3' },
        { id: '4', valor: '4' },
        { id: '5', valor: '5' }
      ];

    this.lListaComboH =
      [
        { id: '', valor: 'Seleccionar' },
        { id: '1', valor: 1 },
        { id: '2', valor: 2 },
        { id: '3', valor: 3 },
        { id: '4', valor: 4 },
        { id: '5', valor: 5 },
        { id: '6', valor: 6 },
        { id: '7', valor: 7 },
        { id: '8', valor: 8 },
        { id: '9', valor: 9 },
        { id: '10', valor: 10 }
      ];

    this.lListaResul =
      [
        { id: '', valor: 'Seleccione' },
        { id: '1', valor: 'No Apto' },
        { id: '2', valor: 'En Desarrollo' },
        { id: '3', valor: 'Apto por Potenciar' },
        { id: '4', valor: 'Apto' },
        { id: '5', valor: 'Apto con Excelencia' }
      ];

    this.fnGetReqPersonal();

  }

  async fnListaReclutamiento() {
    let pParametro = [];
    pParametro.push(this.pais);
    this.spinner.show();
    await this.vSerFidelizacion.fnReclutamiento(8, pParametro, this.url).then((value: any[]) => {
      this.dataSource = new MatTableDataSource(value);
    }, error => {
      console.log(error);
    });
    this.spinner.hide();
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter = function (filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  fnChange = function (op: number) {
    if (op == 1) {
      this.divList = false;
      this.divCreate = true;
    }
    else {
      this.fnListaReclutamiento();
      this.txtControl.reset();
      this.divList = true;
      this.divCreate = false;
    }
  }

  async fnGetHorario() {
    let pParametro = [];
    this.spinner.show();
    await this.vSerFidelizacion.fnReclutamiento(3, pParametro, this.url).then((value: any[]) => {
      this.lCboHorario = value;
    }, error => {
      console.log(error);
    });
    this.spinner.hide();
  }

  fnGetTipoDocumento = function () {
    this.vSerGeneral.fnSystemElements(2, '1', '1', 'nElecod,cElenam', this.pais, this.url).subscribe(
      res => {
        this.lCboTipoDocumento = res;
      },
      err => {
        console.log(err);
      },
      () => {
        // this.spinner.hide();

      }

    )
  }

  fnGetTipoFuente = function () {
    this.vSerGeneral.fnSystemElements(2, '97', '1', 'nElecod,cElenam', this.pais, this.url).subscribe(
      res => {
        this.lCboTipoFuente = res;
      },
      err => {
        console.log(err);
      },
      () => {
        // this.spinner.hide();

      }

    )
  }

  fnGetMedioContacto = function () {

    this.vSerGeneral.fnSystemElements(2, '446', '1', 'nElecod,cElenam', this.pais, this.url).subscribe(
      res => {
        this.lCboMedioCont = res;
      },
      err => {
        console.log(err);
      },
      () => {

      }

    )
  }

  fnGetMotivoNoCita = function () {

    this.vSerGeneral.fnSystemElements(2, '447', '1', 'nElecod,cElenam', this.pais, this.url).subscribe(
      res => {
        this.lCboMotNoCita = res;
      },
      err => {
        console.log(err);
      },
      () => {
        //this.spinner.hide();

      }

    )
  }

  fnGetMotivoNoCont = function () {

    this.vSerGeneral.fnSystemElements(2, '448', '1', 'nElecod,cElenam', this.pais, this.url).subscribe(
      res => {

        this.lCboMotNoCont = res;
      },
      err => {
        console.log(err);
      },
      () => {
        //this.spinner.hide();

      }

    )
  }

  async fnDatos(id) {
    let pParametro = [];
    pParametro.push(this.pais);
    pParametro.push(id);

    this.spinner.show();
    await this.vSerFidelizacion.fnReclutamiento(9, pParametro, this.url).then((value: any[]) => {
      this.fnLLenado(value);
    }, error => {
      console.log(error);
    });
    this.spinner.hide();
  }

  fnLLenado = function (vOB) {

    if (vOB.nValFileUser == 0) {
      this.bDocumentosValidos = false
    }
    else {
      this.bDocumentosValidos = true
    }

    this.nIdPostulacion = vOB.pCodPostulacion;
    this.nIdPostulante = vOB.pCodPostulante;

    if (this.pais == '604') {
      this.DatosFormGroup = this.formBuilder.group({
        TipoDoc: new FormControl(vOB.pCodTipDoc.toString(), Validators.required),
        NumDoc: new FormControl(vOB.pNumDoc.toString(), Validators.required),
        PrimerMombre: new FormControl(vOB.pPrimNom.toString(), Validators.required),
        SegundoMombre: new FormControl(vOB.pSegNom.toString()),
        PrimerApellido: new FormControl(vOB.pApePat.toString(), Validators.required),
        SegundoApellido: new FormControl(vOB.pApeMat.toString(), Validators.required),
        Celular: new FormControl(vOB.pNumCelular.toString(), Validators.required),
        CelularOpc: new FormControl(vOB.pNumCelularOpc.toString()),
        Correo: new FormControl(vOB.pCorreo.toString(), Validators.required),
        Puesto: new FormControl({ value: vOB.pPuesto.toString(), disabled: true }, Validators.required),
        Direccion: new FormControl(vOB.pdireccion.toString(), Validators.required),
        Distrito: new FormControl(vOB.pDistrito.toString()),
      });
    }
    else {
      this.DatosFormGroup = this.formBuilder.group({
        TipoDoc: new FormControl(vOB.pCodTipDoc.toString(), Validators.required),
        NumDoc: new FormControl(vOB.pNumDoc.toString(), Validators.required),
        PrimerMombre: new FormControl(vOB.pPrimNom.toString(), Validators.required),
        SegundoMombre: new FormControl(vOB.pSegNom.toString()),
        PrimerApellido: new FormControl(vOB.pApePat.toString(), Validators.required),
        SegundoApellido: new FormControl(vOB.pApeMat.toString()),
        Celular: new FormControl(vOB.pNumCelular.toString(), Validators.required),
        CelularOpc: new FormControl(vOB.pNumCelularOpc.toString()),
        Correo: new FormControl(vOB.pCorreo.toString(), Validators.required),
        Puesto: new FormControl({ value: vOB.pPuesto.toString(), disabled: true }, Validators.required),
        Direccion: new FormControl(vOB.pdireccion.toString(), Validators.required),
        Distrito: new FormControl(vOB.pDistrito.toString()),
      });
    }


    this.ContactoFormGroup = this.formBuilder.group({
      MedioContactacion: new FormControl(vOB.pCodMedioContacto.toString(), Validators.required),
      Contactado: new FormControl(vOB.pCodContactado.toString(), Validators.required),
      Fuente: new FormControl(vOB.pCodFuentePostu.toString(), Validators.required),
      Referido: new FormControl(vOB.pTextOpc.toString(), Validators.required),
      NoContactacion: new FormControl(vOB.pCodMotNoCont.toString(), Validators.required),
    });

    this.lFecha = vOB.pFechaCita.toString();
    this.lFechaVal = vOB.pFechaCita.toString();

    let fechaFormateada = this.convertUTCDateToLocalDate(new Date(vOB.pFechaCita.toString()));

    this.CitaFormGroup = this.formBuilder.group({
      Citado: new FormControl(vOB.pCodCCitado.toString(), Validators.required),
      Fecha: new FormControl(fechaFormateada, Validators.required),
      Hora: new FormControl(vOB.pCodTurno.toString(), Validators.required),
      Turno: new FormControl(vOB.pTurno.toString(), Validators.required),
      Nocitado: new FormControl(vOB.pCodMotNoCita.toString(), Validators.required),
      UltEstCont: new FormControl(vOB.pUltEstCont.toString(), Validators.required)
    });

    this.CambioCitaFormGroup = this.formBuilder.group({
      PuestoConsi: new FormControl(typeof vOB.codPuestoCon == "undefined" ? '' : vOB.codPuestoCon.toString()),
      Motivo: new FormControl(typeof vOB.motivo == "undefined" ? '' : vOB.motivo.toString())
    });


    this.formEvaluacion = this.formBuilder.group({
      cboContextura: new FormControl(vOB.nContextura.toString(), Validators.required),
      cboSonrisa: new FormControl(vOB.nSonrisa.toString(), Validators.required),
      cboImagen: new FormControl(vOB.nImagen.toString(), Validators.required),
      cboComunicacion: new FormControl(vOB.nComunicacion.toString(), Validators.required),
      cboOrientacion: new FormControl(vOB.nOrientacion.toString(), Validators.required),
      cboNegociacion: new FormControl(vOB.nNegociacion.toString(), Validators.required),
      cboFlexibilidad: new FormControl(vOB.nReflexion.toString(), Validators.required),
      cboExperiencia: new FormControl(typeof vOB.codIdExperiencia === "undefined" ? '' : vOB.codIdExperiencia.toString(), Validators.required),
      cboEstEva: new FormControl(typeof vOB.codEstadoEvaluacion === "undefined" ? '' : vOB.codEstadoEvaluacion.toString(), Validators.required),
      cboFil: new FormControl(typeof vOB.codUsuFid === "undefined" ? '' : vOB.codUsuFid.toString(), Validators.required),
    });

    this.Enviado = vOB.sEstado.toString()

    this.FidelizacionFormGroup = this.formBuilder.group({
      idFide: new FormControl(vOB.pnIdFide),
      PuestoFi: new FormControl(vOB.pCodPuestoConFid.toString()),
      nFirmo: new FormControl(vOB.pEstFirma.toString()),
      nEntrevistado: new FormControl(vOB.pCodEntrevista.toString()),
      nSeleccion: new FormControl(vOB.pCodSeleccion.toString()),
      nValidado: new FormControl(vOB.pCodValidado.toString()),
      nProceso: new FormControl(vOB.pEstProceso.toString(), Validators.required),
      Envio: new FormControl({ value: vOB.sEstado.toString(), disabled: true }),
      nEstadoFid: new FormControl(vOB.pCodEstadoFid.toString(), Validators.required),
      //RQ: new FormControl(''),
      //RQ: new FormControl(vOB.psCodRQ.toString()),
      RQ: new FormControl({ value: vOB.psCodRQ.toString(), disabled: true }),
    });

    this.sCodRQ = vOB.psCodRQ.toString();

    if (this.Enviado == 'Si') {
      this.bRQPersValido = false;
    }
    else {
      this.bRQPersValido = true;
    }


    //this.fnChange(vOB.nContextura.toString(),vOB.nSonrisa.toString(),vOB.nImagen.toString(),0,0)
    //this.fnChange(vOB.nComunicacion.toString(),vOB.nOrientacion.toString(),vOB.nNegociacion.toString(),vOB.nReflexion.toString(),1)
    //this.vpuntPre = vOB.resHab;
    //this.vpuntHabi = typeof vOB.resHab==="undefined"?  '':vOB.resHab;

    this.fnSumaPuntuacion();
    this.fnSumaHabilidad();


    Swal.fire({
      title: 'Estás seguro de fidelizar al postulante "' + vOB.pNom + '"',
      showCancelButton: true,
      confirmButtonText: `Ok`,
    }).then((result) => {
      if (result.isConfirmed) {
        this.fnValdidacion();

      }
      /* Read more about isConfirmed, isDenied below */

    })

  }

  fnValdidacion = function () {
    this.fnChange(1);
    this.DatosFormGroup.disable();
    this.ContactoFormGroup.disable();
    this.CitaFormGroup.disable();
    this.CambioCitaFormGroup.disable();
    this.formEvaluacion.disable();

    if (this.bRQPersValido == true) {
      this.FidelizacionFormGroup.get('RQ').enable();
    }
    else {
      this.FidelizacionFormGroup.get('RQ').disable();
    }


  }

  fnChangeEva = function (a, b, c, d, op) {
    if (a == '') { a = 0 }
    if (b == '') { b = 0 }
    if (c == '') { c = 0 }
    if (d == '') { d = 0 }
    if (op == 1) {
      let punto = (parseInt(a) + parseInt(b) + parseInt(c) + parseInt(d)) / 4 * 10
      this.puntHabi = punto + ' %';


      if (punto < 50) {
        this.vpuntHabi = 'No Apto';
      }
      else if (punto < 70) {
        this.vpuntHabi = 'En Desarrollo';
      }
      else if (punto < 85) {
        this.vpuntHabi = 'Apto con Observación';
      }
      else if (punto < 99.5) {
        this.vpuntHabi = 'Apto';
      }
      else {
        this.vpuntHabi = 'Apto con Excelencia';
      }
    }
    else if (op == 0) {
      this.puntPre = parseInt(a) + parseInt(b) + parseInt(c)

      if (this.puntPre < 5) {
        this.vpuntPre = 'No Apto';
      }
      else if (this.puntPre < 6) {
        this.vpuntPre = 'En Desarrollo';
      }
      else if (this.puntPre < 7) {
        this.vpuntPre = 'Apto con Observacion';
      }
      else if (this.puntPre < 9) {
        this.vpuntPre = 'Apto';
      }
      else {
        this.vpuntPre = 'Apto con Excelencia';
      }
    }
  }

  first(v: string) {
    this.lFecha = v
  }

  fnAction = function (btn) {
    let pParametro = [];
    let vValidacionFidelizacion = this.FidelizacionFormGroup.value;
    if (this.FidelizacionFormGroup.invalid) {
      return;
    }

    pParametro.push(this.CodUsuario);
    pParametro.push(this.nIdPostulacion);
    pParametro.push(this.nIdPostulante);
    pParametro.push(vValidacionFidelizacion.PuestoFi);
    pParametro.push(vValidacionFidelizacion.nFirmo);
    pParametro.push(vValidacionFidelizacion.nEntrevistado);
    pParametro.push(vValidacionFidelizacion.nSeleccion);
    pParametro.push(vValidacionFidelizacion.nValidado);
    pParametro.push(vValidacionFidelizacion.nProceso);
    pParametro.push(vValidacionFidelizacion.nEstadoFid);
    pParametro.push(this.pais);
    pParametro.push(this.sCodRQ);

    this.spinner.show();
    this.vSerFidelizacion.fnReclutamientoCrud(10, pParametro, this.url).subscribe(
      res => {
        Swal.fire({
          title: res.mensaje,
          showCancelButton: true,
          confirmButtonText: `Ok`,
        }).then((result) => {
          if (vValidacionFidelizacion.idFide === '') {
            this.FidelizacionFormGroup.controls.idFide.setValue(res.cod);
          }
          else {

          }
        })
      },
      err => {
        console.log(err);
        this.spinner.hide();
      },
      () => {
        this.spinner.hide();
      }
    );


  }

  async openDialogEnviar() {
    var value = new Object();

    let vValidacionFidelizacion = this.FidelizacionFormGroup.value;

    if (vValidacionFidelizacion.idFide === '') {
      return Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Primero dale click al boton "guardar"'
      });;
    }

    if (this.bDocumentosValidos == false) {
      return Swal.fire({
        icon: 'warning',
        title: '¡Verificar!',
        text: 'Falta confirmar la validación de los Documentos'
      });;
    }


    if (await this.fnValidarRQ(this.sCodRQ) != 1612) {
      Swal.fire('¡Verificar!', `El Número de Requerimiento ${this.sCodRQ} ha sido terminado`, 'warning')
        .then(() => {

        });
    }


    value['IdFide'] = vValidacionFidelizacion.idFide
    value['Estado'] = this.Enviado
    value['sCodRQ'] = this.sCodRQ
    value['nEstadoRQ'] = this.nEstadoRQ

    const dialogRef = this.dialog.open(FidListaEnviarComponent, {
      width: '600px',
      data: value,
    });

    dialogRef.afterClosed().subscribe(result => {



      if (!result) {


        return;
      }
      if (result.data.length > 0) {

        this.FidelizacionFormGroup.controls.Envio.setValue(result.data[0]);
        this.Enviado = result.data[0]
        this.FidelizacionFormGroup.controls.RQ.setValue(result.data[1]);

      }

    });



  }

  async openDialogDocumento() {

    let pParametro = [];
    pParametro.push(this.pais);
    pParametro.push(this.nIdPostulacion);

    this.spinner.show();
    await this.vSerFidelizacion.fnReclutamiento(12, pParametro, this.url).then((value: any[]) => {

      if (value.length > 0) {
        for (let i = 0; i < value.length; i++) {
          value[i].nIdPostulacion = this.nIdPostulacion
          value[i].bDocumentosValidos = this.bDocumentosValidos
        }
      }

      const dialogRef = this.dialog.open(FidDocumentoComponent, {
        width: '800px',
        data: value,

      });

      dialogRef.afterClosed().subscribe(result => {

        this.bDocumentosValidos = result.data;

      });
    }, error => {
      console.log(error);
    });
    this.spinner.hide();
  }

  async ValidarRQ() {
    let pParametro = [];
    let vValidacionFidelizacion = this.FidelizacionFormGroup.value;

    if (vValidacionFidelizacion.RQ === '') {
      return;
    }

    pParametro.push(this.pais);
    pParametro.push(this.Empresa);
    pParametro.push(vValidacionFidelizacion.RQ);

    this.spinner.show();
    await this.vSerFidelizacion.fnReclutamiento(14, pParametro, this.url).then((value: any) => {
      if (value.cod === '0') {
        this.spinner.hide();
        this.FidelizacionFormGroup.controls.idRQ.setValue('');
        return Swal.fire({
          icon: 'error',
          title: 'Error',
          text: value.mensaje
        });
      }
      else {
        this.FidelizacionFormGroup.controls.idRQ.setValue(value.cod);
      }

    }, error => {
      console.log(error);
    });
    this.spinner.hide();

  }

  async openDialogFicha() {
    let pParametro = [];

    pParametro.push(this.pais);
    pParametro.push(this.nIdPostulacion);

    this.spinner.show();
    await this.vSerFidelizacion.fnReclutamiento(11, pParametro, this.url).then((value: any) => {

      const dialogRef = this.dialog.open(FichatecnicaComponent, {
        width: '1150px',
        data: value,
      });

      dialogRef.afterClosed().subscribe(result => {
      });
    }, error => {
      console.log(error);
    });
    this.spinner.hide();

  }

  async openDialogHistorico() {

    const dialogRef = this.dialog.open(HistoricoComponent, {
      width: '400px',
      data: { op: 0, titulo: 'Historico' }
    });

    dialogRef.afterClosed().subscribe(result => {
    });

  }

  async openDialogIndicadores() {

    const dialogRef = this.dialog.open(HistoricoComponent, {
      width: '400px',
      data: { op: 1, titulo: 'Indicadores' }
    });

    dialogRef.afterClosed().subscribe(result => {
    });

  }

  convertUTCDateToLocalDate(date) {
    var newDate = new Date(date.getTime() + date.getTimezoneOffset() * 60 * 1000);

    var offset = date.getTimezoneOffset() / 60;
    var hours = date.getHours();

    newDate.setHours(hours - offset);

    return newDate;
  }

  //#region Histórico de Estados
  async fnVerEstado() {
    let vFide = this.FidelizacionFormGroup.value;
    let pParametro = [];
    pParametro.push(vFide.idFide);

    if (vFide.idFide != '') {
      this.spinner.show();
      this.vSerFidelizacion.fnReclutamiento(17, pParametro, this.url).then((value: Estado[]) => {

        const dialogRef = this.dialog.open(EstadoefectivoComponent, {
          width: '700px',
          data: value,
        });

        dialogRef.afterClosed().subscribe(result => {
        });
      }, error => {
        console.log(error);
      });
      this.spinner.hide();
    }


  }
  //#endregion

  //#region Obtener Req Personal
  async fnGetReqPersonal() {

    let pParametro = [];

    await this.vSerFidelizacion.fnReclutamiento(23, pParametro, this.url).then((value: any) => {

      this.lListaReqPers = value;


    }, error => {
      console.log(error);
    });

  }
  //#endregion

  fnChangeRQPersonal(sCodParametro) {
    this.sCodRQ = sCodParametro
  }

  async fnValidarRQ(param) {

    //let bValidacion=false;
    let nEstado

    if (this.lListaReqPers.length > 0) {
      for (let i = 0; i < this.lListaReqPers.length; i++) {
        if (param == this.lListaReqPers[i].sCodRQ) {
          if (this.lListaReqPers[i].nEstado == 1612) {
            nEstado = 1612
            break;
          }
          else {
            nEstado = 0
          }
        }
        else {
          nEstado = 0
        }
      }
    }

    this.nEstadoRQ = nEstado;

    return nEstado

  }

  fnSumaPuntuacion() {
    let a, b, c;

    a = this.formEvaluacion.get("cboContextura").value;
    b = this.formEvaluacion.get("cboSonrisa").value;
    c = this.formEvaluacion.get("cboImagen").value;

    this.puntPre = parseInt(a) + parseInt(b) + parseInt(c)

    if (this.puntPre < 5) {
      this.vpuntPre = 'No Apto';
    }
    else if (this.puntPre < 6) {
      this.vpuntPre = 'En Desarrollo';
    }
    else if (this.puntPre < 7) {
      this.vpuntPre = 'Apto con Observacion';
    }
    else if (this.puntPre < 9) {
      this.vpuntPre = 'Apto';
    }
    else {
      this.vpuntPre = 'Apto con Excelencia';
    }


  }

  fnSumaHabilidad() {

    let a, b, c, d;

    a = this.formEvaluacion.get("cboComunicacion").value;
    b = this.formEvaluacion.get("cboOrientacion").value;
    c = this.formEvaluacion.get("cboNegociacion").value;
    d = this.formEvaluacion.get("cboFlexibilidad").value;

    let punto = (parseInt(a) + parseInt(b) + parseInt(c) + parseInt(d)) / 4 * 10
    this.puntHabi = punto + ' %';

    if (punto < 50) {
      this.vpuntHabi = 'No Apto';
    }
    else if (punto < 70) {
      this.vpuntHabi = 'En Desarrollo';
    }
    else if (punto < 85) {
      this.vpuntHabi = 'Apto con Observación';
    }
    else if (punto < 99.5) {
      this.vpuntHabi = 'Apto';
    }
    else {
      this.vpuntHabi = 'Apto con Excelencia';
    }
  }

}
