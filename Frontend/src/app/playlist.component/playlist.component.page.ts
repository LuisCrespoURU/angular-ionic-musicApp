import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MusicService } from '../services/music.service';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Location } from '@angular/common'; // Importa Location

@Component({
  selector: 'app-playlist-component',
  templateUrl: './playlist.component.page.html',
  styleUrls: ['./playlist.component.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule],
})
export class PlaylistModalComponent implements OnInit {
  playlists: any[] = [];
  trackId: string = '';
  trackName: string = '';
  trackImageUrl: string = '';

  constructor(
    private musicService: MusicService,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location 
  ) {}

  ngOnInit() {
    this.loadPlaylists();
    this.route.queryParams.subscribe((params) => {
      this.trackId = params['trackId'];
      this.trackName = params['trackName'];
      this.trackImageUrl = params['trackImageUrl'];
    });
  }

  loadPlaylists() {
    this.musicService.getPlaylists().subscribe({
      next: (playlists) => {
        this.playlists = playlists;
      },
      error: (error) => {
        console.error('Error al cargar las playlists:', error);
      },
    });
  }

  selectPlaylist(playlist: any) {
    const songData = {
      id: this.trackId,
      name: this.trackName,
      imageUrl: this.trackImageUrl,
    };

    this.musicService.addSongToPlaylist(playlist._id, songData).subscribe({
      next: (response) => {
        console.log('Canción agregada a la playlist:', response);
        this.router.navigate(['/song-detail', this.trackId]); // Regresa a la página de detalles de la canción
      },
      error: (error) => {
        console.error('Error al agregar la canción a la playlist:', error);
      },
    });
  }

  createNewPlaylist() {
    this.router.navigate(['/playlist'], {
      queryParams: {
        trackId: this.trackId,
        trackName: this.trackName,
        trackImageUrl: this.trackImageUrl,
      },
    });
  }
  goBack() {
    this.location.back(); 
  }
}