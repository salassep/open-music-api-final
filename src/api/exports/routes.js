const routes = (handler) => [
  {
    method: 'POST',
    path: '/exports/playlists/{playlistId}',
    handler: handler.postExportSongsFromPlaylistHandler,
    options: {
      auth: 'songsapp_jwt',
    },
  },
];

module.exports = routes;
