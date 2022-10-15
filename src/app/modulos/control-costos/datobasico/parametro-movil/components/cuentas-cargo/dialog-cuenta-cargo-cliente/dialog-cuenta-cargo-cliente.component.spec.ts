import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogCuentaCargoClienteComponent } from './dialog-cuenta-cargo-cliente.component';

describe('DialogCuentaCargoClienteComponent', () => {
  let component: DialogCuentaCargoClienteComponent;
  let fixture: ComponentFixture<DialogCuentaCargoClienteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DialogCuentaCargoClienteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogCuentaCargoClienteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
