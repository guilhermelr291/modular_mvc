import { beforeEach, describe, expect, test, vi } from 'vitest';
import { AuthController } from './auth-controller';
import { AuthService } from '../service/auth-service';
import { CompareFieldsValidation } from '../validations/sign-up/compare-fields-validator';
import { NextFunction, Request, Response } from 'express';

const mockAuthService = {
  signUp: vi.fn(),
} as unknown as AuthService;

const mockCompareFieldsValidation = {
  validate: vi.fn(),
} as unknown as CompareFieldsValidation;

describe('AuthController', () => {
  let authController: AuthController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    vi.clearAllMocks();

    authController = new AuthController(
      mockAuthService,
      mockCompareFieldsValidation
    );

    mockRequest = {
      body: {
        name: 'any_name',
        email: 'any_email@mail.com',
        password: 'any_password',
        confirmPassword: 'any_password',
      },
    };

    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    mockNext = vi.fn();
  });

  describe('signUp', () => {
    test('Should call CompareFieldsValidation with correct data', async () => {
      const validateSpy = vi.spyOn(mockCompareFieldsValidation, 'validate');

      await authController.signUp(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(validateSpy).toHaveBeenCalledWith(mockRequest.body);
    });

    test('Should call AuthService with correct data', async () => {
      const signUpSpy = vi.spyOn(mockAuthService, 'signUp');

      await authController.signUp(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(signUpSpy).toHaveBeenCalledWith(mockRequest.body);
    });

    test('Should return 201 on success', async () => {
      await authController.signUp(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(201);
    });

    test('Should call next when AuthService throws', async () => {
      const error = new Error();

      vi.spyOn(mockAuthService, 'signUp').mockImplementationOnce(() => {
        throw error;
      });

      await authController.signUp(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });

    test('Should call next when CompareFieldsValidation throws', async () => {
      const error = new Error();

      vi.spyOn(mockCompareFieldsValidation, 'validate').mockImplementationOnce(
        () => {
          throw error;
        }
      );

      await authController.signUp(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});
