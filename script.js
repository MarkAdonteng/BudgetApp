// Initialize expenses array from localStorage
let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
let currentEditIndex = -1;
let deleteIndex = -1;

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
    if (budgetInput.value && !isNaN(budgetInput.value) && parseFloat(budgetInput.value) >= 0) {
        localStorage.setItem('budget', budgetInput.value);
        updateStats();
        budgetInput.value = '';
    } else {
        alert('Please enter a valid budget amount');
    }
}

function formatCurrency(number) {
    return new Intl.NumberFormat('en-GH', {
        style: 'currency',
        currency: 'GHS'
    }).format(number);
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
    const currentBudget = parseFloat(localStorage.getItem('budget')) || 0;
    const currentTotalExpenses = expenses.reduce((total, expense) => total + expense.cost, 0);

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
        localStorage.setItem('expenses', JSON.stringify(expenses));
        
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

function updateStats() {
    const budget = parseFloat(localStorage.getItem('budget')) || 0;
    const totalExpenses = expenses.reduce((total, expense) => total + expense.cost, 0);
    const balance = budget - totalExpenses;

    document.getElementById('budgetPlace').textContent = formatCurrency(budget);
    document.getElementById('expensePlace').textContent = formatCurrency(totalExpenses);
    document.getElementById('balancePlace').textContent = formatCurrency(balance);

    // Update balance color based on status
    const balanceElement = document.getElementById('balancePlace');
    if (balance < 0) {
        balanceElement.style.color = '#ff4757';
    } else if (balance === 0) {
        balanceElement.style.color = '#fff';
    } else {
        balanceElement.style.color = '#2ecc71';
    }

    // Show alert if budget is exceeded
    if (balance < 0) {
        alert('Warning: Budget limit exceeded!');
    }
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

    if (titleInput.value && costInput.value && !isNaN(costInput.value) && parseFloat(costInput.value) >= 0) {
        expenses[currentEditIndex] = {
            ...expenses[currentEditIndex],
            title: titleInput.value,
            cost: parseFloat(costInput.value),
            category: categorySelect.value
        };

        localStorage.setItem('expenses', JSON.stringify(expenses));
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
    localStorage.setItem('expenses', JSON.stringify(expenses));
    closeDeleteModal();
    updateExpenseList();
    updateStats();
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    updateExpenseList();
    updateStats();
});
