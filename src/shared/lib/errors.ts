export class AppError extends Error {
  code: string;
  status: number;

  constructor(message: string, code = "APP_ERROR", status = 500) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.status = status;
  }
}

export class AuthError extends AppError {
  constructor(message = "Não autorizado") {
    super(message, "AUTH_ERROR", 401);
    this.name = "AuthError";
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Acesso negado") {
    super(message, "FORBIDDEN", 403);
    this.name = "ForbiddenError";
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Não encontrado") {
    super(message, "NOT_FOUND", 404);
    this.name = "NotFoundError";
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, "VALIDATION_ERROR", 400);
    this.name = "ValidationError";
  }
}

export class RateLimitError extends AppError {
  constructor(message = "Limite de requisições atingido") {
    super(message, "RATE_LIMIT", 429);
    this.name = "RateLimitError";
  }
}

export class IntegrationError extends AppError {
  constructor(message: string) {
    super(message, "INTEGRATION_ERROR", 502);
    this.name = "IntegrationError";
  }
}

export class BudgetExceededError extends AppError {
  resetAt: Date;
  constructor(message = "Limite de IA atingido", resetAt: Date) {
    super(message, "BUDGET_EXCEEDED", 402);
    this.name = "BudgetExceededError";
    this.resetAt = resetAt;
  }
}
