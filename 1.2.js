const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 3000;

// Define the external API endpoint
app.get('/externalapi/photos', aesync (req, res) => {
  try {
    // Fetch all photos
    const photosResponse = await axios.get('https://jsonplaceholder.typicode.com/photos');
    const photos = photosResponse.data;

    // Apply filters
    let filteredPhotos = photos;

    if (req.query.title) {
      const titleFilter = req.query.title.toLowerCase();
      filteredPhotos = filteredPhotos.filter((photo) => photo.title.toLowerCase().includes(titleFilter));
    }

    if (req.query['album.title']) {
      const albumTitleFilter = req.query['album.title'].toLowerCase();
      filteredPhotos = filteredPhotos.filter((photo) => {
        const albumId = photo.albumId;
        const albumResponse = axios.get(`https://jsonplaceholder.typicode.com/albums/${albumId}`);
        return albumResponse.data.title.toLowerCase().includes(albumTitleFilter);
      });
    }

    if (req.query['album.user.email']) {
      const userEmailFilter = req.query['album.user.email'];
      const userPhotosResponse = await axios.get(`https://jsonplaceholder.typicode.com/users?email=${userEmailFilter}`);
      const userIds = userPhotosResponse.data.map((user) => user.id);
      filteredPhotos = filteredPhotos.filter((photo) => userIds.includes(photo.userId));
    }

    // Enrich filtered photos with album and user details
    const enrichedPhotos = await Promise.all(
      filteredPhotos.map(async (photo) => {
        const albumResponse = await axios.get(`https://jsonplaceholder.typicode.com/albums/${photo.albumId}`);
        const userResponse = await axios.get(`https://jsonplaceholder.typicode.com/users/${albumResponse.data.userId}`);

        return {
          photoId: photo.id,
          title: photo.title,
          url: photo.url,
          album: {
            albumId: albumResponse.data.id,
            albumTitle: albumResponse.data.title,
          },
          user: {
            userId: userResponse.data.id,
            username: userResponse.data.username,
            email: userResponse.data.email,
          },
        };
      })
    );

    // Return the enriched and filtered photo information
    res.json(enrichedPhotos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
n
// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${3000}`);
});
