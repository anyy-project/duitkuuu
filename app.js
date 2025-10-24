// =============================================
// SPLASHSCREEN
// =============================================

// Hide splashscreen after loading
window.addEventListener('load', () => {
    setTimeout(() => {
        const splashscreen = document.getElementById('splashscreen');
        splashscreen.classList.add('fade-out');
        setTimeout(() => {
            splashscreen.style.display = 'none';
            // Initialize user system after splash screen is hidden
            initUserSystem();
        }, 500);
    }, 2000); // Show splashscreen for 2 seconds
});

// =============================================
// MULTI-USER SYSTEM
// =============================================

let currentUser = localStorage.getItem('currentUser') || null;

const USERS = {};

// Get user-specific storage key
function getUserKey(key) {
    return `${currentUser}_${key}`;
}

// =============================================
// DATA STORAGE & INITIALIZATION
// =============================================

let transactions = [];
let budgets = {};

// Kategori untuk Pemasukan dan Pengeluaran
const CATEGORIES = {
    income: [
        { value: 'salary', label: '💼 Gaji' },
        { value: 'business', label: '💰 Bisnis' },
        { value: 'investment', label: '📈 Investasi' },
        { value: 'freelance', label: '💻 Freelance' },
        { value: 'gift', label: '🎁 Hadiah' },
        { value: 'other_income', label: '➕ Lainnya' }
    ],
    expense: [
        { value: 'food', label: '🍔 Makanan & Minuman' },
        { value: 'transport', label: '🚗 Transportasi' },
        { value: 'shopping', label: '🛍️ Belanja' },
        { value: 'bills', label: '📄 Tagihan & Utilitas' },
        { value: 'health', label: '🏥 Kesehatan' },
        { value: 'education', label: '📚 Pendidikan' },
        { value: 'entertainment', label: '🎬 Hiburan' },
        { value: 'family', label: '👨‍👩‍👧‍👦 Keluarga' },
        { value: 'saving', label: '💎 Tabungan' },
        { value: 'other_expense', label: '➕ Lainnya' }
    ]
};

// Charts
let incomeExpenseChart = null;
let categoryChart = null;

// Pagination State
let currentPage = 1;
let itemsPerPage = 25;
let totalFilteredTransactions = 0;

// =============================================
// DOM ELEMENTS
// =============================================

// User Modal & Switcher
const nameInputModal = document.getElementById('nameInputModal');
const nameInputForm = document.getElementById('nameInputForm');
const addUserModal = document.getElementById('addUserModal');
const addUserForm = document.getElementById('addUserForm');
const currentUserBtn = document.getElementById('currentUserBtn');
const currentUserName = document.getElementById('currentUserName');
const currentUserAvatar = document.getElementById('currentUserAvatar');
const userDropdown = document.getElementById('userDropdown');
const userDropdownList = document.getElementById('userDropdownList');
const addUserBtn = document.getElementById('addUserBtn');

// Tabs
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

// Form
const form = document.getElementById('transactionForm');
const typeSelect = document.getElementById('type');
const categorySelect = document.getElementById('category');
const descriptionInput = document.getElementById('description');
const amountInput = document.getElementById('amount');
const dateInput = document.getElementById('date');

// Balance
const totalBalanceEl = document.getElementById('totalBalance');
const totalIncomeEl = document.getElementById('totalIncome');
const totalExpenseEl = document.getElementById('totalExpense');

// Stats
const monthTransactionsEl = document.getElementById('monthTransactions');
const avgExpenseEl = document.getElementById('avgExpense');
const budgetUsedEl = document.getElementById('budgetUsed');

// Transactions
const transactionsList = document.getElementById('transactionsList');
const filterType = document.getElementById('filterType');
const filterCategory = document.getElementById('filterCategory');
const filterPeriod = document.getElementById('filterPeriod');
const exportBtn = document.getElementById('exportBtn');

// Pagination
const transactionCountEl = document.getElementById('transactionCount');
const perPageSelect = document.getElementById('perPage');
const paginationEl = document.getElementById('pagination');
const prevPageBtn = document.getElementById('prevPage');
const nextPageBtn = document.getElementById('nextPage');
const currentPageEl = document.getElementById('currentPage');
const totalPagesEl = document.getElementById('totalPages');

