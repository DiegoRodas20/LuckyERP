import { TestBed } from '@angular/core/testing';

import { AzureSCService } from './azure-sc.service';

describe('AzureSCService', () => {
  let service: AzureSCService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AzureSCService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
