import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ControlAbsenceChange } from '../../../../Model/lcontroli';

@Component({
  selector: 'app-controli-changes',
  templateUrl: './controli-changes.component.html',
  styleUrls: ['./controli-changes.component.css']
})
export class ControliChangesComponent implements OnInit {
  @Input() data: { changes: ControlAbsenceChange[], daySelected: Date };
  displayedcolumns: string[];

  /* #region   Asignación nombres de campos y columnas*/
  cols: any[] = [
    { header: 'Usuario', field: 'sUsuario', type: null, width: '100', align: 'left' },
    { header: 'Estado', field: 'sEstado', type: null, width: '100', align: 'left' },
    { header: 'Fecha', field: 'sFechaRegistro', type: null, width: '120', align: 'center' }
  ];
  /* #endregion */

  constructor(
    private activeModal: NgbActiveModal,
  ) {
    this.displayedcolumns = this.cols.map(x => x.field);
  }

  ngOnInit(): void {
  }

  fnCloseModal(): void {
    this.activeModal.dismiss();
  }
}
