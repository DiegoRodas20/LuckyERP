import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CuentasbImportComponent } from './cuentasb-import.component';

describe('CuentasbImportComponent', () => {
  let component: CuentasbImportComponent;
  let fixture: ComponentFixture<CuentasbImportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CuentasbImportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CuentasbImportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
