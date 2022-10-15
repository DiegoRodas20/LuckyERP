import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistroCantidadArticuloComponent } from './registro-cantidad-articulo.component';

describe('RegistroCantidadArticuloComponent', () => {
  let component: RegistroCantidadArticuloComponent;
  let fixture: ComponentFixture<RegistroCantidadArticuloComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RegistroCantidadArticuloComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegistroCantidadArticuloComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
