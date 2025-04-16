/**
 * JavaScript для главной страницы (дашборда)
 * Обеспечивает визуализацию финансовых данных и основные интерактивные функции
 */
document.addEventListener('DOMContentLoaded', function() {
    // Инициализация компонентов дашборда
    loadSummaryData();
    initializeCharts();
    loadRecentTransactions();

    // Обработчики для временных периодов
    document.querySelectorAll('.period-selector .btn').forEach(button => {
        button.addEventListener('click', function() {
            // Удаление активного класса у всех кнопок
            document.querySelectorAll('.period-selector .btn').forEach(btn => {
                btn.classList.remove('active');
            });
            
            // Добавление активного класса к нажатой кнопке
            this.classList.add('active');
            
            // Обновление данных на основе выбранного периода
            const period = this.dataset.period;
            updateChartsForPeriod(period);
        });
    });
});

/**
 * Загрузка и отображение сводных финансовых данных
 */
function loadSummaryData() {
    // Запрос к API для получения сводных данных
    fetch('/api/transactions/summary')
        .then(response => response.json())
        .then(data => {
            // Обновление счетчиков на странице
            document.getElementById('totalIncome').textContent = formatCurrency(data.totalIncome);
            document.getElementById('totalExpense').textContent = formatCurrency(data.totalExpense);
            document.getElementById('balance').textContent = formatCurrency(data.balance);
            
            // Установка счетчика транзакций
            document.getElementById('transactionCount').textContent = data.transactionCount;
            
            // Обновление прогресса экономии, если есть
            if (data.savingsGoal && data.savingsGoal > 0) {
                const savingsPercent = (data.currentSavings / data.savingsGoal) * 100;
                const savingsProgress = document.getElementById('savingsProgress');
                savingsProgress.style.width = `${Math.min(savingsPercent, 100)}%`;
                document.getElementById('savingsPercentage').textContent = `${savingsPercent.toFixed(1)}%`;
            }
        })
        .catch(error => {
            console.error('Ошибка при загрузке сводных данных:', error);
            showError('Не удалось загрузить финансовый отчет. Пожалуйста, попробуйте позже.');
        });
}

/**
 * Инициализация всех графиков на дашборде
 */
function initializeCharts() {
    // Инициализация графика доходов/расходов
    initIncomeExpenseChart();
    
    // Инициализация графика категорий
    initCategoryChart();
    
    // Инициализация графика трендов
    initTrendChart();
}

/**
 * Инициализация графика доходов и расходов
 */
function initIncomeExpenseChart() {
    const ctx = document.getElementById('incomeExpenseChart').getContext('2d');
    
    // Запрос данных для графика
    fetch('/api/transactions/income-expense-stats')
        .then(response => response.json())
        .then(data => {
            // Создание графика
            window.incomeExpenseChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: data.labels,
                    datasets: [
                        {
                            label: 'Доходы',
                            data: data.incomeData,
                            backgroundColor: 'rgba(75, 192, 192, 0.7)',
                            borderColor: 'rgba(75, 192, 192, 1)',
                            borderWidth: 1
                        },
                        {
                            label: 'Расходы',
                            data: data.expenseData,
                            backgroundColor: 'rgba(255, 99, 132, 0.7)',
                            borderColor: 'rgba(255, 99, 132, 1)',
                            borderWidth: 1
                        }
                    ]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: {
                                color: 'rgba(200, 200, 200, 0.1)'
                            }
                        },
                        x: {
                            grid: {
                                display: false
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            position: 'top',
                        }
                    }
                }
            });
        })
        .catch(error => {
            console.error('Ошибка при загрузке данных для графика доходов/расходов:', error);
        });
}

/**
 * Инициализация графика категорий
 */
function initCategoryChart() {
    const ctx = document.getElementById('categoryChart').getContext('2d');
    
    // Запрос данных для графика категорий
    fetch('/api/transactions/category-stats')
        .then(response => response.json())
        .then(data => {
            // Создание цветов для каждой категории
            const backgroundColors = generateColorArray(data.labels.length);
            
            // Создание графика
            window.categoryChart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: data.labels,
                    datasets: [{
                        data: data.values,
                        backgroundColor: backgroundColors,
                        borderColor: 'rgba(255, 255, 255, 0.5)',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'right',
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const value = context.raw;
                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                    const percentage = ((value / total) * 100).toFixed(1);
                                    return `${context.label}: ${formatCurrency(value)} (${percentage}%)`;
                                }
                            }
                        }
                    }
                }
            });
        })
        .catch(error => {
            console.error('Ошибка при загрузке данных для графика категорий:', error);
        });
}

/**
 * Инициализация графика трендов
 */
function initTrendChart() {
    const ctx = document.getElementById('trendChart').getContext('2d');
    
    // Запрос данных для графика трендов
    fetch('/api/transactions/trend-stats')
        .then(response => response.json())
        .then(data => {
            // Создание графика
            window.trendChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: data.labels,
                    datasets: [
                        {
                            label: 'Доходы',
                            data: data.incomeData,
                            fill: false,
                            backgroundColor: 'rgba(75, 192, 192, 0.7)',
                            borderColor: 'rgba(75, 192, 192, 1)',
                            borderWidth: 2,
                            tension: 0.1
                        },
                        {
                            label: 'Расходы',
                            data: data.expenseData,
                            fill: false,
                            backgroundColor: 'rgba(255, 99, 132, 0.7)',
                            borderColor: 'rgba(255, 99, 132, 1)',
                            borderWidth: 2,
                            tension: 0.1
                        },
                        {
                            label: 'Баланс',
                            data: data.balanceData,
                            fill: false,
                            backgroundColor: 'rgba(54, 162, 235, 0.7)',
                            borderColor: 'rgba(54, 162, 235, 1)',
                            borderWidth: 2,
                            tension: 0.1
                        }
                    ]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: false,
                            grid: {
                                color: 'rgba(200, 200, 200, 0.1)'
                            }
                        },
                        x: {
                            grid: {
                                display: false
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            position: 'top',
                        }
                    }
                }
            });
        })
        .catch(error => {
            console.error('Ошибка при загрузке данных для графика трендов:', error);
        });
}