// Budget
const budgetForm = document.getElementById('budgetForm');
const budgetCategorySelect = document.getElementById('budgetCategory');
const budgetAmountInput = document.getElementById('budgetAmount');
const budgetList = document.getElementById('budgetList');

// Reports
const reportStart = document.getElementById('reportStart');
const reportEnd = document.getElementById('reportEnd');
const generateReportBtn = document.getElementById('generateReport');
const reportResults = document.getElementById('reportResults');

// Actions
const clearAllBtn = document.getElementById('clearAll');

// =============================================
// USER MANAGEMENT
// =============================================

// Function to check and clean localStorage data
function checkLocalStorageData() {
    console.log('=== Checking localStorage data ===');
    console.log('All localStorage keys:', Object.keys(localStorage));
    
    const users = localStorage.getItem('users');
    const currentUser = localStorage.getItem('currentUser');
    
    console.log('users data:', users);
    console.log('currentUser data:', currentUser);
    
    if (users) {
        try {
            const parsed = JSON.parse(users);
            console.log('Parsed users:', parsed);
            console.log('Users count:', Object.keys(parsed).length);
        } catch (error) {
            console.error('Corrupted users data:', error);
            localStorage.removeItem('users');
            localStorage.removeItem('currentUser');
            console.log('Cleared corrupted data');
        }
    }
    console.log('=== End localStorage check ===');
}

function initUserSystem() {
    console.log('=== initUserSystem START ===');
    
    // Check localStorage data first
    checkLocalStorageData();
    
    console.log('currentUser:', currentUser);
    console.log('USERS before loading:', USERS);
    
    // Load users from localStorage
    const savedUsers = localStorage.getItem('users');
    console.log('savedUsers from localStorage:', savedUsers);
    
    if (savedUsers) {
        try {
            const parsedUsers = JSON.parse(savedUsers);
            console.log('parsedUsers:', parsedUsers);
            Object.assign(USERS, parsedUsers);
        } catch (error) {
            console.error('Error parsing users:', error);
            // Clear corrupted data
            localStorage.removeItem('users');
        }
    }
    
    console.log('USERS after loading:', USERS);
    console.log('Number of users:', Object.keys(USERS).length);
    
    // If no users exist, show name input modal
    if (Object.keys(USERS).length === 0) {
        console.log('❌ No users found, showing name input modal');
        showNameInputModal();
    } else {
        console.log('✅ Users exist, hiding modal and initializing app');
        // Hide modal first
        nameInputModal.classList.add('hidden');
        console.log('Modal hidden, classes:', nameInputModal.classList.toString());
        
        // Force hide modal as backup
        setTimeout(() => {
            forceHideModal();
        }, 100);
        
        // If no current user is set, use the first available user
        if (!currentUser) {
            currentUser = Object.keys(USERS)[0];
            localStorage.setItem('currentUser', currentUser);
            console.log('Set current user to:', currentUser);
        }
        
        // Initialize the app with existing user
        updateUserUI();
        populateUserDropdown();
        loadUserData();
        init();
    }
    console.log('=== initUserSystem END ===');
}

function showNameInputModal() {
    console.log('showNameInputModal called');
    console.log('nameInputModal element:', nameInputModal);
    nameInputModal.classList.remove('hidden');
    console.log('Modal classes after remove hidden:', nameInputModal.classList.toString());
    
    // Focus on name input
    setTimeout(() => {
        const nameInput = document.getElementById('userNameInput');
        if (nameInput) {
            nameInput.focus();
        }
    }, 100);
}

function forceHideModal() {
    console.log('Force hiding modal');
    if (nameInputModal) {
        nameInputModal.classList.add('hidden');
        nameInputModal.style.display = 'none';
        console.log('Modal force hidden');
    }
}

