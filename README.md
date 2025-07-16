# User Management App

This project consists of a Node.js backend and a React frontend that together provide a simple user management system with registration, authentication and administration features.

## Features

- **Registration and login** — new users can sign up and obtain a JSON Web Token for authentication.
- **Admin panel** — authenticated users see a table of all users with the ability to block, unblock and delete selected accounts. The table is sorted by last login time and supports filtering by name or email.
- **Bulk actions** — checkboxes allow selecting multiple users at once. The header checkbox selects or deselects all rows.
- **Authorization middleware** — every request (except `/login` and `/register`) verifies that the user exists and is not blocked. Blocked or deleted users are redirected to the login page.
- **Unique email constraint** — the database enforces unique e‑mail addresses using an index rather than application‑level checks.

The UI is built with React, Vite and Bootstrap, while the backend uses Express and MySQL.

## Prerequisites

- Node.js (v18 or later)
- MySQL server

## Database setup

Create a database and a `users` table. The table must have a unique index on the `email` column so that e‑mails remain unique regardless of concurrent requests. Example schema:

```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  status ENUM('active','blocked') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP NULL
);
```

## Configuration

Two `.env` files are required.

`user-management-back/.env` (example values):

```
DB_HOST=your_host
DB_PORT=3306
DB_USER=your_user
DB_PASS=your_password
DB_NAME=your_db
JWT_SECRET=replace_me
CORS_ORIGIN=http://localhost:3000
PORT=5000
```

`user-management-ui/.env`:

```
VITE_API_URL=http://localhost:5000/api
```

## Installation

1. **Backend**
   ```bash
   cd user-management-back
   npm install
   node server.js
   ```

2. **Frontend**
   ```bash
   cd ../user-management-ui
   npm install
   npm run dev
   ```
   The React app will be available on `http://localhost:3000`.

## Usage

- Register a new account or sign in with existing credentials.
- After logging in, you will see the user table with sorting, filtering and bulk actions.
- Blocked users cannot log in. Deleted users may register again with the same e‑mail.




Приложение для управления пользователями
Этот проект состоит из бэкенда на Node.js и фронтенда на React, которые вместе реализуют простую систему управления пользователями с регистрацией, аутентификацией и административными возможностями.

Возможности
Регистрация и вход — новые пользователи могут зарегистрироваться и получить JSON Web Token для аутентификации.

Админ-панель — аутентифицированные пользователи видят таблицу всех пользователей с возможностью блокировать, разблокировать и удалять выбранные аккаунты. Таблица отсортирована по времени последнего входа и поддерживает фильтрацию по имени или e‑mail.

Множественные действия — чекбоксы позволяют выбирать сразу несколько пользователей. Чекбокс в заголовке выбирает или снимает выбор со всех строк.

Промежуточное ПО для авторизации — каждый запрос (кроме /login и /register) проверяет, существует ли пользователь и не заблокирован ли он. Заблокированные или удалённые пользователи перенаправляются на страницу входа.

Ограничение уникальности e‑mail — база данных обеспечивает уникальность адресов электронной почты с помощью индекса, а не проверок на уровне приложения.

Интерфейс построен с использованием React, Vite и Bootstrap, а бэкенд — на Express и MySQL.

Предварительные требования
Node.js (версии 18 или новее)

Сервер MySQL

Настройка базы данных
Создайте базу данных и таблицу users. Таблица должна иметь уникальный индекс по колонке email, чтобы гарантировать уникальность адресов даже при параллельных запросах. Пример схемы:

sql
Копировать
Редактировать
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  status ENUM('active','blocked') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP NULL
);
Конфигурация
Нужны два файла .env.

user-management-back/.env (пример значений):

ini
Копировать
Редактировать
DB_HOST=your_host
DB_PORT=3306
DB_USER=your_user
DB_PASS=your_password
DB_NAME=your_db
JWT_SECRET=replace_me
CORS_ORIGIN=http://localhost:3000
PORT=5000
user-management-ui/.env:

bash
Копировать
Редактировать
VITE_API_URL=http://localhost:5000/api
Установка
Бэкенд

bash
Копировать
Редактировать
cd user-management-back
npm install
node server.js
Фронтенд

bash
Копировать
Редактировать
cd ../user-management-ui
npm install
npm run dev
React-приложение будет доступно по адресу http://localhost:3000.

Использование
Зарегистрируйте новый аккаунт или войдите с существующими данными.

После входа вы увидите таблицу пользователей с сортировкой, фильтрацией и массовыми действиями.

Заблокированные пользователи не могут войти. Удалённые пользователи могут снова зарегистрироваться с тем же e‑mail.

