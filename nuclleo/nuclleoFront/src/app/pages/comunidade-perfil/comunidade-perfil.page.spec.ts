import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ComunidadePerfilPage } from './comunidade-perfil.page';

describe('ComunidadePerfilPage', () => {
  let component: ComunidadePerfilPage;
  let fixture: ComponentFixture<ComunidadePerfilPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ComunidadePerfilPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