function createUserFromInput() {
    const name = document.getElementById('userNameInput').value.trim();
    const avatar = document.getElementById('userAvatarSelect').value;
    
    if (!name) {
        alert('Nama tidak boleh kosong!');
        return;
    }
    
    // Generate unique user ID
    const userId = generateID();
    
    // Add to USERS object
    USERS[userId] = {
        name: name,
        avatar: avatar
    };
    
    // Set as current user
    currentUser = userId;
    
    // Save to localStorage
    localStorage.setItem('currentUser', currentUser);
    localStorage.setItem('users', JSON.stringify(USERS));
    
    // Close modal and initialize app
    nameInputModal.classList.add('hidden');
    updateUserUI();
    populateUserDropdown();
    loadUserData();
    init();
    
    showNotification(`✅ Selamat datang, ${name}!`);
}

function populateUserDropdown() {
    userDropdownList.innerHTML = '';
    
    Object.keys(USERS).forEach(userId => {
        const user = USERS[userId];
        const userItem = document.createElement('div');
        userItem.className = 'user-dropdown-item-container';
        
        const userButton = document.createElement('button');
        userButton.className = 'user-dropdown-item';
        userButton.dataset.user = userId;
        userButton.innerHTML = `
            <span class="user-avatar-small">${user.avatar}</span>
            <span class="user-name">${user.name}</span>
        `;
        
        if (userId === currentUser) {
            userButton.classList.add('active');
        }
        
        userButton.addEventListener('click', () => {
            switchUser(userId);
            userDropdown.classList.remove('show');
        });
        
        // Add delete button (only if not current user and more than 1 user)
        if (userId !== currentUser && Object.keys(USERS).length > 1) {
            const deleteButton = document.createElement('button');
            deleteButton.className = 'user-delete-btn';
            deleteButton.innerHTML = '🗑️';
            deleteButton.title = 'Hapus pengguna';
            deleteButton.addEventListener('click', (e) => {
                e.stopPropagation();
                deleteUser(userId);
            });
            
            userItem.appendChild(userButton);
            userItem.appendChild(deleteButton);
        } else {
            userItem.appendChild(userButton);
        }
        
        userDropdownList.appendChild(userItem);
    });
}

function switchUser(userId) {
    if (userId === currentUser) return;
    
    currentUser = userId;
    localStorage.setItem('currentUser', currentUser);
    
    updateUserUI();
    populateUserDropdown();
    loadUserData();
    
    // Refresh all displays
    displayTransactions();
    displayBudgets();
    updateDashboard();
    updateSavingsDashboard();
    displaySavingsHistory();
    
    showNotification(`✅ Beralih ke akun ${USERS[userId].name}`);
}

function addNewUser() {
    const name = document.getElementById('newUserName').value.trim();
    const avatar = document.getElementById('newUserAvatar').value;
    
    if (!name) {
        alert('Nama pengguna tidak boleh kosong!');
        return;
    }
    
    // Generate unique user ID
    const userId = generateID();
    
    // Add to USERS object
    USERS[userId] = {
        name: name,
        avatar: avatar
    };
    
    // Save users to localStorage
    localStorage.setItem('users', JSON.stringify(USERS));
    
    // Update UI
    populateUserDropdown();
    
    // Close modal
    addUserModal.classList.add('hidden');
    
    // Clear form
    addUserForm.reset();
    
    showNotification(`✅ Pengguna "${name}" berhasil ditambahkan!`);
}

function deleteUser(userId) {
    const user = USERS[userId];
    if (!user) return;
    
    if (!confirm(`Yakin ingin menghapus pengguna "${user.name}"?\n\n⚠️ Semua data transaksi, budget, dan tabungan pengguna ini akan hilang!`)) {
        return;
    }
    
    // Remove user data from localStorage
    const keysToRemove = ['transactions', 'budgets', 'savingsTransactions'];
    keysToRemove.forEach(key => {
        localStorage.removeItem(`${userId}_${key}`);
    });
    
    // Remove user from USERS object
    delete USERS[userId];
    
    // Save updated users
    localStorage.setItem('users', JSON.stringify(USERS));
    
    // Update UI
    populateUserDropdown();
    updateUserUI();
    
    showNotification(`✅ Pengguna "${user.name}" berhasil dihapus!`);
}



function updateUserUI() {
    const user = USERS[currentUser];
    if (user) {
        currentUserName.textContent = user.name;
        currentUserAvatar.textContent = user.avatar;
    }
}

function loadUserData() {
    transactions = JSON.parse(localStorage.getItem(getUserKey('transactions'))) || [];
    budgets = JSON.parse(localStorage.getItem(getUserKey('budgets'))) || {};
}



