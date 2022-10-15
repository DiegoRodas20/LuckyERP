import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogEditAprobacionComponent } from './dialog-edit-aprobacion.component';

describe('DialogEditAprobacionComponent', () => {
  let component: DialogEditAprobacionComponent;
  let fixture: ComponentFixture<DialogEditAprobacionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DialogEditAprobacionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogEditAprobacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
