import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UsuarioAlterarPage } from './usuario-alterar.page';

describe('UsuarioAlterarPage', () => {
  let component: UsuarioAlterarPage;
  let fixture: ComponentFixture<UsuarioAlterarPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(UsuarioAlterarPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
