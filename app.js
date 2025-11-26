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
            console.log('Splashscreen hidden');
            // Initialize user system after splash screen is hidden
            initUserSystem();
            // Initialize tab navigation after splash screen is hidden
            initTabNavigation();
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
let savingsTransactions = [];

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
const currentUserBtn = document.getElementById('currentUserBtn');
const currentUserName = document.getElementById('currentUserName');
const currentUserAvatar = document.getElementById('currentUserAvatar');
const userDropdown = document.getElementById('userDropdown');
const userDropdownList = document.getElementById('userDropdownList');
const addUserBtn = document.getElementById('addUserBtn');
const newUserName = document.getElementById('newUserName');
const newUserAvatar = document.getElementById('newUserAvatar');

// Tabs - Check if elements exist
let tabBtns, tabContents;

function checkDOMElements() {
    console.log('Checking DOM elements...');
    tabBtns = document.querySelectorAll('.tab-btn');
    tabContents = document.querySelectorAll('.tab-content');
    
    console.log('Tab buttons found:', tabBtns.length);
    console.log('Tab contents found:', tabContents.length);
    
    if (tabBtns.length === 0) {
        console.error('CRITICAL: No tab buttons found!');
        return false;
    }
    
    if (tabContents.length === 0) {
        console.error('CRITICAL: No tab contents found!');
        return false;
    }
    
    // Log each tab button
    tabBtns.forEach((btn, index) => {
        console.log(`Tab ${index}:`, btn.textContent.trim(), '->', btn.dataset.tab);
    });
    
    return true;
}

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
const mainSavingsBalanceEl = document.getElementById('mainSavingsBalance');

// Stats
const monthTransactionsEl = document.getElementById('monthTransactions');
const avgExpenseEl = document.getElementById('avgExpense');
const budgetUsedEl = document.getElementById('budgetUsed');
const monthSavingsEl = document.getElementById('monthSavings');

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

// Savings
const savingsForm = document.getElementById('savingsForm');
const savingsAmountInput = document.getElementById('savingsAmount');
const savingsDescriptionInput = document.getElementById('savingsDescription');
const savingsDateInput = document.getElementById('savingsDate');

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

function initUserSystem() {
    // Load users from localStorage
    const savedUsers = localStorage.getItem('users');
    if (savedUsers) {
        try {
            const parsedUsers = JSON.parse(savedUsers);
            Object.assign(USERS, parsedUsers);
        } catch (error) {
            localStorage.removeItem('users');
        }
    }
    
    // If no users exist, create default user
    if (Object.keys(USERS).length === 0) {
        createDefaultUser();
    }
    
    // Set current user if not set
    if (!currentUser) {
        currentUser = Object.keys(USERS)[0];
        localStorage.setItem('currentUser', currentUser);
    }
    
    // Initialize app
    updateUserUI();
    populateUserDropdown();
    loadUserData();
    init();
}

function createDefaultUser() {
    const userId = generateID();
    USERS[userId] = {
        name: 'Pengguna',
        avatar: '👤'
    };
    currentUser = userId;
    localStorage.setItem('currentUser', currentUser);
    localStorage.setItem('users', JSON.stringify(USERS));
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
    
    // Only refresh savings if we're currently on the savings tab
    // updateSavingsDashboard();
    // displaySavingsHistory();
    
    showNotification(`✅ Beralih ke akun ${USERS[userId].name}`);
}

function addNewUser() {
    const name = newUserName.value.trim();
    const avatar = newUserAvatar.value;
    
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
    
    // Clear form
    newUserName.value = '';
    newUserAvatar.value = '👨';
    
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
    savingsTransactions = JSON.parse(localStorage.getItem(getUserKey('savingsTransactions'))) || [];
}



// Add user button click
addUserBtn.addEventListener('click', (e) => {
    e.preventDefault();
    addNewUser();
});

// Add user on Enter key
newUserName.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        addNewUser();
    }
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
    const addUserModal = document.getElementById('addUserModal');
    if (addUserModal) {
        addUserModal.classList.remove('hidden');
    }
});

// Cancel add user
const cancelAddUserBtn = document.getElementById('cancelAddUser');
if (cancelAddUserBtn) {
    cancelAddUserBtn.addEventListener('click', () => {
        const addUserModal = document.getElementById('addUserModal');
        if (addUserModal) {
            addUserModal.classList.add('hidden');
        }
    });
}

