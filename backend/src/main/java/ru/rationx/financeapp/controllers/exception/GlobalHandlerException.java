package ru.rationx.financeapp.controllers.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import ru.rationx.financeapp.models.dto.ResponseDTO;

@RestControllerAdvice
public class GlobalHandlerException {

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ResponseDTO> errorParseHandler(){
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ResponseDTO.builder()
                        .code(HttpStatus.BAD_REQUEST.toString())
                        .message("Возникла ошибка с JSON parse, пожалуйста по смотрите логи")
                .build());
    }
}
