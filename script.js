// Check authentication
function checkAuth() {
    const currentUser = sessionStorage.getItem('currentUser');
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }
    
    // Update UI with user name
    const user = JSON.parse(currentUser);
    const headerSubtitle = document.querySelector('.subtitle');
    headerSubtitle.textContent = `Welcome back, ${user.name}`;
}

// Function to get current user's data
function getCurrentUserData() {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    const users = JSON.parse(localStorage.getItem('users')) || [];
    return users.find(u => u.id === currentUser.id);
}

// Function to update user data
function updateUserData(userData) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const index = users.findIndex(u => u.id === userData.id);
    if (index !== -1) {
        users[index] = userData;
        localStorage.setItem('users', JSON.stringify(users));
    }
}

// Initialize expenses array from user data
let expenses = [];
let currentEditIndex = -1;
let deleteIndex = -1;

// Load user's expenses
function loadUserExpenses() {
    const userData = getCurrentUserData();
    expenses = userData.expenses || [];
    updateExpenseList();
    updateStats();
}

var stats = document.getElementById('stats');
var text = document.getElementById('text');
var showing = false;

function show() {
    if (!showing) {
        stats.style.maxHeight = '400px';
        stats.style.padding = '10px';
        text.innerHTML = 'Hide';
        showing = true;
    } else {
        stats.style.maxHeight = '0';
        stats.style.padding = '0';
        text.innerHTML = 'Show';
        showing = false;
    }
}

function setBudget() {
    const budgetInput = document.getElementById('budget');
    const timeFrame = document.getElementById('budgetTimeFrame').value;
    
    if (budgetInput.value && !isNaN(budgetInput.value) && parseFloat(budgetInput.value) >= 0) {
        const userData = getCurrentUserData();
        userData.budget = {
            amount: parseFloat(budgetInput.value),
            timeFrame: timeFrame,
            startDate: new Date().toISOString()
        };
        updateUserData(userData);
        updateStats();
        budgetInput.value = '';
    } else {
        alert('Please enter a valid budget amount');
    }
}

