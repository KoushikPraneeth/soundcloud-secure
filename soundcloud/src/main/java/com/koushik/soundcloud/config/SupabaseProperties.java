package com.koushik.soundcloud.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
@ConfigurationProperties(prefix = "supabase")
public class SupabaseProperties {
    private String url;
    private String anonKey;
    private String serviceKey;
    private String storageBucketName;

    public String getSupabaseUrl() {
        return url;
    }

    public String getSupabaseAnonKey() {
        return anonKey;
    }

    public String getSupabaseServiceKey() {
        return serviceKey;
    }
}
