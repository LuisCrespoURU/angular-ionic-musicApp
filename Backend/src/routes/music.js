const express = require('express');
const axios = require('axios');
const authMiddleware = require('../middleware/authMiddleware');
const { getValidSpotifyAccessToken } = require('../utils/spotifyUtils');
const Playlist = require('../models/Playlist'); 

const router = express.Router();

// Ruta para buscar canciones y artistas
router.get('/search', authMiddleware, async (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ error: 'El término de búsqueda es obligatorio' });
  }

  try {
    // Obtén un token válido
    const token = await getValidSpotifyAccessToken();

    // Llama a la API de Spotify
    const response = await axios.get('https://api.spotify.com/v1/search', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        q: query,
        type: 'track', // Incluye tanto canciones como artistas
        limit: 50, // Puedes ajustar el límite según tus necesidades
      },
    });

    // Filtra y estructura los datos relevantes
    const tracks = response.data.tracks?.items.map((track) => ({
      id: track.id,
      name: track.name,
      artists: track.artists.map((artist) => artist.name).join(', '),
      album: track.album.name,
      releaseDate: track.album.release_date,
      durationMs: track.duration_ms,
      previewUrl: track.preview_url,
      imageUrl: track.album.images[0]?.url,
    })) || [];

    const artists = response.data.artists?.items.map((artist) => ({
      id: artist.id,
      name: artist.name,
      genres: artist.genres,
      followers: artist.followers.total,
      imageUrl: artist.images[0]?.url,
    })) || [];

    // Devuelve primero los artistas y luego las canciones
    res.json({ artists, tracks });
  } catch (error) {
    console.error('Error al llamar a la API de música:', error.response?.data || error.message);
    res.status(500).json({ error: 'Error al obtener datos de música', details: error.response?.data || error.message });
  }
});

