// Mapbox access token and initialization
mapboxgl.accessToken = 'pk.eyJ1IjoibGFicGFycXVlcGF0cmljaW9zIiwiYSI6ImNqOWE4OGY3MjEweHEzM3FtZHl0dmV5azEifQ.uIJaP80p-gQXAvPG8tF-3w';
const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/labparquepatricios/cm0l88ug2008q01qodhxvfwek',
    center: [16.37, 48.20], // starting position [lng, lat]. Note that lat must be set between -90 and 90
    zoom: 12.9, // starting zoom
    minZoom: 10,
    maxZoom: 16 
});

// Loading spinner
document.getElementById('loading-spinner').style.display = 'flex';

// SIDEBAR

document.addEventListener('DOMContentLoaded', () => {
    const introSidebar = document.getElementById('intro-sidebar');
    const mapSidebar = document.getElementById('map-sidebar');
    const districtsSidebar = document.getElementById('districts-sidebar');

    const btnToMap = document.getElementById('BtnToMap');
    const btnToInfo = document.getElementById('BtnToInfo');

    const checkEligibilityBtn = document.getElementById('checkEligibilityBtn');
    const closeFormBtn = document.getElementById('closeFormBtn');

    btnToMap.addEventListener('click', () => {
        introSidebar.style.display = 'none';
        mapSidebar.style.display = 'block';
    });

    btnToInfo.addEventListener('click',() => {
        mapSidebar.style.display = 'none';
        introSidebar.style.display = 'block';
    });

    document.getElementById('districtsViewBtn').classList.add('active');


    checkEligibilityBtn.addEventListener('click', () => {
        introSidebar.style.display = 'none';
        mapSidebar.style.display = 'none';
        districtsSidebar.style.display = 'block'; // Adjust if needed
    });

    closeFormBtn.addEventListener('click', () => {
        // Hide eligibility form or perform other actions
        document.getElementById('formView').style.display = 'none';
    });
});

// INFO BUTTONS

document.querySelector('.question-button').addEventListener('click', function() {
    Swal.fire({
        title: 'Green Spaces Coverage',
        text: 'It refers to the amount of land in an area that is covered by vegetation such as trees, grass, and other greenery.',
        confirmButtonText: 'Got it!',
        background: '#f0f0f0',
        confirmButtonColor: '#9b1c1f'
    });
});

// Map load event
map.on('load', () => {
    document.getElementById('loading-spinner').style.display = 'none';

    // Add sources
    map.addSource('big-gs', { type: 'geojson', data: 'json/big-gs.geojson'
    });
    map.addSource('medium-gs', { type: 'geojson',data: 'json/medium-gs.geojson'
    });
    map.addSource('small-gs', { type: 'geojson', data: 'json/small-gs.geojson'
    });
    map.addSource('social-housing', { type: 'geojson', data: 'json/social-housing.json'
    });

    map.addLayer({
        'id': 'social-housing',
        'type': 'fill',
        'source': 'social-housing',
        'paint': {
            'fill-color': '#9b1c1f'
        }
    }); 

    
    // Popup setup Social Housing
    let popup = new mapboxgl.Popup({ closeButton: false, closeOnClick: false
    });

    // Add hover event listener
    map.on('mouseenter', 'social-housing', (e) => {
        const properties = e.features[0].properties;
        const hofname = properties.HOFNAME || "N/A";
        const address = properties.ADRESSE || "N/A";
        const year = properties.BAUJAHR || "N/A";
        const units = properties.WOHNUNGSANZAHL || "N/A";   

        const popupContent = `
            <div>
                <h3>${hofname}</h3>
                <p>Constructed in ${year}</p>
                <p><strong>No. of units:</strong> ${units}</p>
                <p><strong>Address:</strong> ${address}</p>
            </div>
        `;

        // Set popup content and position
        popup.setLngLat(e.lngLat)
            .setHTML(popupContent)
            .addTo(map);

        map.getCanvas().style.cursor = 'pointer'; // Change the cursor style on hover
    });


    // Reset the cursor and remove popup when the mouse leaves
    map.on('mouseleave', 'social-housing', () => {
        popup.remove();
        map.getCanvas().style.cursor = '';
    });


    // Add click event listener to social housing layer
    map.on('click', 'social-housing', (e) => {
        const properties = e.features[0].properties;
        const hofname = properties.HOFNAME || "N/A";
        const address = properties.ADRESSE || "N/A";
        const year = properties.BAUJAHR || "N/A";
        const units = properties.WOHNUNGSANZAHL || "N/A";   
        const pdfLink = properties.PDFLINK || "#"; 

        const popupContent = `
            <div>
                <h3>${hofname}</h3>
                <p>Constructed in ${year}</p>
                <p><strong>No. of units:</strong> ${units}</p>
                <p><strong>Address:</strong> ${address}</p>
                <p><a href="${pdfLink}" target="_blank">View More Details (PDF)</a></p>
            </div>
        `;

        new mapboxgl.Popup()
            .setLngLat(e.lngLat)
            .setHTML(popupContent)
            .addTo(map);
    });

    map.on('mouseenter', 'social-housing', () => {
        map.getCanvas().style.cursor = 'pointer';
    });

    map.on('mouseleave', 'social-housing', () => {
        map.getCanvas().style.cursor = '';
    });
});


