import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TopesPorCargoComponent } from './topes-por-cargo.component';

describe('TopesPorCargoComponent', () => {
  let component: TopesPorCargoComponent;
  let fixture: ComponentFixture<TopesPorCargoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TopesPorCargoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TopesPorCargoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
