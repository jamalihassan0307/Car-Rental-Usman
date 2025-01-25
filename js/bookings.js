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

// Load bookings
async function loadBookings() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    try {
        const response = await fetch('https://678717fcc4a42c91610590e7.mockapi.io/api/cars');
        const cars = await response.json();
        const container = document.getElementById('bookingsContainer');

        const userBookings = cars.filter(car => 
            car.customerDetails?.id === currentUser.id &&
            (car.status === 'pending' || car.status === 'rented')
        );

        if (userBookings.length === 0) {
            container.innerHTML = `
                <div class="no-bookings">
                    <i class="fas fa-calendar-times"></i>
                    <h2>No Bookings Found</h2>
                    <p>You haven't made any car rental bookings yet.</p>
                    <a href="/pages/cars.html" class="browse-btn">Browse Cars</a>
                </div>
            `;
            return;
        }

        container.innerHTML = userBookings.map(car => `
            <div class="car-card">
                <div class="car-image" style="background-image: url('${car.image}')">
                    <div class="car-price">$${car.rentPrice}/day</div>
                </div>
                <div class="car-info">
                    <div class="car-header">
                        <h3>${car.name}</h3>
                        <span class="car-status status-${car.status}">${car.status}</span>
                    </div>
                    <div class="car-details">
                        <p><i class="fas fa-car"></i> Model: ${car.model}</p>
                        <p><i class="fas fa-road"></i> Mileage: ${car.mileage} km</p>
                        <p><i class="fas fa-user"></i> Owner: ${car.ownerName}</p>
                        <p><i class="fas fa-phone"></i> Contact: ${car.ownerNumber}</p>
                    </div>
                    ${car.status === 'rented' ? `
                        <button onclick="returnCar(${car.id})" class="return-btn">
                            <i class="fas fa-undo"></i> Return Car
                        </button>
                    ` : `
                        <button onclick="cancelBooking(${car.id})" class="cancel-btn">
                            <i class="fas fa-times"></i> Cancel Request
                        </button>
                    `}
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading bookings:', error);
        container.innerHTML = '<p>Error loading bookings. Please try again later.</p>';
    }
}

// Cancel booking
async function cancelBooking(carId) {
    if (confirm('Are you sure you want to cancel this booking request?')) {
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
                loadBookings();
                showNotification('Booking cancelled successfully!', 'success');
            }
        } catch (error) {
            console.error('Error cancelling booking:', error);
        }
    }
}

// Return car
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
            loadBookings();
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
    loadBookings();
    // Add Font Awesome for icons
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css';
    document.head.appendChild(link);
}); 