// Toggle view functionality
document.getElementById('mapViewBtn').addEventListener('click', function() {
    document.getElementById('districtsView').style.display = 'none';
    document.getElementById('map').style.display = 'block';
    document.getElementById('mapViewBtn').classList.add('active');

});

// Toggle to district view
document.getElementById('districtsViewBtn').addEventListener('click', () => {
    // Hide the map and show the district view
    document.getElementById('map').style.display = 'none';
    document.getElementById('districtsView').style.display = 'block';
    document.getElementById('mapViewBtn').classList.remove('active');
    document.getElementById('districtsViewBtn').classList.add('active');
});



// ----- BUFFERS ----- //
function initializeSliders() {
    document.getElementById('big-green-coverage').value = 0; // Default to 0 for big green spaces
    document.getElementById('medium-green-coverage').value = 0;
    document.getElementById('small-green-coverage').value = 0;
}

// Call the initialization function when the page loads
document.addEventListener('DOMContentLoaded', initializeSliders);


 // Slider event listeners
 document.getElementById('big-green-coverage').addEventListener('input', updateBufferZones);
 document.getElementById('medium-green-coverage').addEventListener('input', updateBufferZones);
 document.getElementById('small-green-coverage').addEventListener('input', updateBufferZones);

 // Update buffer distance display
 document.getElementById('big-green-coverage').addEventListener('input', (event) => {
     document.getElementById('big-buffer-distance').textContent = `${event.target.value}m`;
 });
 document.getElementById('medium-green-coverage').addEventListener('input', (event) => {
     document.getElementById('medium-buffer-distance').textContent = `${event.target.value}m`;
 });
 document.getElementById('small-green-coverage').addEventListener('input', (event) => {
     document.getElementById('small-buffer-distance').textContent = `${event.target.value}m`;
 });


 function updateBufferZones() {
    const bigBufferDistance = parseInt(document.getElementById('big-green-coverage').value, 10);
    const mediumBufferDistance = parseInt(document.getElementById('medium-green-coverage').value, 10);
    const smallBufferDistance = parseInt(document.getElementById('small-green-coverage').value, 10);

    // Fetch and process each green space type
    Promise.all([
        fetch('json/big-gs.geojson').then(response => response.json()),
        fetch('json/medium-gs.geojson').then(response => response.json()),
        fetch('json/small-gs.geojson').then(response => response.json())
    ]).then(([bigData, mediumData, smallData]) => {

        // Buffer big green spaces and handle MultiPolygon
        let bigBufferFeatures = bigData.features.map(feature =>
            turf.buffer(feature, bigBufferDistance, { units: 'meters' })
        );
        const bigFeatureCollection = {
            type: 'FeatureCollection',
            features: bigBufferFeatures
        };
        const bigDissolved = turf.dissolve(bigFeatureCollection);

        // Buffer medium green spaces and handle MultiPolygon
        let mediumBufferFeatures = mediumData.features.map(feature =>
            turf.buffer(feature, Math.min(mediumBufferDistance, 400), { units: 'meters' })
        );
        const mediumFeatureCollection = {
            type: 'FeatureCollection',
            features: mediumBufferFeatures
        };
        const mediumDissolved = turf.dissolve(mediumFeatureCollection);

        // Buffer small green spaces and handle MultiPolygon
        let smallBufferFeatures = smallData.features.map(feature =>
            turf.buffer(feature, Math.min(smallBufferDistance, 200), { units: 'meters' })
        );
        const smallFeatureCollection = {
            type: 'FeatureCollection',
            features: smallBufferFeatures
        };
        const smallDissolved = turf.dissolve(smallFeatureCollection);

        // Update buffer zones

        if (bigBufferDistance > 0) {
            if (map.getSource('buffer-zone-big')) {
                map.getSource('buffer-zone-big').setData(bigDissolved);
                map.setLayoutProperty('buffer-zone-big', 'visibility', 'visible');
            } else {
                map.addSource('buffer-zone-big', {
                    type: 'geojson',
                    data: bigDissolved
                });

                map.addLayer({
                    'id': 'buffer-zone-big',
                    'type': 'fill',
                    'source': 'buffer-zone-big',
                    'paint': {
                        'fill-color': '#cf2026',
                        'fill-opacity': 0.5
                    }
                });
            }
        } else {
            map.setLayoutProperty('buffer-zone-big', 'visibility', 'none');
        }

        // Update medium buffer zone
        if (mediumBufferDistance > 0) {
            if (map.getSource('buffer-zone-medium')) {
                map.getSource('buffer-zone-medium').setData(mediumDissolved);
                map.setLayoutProperty('buffer-zone-medium', 'visibility', 'visible');
            } else {
                map.addSource('buffer-zone-medium', {
                    type: 'geojson',
                    data: mediumDissolved
                });

                map.addLayer({
                    'id': 'buffer-zone-medium',
                    'type': 'fill',
                    'source': 'buffer-zone-medium',
                    'paint': {
                        'fill-color': '#cf2026',
                        'fill-opacity': 0.5
                    }
                });
            }
        } else {
            map.setLayoutProperty('buffer-zone-medium', 'visibility', 'none');
        }

        // Update small buffer zone
        if (smallBufferDistance > 0) {
            if (map.getSource('buffer-zone-small')) {
                map.getSource('buffer-zone-small').setData(smallDissolved);
                map.setLayoutProperty('buffer-zone-small', 'visibility', 'visible');
            } else {
                map.addSource('buffer-zone-small', {
                    type: 'geojson',
                    data: smallDissolved
                });

                map.addLayer({
                    'id': 'buffer-zone-small',
                    'type': 'fill',
                    'source': 'buffer-zone-small',
                    'paint': {
                        'fill-color': '#cf2026',
                        'fill-opacity': 0.5
                    }
                });
            }
        } else {
            map.setLayoutProperty('buffer-zone-small', 'visibility', 'none');
        }


        
    }).catch(err => console.error('Error loading green spaces data:', err));
}