// Name input form submission
nameInputForm.addEventListener('submit', (e) => {
    e.preventDefault();
    createUserFromInput();
});

// Add user form submission
addUserForm.addEventListener('submit', (e) => {
    e.preventDefault();
    addNewUser();
});

// Toggle user dropdown
currentUserBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    userDropdown.classList.toggle('show');
});

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.user-switch')) {
        userDropdown.classList.remove('show');
    }
});

// Add user button
addUserBtn.addEventListener('click', () => {
    userDropdown.classList.remove('show');
    addUserModal.classList.remove('hidden');
});

// Cancel add user
document.getElementById('cancelAddUser').addEventListener('click', () => {
    addUserModal.classList.add('hidden');
});

function init() {
    // Set date input to today
    dateInput.valueAsDate = new Date();
    
    // Populate categories
    populateCategories();
    updateCategoryFilter();
    
    // Display data
    updateDashboard();
    displayTransactions();
    displayBudgets();
    
    // Register Service Worker
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/duitkuuu/service-worker.js')
                .then(reg => {
                    console.log('Service Worker registered successfully:', reg);
                    
                    // Check PWA installability
                    if ('BeforeInstallPromptEvent' in window) {
                        console.log('PWA can be installed');
                    } else {
                        console.log('PWA install prompt not available');
                    }
                })
                .catch(err => {
                    console.log('Service Worker registration failed:', err);
                });
        });
    }
    
    // Debug PWA installability
    window.addEventListener('beforeinstallprompt', (e) => {
        console.log('PWA install prompt triggered');
        e.preventDefault();
        window.deferredPrompt = e;
    });
    
    window.addEventListener('appinstalled', () => {
        console.log('PWA installed successfully');
    });
}

// =============================================
// TAB NAVIGATION
// =============================================

tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const targetTab = btn.dataset.tab;
        
        // Remove active class from all
        tabBtns.forEach(b => b.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));
        
        // Add active class to clicked
        btn.classList.add('active');
        document.getElementById(targetTab).classList.add('active');
        
        // Refresh charts when dashboard is opened
        if (targetTab === 'dashboard') {
            updateDashboard();
        }
    });
});

// =============================================
// CATEGORIES MANAGEMENT
// =============================================

function populateCategories() {
    const type = typeSelect.value;
    const categories = CATEGORIES[type];
    
    categorySelect.innerHTML = '';
    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.value;
        option.textContent = cat.label;
        categorySelect.appendChild(option);
    });
    
    // Populate budget category select (only expense)
    budgetCategorySelect.innerHTML = '';
    CATEGORIES.expense.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.value;
        option.textContent = cat.label;
        budgetCategorySelect.appendChild(option);
    });
}

function updateCategoryFilter() {
    filterCategory.innerHTML = '<option value="all">Semua Kategori</option>';
    
    const allCategories = [...CATEGORIES.income, ...CATEGORIES.expense];
    allCategories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.value;
        option.textContent = cat.label;
        filterCategory.appendChild(option);
    });
}

function getCategoryLabel(categoryValue) {
    const allCategories = [...CATEGORIES.income, ...CATEGORIES.expense];
    const category = allCategories.find(cat => cat.value === categoryValue);
    return category ? category.label : categoryValue;
}

// =============================================
// TRANSACTION MANAGEMENT
// =============================================

function addTransaction(e) {
    e.preventDefault();

    const transaction = {
        id: generateID(),
        type: typeSelect.value,
        category: categorySelect.value,
        description: descriptionInput.value.trim(),
        amount: parseFloat(amountInput.value),
        date: dateInput.value
    };

    transactions.unshift(transaction);
    saveData();
    
    displayTransactions();
    updateDashboard();

    form.reset();
    dateInput.valueAsDate = new Date();
    populateCategories();
    
    showNotification('✅ Transaksi berhasil ditambahkan!');
}

function deleteTransaction(id) {
    if (confirm('Yakin ingin menghapus transaksi ini?')) {
        transactions = transactions.filter(t => t.id !== id);
        saveData();
        displayTransactions();
        updateDashboard();
        showNotification('✅ Transaksi berhasil dihapus!');
    }
}

