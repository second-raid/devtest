<<<<<<< HEAD
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
=======
const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 3000;

// Define the internal API endpoints
const usersEndpoint = 'https://jsonplaceholder.typicode.com/users';
const albumsEndpoint = 'https://jsonplaceholder.typicode.com/albums';
const photosEndpoint = 'https://jsonplaceholder.typicode.com/photos';

// External API endpoint for data enrichment, filtering, and pagination
app.get('/externalapi/photos', async (req, res) => {
  try {
    // Extract query parameters
    const { title, 'album.title': albumTitle, 'album.user.email': userEmail, limit = 25, offset = 0 } = req.query;

    // Fetch all photos
    const photosResponse = await axios.get(photosEndpoint);
    const allPhotos = photosResponse.data;

    // Filter photos based on query parameters
    const filteredPhotos = allPhotos.filter((photo) => {
      const matchTitle = !title || photo.title.includes(title);
      const matchAlbumTitle = !albumTitle || (photo.albumId && (await doesAlbumTitleMatch(photo.albumId, albumTitle)));
      const matchUserEmail = !userEmail || (photo.albumId && (await doesUserEmailMatch(photo.albumId, userEmail)));

      return matchTitle && matchAlbumTitle && matchUserEmail;
    });   

    // Apply pagination
    const slicedPhotos = filteredPhotos.slice(offset, offset + limit);

    // Enrich and send the filtered and paginated data as JSON response
    const enrichedData = await enrichData(slicedPhotos);
    res.json(enrichedData);
  } catch (error) {
    // Handle errors
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Helper function to check if album title matches
async function doesAlbumTitleMatch(albumId, albumTitle) {
  const albumResponse = await axios.get(`${albumsEndpoint}/${albumId}`);
  const albumData = albumResponse.data;
  return albumData.title.includes(albumTitle);
}

// Helper function to check if user email matches
async function doesUserEmailMatch(albumId, userEmail) {
  const albumResponse = await axios.get(`${albumsEndpoint}/${albumId}`);
  const albumData = albumResponse.data;

  const userResponse = await axios.get(`${usersEndpoint}/${albumData.userId}`);
  const userData = userResponse.data;

  return userData.email === userEmail;
}

// Helper function to enrich data
async function enrichData(photos) {
  const enrichedData = [];
  for (const photo of photos) {
    const albumResponse = await axios.get(`${albumsEndpoint}/${photo.albumId}`);
    const albumData = albumResponse.data;

    const userResponse = await axios.get(`${usersEndpoint}/${albumData.userId}`);
    const userData = userResponse.data;

    enrichedData.push({
      photoId: photo.id,
      title: photo.title,
      album: {
        albumId: albumData.id,
        title: albumData.title,
      },
      user: {
        userId: userData.id,
        name: userData.name,
        username: userData.username,
      },
    });
  }
  return enrichedData;
}

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
>>>>>>> 73385846eaff926f26afc733c8c31e43c66895e3
});