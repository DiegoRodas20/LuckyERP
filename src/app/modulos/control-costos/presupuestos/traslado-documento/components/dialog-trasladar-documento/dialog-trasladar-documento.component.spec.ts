import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogTrasladarDocumentoComponent } from './dialog-trasladar-documento.component';

describe('DialogTrasladarDocumentoComponent', () => {
  let component: DialogTrasladarDocumentoComponent;
  let fixture: ComponentFixture<DialogTrasladarDocumentoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DialogTrasladarDocumentoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogTrasladarDocumentoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
