package ru.rationx.financeapp.models.exception;

/**
 * Это пользовательское (кастомное) исключение выбрасывается,
 * если операция с транзакцией не найдена в базе данных.
 * Например, когда пытаются получить или изменить несуществующую транзакцию.
 *
 * Это исключение для обработки ошибок, связанных с отсутствием нужной транзакции.
 */
public class DoesNotExistTransaction extends RuntimeException {
  public DoesNotExistTransaction(String message) {
    super(message);
  }
}
