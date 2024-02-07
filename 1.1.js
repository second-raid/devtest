const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 3000;

// Define the external API endpoint
app.get('/api/photos/:photoId', async (req, res) => {
  try {
    const photoId = req.params.photoId;

    // Fetch photo details
    const photoResponse = await axios.get(`https://jsonplaceholder.typicode.com/photos/${photoId}`);
    const photo = photoResponse.data;

    // Fetch album details
    const albumResponse = await axios.get(`https://jsonplaceholder.typicode.com/albums/${photo.albumId}`);
    const album = albumResponse.data;

    // Fetch user details
    const userResponse = await axios.get(`https://jsonplaceholder.typicode.com/users/${album.userId}`);
    const user = userResponse.data;

    // Enrich photo information with album and user details
    const enrichedPhoto = {
      photoId: photo.id,
      title: photo.title,
      url: photo.url,
      album: {
        albumId: album.id,
        albumTitle: album.title,
      },
      user: {
        userId: user.id,
        username: user.username,
        email: user.email,
      },
    };

    // Return the enriched photo information
    res.json(enrichedPhoto);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Start the server
app.listen(3000, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});