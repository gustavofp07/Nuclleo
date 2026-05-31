import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CriarAnuncioPage } from './criar-anuncio.page';

describe('CriarAnuncioPage', () => {
  let component: CriarAnuncioPage;
  let fixture: ComponentFixture<CriarAnuncioPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CriarAnuncioPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
