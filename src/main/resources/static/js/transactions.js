/**
 * JavaScript для страницы транзакций
 * Обеспечивает функциональность загрузки, фильтрации, редактирования 
 * и удаления транзакций через API
 */
document.addEventListener('DOMContentLoaded', function() {
    // Загрузка всех транзакций при открытии страницы
    loadAllTransactions();
    
    // Загрузка категорий для фильтра
    loadCategories();
    
    // Обработчики событий
    document.getElementById('applyFilter').addEventListener('click', applyFilters);
    document.getElementById('resetFilter').addEventListener('click', resetFilters);
    document.getElementById('deleteTransactionBtn').addEventListener('click', confirmDeleteTransaction);
    document.getElementById('saveEditBtn').addEventListener('click', saveTransactionEdit);
});

/**
 * Загрузка всех транзакций
 */
function loadAllTransactions() {
    fetch('/api/transactions')
        .then(response => response.json())
        .then(data => {
            renderTransactions(data);
        })
        .catch(error => {
            console.error('Ошибка при загрузке транзакций:', error);
            showError('Не удалось загрузить транзакции. Пожалуйста, попробуйте позже.');
        });
}

/**
 * Загрузка категорий для фильтра
 */
function loadCategories() {
    fetch('/api/categories')
        .then(response => response.json())
        .then(categories => {
            const categorySelect = document.getElementById('categoryFilter');
            
            // Очистка и добавление категорий
            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.id;
                option.textContent = category.name;
                categorySelect.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Ошибка при загрузке категорий:', error);
        });
}

/**
 * Отображение транзакций в таблице
 */
function renderTransactions(transactions) {
    const tableBody = document.getElementById('transactionsTable');
    const noTransactionsAlert = document.getElementById('noTransactions');
    
    // Очистка таблицы
    tableBody.innerHTML = '';
    
    if (transactions.length === 0) {
        noTransactionsAlert.classList.remove('d-none');
        return;
    }
    
    noTransactionsAlert.classList.add('d-none');
    
    // Заполнение таблицы
    transactions.forEach(tx => {
        const row = document.createElement('tr');
        
        // Определение типа и суммы транзакции
        const type = tx.regTransaction ? tx.regTransaction.transactionType : 'N/A';
        const sum = tx.regTransaction ? tx.regTransaction.sum : 0;
        const category = tx.category ? tx.category.name : 'Без категории';
        
        // Определение класса для типа транзакции
        const typeClass = type === 'DEBIT' ? 'text-success' : 'text-danger';
        const typeText = type === 'DEBIT' ? 'Поступление' : 'Расход';
        
        // Форматирование даты
        const date = new Date(tx.dateTime).toLocaleString();
        
        // Создание содержимого строки
        row.innerHTML = `
            <td>${tx.id}</td>
            <td>${date}</td>
            <td class="${typeClass}">${typeText}</td>
            <td>${category}</td>
            <td>${sum.toFixed(2)} ₽</td>
            <td>${getStatusBadge(tx.status)}</td>
            <td>${tx.comment || '-'}</td>
            <td>
                <button class="btn btn-sm btn-info view-btn" data-id="${tx.id}">
                    <i class="bi bi-eye"></i>
                </button>
                ${tx.status === 'NEW' ? `
                <button class="btn btn-sm btn-warning edit-btn" data-id="${tx.id}">
                    <i class="bi bi-pencil"></i>
                </button>` : ''}
                ${tx.status !== 'ACCEPTED' && tx.status !== 'PROCESSING' && tx.status !== 'CANCELED' && tx.status !== 'PAYMENT_COMPLETED' && tx.status !== 'RETURN' ? `
                <button class="btn btn-sm btn-danger delete-btn" data-id="${tx.id}">
                    <i class="bi bi-trash"></i>
                </button>` : ''}
            </td>
        `;
        
        // Добавление обработчиков для кнопок
        const viewBtn = row.querySelector('.view-btn');
        if (viewBtn) {
            viewBtn.addEventListener('click', () => showTransactionDetails(tx.id));
        }
        
        const editBtn = row.querySelector('.edit-btn');
        if (editBtn) {
            editBtn.addEventListener('click', () => showEditForm(tx.id));
        }
        
        const deleteBtn = row.querySelector('.delete-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => showDeleteConfirmation(tx.id));
        }
        
        tableBody.appendChild(row);
    });
}

