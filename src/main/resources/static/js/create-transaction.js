/**
 * JavaScript для создания новых транзакций
 */
document.addEventListener('DOMContentLoaded', function() {
    // Проверяем наличие формы создания транзакции
    const createForm = document.getElementById('createTransactionForm');
    if (createForm) {
        createForm.addEventListener('submit', handleCreateTransaction);
    }
    
    // Загрузка категорий для выбора
    loadCategories();
});

/**
 * Загрузка категорий для выбора
 */
function loadCategories() {
    const categorySelect = document.getElementById('categorySelect');
    if (!categorySelect) return;
    
    fetch('/api/categories')
        .then(response => response.json())
        .then(categories => {
            // Очистка и добавление категорий
            categorySelect.innerHTML = '<option value="">Выберите категорию</option>';
            
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
 * Обработка отправки формы создания транзакции
 */
function handleCreateTransaction(event) {
    event.preventDefault();
    
    // Получение данных из формы
    const form = event.target;
    const formData = new FormData(form);
    
    // Создание объекта данных транзакции
    const transactionData = {
        regTransaction: {
            transactionType: formData.get('transactionType'),
            sum: parseFloat(formData.get('sum')) // Преобразуем строку в число
        },
        comment: formData.get('comment'),
        dateTime: new Date(formData.get('dateTime')).toISOString(),
        status: "NEW" // Новая транзакция всегда имеет статус NEW
    };
    
    // Добавление категории, если выбрана
    const categoryId = formData.get('categoryId');
    if (categoryId) {
        transactionData.category = { id: categoryId };
    }
    
    // Отправка запроса на создание транзакции
    fetch('/api/transactions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': getCsrfToken()
        },
        body: JSON.stringify(transactionData)
    })
    .then(response => {
        if (!response.ok) {
            return response.text().then(text => { throw new Error(text) });
        }
        return response.json();
    })
    .then(data => {
        // Очистка формы
        form.reset();
        
        // Уведомление пользователя
        showSuccess('Транзакция успешно создана!');
        
        // Перенаправление на страницу транзакций
        setTimeout(() => {
            window.location.href = '/transactions';
        }, 1500);
    })
    .catch(error => {
        console.error('Ошибка при создании транзакции:', error);
        showError('Не удалось создать транзакцию: ' + error.message);
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
