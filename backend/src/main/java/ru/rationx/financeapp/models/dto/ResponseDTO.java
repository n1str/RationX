package ru.rationx.financeapp.models.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import org.springframework.stereotype.Service;

@Builder
@Setter
@Getter
public class ResponseDTO {
    private String code;
    private String message;
}