/**
 * Получение HTML-бейджа для статуса транзакции
 */
function getStatusBadge(status) {
    const statusMap = {
        'NEW': '<span class="badge bg-secondary">Новая</span>',
        'ACCEPTED': '<span class="badge bg-primary">Подтверждена</span>',
        'PROCESSING': '<span class="badge bg-info">В обработке</span>',
        'CANCELED': '<span class="badge bg-danger">Отменена</span>',
        'PAYMENT_COMPLETED': '<span class="badge bg-success">Выполнена</span>',
        'PAYMENT_DELETED': '<span class="badge bg-dark">Удалена</span>',
        'RETURN': '<span class="badge bg-warning">Возврат</span>'
    };
    
    return statusMap[status] || `<span class="badge bg-secondary">${status}</span>`;
}

/**
 * Применение фильтров к транзакциям
 */
function applyFilters() {
    const status = document.getElementById('statusFilter').value;
    const type = document.getElementById('typeFilter').value;
    const categoryId = document.getElementById('categoryFilter').value;
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const minAmount = document.getElementById('minAmount').value;
    const maxAmount = document.getElementById('maxAmount').value;
    const senderBank = document.getElementById('senderBankFilter').value;
    const recipientBank = document.getElementById('recipientBankFilter').value;
    const inn = document.getElementById('innFilter').value;
    
    // Базовый URL
    let baseUrl = '/api/transactions';
    let queryParams = [];
    
    // Добавление параметров фильтра
    if (status) {
        baseUrl = '/api/transactions/status';
        queryParams.push(`status=${status}`);
    } else if (type) {
        baseUrl = '/api/transactions/type';
        queryParams.push(`type=${type}`);
    } else if (categoryId) {
        baseUrl = `/api/transactions/category/${categoryId}`;
    } else if (inn) {
        baseUrl = `/api/transactions/recipient-inn/${inn}`;
    } else if (senderBank) {
        baseUrl = '/api/transactions/sender-bank';
        queryParams.push(`bankName=${encodeURIComponent(senderBank)}`);
    } else if (recipientBank) {
        baseUrl = '/api/transactions/recipient-bank';
        queryParams.push(`bankName=${encodeURIComponent(recipientBank)}`);
    } else if (startDate && endDate) {
        baseUrl = '/api/transactions/date-range';
        // Преобразование дат в ISO формат для API
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        
        queryParams.push(`start=${start.toISOString()}`);
        queryParams.push(`end=${end.toISOString()}`);
    } else if (minAmount && maxAmount) {
        baseUrl = '/api/transactions/amount-range';
        queryParams.push(`min=${minAmount}`);
        queryParams.push(`max=${maxAmount}`);
    }
    
    // Формирование URL с параметрами
    const url = queryParams.length > 0 ? `${baseUrl}?${queryParams.join('&')}` : baseUrl;
    
    // Загрузка отфильтрованных транзакций
    fetch(url)
        .then(response => response.json())
        .then(data => {
            renderTransactions(data);
        })
        .catch(error => {
            console.error('Ошибка при применении фильтров:', error);
            showError('Не удалось применить фильтры. Пожалуйста, попробуйте позже.');
        });
}

/**
 * Сброс всех фильтров
 */
function resetFilters() {
    document.getElementById('filterForm').reset();
    loadAllTransactions();
}

/**
 * Показ деталей транзакции
 */
