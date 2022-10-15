import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CuentasbDetailComponent } from './cuentasb-detail.component';

describe('CuentasbDetailComponent', () => {
  let component: CuentasbDetailComponent;
  let fixture: ComponentFixture<CuentasbDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CuentasbDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CuentasbDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
