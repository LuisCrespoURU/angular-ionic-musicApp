import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./login/login.page').then((m) => m.LoginPage),
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
    canActivate: [AuthGuard],
  },
  {
    path: 'search',
    loadComponent: () => import('./search/search.page').then((m) => m.SearchPage),
    canActivate: [AuthGuard],
  },
  {
    path: 'song-detail/:id',
    loadComponent: () =>
      import('./song-detail/song-detail.page').then((m) => m.SongDetailPage),
    canActivate: [AuthGuard],

  },
  {
    path: 'register',
    loadComponent: () =>
      import('./register/register.page').then((m) => m.RegisterPage),
    
  },
  {
    path: 'playlist',
    loadComponent: () =>
      import('./playlist/playlist.page').then((m) => m.PlaylistPage),
    canActivate: [AuthGuard],

  },
  {
    path: 'playlist-list',
    loadComponent: () => import('./playlist-list/playlist-list.page').then( m => m.PlaylistListPage),
    canActivate: [AuthGuard],

  },
  {
    path: 'playlist.component',
    loadComponent: () => import('./playlist.component/playlist.component.page').then( (m) => m.PlaylistModalComponent),
  },


  
];