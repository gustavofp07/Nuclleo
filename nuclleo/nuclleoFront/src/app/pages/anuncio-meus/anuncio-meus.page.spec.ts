import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AnuncioMeusPage } from './anuncio-meus.page';

describe('AnuncioMeusPage', () => {
  let component: AnuncioMeusPage;
  let fixture: ComponentFixture<AnuncioMeusPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AnuncioMeusPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
