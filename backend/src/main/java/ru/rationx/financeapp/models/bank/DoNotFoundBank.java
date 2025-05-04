package ru.rationx.financeapp.models.bank;

public class DoNotFoundBank extends RuntimeException {
    public DoNotFoundBank(String message) {
        super(message);
    }
}