function displayTransactions() {
    const typeFilter = filterType.value;
    const categoryFilter = filterCategory.value;
    const periodFilter = filterPeriod.value;
    
    let filtered = transactions;
    
    // Filter by type
    if (typeFilter !== 'all') {
        filtered = filtered.filter(t => t.type === typeFilter);
    }
    
    // Filter by category
    if (categoryFilter !== 'all') {
        filtered = filtered.filter(t => t.category === categoryFilter);
    }
    
    // Filter by period
    if (periodFilter !== 'all') {
        filtered = filtered.filter(t => {
            const tDate = new Date(t.date);
            const today = new Date();
            
            switch (periodFilter) {
                case 'today':
                    return tDate.toDateString() === today.toDateString();
                case 'week':
                    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                    return tDate >= weekAgo;
                case 'month':
                    return tDate.getMonth() === today.getMonth() && 
                           tDate.getFullYear() === today.getFullYear();
                case 'year':
                    return tDate.getFullYear() === today.getFullYear();
                default:
                    return true;
            }
        });
    }
    
    // Update total count
    totalFilteredTransactions = filtered.length;
    transactionCountEl.textContent = totalFilteredTransactions;
    
    // Handle empty state
    if (filtered.length === 0) {
        transactionsList.innerHTML = '<p class="empty-state">Tidak ada transaksi untuk ditampilkan.</p>';
        paginationEl.style.display = 'none';
        return;
    }
    
    // Calculate pagination
    const totalPages = itemsPerPage === 'all' ? 1 : Math.ceil(filtered.length / itemsPerPage);
    
    // Reset to page 1 if current page exceeds total pages
    if (currentPage > totalPages) {
        currentPage = 1;
    }
    
    // Update pagination UI
    updatePaginationUI(totalPages);
    
    // Get transactions for current page
    let paginatedTransactions;
    if (itemsPerPage === 'all') {
        paginatedTransactions = filtered;
    } else {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        paginatedTransactions = filtered.slice(startIndex, endIndex);
    }
    
    // Display transactions
    transactionsList.innerHTML = '';
    
    paginatedTransactions.forEach(transaction => {
        const item = document.createElement('div');
        item.classList.add('transaction-item', transaction.type);
        
        const sign = transaction.type === 'income' ? '+' : '-';
        const formattedDate = formatDate(transaction.date);
        const formattedAmount = formatCurrency(transaction.amount);
        const categoryLabel = getCategoryLabel(transaction.category);
        
        item.innerHTML = `
            <div class="transaction-info">
                <span class="transaction-category">${categoryLabel}</span>
                <div class="transaction-description">${transaction.description}</div>
                <div class="transaction-date">${formattedDate}</div>
            </div>
            <div class="transaction-amount-wrapper">
                <span class="transaction-amount ${transaction.type}">
                    ${sign} ${formattedAmount}
                </span>
                <button class="btn-delete" onclick="deleteTransaction('${transaction.id}')">
                    🗑️
                </button>
            </div>
        `;
        
        transactionsList.appendChild(item);
    });
    
    // Scroll to top of transactions list
    transactionsList.scrollTop = 0;
}

// =============================================
// PAGINATION FUNCTIONS
// =============================================

function updatePaginationUI(totalPages) {
    currentPageEl.textContent = currentPage;
    totalPagesEl.textContent = totalPages;
    
    // Show/hide pagination
    if (itemsPerPage === 'all' || totalPages <= 1) {
        paginationEl.style.display = 'none';
    } else {
        paginationEl.style.display = 'flex';
    }
    
    // Enable/disable buttons
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages;
}

function goToPage(page) {
    currentPage = page;
    displayTransactions();
}

function previousPage() {
    if (currentPage > 1) {
        goToPage(currentPage - 1);
    }
}

function nextPage() {
    const totalPages = Math.ceil(totalFilteredTransactions / itemsPerPage);
    if (currentPage < totalPages) {
        goToPage(currentPage + 1);
    }
}

function changeItemsPerPage() {
    const value = perPageSelect.value;
    itemsPerPage = value === 'all' ? 'all' : parseInt(value);
    currentPage = 1; // Reset to first page
    displayTransactions();
}

