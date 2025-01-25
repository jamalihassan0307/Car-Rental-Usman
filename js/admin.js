// Load navigation
fetch('/pages/components/nav.html')
    .then(response => response.text())
    .then(data => {
        document.getElementById('nav-placeholder').innerHTML = data;
        loadUserInfo();
    });

// Load user info in navigation
function loadUserInfo() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser) {
        document.getElementById('userImage').src = currentUser.image;
        document.getElementById('userName').textContent = currentUser.name;
    }
}

// Modified loadCars function to handle errors better
async function loadCars() {
    try {
        const response = await fetch('https://678717fcc4a42c91610590e7.mockapi.io/api/cars');
        if (!response.ok) {
            throw new Error('Failed to fetch cars');
        }
        const cars = await response.json();
        const container = document.getElementById('carsContainer');
        const statusFilter = document.getElementById('statusFilter').value;
        
        const filteredCars = statusFilter === 'all' 
            ? cars 
            : cars.filter(car => car.status === statusFilter);

        container.innerHTML = filteredCars.map(car => `
            <div class="car-card">
                <img src="${car.image}" alt="${car.name}">
                <div class="car-info">
                    <h3>${car.name}</h3>
                    <p>Model: ${car.model}</p>
                    <p>Mileage: ${car.mileage} km</p>
                    <p>Price: $${car.rentPrice}/day</p>
                    <p>Owner: ${car.ownerName}</p>
                    <p>Contact: ${car.ownerNumber}</p>
                    <span class="car-status status-${car.status || 'available'}">${car.status || 'available'}</span>
                    ${car.customerDetails ? `
                        <div class="customer-info">
                            <p>Rented to: ${car.customerDetails.name}</p>
                            <p>Contact: ${car.customerDetails.contact}</p>
                        </div>
                    ` : ''}
                    <div class="car-actions">
                        <button onclick="editCar('${car.id}')" class="edit-btn">Edit</button>
                        <button onclick="deleteCar('${car.id}')" class="delete-btn">Delete</button>
                        ${car.status === 'pending' ? `
                            <button onclick="approveRental('${car.id}')" class="approve-btn">Approve</button>
                            <button onclick="rejectRental('${car.id}')" class="reject-btn">Reject</button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading cars:', error);
        container.innerHTML = '<p>Error loading cars. Please try again later.</p>';
    }
}

// Modified approval function to handle errors and preserve data
async function approveRental(carId) {
    try {
        // First fetch the car to get current data
        const getResponse = await fetch(`https://678717fcc4a42c91610590e7.mockapi.io/api/cars/${carId}`);
        if (!getResponse.ok) {
            throw new Error('Failed to fetch car details');
        }
        const car = await getResponse.json();

        // Update only the status while preserving all other data
        const response = await fetch(`https://678717fcc4a42c91610590e7.mockapi.io/api/cars/${carId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ...car, // Spread all existing car data
                status: 'rented'
            })
        });

        if (!response.ok) {
            throw new Error('Failed to approve rental');
        }
        
        await loadCars(); // Wait for cars to reload
        showNotification('Rental approved successfully', 'success');
    } catch (error) {
        console.error('Error approving rental:', error);
        showNotification('Failed to approve rental', 'error');
    }
}

// Modified reject function to handle errors and preserve data
async function rejectRental(carId) {
    try {
        // First fetch the car to get current data
        const getResponse = await fetch(`https://678717fcc4a42c91610590e7.mockapi.io/api/cars/${carId}`);
        if (!getResponse.ok) {
            throw new Error('Failed to fetch car details');
        }
        const car = await getResponse.json();

        // Update status and remove customer details while preserving other data
        const response = await fetch(`https://678717fcc4a42c91610590e7.mockapi.io/api/cars/${carId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ...car, // Spread all existing car data
                status: 'available',
                customerDetails: null
            })
        });

        if (!response.ok) {
            throw new Error('Failed to reject rental');
        }

        await loadCars(); // Wait for cars to reload
        showNotification('Rental rejected successfully', 'success');
    } catch (error) {
        console.error('Error rejecting rental:', error);
        showNotification('Failed to reject rental', 'error');
    }
}

// Modified editCar function to handle errors and preserve all data
async function editCar(carId) {
    try {
        const response = await fetch(`https://678717fcc4a42c91610590e7.mockapi.io/api/cars/${carId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch car details');
        }
        const car = await response.json();
        
        // Store the complete car object for later use
        editingCarId = car.id; // Make sure to use the car's actual id
        
        // Populate the form with all car data
        document.getElementById('modalTitle').textContent = 'Edit Car';
        document.getElementById('carName').value = car.name || '';
        document.getElementById('carModel').value = car.model || '';
        document.getElementById('carImage').value = car.image || '';
        document.getElementById('carMileage').value = car.mileage || '';
        document.getElementById('carPrice').value = car.rentPrice || '';
        document.getElementById('ownerName').value = car.ownerName || '';
        document.getElementById('ownerNumber').value = car.ownerNumber || '';
        
        modal.style.display = 'block';
    } catch (error) {
        console.error('Error loading car details:', error);
        showNotification('Failed to load car details', 'error');
    }
}

// Modified deleteCar function to use API
async function deleteCar(carId) {
    if (confirm('Are you sure you want to delete this car?')) {
        try {
            const response = await fetch(`https://678717fcc4a42c91610590e7.mockapi.io/api/cars/${carId}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                loadCars();
            }
        } catch (error) {
            console.error('Error deleting car:', error);
        }
    }
}

// Modal handling
const modal = document.getElementById('carModal');
const closeBtn = document.getElementsByClassName('close')[0];
let editingCarId = null;

function showAddCarForm() {
    editingCarId = null;
    document.getElementById('modalTitle').textContent = 'Add New Car';
    document.getElementById('carForm').reset();
    modal.style.display = 'block';
}

closeBtn.onclick = function() {
    modal.style.display = 'none';
}

window.onclick = function(event) {
    if (event.target === modal) {
        modal.style.display = 'none';
    }
}

// Modified form submission to handle errors and preserve data
document.getElementById('carForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    try {
        // Get all form data
        const carData = {
            name: document.getElementById('carName').value,
            model: document.getElementById('carModel').value,
            image: document.getElementById('carImage').value,
            mileage: document.getElementById('carMileage').value,
            rentPrice: Number(document.getElementById('carPrice').value),
            ownerName: document.getElementById('ownerName').value,
            ownerNumber: document.getElementById('ownerNumber').value,
        };

        if (editingCarId) {
            // For edit, first get existing car data
            const getResponse = await fetch(`https://678717fcc4a42c91610590e7.mockapi.io/api/cars/${editingCarId}`);
            if (!getResponse.ok) {
                throw new Error('Failed to fetch car details');
            }
            const existingCar = await getResponse.json();

            // Merge existing data with new data
            const response = await fetch(`https://678717fcc4a42c91610590e7.mockapi.io/api/cars/${editingCarId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...existingCar, // Preserve existing data
                    ...carData, // Override with new data
                })
            });
            
            if (!response.ok) {
                throw new Error('Failed to update car');
            }
        } else {
            // For new car
            const response = await fetch('https://678717fcc4a42c91610590e7.mockapi.io/api/cars', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...carData,
                    status: 'available',
                    customerDetails: null
                })
            });
            
            if (!response.ok) {
                throw new Error('Failed to add car');
            }
        }
        
        modal.style.display = 'none';
        await loadCars(); // Wait for cars to reload
        showNotification(editingCarId ? 'Car updated successfully' : 'Car added successfully', 'success');
        document.getElementById('carForm').reset(); // Reset form after successful submission
    } catch (error) {
        console.error('Error saving car:', error);
        showNotification('Failed to save car', 'error');
    }
});

// Filter handling
document.getElementById('statusFilter').addEventListener('change', loadCars);

// Initialize page
document.addEventListener('DOMContentLoaded', loadCars);

// Add notification function if not already present
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
} 