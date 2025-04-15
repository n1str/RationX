package ru.rationx.financeapp.models.exception;

public class DoesNotExistTransaction extends RuntimeException {
  public DoesNotExistTransaction(String message) {
    super(message);
  }
}
