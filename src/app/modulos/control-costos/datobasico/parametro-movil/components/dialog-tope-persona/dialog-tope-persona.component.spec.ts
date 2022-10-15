import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogTopePersonaComponent } from './dialog-tope-persona.component';

describe('DialogTopePersonaComponent', () => {
  let component: DialogTopePersonaComponent;
  let fixture: ComponentFixture<DialogTopePersonaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DialogTopePersonaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogTopePersonaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