// =============================================
// DASHBOARD & STATISTICS
// =============================================

function updateDashboard() {
    updateBalance();
    updateStats();
    updateCharts();
}

function updateBalance() {
    const income = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

    const expense = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

    const balance = income - expense;

    totalBalanceEl.textContent = formatCurrency(balance);
    totalIncomeEl.textContent = formatCurrency(income);
    totalExpenseEl.textContent = formatCurrency(expense);
}

function updateStats() {
    // Transactions this month
    const today = new Date();
    const monthTransactions = transactions.filter(t => {
        const tDate = new Date(t.date);
        return tDate.getMonth() === today.getMonth() && 
               tDate.getFullYear() === today.getFullYear();
    });
    monthTransactionsEl.textContent = monthTransactions.length;
    
    // Average expense
    const expenses = transactions.filter(t => t.type === 'expense');
    const avgExpense = expenses.length > 0 
        ? expenses.reduce((sum, t) => sum + t.amount, 0) / expenses.length 
        : 0;
    avgExpenseEl.textContent = formatCurrency(avgExpense);
    
    // Budget used percentage
    const totalBudget = Object.values(budgets).reduce((sum, b) => sum + b, 0);
    const monthExpense = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
    const budgetPercentage = totalBudget > 0 ? (monthExpense / totalBudget * 100).toFixed(1) : 0;
    budgetUsedEl.textContent = budgetPercentage + '%';
}

function updateCharts() {
    updateIncomeExpenseChart();
    updateCategoryChart();
}

function updateIncomeExpenseChart() {
    const canvas = document.getElementById('incomeExpenseChart');
    const ctx = canvas.getContext('2d');
    
    // Get last 6 months data
    const months = [];
    const incomeData = [];
    const expenseData = [];
    
    for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthName = date.toLocaleDateString('id-ID', { month: 'short', year: '2-digit' });
        months.push(monthName);
        
        const monthTransactions = transactions.filter(t => {
            const tDate = new Date(t.date);
            return tDate.getMonth() === date.getMonth() && 
                   tDate.getFullYear() === date.getFullYear();
        });
        
        const income = monthTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
        const expense = monthTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
            
        incomeData.push(income);
        expenseData.push(expense);
    }
    
    if (incomeExpenseChart) {
        incomeExpenseChart.destroy();
    }
    
    incomeExpenseChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: months,
            datasets: [
                {
                    label: 'Pemasukan',
                    data: incomeData,
                    borderColor: '#4CAF50',
                    backgroundColor: 'rgba(76, 175, 80, 0.1)',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Pengeluaran',
                    data: expenseData,
                    borderColor: '#f44336',
                    backgroundColor: 'rgba(244, 67, 54, 0.1)',
                    tension: 0.4,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return 'Rp ' + (value / 1000) + 'k';
                        }
                    }
                }
            }
        }
    });
}

function updateCategoryChart() {
    const canvas = document.getElementById('categoryChart');
    const ctx = canvas.getContext('2d');
    
    // Get expense by category
    const categoryData = {};
    const expenses = transactions.filter(t => t.type === 'expense');
    
    expenses.forEach(t => {
        if (!categoryData[t.category]) {
            categoryData[t.category] = 0;
        }
        categoryData[t.category] += t.amount;
    });
    
    const labels = Object.keys(categoryData).map(cat => getCategoryLabel(cat));
    const data = Object.values(categoryData);
    
    if (categoryChart) {
        categoryChart.destroy();
    }
    
    if (data.length === 0) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.font = '14px Arial';
        ctx.fillStyle = '#999';
        ctx.textAlign = 'center';
        ctx.fillText('Belum ada data pengeluaran', canvas.width / 2, canvas.height / 2);
        return;
    }
    
    categoryChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: [
                    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
                    '#FF9F40', '#FF6384', '#C9CBCF', '#4BC0C0', '#FF9F40'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom'
                }
            }
        }
    });
}

// =============================================
// BUDGET MANAGEMENT
// =============================================

function saveBudget(e) {
    e.preventDefault();
    
    const category = budgetCategorySelect.value;
    const amount = parseFloat(budgetAmountInput.value);
    
    budgets[category] = amount;
    saveData();
    
    displayBudgets();
    updateDashboard();
    
    budgetForm.reset();
    showNotification('✅ Budget berhasil disimpan!');
}