function showTransactionDetails(id) {
    fetch(`/api/transactions/${id}`)
        .then(response => response.json())
        .then(tx => {
            const detailsBody = document.getElementById('transactionDetailsBody');
            
            // Определение типа и суммы транзакции
            const type = tx.regTransaction ? tx.regTransaction.transactionType : 'N/A';
            const sum = tx.regTransaction ? tx.regTransaction.sum : 0;
            const category = tx.category ? tx.category.name : 'Без категории';
            
            // Определение класса для типа транзакции
            const typeClass = type === 'DEBIT' ? 'text-success' : 'text-danger';
            const typeText = type === 'DEBIT' ? 'Поступление' : 'Расход';
            
            // Форматирование даты
            const date = new Date(tx.dateTime).toLocaleString();
            
            // Формирование HTML для деталей
            detailsBody.innerHTML = `
                <div class="row">
                    <div class="col-md-6">
                        <p><strong>ID:</strong> ${tx.id}</p>
                        <p><strong>Дата:</strong> ${date}</p>
                        <p><strong>Тип:</strong> <span class="${typeClass}">${typeText}</span></p>
                        <p><strong>Категория:</strong> ${category}</p>
                        <p><strong>Сумма:</strong> ${sum.toFixed(2)} ₽</p>
                        <p><strong>Статус:</strong> ${getStatusBadge(tx.status)}</p>
                    </div>
                    <div class="col-md-6">
                        <p><strong>Комментарий:</strong> ${tx.comment || '-'}</p>
                        <p><strong>Банк отправителя:</strong> ${tx.senderBank ? tx.senderBank.nameBank : '-'}</p>
                        <p><strong>Банк получателя:</strong> ${tx.recipientBank ? tx.recipientBank.nameBank : '-'}</p>
                        <p><strong>ИНН получателя:</strong> ${tx.subjectGetter && tx.subjectGetter.inn ? tx.subjectGetter.inn : '-'}</p>
                        <p><strong>Телефон получателя:</strong> ${tx.subjectGetter && tx.subjectGetter.recipientPhone ? tx.subjectGetter.recipientPhone : '-'}</p>
                    </div>
                </div>
            `;
            
            // Показ или скрытие кнопок редактирования и удаления
            document.getElementById('editTransactionBtn').style.display = tx.status === 'NEW' ? 'inline-block' : 'none';
            document.getElementById('deleteTransactionBtn').style.display = 
                (tx.status !== 'ACCEPTED' && tx.status !== 'PROCESSING' && tx.status !== 'CANCELED' && tx.status !== 'PAYMENT_COMPLETED' && tx.status !== 'RETURN') 
                ? 'inline-block' : 'none';
            
            // Сохранение ID для будущих действий
            document.getElementById('editTransactionBtn').setAttribute('data-id', tx.id);
            document.getElementById('deleteTransactionBtn').setAttribute('data-id', tx.id);
            
            // Отображение модального окна
            const modal = new bootstrap.Modal(document.getElementById('transactionDetailsModal'));
            modal.show();
            
            // Добавление обработчиков событий
            document.getElementById('editTransactionBtn').addEventListener('click', function() {
                modal.hide();
                showEditForm(tx.id);
            });
        })
        .catch(error => {
            console.error('Ошибка при загрузке деталей транзакции:', error);
            showError('Не удалось загрузить детали транзакции. Пожалуйста, попробуйте позже.');
        });
}

/**
 * Отображение формы редактирования транзакции
 */
