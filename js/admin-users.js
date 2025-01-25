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

// Load users
async function loadUsers() {
    try {
        const response = await fetch('https://678717fcc4a42c91610590e7.mockapi.io/api/users');
        const users = await response.json();
        const container = document.getElementById('usersContainer');
        
        container.innerHTML = users.map(user => `
            <div class="user-card">
                <div class="user-image">
                    <img src="${user.image}" alt="${user.name}">
                </div>
                <div class="user-info">
                    <h3>${user.name}</h3>
                    <p><i class="fas fa-envelope"></i> ${user.email}</p>
                    <p><i class="fas fa-user-tag"></i> ${user.role_of_user === 1 ? 'Admin' : 'User'}</p>
                    <div class="user-actions">
                        <button onclick="editUser(${user.id})" class="edit-btn">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button onclick="deleteUser(${user.id})" class="delete-btn">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading users:', error);
        container.innerHTML = '<p>Error loading users. Please try again later.</p>';
    }
}

// Modal handling
const modal = document.getElementById('userModal');
const closeBtn = document.getElementsByClassName('close')[0];
let editingUserId = null;

async function editUser(userId) {
    try {
        const response = await fetch(`https://678717fcc4a42c91610590e7.mockapi.io/api/users/${userId}`);
        const user = await response.json();
        editingUserId = userId;
        
        document.getElementById('userName').value = user.name;
        document.getElementById('userEmail').value = user.email;
        document.getElementById('userPassword').value = '';
        document.getElementById('userImage').value = user.image;
        document.getElementById('userRole').value = user.role_of_user;
        
        modal.style.display = 'block';
    } catch (error) {
        console.error('Error loading user details:', error);
    }
}

async function deleteUser(userId) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (userId === currentUser.id) {
        showNotification('You cannot delete your own account!', 'error');
        return;
    }

    if (confirm('Are you sure you want to delete this user?')) {
        try {
            const response = await fetch(`https://678717fcc4a42c91610590e7.mockapi.io/api/users/${userId}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                loadUsers();
                showNotification('User deleted successfully!', 'success');
            }
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    }
}

closeBtn.onclick = function() {
    modal.style.display = 'none';
}

window.onclick = function(event) {
    if (event.target === modal) {
        modal.style.display = 'none';
    }
}

// Form handling
document.getElementById('userForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const userData = {
        name: document.getElementById('userName').value,
        email: document.getElementById('userEmail').value,
        image: document.getElementById('userImage').value,
        role_of_user: Number(document.getElementById('userRole').value)
    };

    const password = document.getElementById('userPassword').value;
    if (password) {
        userData.password = password;
    }

    try {
        const response = await fetch(`https://678717fcc4a42c91610590e7.mockapi.io/api/users/${editingUserId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData)
        });
        
        if (response.ok) {
            modal.style.display = 'none';
            loadUsers();
            showNotification('User updated successfully!', 'success');
        }
    } catch (error) {
        console.error('Error updating user:', error);
    }
});

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
    loadUsers();
    // Add Font Awesome for icons
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css';
    document.head.appendChild(link);
}); 