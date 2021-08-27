const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');

class PlaylistSongsService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
  }

  async addPlaylistSong(playlistId, songId) {
    const query = {
      text: 'INSERT INTO playlistsongs VALUES(DEFAULT, $1, $2) RETURNING id',
      values: [playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Lagu gagal ditambahkan ke playlist');
    }

    await this._cacheService.delete(`songs:${playlistId}`);
    return result.rows[0].id;
  }

  async getPlaylistSongs(playlistId) {
    try {
      const result = await this._cacheService.get(`songs:${playlistId}`);

      return JSON.parse(result);
    } catch (error) {
      const query = {
        text: 'SELECT songs.id, songs.title, songs.performer FROM songs LEFT JOIN playlistsongs ON playlistsongs.song_id = songs.id LEFT JOIN playlists ON playlists.id = playlistsongs.playlist_id WHERE playlists.id = $1',
        values: [playlistId],
      };

      const result = await this._pool.query(query);

      await this._cacheService.set(`songs:${playlistId}`, JSON.stringify(result.rows));

      return result.rows;
    }
  }

  async deletePlaylistSong(playlistId, songId) {
    const query = {
      text: 'DELETE FROM playlistsongs WHERE playlist_id = $1 AND song_id = $2 RETURNING id',
      values: [playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Lagu gagal dihapus dari playlist');
    }

    await this._cacheService.delete(`songs:${playlistId}`);
  }
}

module.exports = PlaylistSongsService;