// Cancel add user (alternative button)
const cancelAddUserBtnAlt = document.getElementById('cancelAddUserBtn');
if (cancelAddUserBtnAlt) {
    cancelAddUserBtnAlt.addEventListener('click', () => {
        const addUserModal = document.getElementById('addUserModal');
        if (addUserModal) {
            addUserModal.classList.add('hidden');
        }
    });
}

function init() {
    // Set date input to today
    dateInput.valueAsDate = new Date();
    
    // Set savings date input to today
    if (savingsDateInput) {
        savingsDateInput.valueAsDate = new Date();
    }
    
    // Populate categories
    populateCategories();
    updateCategoryFilter();
    
    // Display data
    updateDashboard();
    displayTransactions();
    displayBudgets();
    
    // Only initialize savings if we're on the savings tab
    // updateSavingsDashboard();
    // displaySavingsHistory();
    
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

function initTabNavigation() {
    console.log('=== INITIALIZING TAB NAVIGATION ===');
    
    // Check if DOM elements exist
    if (!checkDOMElements()) {
        console.error('Cannot initialize tab navigation - DOM elements not found');
        return;
    }
    
    console.log('Setting up event listeners for', tabBtns.length, 'tab buttons');
    
    tabBtns.forEach((btn, index) => {
        console.log(`Setting up tab button ${index}:`, btn.textContent.trim());
        
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            console.log('=== TAB CLICKED ===');
            console.log('Button text:', btn.textContent.trim());
            console.log('Target tab:', btn.dataset.tab);
            
            const targetTab = btn.dataset.tab;
            
            if (!targetTab) {
                console.error('No target tab specified!');
                return;
            }
            
            // Remove active class from all
            tabBtns.forEach(b => {
                b.classList.remove('active');
                console.log('Removed active from:', b.textContent.trim());
            });
            tabContents.forEach(c => {
                c.classList.remove('active');
                console.log('Removed active from content:', c.id);
            });
            
            // Add active class to clicked
            btn.classList.add('active');
            console.log('Added active to:', btn.textContent.trim());
            
            const targetElement = document.getElementById(targetTab);
            
            if (targetElement) {
                targetElement.classList.add('active');
                console.log('Added active to content:', targetTab);
                console.log('Tab switched successfully to:', targetTab);
            } else {
                console.error('Target tab element not found:', targetTab);
                return;
            }
            
            // Refresh charts when dashboard is opened
            if (targetTab === 'dashboard') {
                console.log('Refreshing dashboard...');
                updateDashboard();
            }
            
            // Refresh savings dashboard when savings tab is opened
            if (targetTab === 'savings') {
                console.log('Refreshing savings dashboard...');
                updateSavingsDashboard();
                displaySavingsHistory();
            }
            
            console.log('=== TAB SWITCH COMPLETE ===');
        });
        
        console.log(`Event listener added to tab ${index}`);
    });
    
    console.log('=== TAB NAVIGATION INITIALIZED SUCCESSFULLY ===');
}

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

    // Special handling for savings category
    if (transaction.type === 'expense' && transaction.category === 'saving') {
        // Create a savings deposit transaction
        const savingsTransaction = {
            id: generateID(),
            type: 'deposit',
            amount: transaction.amount,
            description: transaction.description,
            date: transaction.date
        };
        
        // Add to both savings transactions AND main transactions
        savingsTransactions.unshift(savingsTransaction);
        transactions.unshift(transaction); // Keep the original transaction too
        
        saveData();
        
        // Update displays
        displayTransactions();
        updateSavingsDashboard();
        displaySavingsHistory();
        updateDashboard();
        
        form.reset();
        dateInput.valueAsDate = new Date();
        populateCategories();
        
        showNotification('✅ Tabungan berhasil ditambahkan melalui transaksi!');
        return;
    }

    // Regular transaction handling
    transactions.unshift(transaction);
    saveData();
    
    displayTransactions();
    updateDashboard();
    updateSavingsDashboard();
    displaySavingsHistory();

    form.reset();
    dateInput.valueAsDate = new Date();
    populateCategories();
    
    showNotification('✅ Transaksi berhasil ditambahkan!');
}

