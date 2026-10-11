package com.veritas.backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import java.net.URI;
import java.time.Instant;
import java.util.NoSuchElementException;

/**
 * Enterprise RFC 7807 ProblemDetail Global Exception Handler for Veritas Platform.
 * Provides standard, structured API error responses across all REST microservices.
 */
@RestControllerAdvice
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {

    @ExceptionHandler(NoSuchElementException.class)
    public ResponseEntity<ProblemDetail> handleNotFound(NoSuchElementException ex) {
        ProblemDetail pd = ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, ex.getMessage());
        pd.setTitle("Resource Not Found");
        pd.setType(URI.create("https://veritas.academic.org/errors/not-found"));
        pd.setProperty("timestamp", Instant.now());
        pd.setProperty("service", "veritas-backend");
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(pd);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ProblemDetail> handleIllegalArgument(IllegalArgumentException ex) {
        ProblemDetail pd = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, ex.getMessage());
        pd.setTitle("Invalid Request Parameter");
        pd.setType(URI.create("https://veritas.academic.org/errors/invalid-argument"));
        pd.setProperty("timestamp", Instant.now());
        pd.setProperty("service", "veritas-backend");
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(pd);
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ProblemDetail> handleIllegalState(IllegalStateException ex) {
        ProblemDetail pd = ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT, ex.getMessage());
        pd.setTitle("Integrity State Conflict");
        pd.setType(URI.create("https://veritas.academic.org/errors/state-conflict"));
        pd.setProperty("timestamp", Instant.now());
        pd.setProperty("service", "veritas-backend");
        return ResponseEntity.status(HttpStatus.CONFLICT).body(pd);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ProblemDetail> handleGeneralException(Exception ex) {
        ProblemDetail pd = ProblemDetail.forStatusAndDetail(HttpStatus.INTERNAL_SERVER_ERROR, "An unexpected internal error occurred: " + ex.getMessage());
        pd.setTitle("Internal Server Error");
        pd.setType(URI.create("https://veritas.academic.org/errors/internal"));
        pd.setProperty("timestamp", Instant.now());
        pd.setProperty("service", "veritas-backend");
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(pd);
    }
}
