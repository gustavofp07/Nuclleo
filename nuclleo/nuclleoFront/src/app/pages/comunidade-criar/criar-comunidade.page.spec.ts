import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CriarComunidadePage } from './criar-comunidade.page';

describe('CriarComunidadePage', () => {
  let component: CriarComunidadePage;
  let fixture: ComponentFixture<CriarComunidadePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CriarComunidadePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
