package ru.rationx.financeapp.services.exception;

public class NoPermStatusException extends RuntimeException {
    public NoPermStatusException(String message) {
        super(message);
    }
}