function deleteTransaction(id) {
    if (confirm('Yakin ingin menghapus transaksi ini?')) {
        // Check if this is a savings transaction from the old system
        const transaction = transactions.find(t => t.id === id);
        
        if (transaction && transaction.category === 'saving') {
            // This is a savings transaction, we need to handle it specially
            if (transaction.type === 'expense') {
                // This was a savings deposit, remove corresponding savings transaction
                savingsTransactions = savingsTransactions.filter(t => 
                    !(t.type === 'deposit' && 
                      t.description === transaction.description &&
                      t.amount === transaction.amount &&
                      t.date === transaction.date)
                );
            } else if (transaction.type === 'income') {
                // This was a savings withdrawal, remove corresponding savings transaction
                savingsTransactions = savingsTransactions.filter(t => 
                    !(t.type === 'withdrawal' && 
                      t.description === transaction.description &&
                      t.amount === transaction.amount &&
                      t.date === transaction.date)
                );
            }
            
            // Remove from main transactions
            transactions = transactions.filter(t => t.id !== id);
            saveData();
            displayTransactions();
            updateDashboard();
            updateSavingsDashboard();
            displaySavingsHistory();
            showNotification('✅ Transaksi tabungan berhasil dihapus!');
        } else {
            // Regular transaction deletion
        transactions = transactions.filter(t => t.id !== id);
        saveData();
        displayTransactions();
        updateDashboard();
        updateSavingsDashboard();
        displaySavingsHistory();
        showNotification('✅ Transaksi berhasil dihapus!');
        }
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
        
        // Special styling for savings transactions
        let categoryDisplay = categoryLabel;
        let itemClass = transaction.type;
        
        if (transaction.type === 'expense' && transaction.category === 'saving') {
            categoryDisplay = '💎 Tabungan (Setoran)';
            itemClass = 'savings-deposit';
        } else if (transaction.type === 'income' && transaction.category === 'saving') {
            categoryDisplay = '💎 Tabungan (Penarikan)';
            itemClass = 'savings-withdrawal';
        }
        
        item.innerHTML = `
            <div class="transaction-info">
                <span class="transaction-category">${categoryDisplay}</span>
                <div class="transaction-description">${transaction.description}</div>
                <div class="transaction-date">${formattedDate}</div>
            </div>
            <div class="transaction-amount-wrapper">
                <span class="transaction-amount ${itemClass}">
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
    
    // Calculate savings balance
    const savingsBalance = calculateSavingsBalance();

    totalBalanceEl.textContent = formatCurrency(balance);
    totalIncomeEl.textContent = formatCurrency(income);
    totalExpenseEl.textContent = formatCurrency(expense);
    
    // Update main dashboard savings balance
    if (mainSavingsBalanceEl) {
        mainSavingsBalanceEl.textContent = formatCurrency(savingsBalance);
    }
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
    
    // Monthly savings
    const monthSavings = savingsTransactions.filter(t => {
        const tDate = new Date(t.date);
        return tDate.getMonth() === today.getMonth() && 
               tDate.getFullYear() === today.getFullYear();
    });
    
    const savingsDeposits = monthSavings
        .filter(t => t.type === 'deposit')
        .reduce((sum, t) => sum + t.amount, 0);
    const savingsWithdrawals = monthSavings
        .filter(t => t.type === 'withdrawal')
        .reduce((sum, t) => sum + t.amount, 0);
    const netSavings = savingsDeposits - savingsWithdrawals;
    
    if (monthSavingsEl) {
        monthSavingsEl.textContent = formatCurrency(netSavings);
    }
}

function updateCharts() {
    updateIncomeExpenseChart();
    updateCategoryChart();
    updateCategoryDetails();
}

function updateIncomeExpenseChart() {
    const canvas = document.getElementById('incomeExpenseChart');
    const ctx = canvas.getContext('2d');
    
    // Get last 6 months data
    const months = [];
    const incomeData = [];
    const expenseData = [];
    const savingsData = [];
    
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
            
        // Calculate savings for this month
        const monthSavings = savingsTransactions.filter(t => {
            const tDate = new Date(t.date);
            return tDate.getMonth() === date.getMonth() && 
                   tDate.getFullYear() === date.getFullYear();
        });
        
        const savingsDeposits = monthSavings
            .filter(t => t.type === 'deposit')
            .reduce((sum, t) => sum + t.amount, 0);
        const savingsWithdrawals = monthSavings
            .filter(t => t.type === 'withdrawal')
            .reduce((sum, t) => sum + t.amount, 0);
        const netSavings = savingsDeposits - savingsWithdrawals;
            
        incomeData.push(income);
        expenseData.push(expense);
        savingsData.push(netSavings);
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
                    fill: false
                },
                {
                    label: 'Pengeluaran',
                    data: expenseData,
                    borderColor: '#f44336',
                    backgroundColor: 'rgba(244, 67, 54, 0.1)',
                    tension: 0.4,
                    fill: false
                },
                {
                    label: 'Tabungan Bersih',
                    data: savingsData,
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    tension: 0.4,
                    fill: false
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
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${label}: ${formatCurrency(value)} (${percentage}%)`;
                        }
                    }
                }
            },
            onClick: (event, elements) => {
                if (elements.length > 0) {
                    const index = elements[0].index;
                    const categoryValue = Object.keys(categoryData)[index];
                    showCategoryDetails(categoryValue);
                }
            }
        }
    });
}