// --- FORM --- //

const formView = document.getElementById('formView');
const checkEligibilityBtn = document.getElementById('checkEligibilityBtn');

// Show form as a pop-up on top of the map when 'Check Eligibility' is clicked
checkEligibilityBtn.addEventListener('click', function() {
    document.getElementById('formView').style.display = 'block';
});

// Retrieve and populate form data from local storage
function retrieveFormData() {
    const storedData = localStorage.getItem('formData');
    if (storedData) {
        const formData = JSON.parse(storedData);
        document.getElementById('citizenship').value = formData.citizenship || '';
        document.getElementById('age').value = formData.age || '';
        document.getElementById('registration').value = formData.registration || '';
        document.getElementById('income').value = formData.income || '';
        document.getElementById('familySize').value = formData.familySize || '';
    }
}

// Store form data in local storage when form is submitted
function storeFormData() {
    const formData = {
        citizenship: document.getElementById('citizenship').value,
        age: document.getElementById('age').value,
        registration: document.getElementById('registration').value,
        income: document.getElementById('income').value,
        familySize: document.getElementById('familySize').value,
    };
    localStorage.setItem('formData', JSON.stringify(formData));
}

// Eligibility form submission
const eligibilityForm = document.getElementById('eligibilityForm');
eligibilityForm.addEventListener('submit', function(event) {
    event.preventDefault();

    // Retrieve form values
    const citizenship = document.getElementById('citizenship').value;
    const age = parseInt(document.getElementById('age').value);
    const registration = parseInt(document.getElementById('registration').value);
    const income = parseFloat(document.getElementById('income').value);

    // Eligibility check
    let eligible = true;
    document.getElementById('citizenshipMsg').textContent = '';
    document.getElementById('ageMsg').textContent = '';
    document.getElementById('registrationMsg').textContent = '';
    document.getElementById('incomeMsg').textContent = '';

    if (citizenship !== 'yes') {
        document.getElementById('citizenshipMsg').textContent = 'You must have Austrian citizenship or equivalent.';
        eligible = false;
    }
    if (age < 18) {
        document.getElementById('ageMsg').textContent = 'You must be at least 18 years old.';
        eligible = false;
    }
    if (registration < 3) {
        document.getElementById('registrationMsg').textContent = 'You must have been registered in Vienna for at least 3 years.';
        eligible = false;
    }
    if (income > 30000) {
        document.getElementById('incomeMsg').textContent = 'Your income must be below €30,000 per year.';
        eligible = false;
    }

    // Display family size input if eligible
    if (eligible) {
        document.getElementById('eligibilityMessage').textContent = 'You are eligible!';
        document.getElementById('familySizeGroup').style.display = 'block';

        // Add event listener for family size submission
        document.getElementById('familySize').addEventListener('input', function() {
            const familySize = parseInt(this.value);

            if (familySize && familySize > 0) {
                checkHousingOption(familySize);
            }
        });

    } else {
        document.getElementById('eligibilityMessage').textContent = 'You are not eligible for social housing.';
    }

     // Store form data after submission
     storeFormData();

});

