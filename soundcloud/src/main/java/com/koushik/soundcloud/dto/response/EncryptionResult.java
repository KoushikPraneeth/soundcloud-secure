package com.koushik.soundcloud.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class EncryptionResult {
    private final byte[] data;
    private final String key;
    private final String iv;
}
