package ru.rationx.financeapp.models.transaction;

/**
 * Перечисление (enum) — список возможных статусов для любой транзакции.
 */
public enum TransactionStatus {
    NEW("Новая"),
    ACCEPTED("Подтвержденная"),
    PROCESSING("В обработке"),
    CANCELED("Отменена"),
    PAYMENT_COMPLETED("Платеж выполнен"),
    PAYMENT_DELETED("Платеж удален"),
    RETURN("Возврат");

    // Не допущены к редактированию операции со статусами: подтвержденная, в обработке, отменена, платеж выполнен, платеж удален, возврат.

    private final String description;

    TransactionStatus(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
