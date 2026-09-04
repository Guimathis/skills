---
name: exception-handling-conventions
description: Standardized exception handling and error response conventions for Spring Boot REST APIs (Richardson Maturity Level 2). Use when creating or modifying custom exceptions, @RestControllerAdvice, @ExceptionHandler, validation error handlers, ProblemDetail responses, or configuring HTTP error status codes.
---

# Exception Handling Conventions

Conventions for centralized, standardized exception handling in Spring Boot 3+ REST APIs adhering to Richardson Maturity Level 2 and RFC 7807 / RFC 9457 (Problem Details for HTTP APIs).

---

## Core Principles

1. **No Try/Catch in Controllers**: Controllers must never catch business or validation exceptions. Let exceptions propagate to the centralized `@RestControllerAdvice`.
2. **RFC 7807 / RFC 9457 Problem Details**: Use Spring Boot 3's native `org.springframework.http.ProblemDetail` as the standard error response structure.
3. **Unchecked Domain Exceptions**: All business and domain exceptions must extend `RuntimeException`.
4. **Appropriate HTTP Status Codes**: Always map exceptions to semantically correct HTTP status codes matching Richardson Maturity Level 2.
5. **Security & Information Disclosure**: Never leak stack traces, database query fragments, or internal server internals in production error responses.

---

## HTTP Status Code Mapping (Level 2)

| Scenario | Exception Type | HTTP Status | RFC 7807 Title |
|---|---|---|---|
| Resource not found | `ResourceNotFoundException` | `404 Not Found` | Resource Not Found |
| Unique constraint / state conflict | `ConflictException`, `DataIntegrityViolationException` | `409 Conflict` | Resource Conflict |
| Malformed JSON / bad payload | `HttpMessageNotReadableException`, `IllegalArgumentException` | `400 Bad Request` | Bad Request |
| DTO Bean Validation failure | `MethodArgumentNotValidException` | `400 Bad Request` / `422 Unprocessable Content` | Validation Failed |
| Business rule violation | `BusinessRuleException` | `422 Unprocessable Content` / `400 Bad Request` | Unprocessable Content |
| Unauthorized / missing auth | `AuthenticationException` | `401 Unauthorized` | Unauthorized |
| Forbidden / insufficient permissions | `AccessDeniedException` | `403 Forbidden` | Access Denied |
| Unexpected system failure | `Exception` / `Throwable` | `500 Internal Server Error` | Internal Server Error |

---

## Domain Exception Hierarchy

Base abstract class for all domain/business exceptions:

```java
package com.example.app.common.exception;

public abstract class DomainException extends RuntimeException {
    protected DomainException(String message) {
        super(message);
    }

    protected DomainException(String message, Throwable cause) {
        super(message, cause);
    }
}
```

Standard specialized exceptions:

```java
// 404 - Resource Not Found
public class ResourceNotFoundException extends DomainException {
    public ResourceNotFoundException(String resourceName, Object identifier) {
        super(String.format("%s with identifier '%s' was not found", resourceName, identifier));
    }

    public ResourceNotFoundException(String message) {
        super(message);
    }
}

// 409 - Business Conflict (duplicate email, state transition conflict)
public class ConflictException extends DomainException {
    public ConflictException(String message) {
        super(message);
    }
}

// 422 / 400 - Business Rule Violation
public class BusinessRuleException extends DomainException {
    public BusinessRuleException(String message) {
        super(message);
    }
}
```

---

## Global Exception Handler (`@RestControllerAdvice`)

Centralized handler using `ProblemDetail`:

```java
package com.example.app.common.exception;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import java.net.URI;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(ResourceNotFoundException.class)
    public ProblemDetail handleResourceNotFound(ResourceNotFoundException ex) {
        log.warn("Resource not found: {}", ex.getMessage());
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, ex.getMessage());
        problem.setTitle("Resource Not Found");
        problem.setType(URI.create("urn:problem-type:resource-not-found"));
        problem.setProperty("timestamp", Instant.now());
        return problem;
    }

    @ExceptionHandler(ConflictException.class)
    public ProblemDetail handleConflict(ConflictException ex) {
        log.warn("Conflict detected: {}", ex.getMessage());
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT, ex.getMessage());
        problem.setTitle("Resource Conflict");
        problem.setType(URI.create("urn:problem-type:conflict"));
        problem.setProperty("timestamp", Instant.now());
        return problem;
    }

    @ExceptionHandler(BusinessRuleException.class)
    public ProblemDetail handleBusinessRule(BusinessRuleException ex) {
        log.warn("Business rule violation: {}", ex.getMessage());
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.UNPROCESSABLE_ENTITY, ex.getMessage());
        problem.setTitle("Business Rule Violation");
        problem.setType(URI.create("urn:problem-type:business-rule-violation"));
        problem.setProperty("timestamp", Instant.now());
        return problem;
    }

    @Override
    protected ResponseEntity<Object> handleMethodArgumentNotValid(
            MethodArgumentNotValidException ex,
            org.springframework.http.HttpHeaders headers,
            HttpStatusCode status,
            WebRequest request) {

        ProblemDetail problem = ProblemDetail.forStatusAndDetail(
                HttpStatus.BAD_REQUEST,
                "One or more fields failed validation"
        );
        problem.setTitle("Validation Failed");
        problem.setType(URI.create("urn:problem-type:validation-error"));
        problem.setProperty("timestamp", Instant.now());

        Map<String, String> fieldErrors = new HashMap<>();
        for (FieldError error : ex.getBindingResult().getFieldErrors()) {
            fieldErrors.put(error.getField(), error.getDefaultMessage());
        }
        problem.setProperty("errors", fieldErrors);

        return ResponseEntity.status(status).headers(headers).body(problem);
    }

    @ExceptionHandler(Exception.class)
    public ProblemDetail handleUncaughtException(Exception ex) {
        log.error("Unhandled internal server error occurred", ex);
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "An unexpected internal error occurred. Please contact support."
        );
        problem.setTitle("Internal Server Error");
        problem.setType(URI.create("urn:problem-type:internal-server-error"));
        problem.setProperty("timestamp", Instant.now());
        return problem;
    }
}
```

---

## Standard JSON Error Responses

### 1. Resource Not Found (404)
```json
{
  "type": "urn:problem-type:resource-not-found",
  "title": "Resource Not Found",
  "status": 404,
  "detail": "Book with identifier '123e4567-e89b-12d3-a456-426614174000' was not found",
  "timestamp": "2026-08-27T13:45:30.123Z"
}
```

### 2. Validation Failure (400)
```json
{
  "type": "urn:problem-type:validation-error",
  "title": "Validation Failed",
  "status": 400,
  "detail": "One or more fields failed validation",
  "timestamp": "2026-08-27T13:45:30.123Z",
  "errors": {
    "title": "Title cannot be blank",
    "price": "Price must be greater than zero"
  }
}
```

### 3. Business Conflict (409)
```json
{
  "type": "urn:problem-type:conflict",
  "title": "Resource Conflict",
  "status": 409,
  "detail": "A user with email 'user@example.com' already exists",
  "timestamp": "2026-08-27T13:45:30.123Z"
}
```

---

## Logging Guidelines

- **Client Errors (4xx)**: Log at `WARN` level with short descriptive messages. Do not log stack traces.
- **Server Errors (5xx)**: Log at `ERROR` level with full stack traces (`log.error("...", ex)`) for diagnostic purposes.