function updateCategoryDetails() {
    const categoryDetailsList = document.getElementById('categoryDetailsList');
    if (!categoryDetailsList) return;
    
    // Get expense by category with transactions
    const categoryData = {};
    const expenses = transactions.filter(t => t.type === 'expense');
    
    expenses.forEach(t => {
        if (!categoryData[t.category]) {
            categoryData[t.category] = {
                total: 0,
                transactions: []
            };
        }
        categoryData[t.category].total += t.amount;
        categoryData[t.category].transactions.push(t);
    });
    
    if (Object.keys(categoryData).length === 0) {
        categoryDetailsList.innerHTML = '<p class="empty-state">Belum ada data pengeluaran.</p>';
        return;
    }
    
    // Sort by total amount (descending)
    const sortedCategories = Object.entries(categoryData)
        .sort((a, b) => b[1].total - a[1].total);
    
    categoryDetailsList.innerHTML = '';
    
    sortedCategories.forEach(([category, data]) => {
        const categoryLabel = getCategoryLabel(category);
        const categoryItem = document.createElement('div');
        categoryItem.className = 'category-detail-item';
        categoryItem.style.cssText = 'margin-bottom: 20px; padding: 15px; background: #f9f9f9; border-radius: 8px; border-left: 4px solid #667eea;';
        
        // Sort transactions by date (newest first)
        const sortedTransactions = data.transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        categoryItem.innerHTML = `
            <div class="category-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; cursor: pointer;" onclick="toggleCategoryDetails('${category}')">
                <div>
                    <h4 style="margin: 0; color: #333;">${categoryLabel}</h4>
                    <small style="color: #666;">${data.transactions.length} transaksi</small>
                </div>
                <div style="text-align: right;">
                    <div style="font-size: 1.2em; font-weight: 600; color: #f44336;">${formatCurrency(data.total)}</div>
                    <span class="toggle-icon" id="toggle-${category}" style="font-size: 0.9em; color: #666;">▼</span>
                </div>
            </div>
            <div class="category-transactions" id="transactions-${category}" style="display: none; margin-top: 10px; padding-top: 10px; border-top: 1px solid #e0e0e0;">
                ${sortedTransactions.map(transaction => {
                    const formattedDate = formatDate(transaction.date);
                    return `
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px; background: white; border-radius: 6px; margin-bottom: 6px;">
                            <div style="flex: 1;">
                                <div style="font-weight: 500; margin-bottom: 4px;">${transaction.description}</div>
                                <div style="font-size: 0.85em; color: #666;">${formattedDate}</div>
                            </div>
                            <div style="text-align: right; font-weight: 600; color: #f44336;">
                                ${formatCurrency(transaction.amount)}
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
        
        categoryDetailsList.appendChild(categoryItem);
    });
}

function toggleCategoryDetails(category) {
    const transactionsDiv = document.getElementById(`transactions-${category}`);
    const toggleIcon = document.getElementById(`toggle-${category}`);
    
    if (transactionsDiv && toggleIcon) {
        if (transactionsDiv.style.display === 'none') {
            transactionsDiv.style.display = 'block';
            toggleIcon.textContent = '▲';
        } else {
            transactionsDiv.style.display = 'none';
            toggleIcon.textContent = '▼';
        }
    }
}

