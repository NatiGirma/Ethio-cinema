// Real cinema locations in Ethiopia
const cinemas = [
    { name: "Edna Mall Cinema", address: "Edna Mall, Bole, Addis Ababa", latitude: 9.0114, longitude: 38.7669, movies: [
        { title: "Balageru", trailer: "https://www.youtube.com/embed/dQw4w9WgXcQ", image: "balageru.jpg" },
        { title: "Yebeteseb Chewata", trailer: "https://www.youtube.com/embed/dQw4w9WgXcQ", image: "yebeteseb_chewata.jpg" }
    ]},
    { name: "Friendship Cinema", address: "Friendship Mall, Megenagna, Addis Ababa", latitude: 9.0175, longitude: 38.7694, movies: [
        { title: "Ewket", trailer: "https://www.youtube.com/embed/dQw4w9WgXcQ", image: "ewket.jpg" },
        { title: "Teza", trailer: "https://www.youtube.com/embed/dQw4w9WgXcQ", image: "teza.jpg" }
    ]},
    { name: "Cinema Addis", address: "Addis Ababa, Bole", latitude: 9.03, longitude: 38.76, movies: [
        { title: "Fekat", trailer: "https://www.youtube.com/embed/dQw4w9WgXcQ", image: "fekat.jpg" },
        { title: "Difret", trailer: "https://www.youtube.com/embed/dQw4w9WgXcQ", image: "difret.jpg" }
    ]},
    { name: "Dire Dawa Cinema", address: "Dire Dawa", latitude: 9.5917, longitude: 41.8650, movies: [
        { title: "Wend Barya", trailer: "https://www.youtube.com/embed/dQw4w9WgXcQ", image: "wend_barya.jpg" },
        { title: "Enchewawot", trailer: "https://www.youtube.com/embed/dQw4w9WgXcQ", image: "enchewawot.jpg" }
    ]},
    { name: "Mekelle Cinema", address: "Mekelle", latitude: 13.4967, longitude: 39.4698, movies: [
        { title: "Ayrak", trailer: "https://www.youtube.com/embed/dQw4w9WgXcQ", image: "ayrak.jpg" },
        { title: "Teza", trailer: "https://www.youtube.com/embed/dQw4w9WgXcQ", image: "teza.jpg" }
    ]}
];

// Initialize the map
const map = L.map('map').setView([9.03, 38.76], 8); // Centered on Addis Ababa

// Add OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
}).addTo(map);

// User Role Selection
document.getElementById('role-select').addEventListener('click', function() {
    const userRole = document.getElementById('user-role').value;

    // Hide both forms initially
    document.getElementById('client-form').style.display = 'none';
    document.getElementById('cinema-owner-form').style.display = 'none';

    // Show the appropriate form based on the selected role
    if (userRole === 'client') {
        document.getElementById('client-form').style.display = 'block';
    } else if (userRole === 'cinema-owner') {
        document.getElementById('cinema-owner-form').style.display = 'block';
    } else {
        alert('Please select a valid role.');
    }
});

// Get the client's location
document.getElementById('get-location').addEventListener('click', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords;
            findNearestCinema(latitude, longitude);
            map.setView([latitude, longitude], 13); // Zoom in on user's location
            L.marker([latitude, longitude]).addTo(map).bindPopup('You are here!').openPopup();
        }, error => {
            console.error('Error getting location:', error);
            alert('Unable to retrieve your location.');
        });
    } else {
        alert('Geolocation is not supported by this browser.');
    }
});