function displayBudgets() {
    budgetList.innerHTML = '';
    
    if (Object.keys(budgets).length === 0) {
        budgetList.innerHTML = '<p class="empty-state">Belum ada budget yang diatur.</p>';
        return;
    }
    
    const today = new Date();
    
    Object.entries(budgets).forEach(([category, budgetAmount]) => {
        const categoryLabel = getCategoryLabel(category);
        
        // Calculate spent amount this month
        const spent = transactions
            .filter(t => {
                const tDate = new Date(t.date);
                return t.type === 'expense' && 
                       t.category === category &&
                       tDate.getMonth() === today.getMonth() && 
                       tDate.getFullYear() === today.getFullYear();
            })
            .reduce((sum, t) => sum + t.amount, 0);
        
        const percentage = (spent / budgetAmount * 100).toFixed(1);
        let progressClass = '';
        
        if (percentage > 90) {
            progressClass = 'danger';
        } else if (percentage > 70) {
            progressClass = 'warning';
        }
        
        const item = document.createElement('div');
        item.classList.add('budget-item');
        item.innerHTML = `
            <div class="budget-header">
                <span class="budget-category-name">${categoryLabel}</span>
                <button class="btn-delete" onclick="deleteBudget('${category}')">🗑️</button>
            </div>
            <div class="budget-amounts">
                ${formatCurrency(spent)} / ${formatCurrency(budgetAmount)}
            </div>
            <div class="budget-progress-bar">
                <div class="budget-progress-fill ${progressClass}" style="width: ${Math.min(percentage, 100)}%"></div>
            </div>
            <div class="budget-percentage">${percentage}% terpakai</div>
        `;
        
        budgetList.appendChild(item);
    });
}

function deleteBudget(category) {
    if (confirm('Yakin ingin menghapus budget ini?')) {
        delete budgets[category];
        saveData();
        displayBudgets();
        updateDashboard();
        showNotification('✅ Budget berhasil dihapus!');
    }
}

// =============================================
// REPORTS
// =============================================

function generateReport() {
    const startDate = new Date(reportStart.value);
    const endDate = new Date(reportEnd.value);
    
    if (!reportStart.value || !reportEnd.value) {
        alert('Silakan pilih tanggal mulai dan akhir periode!');
        return;
    }
    
    if (startDate > endDate) {
        alert('Tanggal mulai tidak boleh lebih besar dari tanggal akhir!');
        return;
    }
    
    const filtered = transactions.filter(t => {
        const tDate = new Date(t.date);
        return tDate >= startDate && tDate <= endDate;
    });
    
    const income = filtered
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const expense = filtered
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const balance = income - expense;
    
    // Category breakdown
    const categoryBreakdown = {};
    filtered.filter(t => t.type === 'expense').forEach(t => {
        if (!categoryBreakdown[t.category]) {
            categoryBreakdown[t.category] = 0;
        }
        categoryBreakdown[t.category] += t.amount;
    });
    
    let categoryHTML = '<div style="margin-top: 20px;"><h4>Rincian Pengeluaran per Kategori:</h4><ul style="list-style: none; padding: 10px 0;">';
    Object.entries(categoryBreakdown)
        .sort((a, b) => b[1] - a[1])
        .forEach(([cat, amount]) => {
            const label = getCategoryLabel(cat);
            const percentage = ((amount / expense) * 100).toFixed(1);
            categoryHTML += `<li style="padding: 8px; background: #f9f9f9; margin-bottom: 5px; border-radius: 5px;">
                ${label}: <strong>${formatCurrency(amount)}</strong> (${percentage}%)
            </li>`;
        });
    categoryHTML += '</ul></div>';
    
    reportResults.innerHTML = `
        <div class="report-summary">
            <h3>📊 Laporan Periode: ${formatDate(reportStart.value)} - ${formatDate(reportEnd.value)}</h3>
            <div class="report-stats">
                <div class="report-stat">
                    <div class="report-stat-label">Total Pemasukan</div>
                    <div class="report-stat-value" style="color: #4CAF50;">${formatCurrency(income)}</div>
                </div>
                <div class="report-stat">
                    <div class="report-stat-label">Total Pengeluaran</div>
                    <div class="report-stat-value" style="color: #f44336;">${formatCurrency(expense)}</div>
                </div>
                <div class="report-stat">
                    <div class="report-stat-label">Saldo</div>
                    <div class="report-stat-value" style="color: ${balance >= 0 ? '#4CAF50' : '#f44336'};">${formatCurrency(balance)}</div>
                </div>
                <div class="report-stat">
                    <div class="report-stat-label">Jumlah Transaksi</div>
                    <div class="report-stat-value">${filtered.length}</div>
                </div>
            </div>
            ${expense > 0 ? categoryHTML : '<p style="margin-top: 20px; color: #999;">Tidak ada pengeluaran dalam periode ini.</p>'}
        </div>
    `;
    
    showNotification('✅ Laporan berhasil dibuat!');
}

