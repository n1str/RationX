package ru.rationx.financeapp.controllers.mapper;

import lombok.Builder;
import org.springframework.stereotype.Component;
import ru.rationx.financeapp.models.dto.transaction.LiteTransactionDTO;
import ru.rationx.financeapp.models.transaction.Transaction;

// лайт версия для списков
@Component
@Builder
public class TransactionMapper {
    public LiteTransactionDTO toDTO(Transaction transaction){
        LiteTransactionDTO.LiteTransactionDTOBuilder builder = LiteTransactionDTO.builder()
                .id(transaction.getId())
                .status(transaction.getStatus());
        
        // Добавляем данные отправителя
        if (transaction.getSubjectSender() != null) {
            builder.name(transaction.getSubjectSender().getName())
                  .personType(transaction.getSubjectSender().getPersonType())
                  .inn(transaction.getSubjectSender().getInn());
                  
            // Если у отправителя есть телефон
            if (transaction.getSubjectSender().getRecipientPhone() != null) {
                builder.phone(transaction.getSubjectSender().getRecipientPhone());
            }
            
            // Если у отправителя есть адрес
            if (transaction.getSubjectSender().getAddress() != null) {
                builder.address(transaction.getSubjectSender().getAddress());
            }
        }
        
        // Добавляем данные получателя
        if (transaction.getSubjectGetter() != null) {
            builder.nameRecipient(transaction.getSubjectGetter().getName())
                  .personTypeRecipient(transaction.getSubjectGetter().getPersonType())
                  .innRecipient(transaction.getSubjectGetter().getInn());
                  
            // Если у получателя есть телефон
            if (transaction.getSubjectGetter().getRecipientPhone() != null) {
                builder.phoneRecipient(transaction.getSubjectGetter().getRecipientPhone());
            }
            
            // Если у получателя есть адрес
            if (transaction.getSubjectGetter().getAddress() != null) {
                builder.addressRecipient(transaction.getSubjectGetter().getAddress());
            }
        }
        
        // Добавляем данные о банке отправителя
        if (transaction.getSenderBank() != null) {
            builder.nameBankSender(transaction.getSenderBank().getNameBank())
                  .billSender(transaction.getSenderBank().getBill())
                  .rBillSender(transaction.getSenderBank().getRbill());
        }
        
        // Добавляем данные о банке получателя
        if (transaction.getRecipientBank() != null) {
            builder.nameBankRecipient(transaction.getRecipientBank().getNameBank())
                  .billRecipient(transaction.getRecipientBank().getBill())
                  .rBillRecipient(transaction.getRecipientBank().getRbill());
        }
        
        // Добавляем комментарий
        if (transaction.getComment() != null) {
            builder.comment(transaction.getComment());
        }
        
        // Добавляем данные о сумме и типе операции
        if (transaction.getRegTransaction() != null) {
            builder.sum(transaction.getRegTransaction().getSum())
                  .typeOperation(transaction.getRegTransaction().getTransactionType());
        }
        
        // Добавляем данные о категории
        if (transaction.getCategory() != null) {
            builder.category(transaction.getCategory().getName())
                  .transactionType(transaction.getCategory().getApplicableType());
        }

        return builder.build();
    }
}