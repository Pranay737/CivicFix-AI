package com.civicfix.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatResponseDto {
    private String sessionUuid;
    private String response;
    private List<String> citations;
    private ComplaintDto relatedComplaint;
}
