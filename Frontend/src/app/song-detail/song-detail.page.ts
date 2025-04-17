import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { MusicService } from '../services/music.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import ColorThief from 'color-thief-browser';
import { PlaylistModalComponent } from '../playlist.component/playlist.component.page';
import { Location } from '@angular/common'; // Importa Location

@Component({
  selector: 'app-song-detail',
  templateUrl: './song-detail.page.html',
  styleUrls: ['./song-detail.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
  ],
})
export class SongDetailPage implements OnInit {
  song: any;
  artistNames: string = '';
  backgroundColor: string = 'black';

  @ViewChild('albumImage', { static: false }) albumImage!: ElementRef;
  @ViewChild('audioPlayer', { static: false }) audioPlayer!: ElementRef;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private musicService: MusicService,
    private modalController: ModalController,
    private location: Location // Inyecta Location
  ) {}

  ngOnInit() {
    const songId = this.route.snapshot.paramMap.get('id');
    if (songId) {
      this.loadSongDetails(songId);
    } else {
      console.error('Song ID is null');
    }
  }

  loadSongDetails(songId: string) {
    this.musicService.getSongById(songId).subscribe({
      next: (song) => {
        this.song = song;
        this.artistNames = song.artists.map((artist: any) => artist.name).join(', ');
      },
      error: (error) => {
        console.error('Error al cargar los detalles de la canción:', error);
      },
    });
  }

  onImageLoad() {
    if (this.albumImage && this.albumImage.nativeElement) {
      const img = this.albumImage.nativeElement as HTMLImageElement;

      const colorThief = new ColorThief();
      const dominantColor = colorThief.getColor(img);
      this.backgroundColor = `rgb(${dominantColor[0]}, ${dominantColor[1]}, ${dominantColor[2]})`;
    } else {
      console.error('La referencia a la imagen no está disponible.');
    }
  }

  formatDuration(durationMs: number): string {
    const minutes = Math.floor(durationMs / 60000);
    const seconds = Math.floor((durationMs % 60000) / 1000);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }

  playPreview() {
    const audio: HTMLAudioElement = this.audioPlayer.nativeElement;
    audio.play();
  }

  pausePreview() {
    const audio: HTMLAudioElement = this.audioPlayer.nativeElement;
    audio.pause();
  }

    openAddToPlaylist() {
    this.router.navigate(['/playlist.component'], {
      queryParams: {
        trackId: this.song.id,
        trackName: this.song.name,
        trackImageUrl: this.song.album.images[0]?.url,
      },
    });
  }

  async loadPlaylists() {
    return new Promise((resolve, reject) => {
      this.musicService.getPlaylists().subscribe({
        next: (playlists) => resolve(playlists),
        error: (error) => reject(error),
      });
    });
  }

  addToPlaylist(playlist: any) {
    const songData = {
      id: this.song.id,
      name: this.song.name,
      imageUrl: this.song.album.images[0]?.url,
    };

    console.log('Datos de la canción:', songData);
    console.log('Playlist seleccionada:', playlist);

    this.musicService.addSongToPlaylist(playlist._id, songData).subscribe({
      next: (response) => {
        console.log('Canción agregada a la playlist:', response);
      },
      error: (error) => {
        console.error('Error al agregar la canción a la playlist:', error);
      },
    });
  }

  goBack() {
    this.location.back(); // Navega hacia atrás en el historial del navegador
  }
}