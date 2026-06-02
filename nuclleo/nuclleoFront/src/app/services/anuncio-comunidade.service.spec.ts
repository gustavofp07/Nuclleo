import { TestBed } from '@angular/core/testing';

import { AnuncioComunidadeService } from './anuncio-comunidade.service';

describe('AnuncioComunidadeService', () => {
  let service: AnuncioComunidadeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AnuncioComunidadeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
