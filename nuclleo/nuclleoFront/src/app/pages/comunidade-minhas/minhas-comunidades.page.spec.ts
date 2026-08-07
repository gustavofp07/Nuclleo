import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MinhasComunidadesPage } from './minhas-comunidades.page';

describe('MinhasComunidadesPage', () => {
  let component: MinhasComunidadesPage;
  let fixture: ComponentFixture<MinhasComunidadesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MinhasComunidadesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
