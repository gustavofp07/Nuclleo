import { TestBed } from '@angular/core/testing';

import { UsuarioComunidadeService } from './usuario-comunidade.service';

describe('UsuarioComunidadeService', () => {
  let service: UsuarioComunidadeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UsuarioComunidadeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