function showCategoryDetails(categoryValue) {
    // Scroll to category details section
    const categoryDetailsList = document.getElementById('categoryDetailsList');
    if (categoryDetailsList) {
        categoryDetailsList.scrollIntoView({ behavior: 'smooth', block: 'start' });
        
        // Find and expand the category
        const transactionsDiv = document.getElementById(`transactions-${categoryValue}`);
        if (transactionsDiv && transactionsDiv.style.display === 'none') {
            toggleCategoryDetails(categoryValue);
        }
    }
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
// SAVINGS MANAGEMENT
// =============================================

// Gold price per gram in IDR (default: 1,000,000 IDR per gram)
// This can be updated from localStorage or API
const DEFAULT_GOLD_PRICE = 1000000; // 1 juta per gram

function getGoldPrice() {
    const savedPrice = localStorage.getItem(getUserKey('goldPrice'));
    return savedPrice ? parseFloat(savedPrice) : DEFAULT_GOLD_PRICE;
}

function setGoldPrice(price) {
    localStorage.setItem(getUserKey('goldPrice'), price.toString());
}

function convertToGold(amountInRupiah) {
    const goldPrice = getGoldPrice();
    return amountInRupiah / goldPrice;
}

function formatGold(grams) {
    if (grams < 0.001) {
        return '0 gram';
    } else if (grams < 1) {
        return `${(grams * 1000).toFixed(0)} mg`;
    } else {
        // Format as whole number if it's a whole number, otherwise 1 decimal
        if (grams % 1 === 0) {
            return `${grams.toFixed(0)} gram`;
        } else {
            return `${grams.toFixed(1)} gram`;
        }
    }
}

function addSavingsTransaction(e) {
    e.preventDefault();

    const amount = parseFloat(savingsAmountInput.value);
    const description = savingsDescriptionInput.value.trim();
    const date = savingsDateInput.value;
    const forGoldPurchase = document.getElementById('forGoldPurchase').checked;
    const goldGramsInput = document.getElementById('goldGrams');
    const goldGrams = forGoldPurchase && goldGramsInput ? parseFloat(goldGramsInput.value) : null;

    // Validate gold grams if for gold purchase
    if (forGoldPurchase) {
        if (!goldGrams || goldGrams <= 0) {
            alert('Masukkan jumlah gram emas yang dibeli!');
            return;
        }
    }

    // Check if there's enough balance for withdrawal
    const currentBalance = calculateSavingsBalance();
    if (amount > currentBalance) {
        alert(`Saldo tabungan tidak mencukupi!\nSaldo saat ini: ${formatCurrency(currentBalance)}\nJumlah yang ingin ditarik: ${formatCurrency(amount)}`);
        return;
    }

    const savingsTransaction = {
        id: generateID(),
        type: 'withdrawal',
        amount: amount,
        description: description,
        date: date,
        forGoldPurchase: forGoldPurchase || false,
        goldGrams: forGoldPurchase ? goldGrams : null
    };

    savingsTransactions.unshift(savingsTransaction);
    
    // Also add to main transactions for history tracking
    const mainTransaction = {
        id: generateID(),
        type: 'income', // Withdrawal = income (money back to main account)
        category: 'saving',
        description: savingsTransaction.description,
        amount: savingsTransaction.amount,
        date: savingsTransaction.date
    };
    transactions.unshift(mainTransaction);
    
    saveData();
    
    // Update displays
    updateSavingsDashboard();
    displaySavingsHistory();
    displayTransactions(); // Update main transaction list
    updateDashboard(); // Update main dashboard balance

    // Reset form
    savingsForm.reset();
    savingsDateInput.valueAsDate = new Date();
    document.getElementById('goldGramsGroup').style.display = 'none';
    
    if (forGoldPurchase) {
        showNotification(`✅ Tabungan berhasil ditarik untuk beli emas!\n🥇 ${formatGold(goldGrams)}`);
    } else {
        showNotification('✅ Tabungan berhasil ditarik!');
    }
}

function calculateSavingsBalance() {
    const deposits = savingsTransactions
        .filter(t => t.type === 'deposit')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const withdrawals = savingsTransactions
        .filter(t => t.type === 'withdrawal')
        .reduce((sum, t) => sum + t.amount, 0);
    
    return deposits - withdrawals;
}

function deleteSavingsTransaction(id) {
    if (confirm('Yakin ingin menghapus transaksi tabungan ini?')) {
        // Find the savings transaction
        const savingsTransaction = savingsTransactions.find(t => t.id === id);
        
        if (savingsTransaction) {
            // Remove from savings transactions
            savingsTransactions = savingsTransactions.filter(t => t.id !== id);
            
            // Also remove corresponding main transaction
            // Find by description, amount, and date since they should match
            transactions = transactions.filter(t => 
                !(t.category === 'saving' && 
                  t.description === savingsTransaction.description &&
                  t.amount === savingsTransaction.amount &&
                  t.date === savingsTransaction.date)
            );
        }
        
        saveData();
        updateSavingsDashboard();
        displaySavingsHistory();
        displayTransactions(); // Update main transaction list
        updateDashboard(); // Update main dashboard balance
        showNotification('✅ Transaksi tabungan berhasil dihapus!');
    }
}

function updateSavingsDashboard() {
    try {
        console.log('Updating savings dashboard...');
        
        // Calculate savings balance from dedicated savings transactions
        const savingsBalance = calculateSavingsBalance();
        
        // Calculate total deposits and withdrawals
        const totalDeposits = savingsTransactions
            .filter(t => t.type === 'deposit')
            .reduce((sum, t) => sum + t.amount, 0);
        
        const totalWithdrawals = savingsTransactions
            .filter(t => t.type === 'withdrawal')
            .reduce((sum, t) => sum + t.amount, 0);
        
        console.log('Savings transactions found:', savingsTransactions.length);
        console.log('Total deposits:', totalDeposits);
        console.log('Total withdrawals:', totalWithdrawals);
        console.log('Savings balance:', savingsBalance);
        
        // Update UI elements - konvensional
        const savingsBalanceEl = document.getElementById('savingsBalance');
        const savingsDepositEl = document.getElementById('savingsDeposit');
        const savingsWithdrawalEl = document.getElementById('savingsWithdrawal');
        
        if (savingsBalanceEl) {
            savingsBalanceEl.textContent = formatCurrency(savingsBalance);
            console.log('Updated savings balance:', formatCurrency(savingsBalance));
        } else {
            console.log('Savings balance element not found');
        }
        
        if (savingsDepositEl) {
            savingsDepositEl.textContent = formatCurrency(totalDeposits);
        }
        
        if (savingsWithdrawalEl) {
            savingsWithdrawalEl.textContent = formatCurrency(totalWithdrawals);
        }
        
        // Update gold savings display
        updateGoldSavingsDisplay();
        
        console.log('Savings dashboard updated successfully');
    } catch (error) {
        console.error('Error updating savings dashboard:', error);
    }
}

function updateGoldSavingsDisplay() {
    try {
        const savingsBalance = calculateSavingsBalance();
        const goldBalance = convertToGold(savingsBalance);
        const goldPrice = getGoldPrice();
        
        // Get withdrawals used for gold purchase
        const goldPurchases = savingsTransactions
            .filter(t => t.type === 'withdrawal' && t.forGoldPurchase === true)
            .sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // Calculate total amount used for gold purchase
        const totalGoldPurchaseAmount = goldPurchases
            .reduce((sum, t) => sum + t.amount, 0);
        
        // Calculate total gold purchased (using input grams or convert from amount)
        const totalGoldPurchased = goldPurchases
            .reduce((sum, t) => sum + (t.goldGrams || convertToGold(t.amount)), 0);
        
        // Update gold savings section
        const goldSavingsEl = document.getElementById('goldSavingsDisplay');
        if (goldSavingsEl) {
            goldSavingsEl.innerHTML = `
                <div class="gold-info">
                    <div class="gold-balance">
                        <h4>🥇 Tabungan Emas</h4>
                    </div>
                    
                    <div class="gold-stats" style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
                        <div class="gold-stat-item" style="display: flex; justify-content: space-between; margin-bottom: 10px; padding: 10px; background: #fff3cd; border-radius: 8px; border-left: 4px solid #ffc107;">
                            <span style="color: #666; font-weight: 500;">🥇 Total Emas Dibeli:</span>
                            <strong style="color: #ff9800; font-size: 1.1em;">${formatGold(totalGoldPurchased)}</strong>
                            <small style="color: #999; margin-left: 10px;">(${formatCurrency(totalGoldPurchaseAmount)})</small>
                        </div>
                        <div class="gold-stat-item" style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                            <span style="color: #666;">📊 Jumlah Pembelian:</span>
                            <strong style="color: #666;">${goldPurchases.length} kali</strong>
                        </div>
                    </div>
                    
                    ${goldPurchases.length > 0 ? `
                    <div class="gold-purchases" style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
                        <h5 style="margin-bottom: 15px; font-size: 0.95em; color: #666;">📋 Riwayat Pembelian Emas:</h5>
                        <div class="purchase-list" style="max-height: 300px; overflow-y: auto;">
                            ${goldPurchases.map(purchase => {
                                // Use input grams if available, otherwise convert from amount
                                const purchaseGold = purchase.goldGrams || convertToGold(purchase.amount);
                                const formattedDate = formatDate(purchase.date);
                                return `
                                    <div class="purchase-item" style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: linear-gradient(135deg, #fff9e6 0%, #fff3cd 100%); border-radius: 8px; margin-bottom: 10px; border-left: 4px solid #ffc107;">
                                        <div style="flex: 1;">
                                            <div style="font-weight: 600; margin-bottom: 4px; color: #856404;">🥇 ${purchase.description}</div>
                                            <div style="font-size: 0.85em; color: #666;">${formattedDate}</div>
                                        </div>
                                        <div style="text-align: right;">
                                            <div style="font-weight: 700; color: #ff9800; font-size: 1.1em;">${formatGold(purchaseGold)}</div>
                                            <div style="font-size: 0.8em; color: #999;">${formatCurrency(purchase.amount)}</div>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                    ` : `
                    <div class="no-gold-purchases" style="margin-top: 20px; padding: 20px; text-align: center; background: #f9f9f9; border-radius: 8px;">
                        <div style="font-size: 2em; margin-bottom: 10px;">🥇</div>
                        <p style="color: #666; margin: 0;">Belum ada pembelian emas dari tabungan</p>
                        <p style="color: #999; font-size: 0.9em; margin-top: 5px;">Centang "Digunakan untuk beli emas" saat menarik tabungan</p>
                    </div>
                    `}
                </div>
            `;
        }
    } catch (error) {
        console.error('Error updating gold savings display:', error);
    }
}

function updateGoldPrice() {
    const currentPrice = getGoldPrice();
    const newPrice = prompt(`Masukkan harga emas per gram (Rp):`, currentPrice);
    if (newPrice && !isNaN(newPrice) && parseFloat(newPrice) > 0) {
        setGoldPrice(parseFloat(newPrice));
        updateGoldSavingsDisplay();
        showNotification('✅ Harga emas berhasil diperbarui!');
    }
}


function displaySavingsHistory() {
    try {
        console.log('Displaying savings history...');
        
        const savingsHistoryList = document.getElementById('savingsHistoryList');
        const savingsTransactionCount = document.getElementById('savingsTransactionCount');
        const savingsFilter = document.getElementById('savingsFilter');
        
        if (!savingsHistoryList) {
            console.log('Savings history list element not found');
            return;
        }
        
        // Get savings transactions
        let filteredSavingsTransactions = [...savingsTransactions];
        
        // Apply filter if exists
        if (savingsFilter) {
            const filterValue = savingsFilter.value;
            if (filterValue === 'deposit') {
                filteredSavingsTransactions = filteredSavingsTransactions.filter(t => t.type === 'deposit');
            } else if (filterValue === 'withdrawal') {
                filteredSavingsTransactions = filteredSavingsTransactions.filter(t => t.type === 'withdrawal');
            }
        }
        
        // Update count
        if (savingsTransactionCount) {
            savingsTransactionCount.textContent = filteredSavingsTransactions.length;
        }
        
        // Display transactions
        if (filteredSavingsTransactions.length === 0) {
            savingsHistoryList.innerHTML = '<p class="empty-state">Belum ada transaksi tabungan.</p>';
            console.log('No savings transactions to display');
            return;
        }
        
        savingsHistoryList.innerHTML = '';
        
        // Sort by date (newest first)
        filteredSavingsTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        filteredSavingsTransactions.forEach(transaction => {
            const item = document.createElement('div');
            item.classList.add('transaction-item', transaction.type);
            
            const formattedDate = formatDate(transaction.date);
            const formattedAmount = formatCurrency(transaction.amount);
            const typeIcon = transaction.type === 'deposit' ? '📥' : '📤';
            const typeText = transaction.type === 'deposit' ? 'Setoran' : 'Penarikan';
            const amountSign = transaction.type === 'deposit' ? '+' : '-';
            
            item.innerHTML = `
                <div class="transaction-info">
                    <span class="transaction-category">${typeIcon} ${typeText}</span>
                    <div class="transaction-description">${transaction.description}</div>
                    <div class="transaction-date">${formattedDate}</div>
                </div>
                <div class="transaction-amount-wrapper">
                    <span class="transaction-amount ${transaction.type}">
                        ${amountSign} ${formattedAmount}
                    </span>
                    <button class="btn-delete" onclick="deleteSavingsTransaction('${transaction.id}')">
                        🗑️
                    </button>
                </div>
            `;
            
            savingsHistoryList.appendChild(item);
        });
        
        console.log('Savings history displayed successfully:', filteredSavingsTransactions.length, 'transactions');
    } catch (error) {
        console.error('Error displaying savings history:', error);
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
    // Convert to string to preserve precision
    const amountStr = amount.toString();
    
    // Split into integer and decimal parts
    const parts = amountStr.split('.');
    const integerPart = parts[0];
    const decimalPart = parts[1] || '';
    
    // Format integer part with thousand separators
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    
    // Combine with decimal part if exists
    if (decimalPart) {
        return 'Rp ' + formattedInteger + ',' + decimalPart;
    } else {
        return 'Rp ' + formattedInteger;
    }
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
    localStorage.setItem(getUserKey('savingsTransactions'), JSON.stringify(savingsTransactions));
}

function clearAllData() {
    const user = USERS[currentUser];
    if (confirm(`⚠️ Yakin ingin menghapus SEMUA data ${user.name}? Tindakan ini tidak dapat dibatalkan!`)) {
        if (confirm('Konfirmasi sekali lagi: Hapus semua data transaksi dan budget?')) {
            transactions = [];
            budgets = {};
            savingsTransactions = [];
            saveData();
            
            displayTransactions();
            displayBudgets();
            updateDashboard();
            updateSavingsDashboard();
            displaySavingsHistory();
            
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

// Savings
if (savingsForm) {
    savingsForm.addEventListener('submit', addSavingsTransaction);
    
    // Show/hide gold grams input when checkbox is toggled
    const forGoldPurchaseCheckbox = document.getElementById('forGoldPurchase');
    const goldGramsGroup = document.getElementById('goldGramsGroup');
    if (forGoldPurchaseCheckbox && goldGramsGroup) {
        forGoldPurchaseCheckbox.addEventListener('change', (e) => {
            if (e.target.checked) {
                goldGramsGroup.style.display = 'block';
            } else {
                goldGramsGroup.style.display = 'none';
                const goldGramsInput = document.getElementById('goldGrams');
                if (goldGramsInput) {
                    goldGramsInput.value = '';
                }
            }
        });
    }
}

// Reports
generateReportBtn.addEventListener('click', generateReport);

// Savings filter
const savingsFilter = document.getElementById('savingsFilter');
if (savingsFilter) {
    savingsFilter.addEventListener('change', displaySavingsHistory);
}

// Clear all
clearAllBtn.addEventListener('click', clearAllData);

// =============================================
// INITIALIZE APP
// =============================================

// Multiple fallback initialization attempts
function tryInitializeApp() {
    console.log('=== ATTEMPTING TO INITIALIZE APP ===');
    
    if (checkDOMElements()) {
        console.log('DOM elements found, initializing...');
        initUserSystem();
        initTabNavigation();
        return true;
    } else {
        console.log('DOM elements not ready yet, will retry...');
        return false;
    }
}

// Try immediate initialization
if (document.readyState === 'loading') {
    console.log('Document still loading, waiting for DOMContentLoaded...');
    document.addEventListener('DOMContentLoaded', () => {
        console.log('DOMContentLoaded fired');
        setTimeout(tryInitializeApp, 100);
    });
} else {
    console.log('Document already loaded, trying immediate initialization...');
    setTimeout(tryInitializeApp, 100);
}

// Fallback 1: After 1 second
setTimeout(() => {
    console.log('Fallback 1: Trying initialization after 1 second...');
    tryInitializeApp();
}, 1000);

// Fallback 2: After 3 seconds
setTimeout(() => {
    console.log('Fallback 2: Trying initialization after 3 seconds...');
    tryInitializeApp();
}, 3000);

// Fallback 3: After 5 seconds (original fallback)
setTimeout(() => {
    console.log('Fallback 3: Final attempt after 5 seconds...');
    const splashscreen = document.getElementById('splashscreen');
    if (splashscreen && splashscreen.style.display !== 'none') {
        console.log('Force hiding splashscreen...');
        splashscreen.style.display = 'none';
    }
    tryInitializeApp();
}, 5000);

// initUserSystem(); // Moved to after splash screen