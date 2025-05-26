
        document.addEventListener('DOMContentLoaded', function() {
            // DOM Elements
            const addTitleForm = document.getElementById('addTitleForm');
            const editTitleForm = document.getElementById('editTitleForm');
            const titlesTableBody = document.getElementById('titlesTableBody');
            const emptyState = document.getElementById('emptyState');
            const addTitleModal = document.getElementById('addTitleModal');
            const editTitleModal = document.getElementById('editTitleModal');
            const statusModal = document.getElementById('statusModal');
            const confirmModal = document.getElementById('confirmModal');
            const statusOptions = document.querySelectorAll('.status-option');
            const searchInput = document.getElementById('searchInput');
            const statusFilter = document.getElementById('statusFilter');
            const cancelAddBtn = document.getElementById('cancelAddBtn');
            const cancelEditBtn = document.getElementById('cancelEditBtn');
            const openAddModalBtn = document.getElementById('openAddModalBtn');
            const closeAddModalBtn = document.getElementById('closeAddModalBtn');
            const closeEditModalBtn = document.getElementById('closeEditModalBtn');
            
            // Chart variables
            let statusChart;
            
            // Initialize the app
            initApp();
            
            // Set today's date as default for entry date
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('addEntryDate').value = today;
            
            // Event Listeners
            addTitleForm.addEventListener('submit', handleAddTitleSubmit);
            editTitleForm.addEventListener('submit', handleEditTitleSubmit);
            cancelAddBtn.addEventListener('click', resetAddForm);
            cancelEditBtn.addEventListener('click', () => editTitleModal.classList.add('hidden'));
            openAddModalBtn.addEventListener('click', () => {
                resetAddForm();
                addTitleModal.classList.remove('hidden');
            });
            closeAddModalBtn.addEventListener('click', () => addTitleModal.classList.add('hidden'));
            closeEditModalBtn.addEventListener('click', () => editTitleModal.classList.add('hidden'));
            document.getElementById('closeStatusModal').addEventListener('click', () => statusModal.classList.add('hidden'));
            document.getElementById('closeConfirmModal').addEventListener('click', () => confirmModal.classList.add('hidden'));
            document.getElementById('cancelDelete').addEventListener('click', () => confirmModal.classList.add('hidden'));
            document.getElementById('confirmDelete').addEventListener('click', deleteTitle);
            searchInput.addEventListener('input', filterTitles);
            statusFilter.addEventListener('change', filterTitles);
            
            // Add event listeners to status options
            statusOptions.forEach(option => {
                option.addEventListener('click', function() {
                    const newStatus = this.getAttribute('data-status');
                    updateTitleStatus(newStatus);
                    statusModal.classList.add('hidden');
                });
            });
            
            // Input masks for add form
            document.getElementById('addDocument').addEventListener('input', function(e) {
                const value = e.target.value.replace(/\D/g, '');
                
                if (value.length <= 11) {
                    // CPF mask
                    e.target.value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
                } else {
                    // CNPJ mask
                    e.target.value = value.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
                }
            });
            
            document.getElementById('addPhone').addEventListener('input', function(e) {
                const value = e.target.value.replace(/\D/g, '');
                
                if (value.length <= 10) {
                    // Phone without 9th digit
                    e.target.value = value.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
                } else {
                    // Phone with 9th digit
                    e.target.value = value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
                }
            });
            
            document.getElementById('addAmount').addEventListener('input', function(e) {
                let value = e.target.value.replace(/\D/g, '');
                value = (value / 100).toFixed(2) + '';
                value = value.replace('.', ',');
                value = value.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
                e.target.value = value;
            });
            
            // Input masks for edit form
            document.getElementById('editDocument').addEventListener('input', function(e) {
                const value = e.target.value.replace(/\D/g, '');
                
                if (value.length <= 11) {
                    // CPF mask
                    e.target.value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
                } else {
                    // CNPJ mask
                    e.target.value = value.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
                }
            });
            
            document.getElementById('editPhone').addEventListener('input', function(e) {
                const value = e.target.value.replace(/\D/g, '');
                
                if (value.length <= 10) {
                    // Phone without 9th digit
                    e.target.value = value.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
                } else {
                    // Phone with 9th digit
                    e.target.value = value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
                }
            });
            
            document.getElementById('editAmount').addEventListener('input', function(e) {
                let value = e.target.value.replace(/\D/g, '');
                value = (value / 100).toFixed(2) + '';
                value = value.replace('.', ',');
                value = value.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
                e.target.value = value;
            });
            
            // Functions
            function initApp() {
                loadTitles();
                updateDashboard();
            }
            
            function loadTitles() {
                const titles = getTitlesFromStorage();
                
                if (titles.length === 0) {
                    emptyState.classList.remove('hidden');
                    titlesTableBody.innerHTML = '';
                    return;
                }
                
                emptyState.classList.add('hidden');
                renderTitles(titles);
            }
            
            function getTitlesFromStorage() {
                const titlesJSON = localStorage.getItem('titles');
                return titlesJSON ? JSON.parse(titlesJSON) : [];
            }
            
            function saveTitlesToStorage(titles) {
                localStorage.setItem('titles', JSON.stringify(titles));
                updateDashboard();
            }
            
            function renderTitles(titles) {
                // Sort by entry date (newest first)
                titles.sort((a, b) => new Date(b.entryDate) - new Date(a.entryDate));
                
                titlesTableBody.innerHTML = '';
                
                titles.forEach(title => {
                    const row = document.createElement('tr');
                    row.className = 'hover:bg-gray-50';
                    row.innerHTML = `
                        <td class="px-4 py-4" data-label="Cliente">
                            <div class="flex items-center">
                                <div>
                                    <div class="text-sm font-medium text-gray-900">${title.clientName}</div>
                                    <div class="text-sm text-gray-500">${title.ownerName}</div>
                                </div>
                            </div>
                        </td>
                        <td class="px-4 py-4" data-label="Valor">
                            <div class="text-sm font-medium text-gray-900">R$ ${formatCurrency(title.amount)}</div>
                        </td>
                        <td class="px-4 py-4" data-label="Status">
                            <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(title.status)}">
                                ${title.status}
                            </span>
                        </td>
                        <td class="px-4 py-4" data-label="Vencimento">
                            <div class="text-sm text-gray-900">${formatDate(title.dueDate)}</div>
                        </td>
                        <td class="px-4 py-4 actions-cell" data-label="Ações">
                            <div class="flex justify-end space-x-2">
                                <button data-id="${title.id}" class="edit-btn p-1 text-blue-600 hover:text-blue-800">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button data-id="${title.id}" class="status-btn p-1 ${title.status === 'Quitado' ? 'text-green-600 hover:text-green-800' : title.status === 'Devolvido' ? 'text-red-600 hover:text-red-800' : title.status === 'Repassado' ? 'text-blue-600 hover:text-blue-800' : 'text-gray-600 hover:text-gray-800'}">
                                    <i class="fas fa-exchange-alt"></i>
                                </button>
                                <button data-id="${title.id}" class="delete-btn p-1 text-red-600 hover:text-red-800">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </td>
                    `;
                    
                    titlesTableBody.appendChild(row);
                });
                
                // Add event listeners to action buttons
                document.querySelectorAll('.edit-btn').forEach(btn => {
                    btn.addEventListener('click', function() {
                        editTitle(this.getAttribute('data-id'));
                    });
                });
                
                document.querySelectorAll('.status-btn').forEach(btn => {
                    btn.addEventListener('click', function() {
                        openStatusModal(this.getAttribute('data-id'));
                    });
                });
                
                document.querySelectorAll('.delete-btn').forEach(btn => {
                    btn.addEventListener('click', function() {
                        openConfirmModal(this.getAttribute('data-id'));
                    });
                });
            }
            
            function getStatusClass(status) {
                switch(status) {
                    case 'Aguardando': return 'status-aguardando';
                    case 'Quitado': return 'status-quitado';
                    case 'Devolvido': return 'status-devolvido';
                    case 'Repassado': return 'status-repassado';
                    default: return 'status-aguardando';
                }
            }
            
            function formatDate(dateString) {
                const date = new Date(dateString);
                return date.toLocaleDateString('pt-BR');
            }
            
            function formatCurrency(value) {
                return value.toFixed(2).replace('.', ',').replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
            }
            
            function handleAddTitleSubmit(e) {
                e.preventDefault();
                
                const titleData = {
                    clientName: document.getElementById('addClientName').value.trim(),
                    ownerName: document.getElementById('addOwnerName').value.trim(),
                    document: document.getElementById('addDocument').value.trim(),
                    phone: document.getElementById('addPhone').value.trim(),
                    amount: parseFloat(document.getElementById('addAmount').value.replace(/\./g, '').replace(',', '.')),
                    entryDate: document.getElementById('addEntryDate').value,
                    dueDate: document.getElementById('addDueDate').value,
                    status: document.getElementById('addStatus').value,
                    titleInfo: document.getElementById('addTitleInfo').value.trim(),
                    notes: document.getElementById('addNotes').value.trim(),
                    updatedAt: new Date().toISOString()
                };
                
                // Validate required fields
                if (!titleData.clientName || !titleData.ownerName || !titleData.document || !titleData.amount || !titleData.dueDate) {
                    alert('Por favor, preencha todos os campos obrigatórios.');
                    return;
                }
                
                let titles = getTitlesFromStorage();
                
                // Add new title
                titleData.id = Date.now().toString();
                titleData.createdAt = new Date().toISOString();
                titles.unshift(titleData);
                
                saveTitlesToStorage(titles);
                resetAddForm();
                loadTitles();
                addTitleModal.classList.add('hidden');
            }
            
            function handleEditTitleSubmit(e) {
                e.preventDefault();
                
                const titleId = document.getElementById('editTitleId').value;
                const titleData = {
                    clientName: document.getElementById('editClientName').value.trim(),
                    ownerName: document.getElementById('editOwnerName').value.trim(),
                    document: document.getElementById('editDocument').value.trim(),
                    phone: document.getElementById('editPhone').value.trim(),
                    amount: parseFloat(document.getElementById('editAmount').value.replace(/\./g, '').replace(',', '.')),
                    entryDate: document.getElementById('editEntryDate').value,
                    dueDate: document.getElementById('editDueDate').value,
                    status: document.getElementById('editStatus').value,
                    titleInfo: document.getElementById('editTitleInfo').value.trim(),
                    notes: document.getElementById('editNotes').value.trim(),
                    updatedAt: new Date().toISOString()
                };
                
                // Validate required fields
                if (!titleData.clientName || !titleData.ownerName || !titleData.document || !titleData.amount || !titleData.dueDate) {
                    alert('Por favor, preencha todos os campos obrigatórios.');
                    return;
                }
                
                let titles = getTitlesFromStorage();
                
                // Update existing title
                const index = titles.findIndex(t => t.id === titleId);
                if (index !== -1) {
                    titleData.id = titleId;
                    titleData.createdAt = titles[index].createdAt;
                    titles[index] = titleData;
                }
                
                saveTitlesToStorage(titles);
                loadTitles();
                editTitleModal.classList.add('hidden');
            }
            
            function resetAddForm() {
                addTitleForm.reset();
                document.getElementById('addEntryDate').value = today;
                document.getElementById('addStatus').value = 'Aguardando';
            }
            
            function editTitle(id) {
                const titles = getTitlesFromStorage();
                const title = titles.find(t => t.id === id);
                
                if (title) {
                    document.getElementById('editTitleId').value = title.id;
                    document.getElementById('editClientName').value = title.clientName;
                    document.getElementById('editOwnerName').value = title.ownerName;
                    document.getElementById('editDocument').value = title.document;
                    document.getElementById('editPhone').value = title.phone || '';
                    document.getElementById('editAmount').value = formatCurrency(title.amount);
                    document.getElementById('editEntryDate').value = title.entryDate;
                    document.getElementById('editDueDate').value = title.dueDate;
                    document.getElementById('editStatus').value = title.status;
                    document.getElementById('editTitleInfo').value = title.titleInfo || '';
                    document.getElementById('editNotes').value = title.notes || '';
                    
                    editTitleModal.classList.remove('hidden');
                }
            }
            
            function openStatusModal(id) {
                document.getElementById('currentTitleId').value = id;
                statusModal.classList.remove('hidden');
            }
            
            function updateTitleStatus(newStatus) {
                const id = document.getElementById('currentTitleId').value;
                let titles = getTitlesFromStorage();
                const index = titles.findIndex(t => t.id === id);
                
                if (index !== -1) {
                    titles[index].status = newStatus;
                    titles[index].updatedAt = new Date().toISOString();
                    saveTitlesToStorage(titles);
                    loadTitles();
                }
            }
            
            function openConfirmModal(id) {
                document.getElementById('titleToDelete').value = id;
                confirmModal.classList.remove('hidden');
            }
            
            function deleteTitle() {
                const id = document.getElementById('titleToDelete').value;
                let titles = getTitlesFromStorage();
                titles = titles.filter(t => t.id !== id);
                
                saveTitlesToStorage(titles);
                confirmModal.classList.add('hidden');
                loadTitles();
            }
            
            function filterTitles() {
                const searchTerm = searchInput.value.toLowerCase();
                const statusFilterValue = statusFilter.value;
                let titles = getTitlesFromStorage();
                
                if (searchTerm || statusFilterValue !== 'all') {
                    titles = titles.filter(title => {
                        const matchesSearch = 
                            title.clientName.toLowerCase().includes(searchTerm) ||
                            title.ownerName.toLowerCase().includes(searchTerm) ||
                            title.document.toLowerCase().includes(searchTerm) ||
                            (title.phone && title.phone.toLowerCase().includes(searchTerm)) ||
                            title.amount.toString().includes(searchTerm.replace(',', '.')) ||
                            (title.titleInfo && title.titleInfo.toLowerCase().includes(searchTerm)) ||
                            (title.notes && title.notes.toLowerCase().includes(searchTerm));
                        
                        const matchesStatus = statusFilterValue === 'all' || title.status === statusFilterValue;
                        
                        return matchesSearch && matchesStatus;
                    });
                }
                
                if (titles.length === 0) {
                    emptyState.classList.remove('hidden');
                    titlesTableBody.innerHTML = '';
                } else {
                    emptyState.classList.add('hidden');
                    renderTitles(titles);
                }
            }
            
            function updateDashboard() {
                const titles = getTitlesFromStorage();
                
                // Filter out quitados for totals
                const activeTitles = titles.filter(title => title.status !== 'Quitado');
                
                // Update total active titles
                document.getElementById('totalTitles').textContent = activeTitles.length;
                
                // Update total active amount
                const totalAmount = activeTitles.reduce((sum, title) => sum + title.amount, 0);
                document.getElementById('totalAmount').textContent = `R$ ${formatCurrency(totalAmount)}`;
                
                // Count titles by status (including quitados for the chart)
                const statusCounts = {
                    Aguardando: 0,
                    Quitado: 0,
                    Devolvido: 0,
                    Repassado: 0
                };
                
                const statusAmounts = {
                    Aguardando: 0,
                    Quitado: 0,
                    Devolvido: 0,
                    Repassado: 0
                };
                
                titles.forEach(title => {
                    statusCounts[title.status]++;
                    statusAmounts[title.status] += title.amount;
                });
                
                // Update titles by status count (now just Aguardando)
                document.getElementById('titlesByStatusCount').textContent = statusCounts.Aguardando;
                
                // Update amount by status (now just Aguardando)
                document.getElementById('amountByStatus').textContent = `R$ ${formatCurrency(statusAmounts.Aguardando)}`;
                
                // Update status summary
                document.getElementById('awaitingCount').textContent = statusCounts.Aguardando;
                document.getElementById('awaitingAmount').textContent = formatCurrency(statusAmounts.Aguardando);
                
                document.getElementById('paidCount').textContent = statusCounts.Quitado;
                document.getElementById('paidAmount').textContent = formatCurrency(statusAmounts.Quitado);
                
                document.getElementById('returnedCount').textContent = statusCounts.Devolvido;
                document.getElementById('returnedAmount').textContent = formatCurrency(statusAmounts.Devolvido);
                
                document.getElementById('forwardedCount').textContent = statusCounts.Repassado;
                document.getElementById('forwardedAmount').textContent = formatCurrency(statusAmounts.Repassado);
                
                // Update chart (pie chart) - only active titles (excluding quitados)
                updateChart(activeTitles);
            }
            
            function updateChart(activeTitles) {
                const ctx = document.getElementById('statusChart').getContext('2d');
                
                // Count active titles by status
                const statusCounts = {
                    Aguardando: 0,
                    Devolvido: 0,
                    Repassado: 0
                };
                
                activeTitles.forEach(title => {
                    if (title.status in statusCounts) {
                        statusCounts[title.status]++;
                    }
                });
                
                // Prepare data for chart
                const labels = [];
                const data = [];
                const backgroundColors = [];
                
                if (statusCounts.Aguardando > 0) {
                    labels.push('Aguardando');
                    data.push(statusCounts.Aguardando);
                    backgroundColors.push('rgba(156, 163, 175, 0.7)');
                }
                
                if (statusCounts.Devolvido > 0) {
                    labels.push('Devolvido');
                    data.push(statusCounts.Devolvido);
                    backgroundColors.push('rgba(239, 68, 68, 0.7)');
                }
                
                if (statusCounts.Repassado > 0) {
                    labels.push('Repassado');
                    data.push(statusCounts.Repassado);
                    backgroundColors.push('rgba(59, 130, 246, 0.7)');
                }
                
                // Destroy previous chart if it exists
                if (statusChart) {
                    statusChart.destroy();
                }
                
                // Only create chart if there's data to show
                if (data.length > 0) {
                    statusChart = new Chart(ctx, {
                        type: 'pie',
                        data: {
                            labels: labels,
                            datasets: [{
                                data: data,
                                backgroundColor: backgroundColors,
                                borderColor: backgroundColors.map(color => color.replace('0.7', '1')),
                                borderWidth: 1
                            }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                                legend: {
                                    position: 'bottom',
                                },
                                tooltip: {
                                    callbacks: {
                                        label: function(context) {
                                            const label = context.label || '';
                                            const value = context.raw || 0;
                                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                            const percentage = Math.round((value / total) * 100);
                                            return `${label}: ${value} (${percentage}%)`;
                                        }
                                    }
                                }
                            }
                        }
                    });
                } else {
                    // Clear the canvas if no data
                    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
                }
            }
        });