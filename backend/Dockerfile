FROM maven:3.9.5-eclipse-temurin-21 AS build

WORKDIR /app

# Копируем файлы проекта
COPY pom.xml .
COPY src ./src

# Собираем проект
RUN mvn clean package -DskipTests

# Создаем второй этап сборки для запуска приложения
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Копируем JAR файл из первого этапа
COPY --from=build /app/target/*.jar app.jar

# Запускаем приложение
ENTRYPOINT ["java", "-jar", "app.jar"]
