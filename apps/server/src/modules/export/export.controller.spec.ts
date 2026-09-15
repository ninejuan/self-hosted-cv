import { InternalServerErrorException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import type { Request, Response } from 'express';

import { ExportController } from './export.controller';
import { ExportService } from './export.service';

describe('ExportController', () => {
  let controller: ExportController;
  let exportService: {
    readonly buildZip: jest.MockedFunction<ExportService['buildZip']>;
  };
  const originalNodeEnv = process.env.NODE_ENV;
  const originalAppUrl = process.env.APP_URL;

  beforeEach(async () => {
    exportService = {
      buildZip: jest.fn().mockResolvedValue(Buffer.from('zip')),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExportController],
      providers: [{ provide: ExportService, useValue: exportService }],
    }).compile();

    controller = module.get(ExportController);
  });

  afterEach(() => {
    restoreEnvironment('NODE_ENV', originalNodeEnv);
    restoreEnvironment('APP_URL', originalAppUrl);
    jest.clearAllMocks();
  });

  describe('export', () => {
    it('rejects Host fallback in production when APP_URL is unset', async () => {
      process.env.NODE_ENV = 'production';
      delete process.env.APP_URL;

      await expect(
        controller.exportSite(createRequest(), createResponse()),
      ).rejects.toBeInstanceOf(InternalServerErrorException);
      expect(exportService.buildZip).not.toHaveBeenCalled();
    });
  });
});

function createRequest(): Request {
  return {
    get: jest.fn().mockReturnValue('attacker.example'),
    protocol: 'https',
  } as Request;
}

function createResponse(): Response {
  return {
    end: jest.fn(),
    json: jest.fn(),
    setHeader: jest.fn(),
    status: jest.fn().mockReturnThis(),
  } as Response;
}

function restoreEnvironment(key: string, value: string | undefined): void {
  if (value === undefined) {
    delete process.env[key];
    return;
  }

  process.env[key] = value;
}
