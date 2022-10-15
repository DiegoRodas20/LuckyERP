import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CuentasbExportComponent } from './cuentasb-export.component';

describe('CuentasbExportComponent', () => {
  let component: CuentasbExportComponent;
  let fixture: ComponentFixture<CuentasbExportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CuentasbExportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CuentasbExportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
