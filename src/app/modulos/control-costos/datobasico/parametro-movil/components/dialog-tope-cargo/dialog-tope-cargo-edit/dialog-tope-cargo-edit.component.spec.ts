import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogTopeCargoEditComponent } from './dialog-tope-cargo-edit.component';

describe('DialogTopeCargoEditComponent', () => {
  let component: DialogTopeCargoEditComponent;
  let fixture: ComponentFixture<DialogTopeCargoEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DialogTopeCargoEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogTopeCargoEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
