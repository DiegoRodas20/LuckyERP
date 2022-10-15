import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TopesPorPersonaComponent } from './topes-por-persona.component';

describe('TopesPorPersonaComponent', () => {
  let component: TopesPorPersonaComponent;
  let fixture: ComponentFixture<TopesPorPersonaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TopesPorPersonaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TopesPorPersonaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
