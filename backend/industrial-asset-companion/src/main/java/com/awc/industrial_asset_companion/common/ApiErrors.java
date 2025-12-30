package com.awc.industrial_asset_companion.common;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.NoSuchElementException;

@RestControllerAdvice
public class ApiErrors {

    // --- helpers -------------------------------------------------------------

    private static Map<String, Object> base(HttpStatus status, String message) {
        var body = new LinkedHashMap<String, Object>();
        body.put("ts", Instant.now().toString());
        body.put("status", status.value());
        body.put("error", status.getReasonPhrase());
        body.put("message", message);
        return body;
    }

    private static Throwable rootCause(Throwable t) {
        Throwable r = t;
        while (r.getCause() != null && r.getCause() != r) r = r.getCause();
        return r;
    }

    // --- existing 404 handler (you already had this) ------------------------
    @ExceptionHandler(NoSuchElementException.class)
    public ResponseEntity<Map<String, Object>> notFound(NoSuchElementException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(base(HttpStatus.NOT_FOUND, ex.getMessage() != null ? ex.getMessage() : "Not Found"));
    }

    // --- NEW: map DB unique/index violations to 409 with fieldErrors --------
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, Object>> conflict(DataIntegrityViolationException ex) {
        String msg = rootCause(ex).getMessage();               // MySQL: "Duplicate entry 'LS-...' for key 'lift_stations.ix_ls_code'"
        var body = base(HttpStatus.CONFLICT, "Data conflict");
        var fieldErrors = new LinkedHashMap<String, String>();

        // Adjust these checks to match your constraint/index names if needed
        if (msg != null && (msg.contains("ix_ls_code") || msg.contains("uk_ls_code") || msg.contains("for key 'code'"))) {
            fieldErrors.put("code", "This code is already in use");
            body.put("message", "Station code already exists");
        }

        if (!fieldErrors.isEmpty()) {
            body.put("fieldErrors", fieldErrors);              // <-- what the frontend expects
            return ResponseEntity.status(HttpStatus.CONFLICT).body(body);
        }

        // Fallback
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(base(HttpStatus.BAD_REQUEST, "Data integrity error"));
    }
}