// Ruta para obtener detalles de una canción
router.get('/track/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ error: 'El ID de la canción es obligatorio' });
  }

  try {
    // Obtén un token válido
    const token = await getValidSpotifyAccessToken();

    // Llama a la API de Spotify para obtener los detalles de la canción
    const response = await axios.get(`https://api.spotify.com/v1/tracks/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // Estructura los datos relevantes
    const track = {
      id: response.data.id,
      name: response.data.name,
      artists: response.data.artists.map((artist) => artist.name),
      album: {
        name: response.data.album.name,
        release_date: response.data.album.release_date,
        images: response.data.album.images,
      },
      duration_ms: response.data.duration_ms,
      preview_url: response.data.preview_url,
    };

    res.json(track); // Devuelve los datos al frontend
  } catch (error) {
    console.error('Error al obtener los detalles de la canción:', error.response?.data || error.message);
    res.status(500).json({ error: 'Error al obtener los detalles de la canción', details: error.response?.data || error.message });
  }
});

// Ruta para obtener álbumes y sencillos populares
router.get('/popular', async (req, res) => {
  try {
    const token = await getValidSpotifyAccessToken();
    console.log('Token de Spotify:', token);

    const response = await axios.get('https://api.spotify.com/v1/browse/new-releases', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        limit: 10,
        offset: 0,
      },
    });

    console.log('Respuesta de Spotify:', response.data);

    const albums = response.data.albums.items.map((album) => ({
      id: album.id,
      name: album.name,
      artists: album.artists.map((artist) => artist.name).join(', '),
      releaseDate: album.release_date,
      imageUrl: album.images[0]?.url,
    }));

    res.json(albums);
  } catch (error) {
    console.error('Error al obtener álbumes populares:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Error al obtener álbumes populares',
      details: error.response?.data || error.message,
    });
  }
});

// Ruta para obtener la vista previa de una canción
router.get('/preview', async (req, res) => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'La URL de la vista previa es obligatoria' });
  }

  try {
    const response = await axios.get(url, { responseType: 'stream' });
    res.set('Content-Type', response.headers['content-type']);
    response.data.pipe(res);
  } catch (error) {
    console.error('Error al obtener la vista previa:', error.message);
    res.status(500).json({ error: 'Error al obtener la vista previa' });
  }
});

router.get('/recommendations', authMiddleware, async (req, res) => {
  const token = await getValidSpotifyAccessToken();

  try {
    const response = await axios.get('https://api.spotify.com/v1/recommendations', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        seed_artists: '4NHQUGzhtTLFvgF5SZesLK', // puedes cambiarlo
        seed_genres: 'pop',
        limit: 10
      },
    });

    const recommendations = response.data.tracks.map((track) => ({
      id: track.id,
      name: track.name,
      artists: track.artists.map(a => a.name).join(', '),
      album: track.album.name,
      imageUrl: track.album.images[0]?.url,
      previewUrl: track.preview_url,
    }));

    res.json(recommendations);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener recomendaciones' });
  }
});


router.get('/new-releases', authMiddleware, async (req, res) => {
  const token = await getValidSpotifyAccessToken();

  try {
    const response = await axios.get('https://api.spotify.com/v1/browse/new-releases', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        limit: 10,
        country: 'US'
      },
    });

    const releases = response.data.albums.items.map((album) => ({
      id: album.id,
      name: album.name,
      artists: album.artists.map(a => a.name).join(', '),
      imageUrl: album.images[0]?.url,
      releaseDate: album.release_date,
    }));

    res.json(releases);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener nuevos lanzamientos' });
  }
});


router.get('/featured-playlists', authMiddleware, async (req, res) => {
  const token = await getValidSpotifyAccessToken();

  try {
    const response = await axios.get('https://api.spotify.com/v1/browse/featured-playlists', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        limit: 10,
        country: 'US',
      },
    });

    const playlists = response.data.playlists.items.map((playlist) => ({
      id: playlist.id,
      name: playlist.name,
      description: playlist.description,
      imageUrl: playlist.images[0]?.url,
    }));

    res.json(playlists);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener playlists destacadas' });
  }
});

// Ruta para crear una playlist
router.post('/playlists', authMiddleware, async (req, res) => {
  const { name, songs } = req.body;
  const userId = req.user.id;

  if (!name) {
    return res.status(400).json({ error: 'El nombre de la playlist es obligatorio' });
  }

  try {
    const newPlaylist = new Playlist({
      name,
      songs: songs || [],
      createdBy: userId,
    });

    const savedPlaylist = await newPlaylist.save();
    res.status(201).json(savedPlaylist);
  } catch (error) {
    console.error('Error al crear la playlist:', error);
    res.status(500).json({ error: 'Error al crear la playlist' });
  }
});

// Ruta para obtener todas las playlists del usuario autenticado
router.get('/playlists', authMiddleware, async (req, res) => {
  const userId = req.user.id;

  try {
    const playlists = await Playlist.find({ createdBy: userId });
    res.json(playlists);
  } catch (error) {
    console.error('Error al obtener las playlists:', error);
    res.status(500).json({ error: 'Error al obtener las playlists' });
  }
});

// Ruta para obtener una playlist específica por ID
router.get('/playlists/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    const playlist = await Playlist.findById(id);

    if (!playlist) {
      return res.status(404).json({ error: 'Playlist no encontrada' });
    }

    res.json(playlist);
  } catch (error) {
    console.error('Error al obtener la playlist:', error);
    res.status(500).json({ error: 'Error al obtener la playlist' });
  }
});

// Ruta para actualizar una playlist
router.put('/playlists/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { songs } = req.body;

  try {
    const updatedPlaylist = await Playlist.findByIdAndUpdate(
      id,
      { $set: { songs } },
      { new: true }
    );

    if (!updatedPlaylist) {
      return res.status(404).json({ error: 'Playlist no encontrada' });
    }

    res.json(updatedPlaylist);
  } catch (error) {
    console.error('Error al actualizar la playlist:', error);
    res.status(500).json({ error: 'Error al actualizar la playlist' });
  }
});

// Ruta para agregar una canción a una playlist
router.post('/playlists/:playlistId/songs', authMiddleware, async (req, res) => {
  const { playlistId } = req.params;
  const song = req.body;

  try {
    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
      return res.status(404).json({ error: 'Playlist no encontrada' });
    }

    const completeSong = {
      ...song,
      imageUrl: song.imageUrl || 'assets/default-song.png',
    };

    playlist.songs.push(completeSong);
    const updatedPlaylist = await playlist.save();

    res.json(updatedPlaylist);
  } catch (error) {
    console.error('Error al agregar la canción a la playlist:', error);
    res.status(500).json({ error: 'Error al agregar la canción a la playlist' });
  }
});

// Ruta para eliminar una canción de una playlist
router.delete('/playlists/:playlistId/songs/:songId', authMiddleware, async (req, res) => {
  const { playlistId, songId } = req.params;

  try {
    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
      return res.status(404).json({ error: 'Playlist no encontrada' });
    }

    playlist.songs = playlist.songs.filter((song) => song.id !== songId);
    const updatedPlaylist = await playlist.save();

    res.json(updatedPlaylist);
  } catch (error) {
    console.error('Error al eliminar la canción de la playlist:', error);
    res.status(500).json({ error: 'Error al eliminar la canción de la playlist' });
  }
});

// Ruta para eliminar una playlist
router.delete('/playlists/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    const playlist = await Playlist.findByIdAndDelete(id);

    if (!playlist) {
      return res.status(404).json({ error: 'Playlist no encontrada' });
    }

    res.json({ message: 'Playlist eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar la playlist:', error);
    res.status(500).json({ error: 'Error al eliminar la playlist' });
  }
});

module.exports = router;