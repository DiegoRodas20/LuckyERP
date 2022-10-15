import { TestBed } from '@angular/core/testing';

import { NotasLogisticaService } from './notas-logistica.service';

describe('NotasLogisticaService', () => {
  let service: NotasLogisticaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NotasLogisticaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
