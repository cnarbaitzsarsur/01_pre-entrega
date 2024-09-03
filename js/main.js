// Create a map view

mapboxgl.accessToken = 'pk.eyJ1IjoibGFicGFycXVlcGF0cmljaW9zIiwiYSI6ImNqOWE4OGY3MjEweHEzM3FtZHl0dmV5azEifQ.uIJaP80p-gQXAvPG8tF-3w';
const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/labparquepatricios/cm0l88ug2008q01qodhxvfwek',
    center: [16.37, 48.20], // starting position [lng, lat]. Note that lat must be set between -90 and 90
    zoom: 12, // starting zoom
    minZoom: 10,
    maxZoom: 16 
});

map.on('load', () => {
    // Add the green spaces source
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

    map.addLayer({
        'id': 'big-gs',
        'type': 'fill',
        'source': 'big-gs',
        'paint': {
            'fill-color': '#f8d1d4',
            'fill-opacity': 0
        }
    });

    map.addLayer({
        'id': 'medium-gs',
        'type': 'fill',
        'source': 'medium-gs',
        'paint': {
            'fill-color': '#f8d1d4',
            'fill-opacity': 0
        }
    });

    map.addLayer({
        'id': 'small-gs',
        'type': 'fill',
        'source': 'small-gs',
        'paint': {
            'fill-color': '#f8d1d4',
            'fill-opacity': 0
        }
    });

     // Add the buffer zone source and layer
     map.addSource('buffer-zone', {
        type: 'geojson',
        data: {
            type: 'FeatureCollection',
            features: []
        }
    });

    map.addLayer({
        'id': 'buffer-zone',
        'type': 'fill',
        'source': 'buffer-zone',
        'paint': {
            'fill-color': '#9b1c1f',
            'fill-opacity': 0.1
        }
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
        const bigBufferFeatures = bigData.features.map(feature =>
            turf.buffer(feature, bigBufferDistance, { units: 'meters' })
        );
        const mediumBufferFeatures = mediumData.features.map(feature =>
            turf.buffer(feature, Math.min(mediumBufferDistance, 400), { units: 'meters' })
        );
        const smallBufferFeatures = smallData.features.map(feature =>
            turf.buffer(feature, Math.min(smallBufferDistance, 200), { units: 'meters' })
        );

        const bufferFeatures = [...bigBufferFeatures, ...mediumBufferFeatures, ...smallBufferFeatures];

        const bufferGeoJSON = {
            type: 'FeatureCollection',
            features: bufferFeatures
        };

        if (map.getSource('buffer-zone')) {
            map.getSource('buffer-zone').setData(bufferGeoJSON);
        } else {
            map.addSource('buffer-zone', {
                type: 'geojson',
                data: bufferGeoJSON
            });

            map.addLayer({
                'id': 'buffer-zone',
                'type': 'fill',
                'source': 'buffer-zone',
                'paint': {
                    'fill-color': '#f8d1d4',
                    'fill-opacity': 0.5
                }
            });
        }
    }).catch(err => console.error('Error loading green spaces data:', err));
}


document.getElementById("checkEligibilityBtn").addEventListener("click", () => {
    checkEligibility();
})

// Function to check if the user has Austrian citizenship
function checkCitizenship() {
    let citizenship = prompt("Do you have an Austrian Citizenship or equivalent? Answer with yes or no");
    if (citizenship.toLowerCase() !== "yes") {
        alert("You need to have an Austrian citizenship or equivalent to be eligible for social housing.");
        return false;
    }
    return true;
};

// Function to check the user's age
function checkAge() {
    let age = parseInt(prompt("Please enter your age:"));
    if (isNaN(age) || age < 18) {
        alert("You are too young to be eligible for social housing.");
        return false;
    }
    return true;
};

// Function to check the user's registration in Vienna
function checkRegistration() {
    let registration = parseInt(prompt("Please enter the total number of years you have been registered in Vienna:"));
    if (isNaN(registration) || registration < 3) {
        alert("You need to have been living in Vienna for at least 3 years to be eligible for social housing.");
        return false;
    }
    return true;
};

// Function to check the user's annual income
function checkIncome() {
    let annualIncome = parseFloat(prompt("Please enter your total annual household income:"));
    if (isNaN(annualIncome) || annualIncome > 30000) {
        alert("You need to earn less than 30,000€ annually to be eligible for social housing.");
        return false;
    }
    return true;
};

// Check which type of housing they can get

//Housing types
const housingOptions = [
    {id: 1, name: "Small Apartment", size:50, rooms: 2, neighbouhood:"Leopoldstadt"},
    {id: 2, name:"Medium Apartment", size:80, rooms: 3, neighborhood:"Margareten"},
    {id: 3, name:"Large Apartment", size:120, rooms: 4, neighbouhood:"Wieden"},
];

// Function to calculate the maximum eligible housing size
function calculateHousingSize(familyMembers) {
    const minimumSpacePerPerson = 20; // For example, 20 m² per person
    return familyMembers * minimumSpacePerPerson;
};


// Function to calculate which option is suitable based on family members
function checkHousingOption (familyMembers) {
    const requiredSize = calculateHousingSize(familyMembers);
    let suitableHousing = null;

    // Iterate through housing options to find the first suitable option
    for (const house of housingOptions) {
        if (house.size >= requiredSize) {
            suitableHousing = house;
            break;
        }
    }

    //Display the result
    if (suitableHousing) {
        alert((`You may be eligible for the ${suitableHousing.name} in ${suitableHousing.neighborhood}. It has ${suitableHousing.rooms} rooms and is ${suitableHousing.size} m² in size. Please contact your local housing authority for more information.`));
    } else {
        alert ("Unfortunately, we do not have a suitable apartment based on your requirements. Please contact your local housing authority for further assistance.");
    }
}

// Function to check eligibility for one applicant
function checkEligibility() {
    if (!checkCitizenship()) return;
    if (!checkAge()) return;
    if (!checkRegistration()) return;
    if (!checkIncome()) return;

    alert("You may be eligible for a social housing. Let's check which type");
    
    //Prompt for family members
    const familyMembers = parseInt(prompt("Please enter the total number of family members:"));
    
    // Check and display the suitable housing option
    checkHousingOption(familyMembers);
};

checkEligibility();


// Function to check eligibility for multiple applicants
function checkMultipleApplicants() {
    let continueChecking = true;
    while (continueChecking) {
        checkEligibility();
        // Ask if the user wants to check eligibility for another applicant
        let anotherApplicant = prompt("Do you want to check eligibility for another applicant? Answer with yes or no");
        if (anotherApplicant.toLowerCase() !== "yes") {
            continueChecking = false;
            alert("Thank you for using the Social Housing Eligibility Checker. Goodbye!");
        }
    }
};

// Start the eligibility check process for multiple applicants
checkMultipleApplicants();
