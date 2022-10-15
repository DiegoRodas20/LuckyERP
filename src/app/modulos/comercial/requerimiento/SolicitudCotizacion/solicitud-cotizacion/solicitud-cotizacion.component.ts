import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { SolicitudCotizacionService } from '../solicitud-cotizacion.service';
import { MatSort } from '@angular/material/sort';
import { Observable, Subject } from 'rxjs';
import Swal from 'sweetalert2';
import { speedDialFabAnimations } from '../speed-dial-fab.animations';
import { MatDialog } from '@angular/material/dialog';
import { ScFileComponent } from './sc/sc-file/sc-file.component';

@Component({
  animations: [speedDialFabAnimations],
  selector: 'app-solicitud-cotizacion',
  templateUrl: './solicitud-cotizacion.component.html',
  styleUrls: ['./solicitud-cotizacion.component.css']
})

export class SolicitudCotizacionComponent implements OnInit {
  fabButtons = [
    {
      icon: 'engineering'
    },
    {
      icon: 'checkroom'
    }
  ];
  buttons = [];
  fabTogglerState = 'active';
  displayedColumns: string[] = ['opcion', 'correlativo', 'anio', 'codPresupuesto', 'fechaEnvio', 'fechaDeseada',
    'cliente', 'estado', 'comprador', 'PDF CP'];
  dataSource: MatTableDataSource<any[]>;
  Privilegio = false;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;


  constructor(private router: Router, private solicitudCotizacionService: SolicitudCotizacionService,
    public dialog: MatDialog) {
    this.ObtenerPrivilegioUsuario().subscribe(check => {
      if (check === true) {
        this.Privilegio = true;
      } else {
        this.Privilegio = false;
        document.getElementById('scToggle').style.display = 'flex';
        this.onToggleFab()
      }
    });
    this.CargarDataAPI().subscribe((res) => {
      this.dataSource = new MatTableDataSource<any[]>(res);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort
      if (this.dataSource.data.length > 0) {
        this.changeColumnFilter(0);
      }
    });


  }
  changeColumnFilter(radioValue) {
    if (radioValue === 0) {
      this.dataSource.filterPredicate = function (data, filter) {
        return data['cliente'].toLowerCase().includes(filter);
      };
    }
    if (radioValue === 1) {
      this.dataSource.filterPredicate = function (data, filter) {
        return data['codPresupuesto'].toLowerCase().includes(filter);
      };
    }
    /*if (radioValue === 2) {
      this.dataSource.filterPredicate = function (data, filter) {
        return data['COMPRADOR--COMPRADOR'].toLowerCase().includes(filter);
      };
    }*/
    if (radioValue === 3) {
      this.dataSource.filterPredicate = function (data, filter) {
        return data['estado'].toLowerCase().includes(filter);
      };
    }
    if (radioValue === 4) {
      this.dataSource.filterPredicate = function (data, filter) {
        return data['sPDF'].toLowerCase().includes(filter);
      };
    }
  }
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
  openDialog(idCot, correlativo, codPresupuesto, codigoCliente): void {
    const dialogRef = this.dialog.open(ScFileComponent, {
      width: '80%',
      data: { idCot, correlativo, codPresupuesto, codigoCliente }
    });

    dialogRef.afterClosed().subscribe(result => {
      this.CargarDataAPI().subscribe((res) => {
        this.dataSource = new MatTableDataSource<any[]>(res);
        this.dataSource.paginator = this.paginator;
      });
    });
  }

  ngOnInit(): void {
    this.CargarDataAPI();
  }

  showItems() {
    this.fabTogglerState = 'active';
    this.buttons = this.fabButtons;
  }

  hideItems() {
    this.fabTogglerState = 'inactive';
    this.buttons = [];
  }

  onToggleFab() {
    this.buttons.length ? this.hideItems() : this.showItems();
  }

  CargarDataAPI(): Observable<any> {
    const user = localStorage.getItem('currentUser');
    const idUser = JSON.parse(window.atob(user.split('.')[1])).uid;
    const idEmpresa = Number(localStorage.getItem('Empresa'));
    const params = [];
    params.push(idUser);
    params.push(idEmpresa);
    const subject = new Subject();
    this.solicitudCotizacionService.crudSolicitudCotizacion(14, params, '|').subscribe(
      (res: []) => {
        subject.next(res);
      }
    );
    return subject.asObservable();
  }

  dobleClickVerCotizacion(row) {
    this.router.navigateByUrl(
      'comercial/requerimiento/solicitud_cotizacion/detalle/' + row.id
    );
  }

  tap(element, i) {
    if (i === 0) {
      this.router.navigateByUrl(
        'comercial/requerimiento/solicitud_cotizacion/nuevo/general'
      );
    }
    if (i === 1) {
      this.router.navigateByUrl(
        'comercial/requerimiento/solicitud_cotizacion/nuevo/textil'
      );
    }
  }

  tapColumns(i) {
    if (i === 0) {
      return 'SC General';
    }
    if (i === 1) {
      return 'SC Textil';
    }
  }

  ObtenerPrivilegioUsuario(): Observable<any> {
    const user = localStorage.getItem('currentUser');
    const idUser = JSON.parse(window.atob(user.split('.')[1])).uid;
    const params = [];
    params.push(idUser);
    const subject = new Subject();
    this.solicitudCotizacionService.crudSolicitudCotizacion(21, params, '|').subscribe(
      res => {
        subject.next(res);
      }
    );
    return subject.asObservable();
  }

  verCotizacionesPrivilegioOff(estado, pdf): boolean {
    if (estado === 'Recibido por Compras' && pdf === 'SI') {
      return false;
    } else {
      return true;
    }
  }
}
