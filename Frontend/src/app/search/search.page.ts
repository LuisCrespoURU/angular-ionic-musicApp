import { Component, Input } from '@angular/core';
import { Router } from '@angular/router'; // Importa el Router
import { MusicService } from '../services/music.service';
import { TrackService } from '../services/track.service'; // Importa el servicio
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../navbar/navbar.component';
import { HttpClient } from '@angular/common/http'; // Importa HttpClient
import { ModalController } from '@ionic/angular'; // Importa ModalController
import { AudioPlayerComponent } from '../audio-player/audio-player.component'; // Importa el componente

@Component({
  selector: 'app-search',
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    NavbarComponent,
    AudioPlayerComponent // Registra el componente aquí
  ]
})
export class SearchPage {
  @Input() isModal: boolean = false; // Determina si el componente se usa como modal
  searchQuery: string = ''; // Consulta de búsqueda
  artist: any = null; // Artista principal
  tracks: any[] = []; // Canciones del artista
  musicResults: any[] = []; // Resultados de canciones
  artistResults: any[] = []; // Resultados de artistas
  savedTracks: Set<string> = new Set(); // Almacena los IDs de las canciones guardadas

  // Propiedades para filtros
  selectedDuration: string = ''; // Duración seleccionada
  selectedSort: string = ''; // Orden seleccionado

  constructor(
    private musicService: MusicService,
    private router: Router,
    private trackService: TrackService, // Inyecta el servicio
    private http: HttpClient, // Inyecta HttpClient
    private modalController: ModalController // Inyecta ModalController
  ) {}

  search(query: string) {
    if (!query.trim()) {
      this.artist = null;
      this.tracks = [];
      this.musicResults = [];
      this.artistResults = [];
      return;
    }

    this.musicService.searchMusic(query).subscribe((response) => {
      this.artist = response.artists; // Artista principal
      this.tracks = response.tracks; // Canciones del artista
      this.musicResults = response.tracks; // Canciones
      this.artistResults = response.artists; // Artistas
    });
  }

  formatDuration(durationMs: number): string {
    const minutes = Math.floor(durationMs / 60000);
    const seconds = Math.floor((durationMs % 60000) / 1000);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }

  goToSongDetail(trackId: string) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const username = currentUser.username; // Obtén el username del usuario actual
  
    if (!username) {
      console.error('No se encontró el usuario actual.');
      return;
    }
  
    const track = this.musicResults.find((t) => t.id === trackId);
  
    if (track) {
      // Usa el servicio para enviar la canción al backend
      this.trackService.saveViewedTrack(username, track).subscribe({
        next: (response) => {
          console.log('Canción guardada:', response);
        },
        error: (error) => {
          console.error('Error al guardar la canción:', error);
        },
      });
    }
  
    // Navegar a la página de detalles de la canción
    this.router.navigate(['/song-detail', trackId]);
  }

  addToPlaylist(track: any, event: Event) {
    event.stopPropagation(); // Detiene la propagación del evento hacia el contenedor padre
    if (this.savedTracks.has(track.id)) {
      this.savedTracks.delete(track.id); // Elimina de la lista de guardados
      console.log(`Canción eliminada de la playlist: ${track.name}`);
    } else {
      this.savedTracks.add(track.id); // Agrega a la lista de guardados
      console.log(`Canción guardada en la playlist: ${track.name}`);
    }

    // Redirige a la página de la playlist con los datos de la canción seleccionada
    this.router.navigate(['/playlist'], {
      queryParams: {
        trackId: track.id,
        trackName: track.name,
      },
    });
  }

  closeModal() {
    this.modalController.dismiss();
  }

  // Método para aplicar filtros
  applyFilters() {
    // Filtrar por duración
    this.musicResults = this.musicResults.filter((track) => {
      const durationMinutes = track.durationMs / 60000;
      return (
        !this.selectedDuration ||
        (this.selectedDuration === 'short' && durationMinutes < 3) ||
        (this.selectedDuration === 'medium' && durationMinutes >= 3 && durationMinutes <= 5) ||
        (this.selectedDuration === 'long' && durationMinutes > 5)
      );
    });

    // Ordenar por título
    if (this.selectedSort === 'asc') {
      this.musicResults.sort((a, b) => a.name.localeCompare(b.name));
    } else if (this.selectedSort === 'desc') {
      this.musicResults.sort((a, b) => b.name.localeCompare(a.name));
    }
  }
}
