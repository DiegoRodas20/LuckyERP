import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaparametrosComponent } from './listaparametros.component';

describe('ListaparametrosComponent', () => {
  let component: ListaparametrosComponent;
  let fixture: ComponentFixture<ListaparametrosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListaparametrosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListaparametrosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
