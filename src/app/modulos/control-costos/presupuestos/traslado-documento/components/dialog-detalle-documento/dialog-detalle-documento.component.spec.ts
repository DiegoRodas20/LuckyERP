import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogDetalleDocumentoComponent } from './dialog-detalle-documento.component';

describe('DialogDetalleDocumentoComponent', () => {
  let component: DialogDetalleDocumentoComponent;
  let fixture: ComponentFixture<DialogDetalleDocumentoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DialogDetalleDocumentoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogDetalleDocumentoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
