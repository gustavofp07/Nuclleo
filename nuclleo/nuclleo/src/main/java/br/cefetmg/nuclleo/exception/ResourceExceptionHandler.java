package br.cefetmg.nuclleo.exception;

import java.time.Instant;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import jakarta.servlet.http.HttpServletRequest;

@RestControllerAdvice
public class ResourceExceptionHandler {

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<StandardError> maxUploadSize(
            MaxUploadSizeExceededException e,
            HttpServletRequest request) {

        HttpStatus status = HttpStatus.PAYLOAD_TOO_LARGE;
        StandardError err = new StandardError(
                Instant.now(),
                status.value(),
                "Arquivo muito grande",
                "A foto deve ter no máximo 100 MB.",
                request.getRequestURI());

        return ResponseEntity.status(status).body(err);
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<StandardError> resourceNotFound(
            ResourceNotFoundException e,
            HttpServletRequest request) {

        HttpStatus status = HttpStatus.NOT_FOUND;

        StandardError err = new StandardError(
                Instant.now(),
                status.value(),
                "Recurso não encontrado",
                e.getMessage(),
                request.getRequestURI());

        return ResponseEntity.status(status).body(err);
    }

    @ExceptionHandler(DatabaseException.class)
    public ResponseEntity<StandardError> database(
            DatabaseException e,
            HttpServletRequest request) {

        HttpStatus status = HttpStatus.BAD_REQUEST;

        StandardError err = new StandardError(
                Instant.now(),
                status.value(),
                "Erro de banco de dados",
                e.getMessage(),
                request.getRequestURI());

        return ResponseEntity.status(status).body(err);
    }

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<StandardError> badRequest(
            BadRequestException e,
            HttpServletRequest request) {

        HttpStatus status = HttpStatus.BAD_REQUEST;

        StandardError err = new StandardError(
                Instant.now(),
                status.value(),
                "Requisição inválida",
                e.getMessage(),
                request.getRequestURI());

        return ResponseEntity.status(status).body(err);
    }

    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<StandardError> unauthorized(
            UnauthorizedException e,
            HttpServletRequest request) {

        HttpStatus status = HttpStatus.UNAUTHORIZED;

        StandardError err = new StandardError(
                Instant.now(),
                status.value(),
                "Não autorizado",
                e.getMessage(),
                request.getRequestURI());

        return ResponseEntity.status(status).body(err);
    }

    @ExceptionHandler(ConflictException.class)
    public ResponseEntity<StandardError> conflict(
            ConflictException e,
            HttpServletRequest request) {

        HttpStatus status = HttpStatus.CONFLICT;

        StandardError err = new StandardError(
                Instant.now(),
                status.value(),
                "Conflito",
                e.getMessage(),
                request.getRequestURI());

        return ResponseEntity.status(status).body(err);
    }

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<StandardError> business(
            BusinessException e,
            HttpServletRequest request) {

        HttpStatus status = HttpStatus.UNPROCESSABLE_ENTITY;

        StandardError err = new StandardError(
                Instant.now(),
                status.value(),
                "Regra de negócio violada",
                e.getMessage(),
                request.getRequestURI());

        return ResponseEntity.status(status).body(err);
    }
    
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ValidationError> validation(
            MethodArgumentNotValidException e,
            HttpServletRequest request) {

        HttpStatus status = HttpStatus.BAD_REQUEST;

        ValidationError err = new ValidationError(
                Instant.now(),
                status.value(),
                "Erro de validação",
                "Campos inválidos",
                request.getRequestURI());

        e.getBindingResult().getFieldErrors()
                .forEach(f -> err.addError(
                        f.getField(),
                        f.getDefaultMessage()));

        return ResponseEntity.status(status).body(err);
    }
}
