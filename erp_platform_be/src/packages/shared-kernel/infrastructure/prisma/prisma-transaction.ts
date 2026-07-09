import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { TransactionRunner } from '@shared-kernel/application';

@Injectable()
export class PrismaTransaction implements TransactionRunner {
  constructor(private readonly prisma: PrismaService) {}

  async run<T>(work: () => Promise<T>): Promise<T> {
    return this.prisma.$transaction(async () => work());
  }
}
