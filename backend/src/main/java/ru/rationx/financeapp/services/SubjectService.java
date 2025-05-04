package ru.rationx.financeapp.services;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import ru.rationx.financeapp.models.subject.Subject;
import ru.rationx.financeapp.models.subject.exception.DoNotFoundSubject;
import ru.rationx.financeapp.models.transaction.Category;
import ru.rationx.financeapp.models.transaction.TransactionType;
import ru.rationx.financeapp.repository.SubjectRepository;

import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class SubjectService {
    private final SubjectRepository subjectRepository;

    public boolean isExistSubject(String s) {
        return subjectRepository.existsByName(s);
    }


    @Transactional
    public Subject getSubjectByINN(String inn) {
        return subjectRepository.findByInn(inn)
                .orElseThrow(() -> new DoNotFoundSubject("Субъект не найден: проверьте корректность заполняемых данных"));
    }


    // Получаем и перезаписываем текущий субъект или создаём новый
    public Subject getOrCreateSubject(
            String inn,
            String name,
            Subject.PersonType personType,
            String address,
            String phone

    ){
        try {
            Subject subjectByINN = getSubjectByINN(inn.strip());
            log.info("Получен субъект по ИНН: {}",inn);

            subjectByINN.setName(name);
            subjectByINN.setAddress(address);
            subjectByINN.setRecipientPhone(phone);
            subjectByINN.setPersonType(personType);

            log.info("Данные перезаписаны, сохраняем, возвращаем...");

            subjectRepository.save(subjectByINN);

            return subjectByINN;
        } catch (DoNotFoundSubject ex) {
            log.info("Субъекта с таким ИНН: {} - нет, переходим к созданию. ", inn);
            Subject newSubject = Subject.builder()
                    .name(name)
                    .inn(inn)
                    .address(address)
                    .recipientPhone(phone)
                    .personType(personType)
                    .build();

            subjectRepository.save(newSubject);
            log.info("Субъект с именем {} был успешно создан. ", name);

            return newSubject;
        }

    }

    // Примитивный способ обновить субъекта
    public void updateSubject(Map<String, Object> data, Subject subject) {
        if (data == null || data.isEmpty()) {
            log.error("К сожалению входные данные не должны быть null");
            return;
        }

        // Свойства
        Object nameObj = data.get("name");
        Object personTypeObj = data.get("personType");
        Object innObj = data.get("inn");
        Object addressObj = data.get("address");
        Object phoneObj = data.get("phone");

        if (nameObj instanceof String name && !name.isBlank()) {
            subject.setName(name);
        }
        if (personTypeObj instanceof Subject.PersonType personType && personType.isExist()) {
            subject.setPersonType(personType);
        }
        if (innObj instanceof String inn && !inn.isBlank()) {
            if (inn.matches("^\\d{10}|\\d{12}$")) {
                subject.setInn(inn);
            } else {
                log.error("Ошибка заполнение поля ИНН, пожалуйста проверьте вводимые данные. ");
            }
        }
        if (addressObj instanceof String address && !address.isBlank()) {
            subject.setAddress(address);
        }
        if (phoneObj instanceof String phone && !phone.isBlank()) {
            subject.setRecipientPhone(phone);
        }

        subjectRepository.save(subject);
        log.info("Субъект `{}` успешно отредактирован.",subject.getName());
    }


}