// =============================================
// EXPORT DATA
// =============================================

function exportData() {
    if (transactions.length === 0) {
        alert('Tidak ada data untuk di-export!');
        return;
    }
    
    const user = USERS[currentUser];
    let csv = 'Tanggal,Jenis,Kategori,Keterangan,Jumlah\n';
    
    transactions.forEach(t => {
        const type = t.type === 'income' ? 'Pemasukan' : 'Pengeluaran';
        const category = getCategoryLabel(t.category);
        csv += `${t.date},${type},${category},"${t.description}",${t.amount}\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    const filename = `keuangan_${user.name}_${new Date().toISOString().split('T')[0]}.csv`;
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification('✅ Data berhasil di-export!');
}

// =============================================
// UTILITY FUNCTIONS
// =============================================

function generateID() {
    return Date.now() + Math.random().toString(36).substr(2, 9);
}

function formatCurrency(amount) {
    return 'Rp ' + amount.toLocaleString('id-ID');
}

function formatDate(dateString) {
    const date = new Date(dateString);
    
    // Check if mobile
    const isMobile = window.innerWidth <= 768;
    
    if (isMobile) {
        // Short format for mobile
        return date.toLocaleDateString('id-ID', {
            day: '2-digit',
            month: '2-digit',
            year: '2-digit'
        });
    } else {
        // Full format for desktop
        return date.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    }
}

function saveData() {
    localStorage.setItem(getUserKey('transactions'), JSON.stringify(transactions));
    localStorage.setItem(getUserKey('budgets'), JSON.stringify(budgets));
}

function clearAllData() {
    const user = USERS[currentUser];
    if (confirm(`⚠️ Yakin ingin menghapus SEMUA data ${user.name}? Tindakan ini tidak dapat dibatalkan!`)) {
        if (confirm('Konfirmasi sekali lagi: Hapus semua data transaksi dan budget?')) {
            transactions = [];
            budgets = {};
            saveData();
            
            displayTransactions();
            displayBudgets();
            updateDashboard();
            
            showNotification('✅ Semua data berhasil dihapus!');
        }
    }
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        z-index: 3000;
        animation: slideInRight 0.3s ease-out;
        max-width: 300px;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(400px); opacity: 0; }
    }
`;
document.head.appendChild(style);

// =============================================
// EVENT LISTENERS
// =============================================

// Transaction form
form.addEventListener('submit', addTransaction);
typeSelect.addEventListener('change', populateCategories);

// Filters
filterType.addEventListener('change', () => {
    currentPage = 1; // Reset to page 1 when filter changes
    displayTransactions();
});
filterCategory.addEventListener('change', () => {
    currentPage = 1;
    displayTransactions();
});
filterPeriod.addEventListener('change', () => {
    currentPage = 1;
    displayTransactions();
});

// Pagination
prevPageBtn.addEventListener('click', previousPage);
nextPageBtn.addEventListener('click', nextPage);
perPageSelect.addEventListener('change', changeItemsPerPage);

// Export
exportBtn.addEventListener('click', exportData);

// Budget
budgetForm.addEventListener('submit', saveBudget);

// Reports
generateReportBtn.addEventListener('click', generateReport);

// Clear all
clearAllBtn.addEventListener('click', clearAllData);

// =============================================
// INITIALIZE APP
// =============================================

// initUserSystem(); // Moved to after splash screen