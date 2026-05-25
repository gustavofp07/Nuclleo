import { TestBed } from '@angular/core/testing';

import { ComunidadeService } from './comunidade.service';

describe('ComunidadeService', () => {
  let service: ComunidadeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ComunidadeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
