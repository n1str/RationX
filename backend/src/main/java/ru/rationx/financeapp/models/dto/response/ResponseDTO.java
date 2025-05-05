package ru.rationx.financeapp.models.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Builder
@Setter
@Getter
public class ResponseDTO {
    private String code;
    private String message;
}
