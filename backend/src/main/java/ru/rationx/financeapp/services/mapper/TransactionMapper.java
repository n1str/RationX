package ru.rationx.financeapp.services.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import ru.rationx.financeapp.models.dto.transaction.TransactionDTO;
import ru.rationx.financeapp.models.transaction.Transaction;

@Mapper(componentModel = "spring")
public interface  TransactionMapper {

    @Mapping(target = "id",ignore = true)
    @Mapping(target = "user",ignore = true)
    @Mapping(target = "status",ignore = true)
    @Mapping(target = "senderBank",ignore = true)
    @Mapping(target = "recipientBank",ignore = true)
    @Mapping(target = "dateTime",ignore = true)
    @Mapping(target = "regTransaction",ignore = true)
    @Mapping(target = "subjectSender",ignore = true)
    @Mapping(target = "subjectGetter",ignore = true)
    @Mapping(target = "category",ignore = true)
    void updateTransaction(TransactionDTO transactionDTO, @MappingTarget Transaction transaction);
}
