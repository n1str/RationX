package ru.rationx.financeapp.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import ru.rationx.financeapp.models.bank.Bank;
import ru.rationx.financeapp.models.subject.Subject;
import ru.rationx.financeapp.repository.BankRepository;

@Service
@RequiredArgsConstructor
public class BankService {
    private final BankRepository bankRepository;

    public Bank create(String nameBank, String rBill, String bill, Subject subject){
        return Bank.builder()
                .bill(bill)
                .rbill(rBill)
                .nameBank(nameBank)
                .subject(subject)
                .build();
    }
}
