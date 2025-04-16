package ru.rationx.financeapp.models.transaction;

/**
 * Перечисление (enum), которое описывает тип транзакции:
 * DEBIT — поступление средств (например, зарплата, перевод на счёт)
 * CREDIT — расход средств (например, покупка, оплата услуг)
 */
public enum TransactionType {
    DEBIT("Поступление"),
    CREDIT("Расход");

    private final String description;
    
    TransactionType(String description) {
        this.description = description;
    }
    
    public String getDescription() {
        return description;
    }
}
