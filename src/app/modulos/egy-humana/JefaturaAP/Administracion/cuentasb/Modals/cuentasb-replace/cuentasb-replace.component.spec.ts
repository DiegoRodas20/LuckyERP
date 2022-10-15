import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CuentasbReplaceComponent } from './cuentasb-replace.component';

describe('CuentasbReplaceComponent', () => {
  let component: CuentasbReplaceComponent;
  let fixture: ComponentFixture<CuentasbReplaceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CuentasbReplaceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CuentasbReplaceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
