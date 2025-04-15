package ru.rationx.financeapp.models.transaction;

/**
 * Перечисление (enum), которое описывает тип транзакции:
 * DEBIT — поступление средств (например, зарплата, перевод на счёт)
 * CREDIT — расход средств (например, покупка, оплата услуг)
 * Если нужно добавить новый тип транзакции — тут.
 */
public enum TransactionType {
    DEBIT("Поступление"),
    CREDIT("Расход");

    public String ch;
    TransactionType(String ch) {
        this.ch = ch;
    }
}
