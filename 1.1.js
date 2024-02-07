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
});