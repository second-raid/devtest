const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 3000;

// Define the internal API endpoints
const usersEndpoint = 'https://jsonplaceholder.typicode.com/users';
const albumsEndpoint = 'https://jsonplaceholder.typicode.com/albums';
const photosEndpoint = 'https://jsonplaceholder.typicode.com/photos';

// External API endpoint for data enrichment
app.get('/externalapi/photos/:photoId', async (req, res) => {
  try {
    const photoId = req.params.photoId;

    // Fetch photo details
    const photoResponse = await axios.get(`${photosEndpoint}/${photoId}`);
    const photoData = photoResponse.data;

    // Fetch album details
    const albumResponse = await axios.get(`${albumsEndpoint}/${photoData.albumId}`);
    const albumData = albumResponse.data;

    // Fetch user details
    const userResponse = await axios.get(`${usersEndpoint}/${albumData.userId}`);
    const userData = userResponse.data;

    // Combine data for enrichment
    const enrichedData = {
      photoId: photoData.id,
      title: photoData.title,
      album: {
        albumId: albumData.id,
        title: albumData.title,
      },
      user: {
        userId: userData.id,
        name: userData.name,
        username: userData.username,
      },
    };

    // Send enriched data as JSON response
    res.json(enrichedData);
  } catch (error) {
    // Handle errors
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
