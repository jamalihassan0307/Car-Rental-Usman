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

// Load cars
async function loadCars() {
    try {
        const response = await fetch('https://678717fcc4a42c91610590e7.mockapi.io/api/cars');
        const cars = await response.json();
        const container = document.getElementById('carsContainer');
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));

        container.innerHTML = cars.map(car => `
            <div class="car-card">
                <div class="car-image" style="background-image: url('${car.image}')">
                    <div class="car-price">$${car.rentPrice}/day</div>
                </div>
                <div class="car-info">
                    <div class="car-header">
                        <h3>${car.name}</h3>
                        <span class="car-status status-${car.status || 'available'}">${car.status || 'available'}</span>
                    </div>
                    <div class="car-details">
                        <p><i class="fas fa-car"></i> Model: ${car.model}</p>
                        <p><i class="fas fa-road"></i> Mileage: ${car.mileage} km</p>
                        <p><i class="fas fa-user"></i> Owner: ${car.ownerName}</p>
                        <p><i class="fas fa-phone"></i> Contact: ${car.ownerNumber}</p>
                    </div>
                    ${car.status === 'available' && currentUser.role_of_user === 2 ? `
                        <button onclick="rentCar(${car.id})" class="rent-btn">
                            <i class="fas fa-key"></i> Rent Now
                        </button>
                    ` : ''}
                    ${car.status === 'rented' && car.customerDetails?.id === currentUser.id ? `
                        <button onclick="returnCar(${car.id})" class="return-btn">
                            <i class="fas fa-undo"></i> Return Car
                        </button>
                    ` : ''}
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading cars:', error);
        container.innerHTML = '<p>Error loading cars. Please try again later.</p>';
    }
}

// Rent car function
async function rentCar(carId) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    try {
        const response = await fetch(`https://678717fcc4a42c91610590e7.mockapi.io/api/cars/${carId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                status: 'pending',
                customerDetails: {
                    id: currentUser.id,
                    name: currentUser.name,
                    contact: currentUser.email
                }
            })
        });

        if (response.ok) {
            loadCars();
            showNotification('Rental request submitted successfully!', 'success');
        }
    } catch (error) {
        console.error('Error submitting rental request:', error);
    }
}

// Return car function
async function returnCar(carId) {
    try {
        const response = await fetch(`https://678717fcc4a42c91610590e7.mockapi.io/api/cars/${carId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                status: 'available',
                customerDetails: null
            })
        });

        if (response.ok) {
            loadCars();
            showNotification('Car returned successfully!', 'success');
        }
    } catch (error) {
        console.error('Error returning car:', error);
    }
}

// Show notification
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    loadCars();
    // Add Font Awesome for icons
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css';
    document.head.appendChild(link);
}); 