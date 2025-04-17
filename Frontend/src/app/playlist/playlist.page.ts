import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { MusicService } from '../services/music.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../navbar/navbar.component';
import { AudioPlayerComponent } from '../audio-player/audio-player.component';
import { Location } from '@angular/common';


@Component({
  selector: 'app-playlist',
  templateUrl: './playlist.page.html',
  styleUrls: ['./playlist.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, NavbarComponent, AudioPlayerComponent],
})
export class PlaylistPage implements OnInit {
  playlistName: string = '';
  selectedSongs: { id: string; name: string; imageUrl?: string }[] = [];
  isEditMode: boolean = false;
  playlistId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private musicService: MusicService,
    private location: Location
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.playlistId = params['playlistId'] || null;

      if (!this.playlistName) {
        this.playlistName = params['playlistName'] || 'Nueva Playlist';
      }

      this.isEditMode = !!this.playlistId;

      const trackId = params['trackId'];
      const trackName = params['trackName'];
      const trackImageUrl = params['trackImageUrl']; // Captura la URL de la imagen
      if (trackId && trackName) {
        this.addSong({ id: trackId, name: trackName, imageUrl: trackImageUrl });
      }
    });

    if (this.isEditMode && this.playlistId) {
      this.loadPlaylist(this.playlistId);
    }
  }

  loadPlaylist(playlistId: string) {
    if (!playlistId) {
      console.error('El ID de la playlist es inválido.');
      return;
    }

    this.musicService.getPlaylists(playlistId).subscribe({
      next: (playlist) => {
        this.playlistName = playlist.name;
        this.selectedSongs = playlist.songs.map((song: any) => ({
          id: song.id,
          name: song.name,
          imageUrl: song.imageUrl || 'assets/default-song.png', // Imagen predeterminada
        }));
        console.log('Playlist cargada:', this.selectedSongs);
      },
      error: (error) => {
        console.error('Error al cargar la playlist:', error);
      },
    });
  }

  savePlaylist() {
    if (!this.playlistName.trim()) {
      console.error('El nombre de la playlist no puede estar vacío.');
      return;
    }

    if (this.selectedSongs.length === 0) {
      console.error('No hay canciones en la playlist.');
      return;
    }

    const payload = {
      name: this.playlistName,
      songs: this.selectedSongs,
    };

    if (this.isEditMode && this.playlistId) {
      this.musicService.updatePlaylist(this.playlistId, payload).subscribe({
        next: (response) => {
          console.log('Playlist actualizada:', response);
          this.router.navigate(['/home']);
        },
        error: (error) => {
          console.error('Error al actualizar la playlist:', error);
        },
      });
    } else {
      this.musicService.createPlaylist(this.playlistName, this.selectedSongs).subscribe({
        next: (response) => {
          console.log('Playlist creada:', response);
          this.musicService.notifyPlaylistCreated(response);
          this.router.navigate(['/home']);
        },
        error: (error) => {
          console.error('Error al crear la playlist:', error);
        },
      });
    }
  }

  addSong(song: { id: string; name: string; imageUrl?: string }) {
    if (!this.selectedSongs.some((s) => s.id === song.id)) {
      const completeSong = {
        ...song,
        imageUrl: song.imageUrl || 'assets/default-song.png', // Imagen predeterminada
      };
      this.selectedSongs.push(completeSong);
      console.log('Canción agregada:', completeSong);
    } else {
      console.log('La canción ya está en la playlist.');
    }
  }

  removeSong(songId: string) {
    this.selectedSongs = this.selectedSongs.filter((song) => song.id !== songId);
    console.log('Canción eliminada. Lista actualizada:', this.selectedSongs);
  }

  openAddSongModal() {
    this.router.navigate(['/search'], {
      queryParams: {
        playlistId: this.playlistId,
      },
    });
  }

  goBack() {
    this.location.back();
  }
}
