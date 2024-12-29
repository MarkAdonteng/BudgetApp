// Function to toggle between login and register forms
function toggleForms(form) {
    const loginBox = document.getElementById('loginBox');
    const registerBox = document.getElementById('registerBox');
    
    if (form === 'register') {
        loginBox.style.display = 'none';
        registerBox.style.display = 'block';
    } else {
        loginBox.style.display = 'block';
        registerBox.style.display = 'none';
    }
}

// Function to handle user registration
function handleRegister(event) {
    event.preventDefault();
    
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Validate passwords match
    if (password !== confirmPassword) {
        showError('Passwords do not match');
        return false;
    }

    // Get existing users or initialize empty array
    const users = JSON.parse(localStorage.getItem('users')) || [];

    // Check if user already exists
    if (users.some(user => user.email === email)) {
        showError('Email already registered');
        return false;
    }

    // Create new user
    const newUser = {
        id: generateUserId(),
        name,
        email,
        password, // In a real app, this should be hashed
        expenses: [],
        budget: 0
    };

    // Add user to array and save
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));

    // Auto login after registration
    loginUser(newUser);
    return false;
}

// Function to handle user login
function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    // Get users from storage
    const users = JSON.parse(localStorage.getItem('users')) || [];

    // Find user
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        loginUser(user);
    } else {
        showError('Invalid email or password');
    }
    return false;
}

// Function to log in user and redirect
function loginUser(user) {
    // Save current user info in session
    sessionStorage.setItem('currentUser', JSON.stringify({
        id: user.id,
        name: user.name,
        email: user.email
    }));
    
    // Redirect to main app
    window.location.href = 'index.html';
}

// Helper function to show error messages
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.display = 'block';
    errorDiv.textContent = message;

    // Find the form that's currently visible
    const currentForm = document.querySelector('.auth-box[style*="block"]') || document.querySelector('.auth-box');
    const existingError = currentForm.querySelector('.error-message');
    
    if (existingError) {
        existingError.remove();
    }
    
    currentForm.insertBefore(errorDiv, currentForm.firstChild);

    // Hide error after 3 seconds
    setTimeout(() => {
        errorDiv.remove();
    }, 3000);
}

// Helper function to generate unique user ID
function generateUserId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Check if user is already logged in
function checkAuth() {
    const currentUser = sessionStorage.getItem('currentUser');
    if (currentUser && window.location.pathname.includes('login.html')) {
        window.location.href = 'index.html';
    }
}

// Run auth check when page loads
checkAuth(); 