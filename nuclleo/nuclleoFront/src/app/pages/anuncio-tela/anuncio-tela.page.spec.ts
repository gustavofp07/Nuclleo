import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AnuncioTelaPage } from './anuncio-tela.page';

describe('AnuncioTelaPage', () => {
  let component: AnuncioTelaPage;
  let fixture: ComponentFixture<AnuncioTelaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AnuncioTelaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
