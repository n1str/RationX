package ru.rationx.financeapp.models.subject.exception;

public class DoNotFoundSubject extends RuntimeException {
    public DoNotFoundSubject(String message) {
        super(message);
    }
}
