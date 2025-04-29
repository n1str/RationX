package ru.rationx.financeapp.services;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import ru.rationx.financeapp.models.subject.Subject;
import ru.rationx.financeapp.models.subject.exception.DoNotFoundSubject;
import ru.rationx.financeapp.repository.SubjectRepository;

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


}