function showEditForm(id) {
    fetch(`/api/transactions/${id}`)
        .then(response => response.json())
        .then(tx => {
            // Заполнение формы данными
            document.getElementById('editTransactionId').value = tx.id;
            
            // Форматирование даты и времени для input type="datetime-local"
            const date = new Date(tx.dateTime);
            const dateTimeStr = date.toISOString().slice(0, 16);
            document.getElementById('editDateTime').value = dateTimeStr;
            
            document.getElementById('editStatus').value = tx.status;
            
            // Установка суммы, если есть
            if (tx.regTransaction && tx.regTransaction.sum) {
                document.getElementById('editSum').value = tx.regTransaction.sum;
            }
            
            // Установка комментария, если есть
            document.getElementById('editComment').value = tx.comment || '';
            
            // Отображение модального окна
            const modal = new bootstrap.Modal(document.getElementById('editTransactionModal'));
            modal.show();
        })
        .catch(error => {
            console.error('Ошибка при загрузке данных для редактирования:', error);
            showError('Не удалось загрузить данные для редактирования. Пожалуйста, попробуйте позже.');
        });
}

/**
 * Сохранение отредактированной транзакции
 */
function saveTransactionEdit() {
    const id = document.getElementById('editTransactionId').value;
    const dateTime = document.getElementById('editDateTime').value;
    const status = document.getElementById('editStatus').value;
    const sum = document.getElementById('editSum').value;
    const comment = document.getElementById('editComment').value;
    
    // Формирование объекта с обновленными данными
    const updatedData = {
        status: status,
        dateTime: new Date(dateTime).toISOString(),
        comment: comment,
        regTransaction: {
            sum: parseFloat(sum)
        }
    };
    
    // Отправка запроса на обновление
    fetch(`/api/transactions/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': getCsrfToken()
        },
        body: JSON.stringify(updatedData)
    })
    .then(response => {
        if (!response.ok) {
            return response.text().then(text => { throw new Error(text) });
        }
        return response.json();
    })
    .then(data => {
        // Закрытие модального окна
        const modal = bootstrap.Modal.getInstance(document.getElementById('editTransactionModal'));
        modal.hide();
        
        // Перезагрузка транзакций
        loadAllTransactions();
        
        // Уведомление пользователя
        showSuccess('Транзакция успешно обновлена!');
    })
    .catch(error => {
        console.error('Ошибка при обновлении транзакции:', error);
        showError('Не удалось обновить транзакцию. ' + error.message);
    });
}

/**
 * Отображение подтверждения удаления
 */
function showDeleteConfirmation(id) {
    if (confirm('Вы уверены, что хотите удалить эту транзакцию?')) {
        deleteTransaction(id);
    }
}

/**
 * Подтверждение удаления из модального окна
 */
function confirmDeleteTransaction() {
    const id = document.getElementById('deleteTransactionBtn').getAttribute('data-id');
    
    // Закрытие модального окна деталей
    const modal = bootstrap.Modal.getInstance(document.getElementById('transactionDetailsModal'));
    modal.hide();
    
    // Удаление транзакции
    deleteTransaction(id);
}

/**
 * Удаление транзакции
 */
function deleteTransaction(id) {
    fetch(`/api/transactions/${id}`, {
        method: 'DELETE',
        headers: {
            'X-CSRF-TOKEN': getCsrfToken()
        }
    })
    .then(response => {
        if (!response.ok) {
            if (response.status === 403) {
                throw new Error('Удаление запрещено для транзакций с этим статусом');
            }
            throw new Error('Ошибка при удалении транзакции');
        }
        
        // Перезагрузка транзакций
        loadAllTransactions();
        
        // Уведомление пользователя
        showSuccess('Транзакция успешно удалена!');
    })
    .catch(error => {
        console.error('Ошибка при удалении транзакции:', error);
        showError(error.message);
    });
}

/**
 * Получение CSRF токена из cookies
 */
function getCsrfToken() {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'XSRF-TOKEN') {
            return decodeURIComponent(value);
        }
    }
    return '';
}

/**
 * Отображение сообщения об ошибке
 */
function showError(message) {
    alert('Ошибка: ' + message);
}

/**
 * Отображение сообщения об успехе
 */
function showSuccess(message) {
    alert('Успех: ' + message);
}
