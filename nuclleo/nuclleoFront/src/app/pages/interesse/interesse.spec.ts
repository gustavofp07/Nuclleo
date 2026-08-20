import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InteresseMeusPage } from './interesse';

describe('InteresseMeusPage', () => {
  let component: InteresseMeusPage;
  let fixture: ComponentFixture<InteresseMeusPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(InteresseMeusPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
