import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatExpansionPanel } from '@angular/material/expansion';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { adminpAnimations } from '../../../../Animations/adminp.animations';
import { ControlvService } from '../../../../Services/controlv.service';

@Component({
  selector: 'app-controv-view',
  templateUrl: './controv-view.component.html',
  styleUrls: ['./controv-view.component.css'],
  animations: [adminpAnimations]
})
export class ControvViewComponent implements OnInit {

  @Input() fromParent;
  pbDetail: boolean;

  data: any;
  idPlanilla = '';



  // DetailDC: string[] = [ 'action', 'sSupervisor', 'dFechaIni', 'dFechaFin', 'sEstado' ];
  // DetailDS: MatTableDataSource<IDetail>;

  fgDetail2: FormGroup;

  
  constructor(public activeModal: NgbActiveModal,
    public service: ControlvService,
    public fb: FormBuilder,
    private spi: NgxSpinnerService,
    private _snackBar: MatSnackBar) {
      this.new_fgDetail2();
     }

    get getDetail() { return this.fgDetail2.controls; }


    async ngOnInit(): Promise<void> {
    const data = this.fromParent.data;
    const data2 = this.fromParent.data2;
    this.fgDetail2.controls['nIdPersonal'].setValue(data.nIdPersonal);
    this.fgDetail2.controls['nIdReqVac'].setValue(data.nIdReqVac);
    // this.fgDetail2.controls['sSolicitante'].setValue(data.sSolicitante);
    this.fgDetail2.controls['nIdResp'].setValue(data.nIdResp);
    this.fgDetail2.controls['sSupervisor'].setValue(data.sSupervisor);
    this.fgDetail2.controls['sTipo'].setValue(data.sTipo);
    this.fgDetail2.controls['sDscTipo'].setValue(data.sDscTipo);
    this.fgDetail2.controls['sDocumento'].setValue(data.sDocumento);
    this.fgDetail2.controls['sCiudad'].setValue(data.sCiudad);
    this.fgDetail2.controls['nIdEstado'].setValue(data.nIdEstado);
    this.fgDetail2.controls['sDias'].setValue(data.sDias);
    this.fgDetail2.controls['sEstado'].setValue(data.sEstado);
  }

  new_fgDetail2() {
    this.fgDetail2 = this.fb.group({
      nIdPersonal: 0,
      nIdReqVac: 0,
      sSolicitante:  [{ value: '', disabled: true }],
      nIdResp: 0,
      sSupervisor:  [{ value: '', disabled: true }],
      sCodPlla: [{ value: '', disabled: true }],
      sTipo: [{ value: '', disabled: true }],
      sDscTipo: [{ value: '', disabled: true }],
      sDocumento: [{ value: '', disabled: true }],
      sCiudad: [{ value: '', disabled: true }],
      nIdEstado: 0,
      sDias: 0,
      sEstado: [{ value: '', disabled: true }]
    });
  }

}
