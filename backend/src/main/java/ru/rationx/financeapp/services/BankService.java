package ru.rationx.financeapp.services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import ru.rationx.financeapp.models.bank.Bank;
import ru.rationx.financeapp.models.bank.DoNotFoundBank;
import ru.rationx.financeapp.models.subject.Subject;
import ru.rationx.financeapp.models.transaction.Transaction;
import ru.rationx.financeapp.repository.BankRepository;

import java.util.List;
import java.util.Map;
import java.util.Objects;

@Service
@RequiredArgsConstructor
@Slf4j
public class BankService {
    private final BankRepository bankRepository;

    public Bank create(String nameBank, String rBill, String bill, Subject subject) {
        return Bank.builder()
                .bill(bill)
                .rbill(rBill)
                .nameBank(nameBank)
                .subject(subject)
                .build();
    }

    public Bank findBank(String bill){
        return bankRepository.findByBill(bill)
                .orElseThrow(() -> new DoNotFoundBank("Не был найден банк по такому счету."));
    }

    public void updateOrCreateBank(Map<String, Object> data){
        if (data == null) {
            log.error("К сожалению возникла ошибка, data не может быть `null`");
        }

        Object nameBankObj = data.get("nameBank");
        Object billObj = data.get("bill");
        Object rBillObj = data.get("rBill");
        Object subjObj = data.get("subj");

        try {
            // Если уже есть определенный банковский счет, изменить имя и расчетный счет.
            if (billObj instanceof String bill && !bill.isBlank()) {
                Bank bank = findBank(bill);
                log.info("Был найден счет `{}`", bill);
                if (nameBankObj instanceof String nameBank && !nameBank.isBlank()) {
                    bank.setNameBank(nameBank);
                }
                if (rBillObj instanceof String rBill && !rBill.isBlank())  {
                    bank.setRbill(rBill);
                }
                bankRepository.save(bank);
                log.info("Данные о счете были обновлены.");

            }
        } catch (DoNotFoundBank ex) {
            if (subjObj instanceof Subject subject)  {
                Bank bank = create(
                        String.valueOf(billObj),
                        String.valueOf(rBillObj),
                        String.valueOf(nameBankObj),
                        subject);

                bankRepository.save(bank);
            }
            log.info("Был создан новый банк т.к не было найдено расчетного счета.");
        }
    }


}
//    // Обновление банка
//    public void update(List<Bank> bank, Map<String, Object> data) {
//        if (bank == null) {
//            log.error("[СервисБанк]: Вы не можете передать null значение `bank`.");
//            return;
//        }
//
//        if (data == null) {
//            log.error("[СервисБанк]: Вы не можете передать null значение `data`.");
//            return;
//        }
//
//        Object nameBankObj = data.get("nameBank");
//        Object billObj = data.get("bill");
//        Object rBillObj = data.get("rBill");
//
//        Bank filterBank = bank.stream()
//                .filter(b1 -> b1.getNameBank()
//                        .equalsIgnoreCase(String.valueOf(nameBankObj))
//                        && b1.getBill().equalsIgnoreCase(String.valueOf(billObj)))
//                .findFirst()
//                .orElseThrow(() -> new RuntimeException("Возникла ошибка при работе с обновлением банка."));
//    }
//}
