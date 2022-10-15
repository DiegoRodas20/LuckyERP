import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogTopeCargoComponent } from './dialog-tope-cargo.component';

describe('DialogTopeCargoComponent', () => {
  let component: DialogTopeCargoComponent;
  let fixture: ComponentFixture<DialogTopeCargoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DialogTopeCargoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogTopeCargoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
