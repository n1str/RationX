package ru.rationx.financeapp.models.transaction;

public enum TransactionType {
    DEBIT("Поступление"),
    CREDIT("Расход");

    public String ch;
    TransactionType(String ch) {
        this.ch = ch;
    }
}
