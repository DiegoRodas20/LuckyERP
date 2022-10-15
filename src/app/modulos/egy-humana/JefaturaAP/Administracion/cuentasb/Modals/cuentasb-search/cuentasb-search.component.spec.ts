import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CuentasbSearchComponent } from './cuentasb-search.component';

describe('CuentasbSearchComponent', () => {
  let component: CuentasbSearchComponent;
  let fixture: ComponentFixture<CuentasbSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CuentasbSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CuentasbSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
