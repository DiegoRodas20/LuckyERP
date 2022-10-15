import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CuentasbCuentaComponent } from './cuentasb-cuenta.component';

describe('CuentasbCuentaComponent', () => {
  let component: CuentasbCuentaComponent;
  let fixture: ComponentFixture<CuentasbCuentaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CuentasbCuentaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CuentasbCuentaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
