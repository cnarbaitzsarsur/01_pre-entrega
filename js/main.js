// Mapbox access token and initialization
mapboxgl.accessToken = 'pk.eyJ1IjoibGFicGFycXVlcGF0cmljaW9zIiwiYSI6ImNqOWE4OGY3MjEweHEzM3FtZHl0dmV5azEifQ.uIJaP80p-gQXAvPG8tF-3w';
const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/labparquepatricios/cm0l88ug2008q01qodhxvfwek',
    center: [16.37, 48.20], // starting position [lng, lat]. Note that lat must be set between -90 and 90
    zoom: 11.9, // starting zoom
    minZoom: 10,
    maxZoom: 16 
});

// LOADING SPINNER 
document.getElementById('loading-spinner').style.display = 'flex';


// ----- SIDEBAR ----- //

document.addEventListener('DOMContentLoaded', () => {
    const introSidebar = document.getElementById('intro-sidebar');
    const mapSidebar = document.getElementById('map-sidebar');
    const formSidebar = document.getElementById('form-sidebar');

    // Set default visibility
    introSidebar.style.display = 'block';
    mapSidebar.style.display = 'none';
    formSidebar.style.display = 'none';

    const btnToMap = document.getElementById('BtnToMap');
    const btnToInfo = document.getElementById('BtnToInfo');
    const btnToCheckEligibility = document.getElementById('btnToCheckEligibility');
    const closeFormBtn = document.getElementById('closeFormBtn');

    btnToMap.addEventListener('click', () => {
        introSidebar.style.display = 'none';
        mapSidebar.style.display = 'block';
    });

    btnToInfo.addEventListener('click',() => {
        mapSidebar.style.display = 'none';
        introSidebar.style.display = 'block';
    });

    btnToCheckEligibility.addEventListener('click', () => {
        introSidebar.style.display = 'none';
        mapSidebar.style.display = 'block';
        formSidebar.style.display = 'block'; // Adjust if needed
    });

    document.getElementById('districtsViewBtn').classList.add('active');

    closeFormBtn.addEventListener('click', () => {
        // Hide eligibility form or perform other actions
        document.getElementById('form-sidebar').style.display = 'none';
    });
});

document.getElementById('readMoreBtn').addEventListener('click', function() {
    const moreText = document.getElementById('moreText');
    const btnText = document.getElementById('readMoreBtn');

    if (moreText.style.display === "none") {
        moreText.style.display = "inline";
        btnText.innerHTML = "Read Less"; // Change button text
    } else {
        moreText.style.display = "none";
        btnText.innerHTML = "Keep Reading"; // Change button text back
    }
});


// ----- INFO BUTTONS ----- //

document.querySelector('.question-button').addEventListener('click', function() {
    Swal.fire({
        title: 'Green Spaces Coverage',
        text: 'It refers to the amount of land in an area that is covered by vegetation such as trees, grass, and other greenery.',
        confirmButtonText: 'Got it!',
        background: '#f0f0f0',
        confirmButtonColor: '#CF2026'
    });
});

