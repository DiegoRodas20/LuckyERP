import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ControlPersonalDto } from '../../../../Model/lcontroli';

@Component({
  selector: 'app-controli-search',
  templateUrl: './controli-search.component.html',
  styleUrls: ['./controli-search.component.css']
})
export class ControliSearchComponent implements OnInit {
  @Input() data: ControlPersonalDto[];
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  dataSource: MatTableDataSource<ControlPersonalDto>;
  displayedcolumns: string[];

  /* #region   Asignación nombres de campos y columnas*/
  cols: any[] = [
    { header: 'Opción', field: 'accion', type: 'accion', width: '50', align: 'center' },
    { header: 'Apellidos y Nombres', field: 'sNombreCompleto', type: 'titlecase', width: '200', align: 'left' },
    { header: 'Planilla', field: 'sCodPlla', type: null, width: '50', align: 'center' },
    { header: 'Tipo Doc.', field: 'sTipoDoc', type: null, width: '80', align: 'center' },
    { header: 'Documento', field: 'sDocumento', type: null, width: '80', align: 'center' },
    { header: 'F. Ingreso', field: 'sFechaIni', type: null, width: '80', align: 'center' },
    { header: 'F. Cese', field: 'sFechaFin', type: null, width: '80', align: 'center' },
    { header: 'Responsable', field: 'sResponsable', type: null, width: '200', align: 'left' }
  ];
  /* #endregion */

  constructor(
    private activeModal: NgbActiveModal,
  ) {
    this.displayedcolumns = this.cols.map(x => x.field);
  }

  ngOnInit(): void {
    this.dataSource = new MatTableDataSource<ControlPersonalDto>(this.data);
    this.dataSource.paginator = this.paginator;
  }

  /* #region  Método de filtración del listado */
  applyFilter(filterValue: string) { this.dataSource.filter = filterValue.trim().toLowerCase() }
  /* #endregion */

  /* #region  Método de limpieza del auto filtrado */
  fnClean(): void { this.dataSource.filter = '' }
  /* #endregion */

  showModal(row: ControlPersonalDto): void {
    this.activeModal.close(row);
  }

  fnCloseModal(): void {
    this.activeModal.dismiss();
  }

}