function formatCurrency(number) {
    // Ensure number is treated as a number and has 2 decimal places
    const amount = Number(number).toFixed(2);
    return new Intl.NumberFormat('en-GH', {
        style: 'currency',
        currency: 'GHS',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
}

function showWarningModal(currentBudget, currentExpenses, newExpenseCost) {
    const warningModal = document.getElementById('warningModal');
    const remainingBudget = currentBudget - currentExpenses;
    
    document.getElementById('warningMessage').textContent = 
        `Cannot add this expense of ${formatCurrency(newExpenseCost)} as it would exceed your budget.`;
    document.getElementById('currentBudgetDisplay').textContent = formatCurrency(currentBudget);
    document.getElementById('currentExpensesDisplay').textContent = formatCurrency(currentExpenses);
    document.getElementById('remainingBudgetDisplay').textContent = formatCurrency(remainingBudget);
    
    warningModal.style.display = 'block';
}

function closeWarningModal() {
    document.getElementById('warningModal').style.display = 'none';
}

function add() {
    const titleInput = document.getElementById('titleInp');
    const costInput = document.getElementById('costInp');
    const categorySelect = document.getElementById('categorySelect');
    const userData = getCurrentUserData();
    const currentBudget = userData.budget?.amount || 0;
    const currentPeriodExpenses = getExpensesInCurrentPeriod();
    const currentTotalExpenses = currentPeriodExpenses.reduce((total, expense) => total + expense.cost, 0);

    if (titleInput.value && costInput.value && !isNaN(costInput.value) && parseFloat(costInput.value) >= 0) {
        const newExpenseCost = parseFloat(costInput.value);
        
        // Check if adding this expense would exceed the budget
        if (currentTotalExpenses + newExpenseCost > currentBudget) {
            showWarningModal(currentBudget, currentTotalExpenses, newExpenseCost);
            return;
        }

        const newExpense = {
            title: titleInput.value,
            cost: newExpenseCost,
            category: categorySelect.value || 'other',
            date: new Date().toISOString()
        };

        expenses.push(newExpense);
        userData.expenses = expenses;
        updateUserData(userData);
        
        // Clear inputs
        titleInput.value = '';
        costInput.value = '';
        categorySelect.value = '';

        updateExpenseList();
        updateStats();
    } else {
        alert('Please enter valid expense details');
    }
}

function getExpensesInCurrentPeriod() {
    const userData = getCurrentUserData();
    if (!userData.budget) return [];

    const budgetStartDate = new Date(userData.budget.startDate);
    const currentDate = new Date();
    
    return expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        if (userData.budget.timeFrame === 'weekly') {
            // Get start of the current week
            const weekStart = new Date(budgetStartDate);
            const currentWeekStart = new Date(currentDate);
            weekStart.setHours(0, 0, 0, 0);
            currentWeekStart.setHours(0, 0, 0, 0);
            
            // Set to start of week (Sunday)
            weekStart.setDate(weekStart.getDate() - weekStart.getDay());
            currentWeekStart.setDate(currentWeekStart.getDate() - currentWeekStart.getDay());
            
            // Check if we're in a new week cycle
            const weeksDiff = Math.floor((currentWeekStart - weekStart) / (7 * 24 * 60 * 60 * 1000));
            const cycleStart = new Date(weekStart);
            cycleStart.setDate(cycleStart.getDate() + (weeksDiff * 7));
            const cycleEnd = new Date(cycleStart);
            cycleEnd.setDate(cycleEnd.getDate() + 7);
            
            return expenseDate >= cycleStart && expenseDate < cycleEnd;
        } else { // monthly
            // Get start of the current month
            const monthStart = new Date(budgetStartDate);
            const currentMonthStart = new Date(currentDate);
            monthStart.setDate(1);
            monthStart.setHours(0, 0, 0, 0);
            currentMonthStart.setDate(1);
            currentMonthStart.setHours(0, 0, 0, 0);
            
            // Check if we're in a new month cycle
            const monthsDiff = (currentMonthStart.getFullYear() - monthStart.getFullYear()) * 12 
                + (currentMonthStart.getMonth() - monthStart.getMonth());
            const cycleStart = new Date(monthStart);
            cycleStart.setMonth(cycleStart.getMonth() + monthsDiff);
            const cycleEnd = new Date(cycleStart);
            cycleEnd.setMonth(cycleEnd.getMonth() + 1);
            
            return expenseDate >= cycleStart && expenseDate < cycleEnd;
        }
    });
}

function updateStats() {
    const userData = getCurrentUserData();
    const budget = userData.budget?.amount || 0;
    const currentPeriodExpenses = getExpensesInCurrentPeriod();
    const totalExpenses = currentPeriodExpenses.reduce((total, expense) => total + expense.cost, 0);
    const balance = budget - totalExpenses;

    // Format with 2 decimal places and proper currency
    document.getElementById('budgetPlace').textContent = formatCurrency(budget);
    document.getElementById('expensePlace').textContent = formatCurrency(totalExpenses);
    document.getElementById('balancePlace').textContent = formatCurrency(balance);

    // Add timeframe indicator if budget exists
    if (userData.budget?.timeFrame) {
        const timeFrameText = userData.budget.timeFrame === 'weekly' ? 'Weekly' : 'Monthly';
        document.getElementById('budgetPlace').parentElement.querySelector('h2').textContent = `${timeFrameText} Budget`;
    }

    // Update balance color based on status
    const balanceElement = document.getElementById('balancePlace');
    if (balance < 0) {
        balanceElement.style.color = '#ff4757';
    } else if (balance === 0) {
        balanceElement.style.color = '#fff';
    } else {
        balanceElement.style.color = '#2ecc71';
    }
}

// Add logout function
function logout() {
    sessionStorage.removeItem('currentUser');
    window.location.href = 'login.html';
}

function filterExpenses() {
    updateExpenseList();
}

function sortExpenses() {
    updateExpenseList();
}