/**
 * Обновление графиков в соответствии с выбранным периодом времени
 */
function updateChartsForPeriod(period) {
    // Запрос данных для указанного периода
    fetch(`/api/transactions/stats?period=${period}`)
        .then(response => response.json())
        .then(data => {
            // Обновление графика доходов/расходов
            if (window.incomeExpenseChart) {
                window.incomeExpenseChart.data.labels = data.incomeExpense.labels;
                window.incomeExpenseChart.data.datasets[0].data = data.incomeExpense.incomeData;
                window.incomeExpenseChart.data.datasets[1].data = data.incomeExpense.expenseData;
                window.incomeExpenseChart.update();
            }
            
            // Обновление графика категорий
            if (window.categoryChart) {
                window.categoryChart.data.labels = data.category.labels;
                window.categoryChart.data.datasets[0].data = data.category.values;
                window.categoryChart.update();
            }
            
            // Обновление графика трендов
            if (window.trendChart) {
                window.trendChart.data.labels = data.trend.labels;
                window.trendChart.data.datasets[0].data = data.trend.incomeData;
                window.trendChart.data.datasets[1].data = data.trend.expenseData;
                window.trendChart.data.datasets[2].data = data.trend.balanceData;
                window.trendChart.update();
            }
        })
        .catch(error => {
            console.error('Ошибка при обновлении графиков:', error);
        });
}

/**
 * Загрузка последних транзакций
 */
function loadRecentTransactions() {
    fetch('/api/transactions/recent?limit=5')
        .then(response => response.json())
        .then(transactions => {
            const containerList = document.getElementById('recentTransactionsList');
            
            // Очистка списка
            containerList.innerHTML = '';
            
            if (transactions.length === 0) {
                containerList.innerHTML = '<li class="list-group-item">Нет недавних транзакций</li>';
                return;
            }
            
            // Заполнение списка
            transactions.forEach(tx => {
                // Определение типа и суммы транзакции
                const type = tx.regTransaction ? tx.regTransaction.transactionType : 'N/A';
                const sum = tx.regTransaction ? tx.regTransaction.sum : 0;
                
                // Определение иконки и стиля для типа транзакции
                const icon = type === 'DEBIT' ? 'bi-arrow-down-circle-fill text-success' : 'bi-arrow-up-circle-fill text-danger';
                const amountClass = type === 'DEBIT' ? 'text-success' : 'text-danger';
                const amountPrefix = type === 'DEBIT' ? '+' : '-';
                
                // Форматирование даты
                const date = new Date(tx.dateTime).toLocaleDateString();
                
                // Создание элемента списка
                const li = document.createElement('li');
                li.className = 'list-group-item d-flex justify-content-between align-items-center px-0';
                li.innerHTML = `
                    <div class="transaction-info">
                        <div class="d-flex align-items-center">
                            <i class="bi ${icon} me-2 fs-5"></i>
                            <div>
                                <span class="fw-bold">${tx.category ? tx.category.name : 'Без категории'}</span>
                                <small class="d-block text-muted">${date}</small>
                            </div>
                        </div>
                    </div>
                    <span class="badge ${amountClass} fs-6">${amountPrefix} ${formatCurrency(sum)}</span>
                `;
                
                containerList.appendChild(li);
            });
        })
        .catch(error => {
            console.error('Ошибка при загрузке последних транзакций:', error);
        });
}

/**
 * Генерация массива цветов для графиков
 */
function generateColorArray(count) {
    const baseColors = [
        'rgba(75, 192, 192, 0.7)',  // Бирюзовый
        'rgba(255, 99, 132, 0.7)',  // Розовый
        'rgba(54, 162, 235, 0.7)',  // Синий
        'rgba(255, 206, 86, 0.7)',  // Желтый
        'rgba(153, 102, 255, 0.7)', // Фиолетовый
        'rgba(255, 159, 64, 0.7)',  // Оранжевый
        'rgba(46, 204, 113, 0.7)',  // Зеленый
        'rgba(231, 76, 60, 0.7)',   // Красный
        'rgba(52, 73, 94, 0.7)',    // Тёмно-синий
        'rgba(155, 89, 182, 0.7)'   // Пурпурный
    ];
    
    // Создание массива цветов нужной длины
    const result = [];
    for (let i = 0; i < count; i++) {
        result.push(baseColors[i % baseColors.length]);
    }
    
    return result;
}

/**
 * Форматирование валюты
 */
function formatCurrency(value) {
    return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 2
    }).format(value);
}

/**
 * Отображение сообщения об ошибке
 */
function showError(message) {
    alert('Ошибка: ' + message);
}

/**
 * Функция для перехода на страницу транзакций
 */
function goToTransactions() {
    window.location.href = '/transactions';
}

/**
 * Функция для создания новой транзакции
 */
function createNewTransaction() {
    window.location.href = '/transactions?action=new';
}
