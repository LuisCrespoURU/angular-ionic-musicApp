import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class MusicService {
  private apiUrl = 'https://spotify-angular2-yoli.vercel.app/api/music'; // URL del backend

  private playlistCreatedSubject = new BehaviorSubject<any>(null); // Emisor de eventos para playlists creadas
  playlistCreated$ = this.playlistCreatedSubject.asObservable(); // Observable para escuchar eventos de creación

  private playlistUpdatedSubject = new BehaviorSubject<any>(null); // Emisor de eventos para actualizaciones de playlists
  playlistUpdated$ = this.playlistUpdatedSubject.asObservable(); // Observable para escuchar eventos de actualización

  constructor(private http: HttpClient) {}

  // Obtener detalles de una canción por ID
  getSongById(songId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/track/${songId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
      },
    });
  }

  // Buscar canciones y artistas
  searchMusic(query: string): Observable<{ tracks: any[]; artists: any[] }> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('jwtToken')}`, // Envía el token JWT
    });

    return this.http.get<{ tracks: any[]; artists: any[] }>(`${this.apiUrl}/search`, { headers, params: { query } });
  }

  // Obtener recomendaciones
  getRecommendations(): Observable<any[]> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
    });

    return this.http.get<any[]>(`${this.apiUrl}/recommendations`, { headers });
  }

  // Obtener nuevos lanzamientos
  getNewReleases(): Observable<any[]> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('jwtToken')}`, // Envía el token JWT
    });

    return this.http.get<any[]>(`${this.apiUrl}/new-releases`, { headers });
  }

  // Obtener playlists destacadas
  getFeaturedPlaylists(): Observable<any[]> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
    });

    return this.http.get<any[]>(`${this.apiUrl}/featured-playlists`, { headers });
  }

  // Obtener álbumes populares
  getPopularAlbums(): Observable<any[]> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('jwtToken')}`, // Envía el token JWT
    });

    return this.http.get<any[]>(`${this.apiUrl}/popular`, { headers });
  }

  // Crear una nueva playlist
  createPlaylist(name: string, songs: any[]): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('jwtToken')}`, // Envía el token JWT
    });

    const payload = { name, songs };
    console.log('Payload enviado al backend:', payload); // Depuración

    return this.http.post(`${this.apiUrl}/playlists`, payload, { headers }).pipe(
      tap((response) => {
        this.notifyPlaylistCreated(response); // Notifica la creación
      })
    );
  }

  // Obtener todas las playlists o una específica por ID
  getPlaylists(playlistId?: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('jwtToken')}`, // Envía el token JWT
    });

    const url = playlistId ? `${this.apiUrl}/playlists/${playlistId}` : `${this.apiUrl}/playlists`;
    return this.http.get<any>(url, { headers });
  }

  // Actualizar una playlist existente
  updatePlaylist(id: string, data: { name: string; songs: any[] }): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('jwtToken')}`, // Envía el token JWT
    });

    return this.http.put(`${this.apiUrl}/playlists/${id}`, data, { headers }).pipe(
      tap((response) => {
        this.notifyPlaylistUpdated(response); // Notifica la actualización
      })
    );
  }

  // Eliminar una playlist
  deletePlaylist(playlistId: string): Observable<any> {
    console.log('Eliminando playlist con ID:', playlistId); // Depuración
    const headers = new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('jwtToken')}`, // Envía el token JWT
    });

    return this.http.delete(`${this.apiUrl}/playlists/${playlistId}`, { headers });
  }

  // Eliminar una canción de una playlist
  deleteSongFromPlaylist(playlistId: string, songId: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('jwtToken')}`, // Envía el token JWT
    });

    return this.http.delete(`${this.apiUrl}/playlists/${playlistId}/songs/${songId}`, { headers });
  }

  // Agregar una canción a una playlist
  addSongToPlaylist(playlistId: string, song: any): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
    });

    return this.http.post(`${this.apiUrl}/playlists/${playlistId}/songs`, song, { headers }).pipe(
      tap((response) => {
        this.notifyPlaylistUpdated(response); // Notifica que la playlist fue actualizada
      })
    );
  }

  // Notificar la creación de una playlist
  notifyPlaylistCreated(playlist: any) {
    this.playlistCreatedSubject.next(playlist); // Emite el evento de creación
  }

  // Notificar la actualización de una playlist
  notifyPlaylistUpdated(updatedPlaylist: any) {
    this.playlistUpdatedSubject.next(updatedPlaylist); // Emite el evento de actualización
  }
}
