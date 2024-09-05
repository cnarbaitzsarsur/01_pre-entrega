// Create a map view

mapboxgl.accessToken = 'pk.eyJ1IjoibGFicGFycXVlcGF0cmljaW9zIiwiYSI6ImNqOWE4OGY3MjEweHEzM3FtZHl0dmV5azEifQ.uIJaP80p-gQXAvPG8tF-3w';
const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/labparquepatricios/cm0l88ug2008q01qodhxvfwek',
    center: [16.37, 48.20], // starting position [lng, lat]. Note that lat must be set between -90 and 90
    zoom: 12.9, // starting zoom
    minZoom: 10,
    maxZoom: 16 
});

document.getElementById('loading-spinner').style.display = 'flex';

map.on('load', () => {

    document.getElementById('loading-spinner').style.display = 'none';

    // Add the green spaces sources
    map.addSource('big-gs', {
        type: 'geojson',
        data: 'json/big-gs.geojson'
    });

    map.addSource('medium-gs', {
        type: 'geojson',
        data: 'json/medium-gs.geojson'
    });

    map.addSource('small-gs', {
        type: 'geojson',
        data: 'json/small-gs.geojson'
    });

    // Add the social housing source and layer
    map.addSource('social-housing', {
        type: 'geojson',
        data: 'json/social-housing.json'
    });

    map.addLayer({
        'id': 'social-housing',
        'type': 'fill',
        'source': 'social-housing',
        'paint': {
            'fill-color': '#9b1c1f'
        }
    }); 

let popup = new mapboxgl.Popup({
    closeButton: false,
    closeOnClick: false
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

 // Update buffer zone based on initial slider value
 updateBufferZones();

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


// Function to update buffer zones based on slider values
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
    formView.style.display = 'block'; // Show the form
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



// // Function to check eligibility for multiple applicants
// function checkMultipleApplicants() {
//     let continueChecking = true;
//     while (continueChecking) {
//         checkEligibility();
//         // Ask if the user wants to check eligibility for another applicant
//         let anotherApplicant = prompt("Do you want to check eligibility for another applicant? Answer with yes or no");
//         if (anotherApplicant.toLowerCase() !== "yes") {
//             continueChecking = false;
//             alert("Thank you for using the Social Housing Eligibility Checker. Goodbye!");
//         }
//     }
// };

// // Start the eligibility check process for multiple applicants
// checkMultipleApplicants();