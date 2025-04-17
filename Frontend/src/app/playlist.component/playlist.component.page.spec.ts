import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlaylistComponentPage } from './playlist.component.page';

describe('PlaylistComponentPage', () => {
  let component: PlaylistComponentPage;
  let fixture: ComponentFixture<PlaylistComponentPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PlaylistComponentPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