// ----- MAP LAYERS ----- //
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
    map.addSource('block-baujahr', { type: 'geojson', data: 'json/block-baujahr.geojson'
    });
    // map.addSource('bus-stops', { type: 'geojson', data: 'json/bus-stops.geojson'
    // });
    // map.addSource('ubahn-stops', { type: 'geojson', data: 'json/ubahn-stops.geojson'
    // });


    map.addLayer({
        'id': 'social-housing',
        'type': 'fill',
        'source': 'social-housing',
        'paint': {
            'fill-color': '#CF2026'
        }
    }); 
    
    map.addLayer({
        id: 'social-housing-buffer',
        type: 'circle',
        source: 'social-housing', 
        paint: {
            'circle-radius': 2, 
            'circle-opacity': 0  
        },
        filter: ['==', '$type', 'Polygon'] 
    });
    
    map.addLayer({
        'id': 'block-baujahr',
        'type': 'fill',
        'source': 'block-baujahr',
        'paint': {
            'fill-color': '#CF2026',
            'fill-opacity': 0.6
        }
    }); 

    // map.addLayer({
    //     'id': 'bus-stops',
    //     'type': 'circle', // Change to 'circle' for better visibility
    //     'source': 'bus-stops',
    //     'paint': {
    //         'circle-color': 'blue', // Color for bus stops
    //         'circle-radius': 2       // Adjust radius for visibility
    //     }
    // });

    // map.addLayer({
    //     'id': 'ubahn-stops',
    //     'type': 'circle', // Using circle for uniformity
    //     'source': 'ubahn-stops',
    //     'paint': {
    //         'circle-color': 'green', // Color for U-Bahn stops
    //         'circle-radius': 2        // Adjust radius for visibility
    //     }
    // });
    
    // Popup setup Social Housing
    let popup = new mapboxgl.Popup({ closeButton: false, closeOnClick: false
    });

    // Add hover event listener
    map.on('mouseenter', 'social-housing-buffer', (e) => {
        const properties = e.features[0].properties;
        const hofname = properties.HOFNAME || "N/A";
        const address = properties.ADRESSE || "N/A";
        const year = properties.BAUJAHR || "N/A";
        const units = properties.WOHNUNGSANZAHL || "N/A";   

        const popupContent = `
            <div>
                <h3 style="text-transform: uppercase;">${hofname}</h3>
               <div style="font-size: 130%;"> 
                    <p>Constructed in ${year}</p>
                    <p><strong>No. of units:</strong> ${units}</p>
                    <p><strong>Address:</strong> ${address}</p>
                </div>
            </div>
        `;

        // Set popup content and position
        popup.setLngLat(e.lngLat)
            .setHTML(popupContent)
            .addTo(map);

        map.getCanvas().style.cursor = 'pointer'; // Change the cursor style on hover
    });


    // Reset the cursor and remove popup when the mouse leaves
    map.on('mouseleave', 'social-housing-buffer', () => {
        popup.remove();
        map.getCanvas().style.cursor = '';
    });


    // Add click event listener to social housing layer
    map.on('click', 'social-housing-buffer', (e) => {
        const properties = e.features[0].properties;
        const hofname = properties.HOFNAME || "N/A";
        const address = properties.ADRESSE || "N/A";
        const year = properties.BAUJAHR || "N/A";
        const units = properties.WOHNUNGSANZAHL || "N/A";   
        const pdfLink = properties.PDFLINK || "#"; 

        const popupContent = `
            <div>
                <h3 style="text-transform: uppercase;">${hofname}</h3>
                <div style="font-size: 130%;"> 
                    <p>Constructed in ${year}</p>
                    <p><strong>No. of units:</strong> ${units}</p>
                    <p><strong>Address:</strong> ${address}</p>
                    <p><a href="${pdfLink}" target="_blank">View More Details (PDF)</a></p>
                </div>
            </div>
        `;

        new mapboxgl.Popup()
            .setLngLat(e.lngLat)
            .setHTML(popupContent)
            .addTo(map);
    });

    map.on('mouseenter', 'social-housing-buffer', () => {
        map.getCanvas().style.cursor = 'pointer';
    });

    map.on('mouseleave', 'social-housing-buffer', () => {
        map.getCanvas().style.cursor = '';
    });
});

// ----- TOGGLE VIEW ----- //

document.addEventListener('DOMContentLoaded', function() {
    // Set the initial active/inactive states
    document.getElementById('mapViewBtn').classList.add('active');
    document.getElementById('districtsViewBtn').classList.remove('active');
    
    // Display the map view by default
    document.getElementById('map').style.display = 'block';
    document.getElementById('districtsView').style.display = 'none';

    // Toggle view functionality
    document.getElementById('mapViewBtn').addEventListener('click', function() {
        document.getElementById('map').style.display = 'block';
        document.getElementById('districtsView').style.display = 'none';
        document.getElementById('districtsViewBtn').classList.remove('active');
        document.getElementById('mapViewBtn').classList.add('active');
    });

    // Toggle to district view
    document.getElementById('districtsViewBtn').addEventListener('click', function() {
        document.getElementById('map').style.display = 'none';
        document.getElementById('districtsView').style.display = 'block';
        document.getElementById('mapViewBtn').classList.remove('active');
        document.getElementById('districtsViewBtn').classList.add('active');
    });
});

// ----- SLIDER YEARS ----- //

const yearSlider = document.getElementById('yearSlider');
const selectedYearDisplay = document.getElementById('selectedYear');

yearSlider.addEventListener('input', () => {
    const selectedYear = parseInt(yearSlider.value, 10);
    selectedYearDisplay.textContent = selectedYear;

    // Call the function to update visible buildings
    updateVisibleBuildings(selectedYear);
});

function updateVisibleBuildings(selectedYear) {
    // Fetch social housing data
    fetch('json/block-baujahr.geojson') 
        .then(response => response.json())
        .then(data => {
            // Filter buildings based on BAUJAHR
            const filteredBuildings = data.features.filter(feature => {
                const baijahr = feature.properties.BAUJAHR1;
                return baijahr <= selectedYear; // Include buildings built on or before the selected year
            });

            // Update map layer with filtered data
            if (map.getSource('block-baujahr')) {
                map.getSource('block-baujahr').setData({
                    type: 'FeatureCollection',
                    features: filteredBuildings
                });
            }
        })
        .catch(err => console.error('Error loading social housing data:', err));
}

// Initialize with the default value
updateVisibleBuildings(parseInt(yearSlider.value, 10));


// ----- BUFFERS ----- //