// Close the form when the close button is clicked
const closeFormBtn = document.getElementById('closeFormBtn');
closeFormBtn.addEventListener('click', function() {
    document.getElementById('formView').style.display = 'none';
    localStorage.removeItem('formData'); // Clear the stored data when closing the form
});


// Function to check suitable housing option
function checkHousingOption(familySize) {
    const housingOptions = [
        { name: 'Small Apartment', size: 50, rooms: 2, neighborhood: 'Leopoldstadt' },
        { name: 'Medium Apartment', size: 80, rooms: 3, neighborhood: 'Margareten' },
        { name: 'Large Apartment', size: 120, rooms: 4, neighborhood: 'Wieden' },
    ];

    const requiredSize = familySize * 20; // Example: 20 m² per person

    let suitableHousing = null;
    for (const house of housingOptions) {
        if (house.size >= requiredSize) {
            suitableHousing = house;
            break;
        }
    }

    // Display housing option or a message if no suitable option is found
    const suitableHouseMessage = document.getElementById('suitableHouseMessage')
    if (suitableHousing) {
        suitableHouseMessage.textContent = `You may be eligible for the ${suitableHousing.name} in ${suitableHousing.neighborhood}. It has ${suitableHousing.rooms} rooms and is ${suitableHousing.size} m² in size.`;
    } else {
        suitableHouseMessage.textContent = 'Unfortunately, we do not have a suitable apartment based on your requirements.';
    }
}
