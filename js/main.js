// Create a map view

mapboxgl.accessToken = 'pk.eyJ1IjoibGFicGFycXVlcGF0cmljaW9zIiwiYSI6ImNqOWE4OGY3MjEweHEzM3FtZHl0dmV5azEifQ.uIJaP80p-gQXAvPG8tF-3w';
const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/labparquepatricios/cjeuewjhw0ghw2sp738995x9y',
    center: [16.37, 48.20], // starting position [lng, lat]. Note that lat must be set between -90 and 90
    zoom: 12, // starting zoom
    minZoom: 8,
    maxZoom: 14 
});


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
