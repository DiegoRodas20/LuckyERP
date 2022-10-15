import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScVisorComponent } from './sc-visor.component';

describe('ScVisorComponent', () => {
  let component: ScVisorComponent;
  let fixture: ComponentFixture<ScVisorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScVisorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScVisorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
