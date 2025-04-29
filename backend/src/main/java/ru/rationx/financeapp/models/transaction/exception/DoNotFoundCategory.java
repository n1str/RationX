package ru.rationx.financeapp.models.transaction.exception;

public class DoNotFoundCategory extends RuntimeException {
  public DoNotFoundCategory(String message) {
    super(message);
  }
}