function updateExpenseList() {
    const expenseList = document.getElementById('expenseItems');
    const filterCategory = document.getElementById('filterCategory').value;
    const sortBy = document.getElementById('sortBy').value;

    // Filter expenses
    let filteredExpenses = expenses;
    if (filterCategory) {
        filteredExpenses = expenses.filter(expense => expense.category === filterCategory);
    }

    // Sort expenses
    filteredExpenses.sort((a, b) => {
        switch (sortBy) {
            case 'date-desc':
                return new Date(b.date) - new Date(a.date);
            case 'date-asc':
                return new Date(a.date) - new Date(b.date);
            case 'amount-desc':
                return b.cost - a.cost;
            case 'amount-asc':
                return a.cost - b.cost;
            default:
                return new Date(b.date) - new Date(a.date);
        }
    });

    // Clear existing list
    expenseList.innerHTML = '';

    // Add expenses to list
    filteredExpenses.forEach((expense, index) => {
        const expenseItem = document.createElement('div');
        expenseItem.className = 'list-item';
        
        const categoryIcon = getCategoryIcon(expense.category);
        const date = new Date(expense.date).toLocaleDateString();

        expenseItem.innerHTML = `
            <div class="expense-info">
                <h3>${expense.title}</h3>
                <small>${categoryIcon} ${expense.category} • ${date}</small>
            </div>
            <div class="expense-amount">
                <h3>${formatCurrency(expense.cost)}</h3>
            </div>
            <div class="expense-actions">
                <i class="fas fa-edit edit-btn" onclick="showEditModal(${index})"></i>
                <i class="fas fa-trash delete-btn" onclick="showDeleteModal(${index})"></i>
            </div>
        `;
        
        expenseList.appendChild(expenseItem);
    });
}

function getCategoryIcon(category) {
    const icons = {
        groceries: '<i class="fas fa-shopping-basket"></i>',
        utilities: '<i class="fas fa-bolt"></i>',
        entertainment: '<i class="fas fa-film"></i>',
        transport: '<i class="fas fa-car"></i>',
        other: '<i class="fas fa-box"></i>'
    };
    return icons[category] || icons.other;
}

function showEditModal(index) {
    currentEditIndex = index;
    const expense = expenses[index];
    
    document.getElementById('editTitle').value = expense.title;
    document.getElementById('editCost').value = expense.cost;
    document.getElementById('editCategory').value = expense.category;
    
    document.getElementById('editModal').style.display = 'block';
}

function closeEditModal() {
    document.getElementById('editModal').style.display = 'none';
    currentEditIndex = -1;
}

function saveEdit() {
    if (currentEditIndex === -1) return;
    
    const titleInput = document.getElementById('editTitle');
    const costInput = document.getElementById('editCost');
    const categorySelect = document.getElementById('editCategory');
    const userData = getCurrentUserData();
    const currentBudget = userData.budget?.amount || 0;

    if (titleInput.value && costInput.value && !isNaN(costInput.value) && parseFloat(costInput.value) >= 0) {
        const newCost = parseFloat(costInput.value);
        const currentPeriodExpenses = getExpensesInCurrentPeriod();
        const otherExpenses = currentPeriodExpenses.reduce((total, expense, index) => 
            expense !== expenses[currentEditIndex] ? total + expense.cost : total, 0);

        // Check if the new total expenses would exceed the budget
        if (otherExpenses + newCost > currentBudget) {
            showWarningModal(currentBudget, otherExpenses, newCost);
            return;
        }

        expenses[currentEditIndex] = {
            ...expenses[currentEditIndex],
            title: titleInput.value,
            cost: newCost,
            category: categorySelect.value
        };

        userData.expenses = expenses;
        updateUserData(userData);
        closeEditModal();
        updateExpenseList();
        updateStats();
    } else {
        alert('Please enter valid expense details');
    }
}

function showDeleteModal(index) {
    deleteIndex = index;
    document.getElementById('deleteModal').style.display = 'block';
}

function closeDeleteModal() {
    document.getElementById('deleteModal').style.display = 'none';
    deleteIndex = -1;
}

function confirmDelete() {
    if (deleteIndex === -1) return;
    
    expenses.splice(deleteIndex, 1);
    const userData = getCurrentUserData();
    userData.expenses = expenses;
    updateUserData(userData);
    closeDeleteModal();
    updateExpenseList();
    updateStats();
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadUserExpenses();
});