// Search for a specific location
document.getElementById('search-location').addEventListener('click', () => {
    const locationInput = document.getElementById('location-input').value;
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${locationInput}`)
        .then(response => response.json())
        .then(data => {
            if (data.length > 0) {
                const { lat, lon } = data[0];
                map.setView([lat, lon], 13);
                L.marker([lat, lon]).addTo(map).bindPopup('Searched Location').openPopup();
                findNearestCinema(lat, lon); // Find nearest cinema based on searched location
            } else {
                alert('Location not found.');
            }
        })
        .catch(error => {
            console.error('Error fetching location:', error);
            alert('An error occurred while searching for the location.');
        });
});

// Search for a selected city
document.getElementById('search-city').addEventListener('click', () => {
    const locationSelect = document.getElementById('location-select');
    const selectedLocation = locationSelect.value;
    const selectedCinema = cinemas.find(cinema => cinema.address.includes(selectedLocation));

    if (selectedCinema) {
        map.setView([selectedCinema.latitude, selectedCinema.longitude], 13);
        L.marker([selectedCinema.latitude, selectedCinema.longitude]).addTo(map).bindPopup(selectedCinema.name).openPopup();
        updateResults(selectedCinema.name, selectedCinema.address, selectedCinema.movies);
    } else {
        alert('No cinemas found in the selected location.');
    }
});

// Find the nearest cinema
function findNearestCinema(latitude, longitude) {
    const distances = cinemas.map(cinema => ({
        name: cinema.name,
        address: cinema.address,
        movies: cinema.movies,
        distance: calculateDistance(latitude, longitude, cinema.latitude, cinema.longitude)
    }));

    // Find the nearest cinema
    const nearestCinema = distances.reduce((a, b) => (a.distance < b.distance ? a : b));

    // Update the HTML with the nearest cinema and movie listings
    updateResults(nearestCinema.name, nearestCinema.address, nearestCinema.movies);
}

// Calculate distance between two coordinates
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
}

// Update the HTML with the results
function updateResults(cinemaName, cinemaAddress, movies) {
    document.getElementById('cinema-name').textContent = cinemaName;
    document.getElementById('cinema-address').textContent = cinemaAddress;

    const movieListElement = document.getElementById('movie-list');
    movieListElement.innerHTML = '';

    if (movies.length === 0) {
        movieListElement.innerHTML = '<li>No movies showing today.</li>';
    } else {
        movies.forEach(movie => {
            const movieItem = document.createElement('li');
            const movieLink = document.createElement('a');
            movieLink.href = '#';
            movieLink.textContent = movie.title;
            movieLink.addEventListener('click', () => openTrailerModal(movie.trailer));
            movieItem.appendChild(movieLink);
            movieListElement.appendChild(movieItem);
        });
    }
}

// Open the ticket purchase modal
function openTicketModal(movieTitle) {
    document.getElementById('movie-title').value = movieTitle;
    $('#ticketModal').modal('show');
}

// Open the movie trailer modal
function openTrailerModal(trailerUrl) {
    const trailerIframe = document.querySelector('#trailerModal iframe');
    trailerIframe.src = trailerUrl;
    $('#trailerModal').modal('show');
}

// Handle ticket purchase form submission
document.getElementById('ticket-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const movieTitle = document.getElementById('movie-title').value;
    const paymentMethod = document.getElementById('payment-method').value;
    const clientName = document.getElementById('client-name').value;

    // Generate a random chair number
    const chairNumber = Math.floor(Math.random() * 100) + 1; // Random chair number between 1 and 100

    // Simulate payment processing
    alert(`Thank you, ${clientName}! You have purchased a ticket for "${movieTitle}" using ${paymentMethod}. Your chair number is ${chairNumber}.`);
    $('#ticketModal').modal('hide');
});

// Register Cinema Owner
document.getElementById('register-cinema').addEventListener('click', function() {
    const cinemaName = document.getElementById('cinema-name-input').value;
    const cinemaLocation = document.getElementById('cinema-location-input').value;
    const movieTitle = document.getElementById('movie-title-input').value;
    const showtime = document.getElementById('showtime-input').value;
    const fee = document.getElementById('fee-input').value;

    if (cinemaName && cinemaLocation && movieTitle && showtime && fee) {
        // Add the new cinema to the cinemas array
        cinemas.push({
            name: cinemaName,
            address: cinemaLocation,
            latitude: 0, // Placeholder, you can implement geocoding for the location
            longitude: 0, // Placeholder
            movies: [{ title: movieTitle, trailer: "https://www.youtube.com/embed/dQw4w9WgXcQ", image: "" }] // Add more details as needed
        });

        // Display success message
        document.getElementById('registration-message').textContent = `Thank you for joining us, ${cinemaName}! You have successfully registered your cinema.`;
        
        // Clear the input fields
        document.getElementById('cinema-name-input').value = '';
        document.getElementById('cinema-location-input').value = '';
        document.getElementById('movie-title-input').value = '';
        document.getElementById('showtime-input').value = '';
        document.getElementById('fee-input').value = '';
    } else {
        alert('Please fill in all fields.');
    }
});