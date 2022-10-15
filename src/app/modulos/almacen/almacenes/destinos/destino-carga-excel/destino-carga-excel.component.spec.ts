import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogDestinoCargaExcelComponent } from './destino-carga-excel.component';

describe('DestinoCargaExcelComponent', () => {
  let component: DialogDestinoCargaExcelComponent;
  let fixture: ComponentFixture<DialogDestinoCargaExcelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DialogDestinoCargaExcelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogDestinoCargaExcelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
