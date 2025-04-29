# Finance App Backend

REST API сервис для управления финансами без frontend-части. Все взаимодействие происходит через HTTP запросы к API.

## Аутентификация

Все API-запросы (кроме регистрации и входа) требуют аутентификации с помощью JWT токена.

### Регистрация

```
POST /api/auth/register
Content-Type: application/json

{
  "username": "user123",
  "password": "password123"
}
```

Ответ:
```
{
  "token": "jwt_token_here"
}
```

### Вход

```
POST /api/auth/login
Content-Type: application/json

{
  "username": "user123",
  "password": "password123"
}
```

Ответ:
```
{
  "token": "jwt_token_here"
}
```

### Аутентификация запросов

Для аутентифицированных запросов необходимо добавлять заголовок:

```
Authorization: Bearer jwt_token_here
```

## API Транзакций

### Получение всех транзакций

```
GET /api/transactions
Authorization: Bearer jwt_token_here
```

### Создание транзакции

```
POST /api/transactions
Authorization: Bearer jwt_token_here
Content-Type: application/json

{
  // данные транзакции
}
```

### Получение транзакции по ID

```
GET /api/transactions/{id}
Authorization: Bearer jwt_token_here
```

### Обновление транзакции

```
PUT /api/transactions/{id}
Authorization: Bearer jwt_token_here
Content-Type: application/json

{
  // обновленные данные
}
```

### Удаление транзакции

```
DELETE /api/transactions/{id}
Authorization: Bearer jwt_token_here
```

## API Категорий

Для работы с категориями используются аналогичные эндпоинты:

```
GET /api/categories
POST /api/categories
GET /api/categories/{id}
PUT /api/categories/{id}
DELETE /api/categories/{id}
```

## API Статистики

Для получения статистики:

```
GET /api/statistics
Authorization: Bearer jwt_token_here
```

## Запуск проекта

1. Настройте подключение к базе данных в `application.yml`
2. Запустите приложение:
   ```
   ./mvnw spring-boot:run
   ```
3. Сервер запустится на порту 8080 (по умолчанию) 