function initializeSliders() {
    document.getElementById('big-green-coverage').value = 0;
    document.getElementById('medium-green-coverage').value = 0;
    document.getElementById('small-green-coverage').value = 0;
    // document.getElementById('bus-buffer').value = 0;
    // document.getElementById('ubahn-buffer').value = 0;
}

// Call the initialization function when the page loads
document.addEventListener('DOMContentLoaded', initializeSliders);


 // Slider event listeners
 document.getElementById('big-green-coverage').addEventListener('input', updateBufferZones);
 document.getElementById('medium-green-coverage').addEventListener('input', updateBufferZones);
 document.getElementById('small-green-coverage').addEventListener('input', updateBufferZones);
//  document.getElementById('bus-buffer').addEventListener('input', updatePublicTransportBuffers);
// document.getElementById('ubahn-buffer').addEventListener('input', updatePublicTransportBuffers);

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
//  document.getElementById('bus-buffer').addEventListener('input', (event) => {
//     document.getElementById('bus-buffer-distance').textContent = `${event.target.value}m`;
// });
// document.getElementById('ubahn-buffer').addEventListener('input', (event) => {
//     document.getElementById('ubahn-buffer-distance').textContent = `${event.target.value}m`;
// });


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
                        'fill-color': '#CF2026',
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
                        'fill-color': '#CF2026',
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
                        'fill-color': '#CF2026',
                        'fill-opacity': 0.5
                    }
                });
            }
        } else {
            map.setLayoutProperty('buffer-zone-small', 'visibility', 'none');
        }
        
    }).catch(err => console.error('Error loading green spaces data:', err));
}

// function updatePublicTransportBuffers() {
//     const busBufferDistance = parseInt(document.getElementById('bus-buffer').value, 10);
//     const ubahnBufferDistance = parseInt(document.getElementById('ubahn-buffer').value, 10);

//     // Fetch and process bus and U-Bahn data
//     Promise.all([
//         fetch('json/bus-stops.geojson').then(response => response.json()),
//         fetch('json/ubahn-stops.geojson').then(response => response.json())
//     ]).then(([busData, ubahnData]) => {

//         // Buffer bus stops
//         let busBufferFeatures = busData.features.map(feature =>
//             turf.buffer(feature, busBufferFeatures, { units: 'meters' })
//         );
//         const busFeatureCollection = {
//             type: 'FeatureCollection',
//             features: busBufferFeatures
//         };
//         const busDissolved = turf.dissolve(busFeatureCollection);

//         // Buffer U-Bahn stops
//         let ubahnBufferFeatures = ubahnData.features.map(feature =>
//             turf.buffer(feature, Math.min(ubahnBufferFeatures, 800), { units: 'meters' })
//         );
//         const ubahnFeatureCollection = {
//             type: 'FeatureCollection',
//             features: ubahnBufferFeatures
//         };
//         const ubahnDissolved = turf.dissolve(ubahnFeatureCollection);

//         // Update buffer zones for bus stops
//         if (busBufferDistance > 0) {
//             if (map.getSource('buffer-zone-bus')) {
//                 map.getSource('buffer-zone-bus').setData(busDissolved);
//                 map.setLayoutProperty('buffer-zone-bus', 'visibility', 'visible');
//             } else {
//                 map.addSource('buffer-zone-bus', {
//                     type: 'geojson',
//                     data: busDissolved
//                 });

//                 map.addLayer({
//                     'id': 'buffer-zone-bus',
//                     'type': 'fill',
//                     'source': 'buffer-zone-bus',
//                     'paint': {
//                         'fill-color': 'black',
//                         'fill-opacity': 0.5
//                     }
//                 });
//             }
//         } else {
//             map.setLayoutProperty('buffer-zone-bus', 'visibility', 'none');
//         }

//         // Update buffer zones for U-Bahn stops
//         if (ubahnBufferDistance > 0) {
//             if (map.getSource('buffer-zone-ubahn')) {
//                 map.getSource('buffer-zone-ubahn').setData(ubahnDissolved);
//                 map.setLayoutProperty('buffer-zone-ubahn', 'visibility', 'visible');
//             } else {
//                 map.addSource('buffer-zone-ubahn', {
//                     type: 'geojson',
//                     data: ubahnDissolved
//                 });

//                 map.addLayer({
//                     'id': 'buffer-zone-ubahn',
//                     'type': 'fill',
//                     'source': 'buffer-zone-ubahn',
//                     'paint': {
//                        'fill-color': 'black',
//                         'fill-opacity': 0.5
//                     }
//                 });
//             }
//         } else {
//             map.setLayoutProperty('buffer-zone-ubahn', 'visibility', 'none');
//         }

//     }).catch(err => console.error('Error loading public transport data:', err));
// }


// --- FORM --- //

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