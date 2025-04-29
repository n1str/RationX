package ru.rationx.financeapp.services.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import ru.rationx.financeapp.models.dto.TransactionDTO;
import ru.rationx.financeapp.models.transaction.Transaction;

@Mapper(componentModel = "spring")
public interface  TransactionMapper {

    @Mapping(target = "id",ignore = true)
    @Mapping(target = "user",ignore = true)
    void updateTransaction(TransactionDTO transactionDTO, @MappingTarget Transaction transaction);
}
