package ru.rationx.financeapp.services;


import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import ru.rationx.financeapp.models.transaction.RegTransaction;
import ru.rationx.financeapp.models.transaction.Transaction;
import ru.rationx.financeapp.models.transaction.TransactionType;
import ru.rationx.financeapp.repository.RegTransactionsRepository;

import java.util.HashMap;
import java.util.Map;
import java.util.Objects;
// RegService он же сервис по работе с регистром накопления (Приход/Расход)

@Service
@RequiredArgsConstructor
@Slf4j
public class RegService {
    private final RegTransactionsRepository regTransactionsRepository;

    public void updateReg(Transaction transaction, Double sum, TransactionType transactionType){
        if (transaction == null) {
            log.error("[РегистрСведений_ПриходРасход]: Вы передаете некорректную транзакцию...");
        }

        if (transaction.getRegTransaction() != null) {
            Map<String, Object> oldData = new HashMap<>();

            RegTransaction regTransaction = transaction.getRegTransaction();
                oldData.put("old_sum",regTransaction.getSum()) ;
                oldData.put("old_type",regTransaction.getTransactionType());

                regTransaction.setSum(sum);
                regTransaction.setTransactionType(transactionType);

                regTransactionsRepository.save(regTransaction);
                log.info("\nВы успешно обновили данные регистра накопления sum: [before: {} after: {}] " +
                        "type: [before: {} after: {}]",oldData.get("old_sum"),
                        regTransaction.getSum(),
                        oldData.get("old_type"),
                        regTransaction.getTransactionType());
                return;
        }
        log.error("[РегистрСведений_ПриходРасход]: Сумма не была обновлена..");
    }

}
