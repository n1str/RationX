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
        return LiteTransactionDTO.builder()
                .id(transaction.getId())

                .status(transaction.getStatus())

                .name(transaction.getSubjectSender().getName())
                .personType(transaction.getSubjectSender().getPersonType())
                .inn(transaction.getSubjectSender().getInn())

                .nameRecipient(transaction.getSubjectGetter().getName())
                .personType(transaction.getSubjectGetter().getPersonType())
                .inn(transaction.getSubjectGetter().getInn())

                .comment(transaction.getComment())

                .sum(transaction.getRegTransaction().getSum())
                .typeOperation(transaction.getRegTransaction().getTransactionType())

                .category(transaction.getCategory().getName())
                .transactionType(transaction.getCategory().getApplicableType())

                .build();
    }
}