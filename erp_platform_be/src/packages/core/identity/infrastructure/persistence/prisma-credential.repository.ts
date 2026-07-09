import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { Credential, CredentialRepository } from '../../domain/index';
import { CredentialPersistenceMapper } from './credential.persistence.mapper';

@Injectable()
export class PrismaCredentialRepository implements CredentialRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(credential: Credential): Promise<void> {
    await this.prisma.credential.create({
      data: {
        id: credential.id.getValue(),
        ...CredentialPersistenceMapper.toPersistence(credential),
        createdAt: credential.createdAt,
      },
    });
  }

  async update(credential: Credential): Promise<void> {
    await this.prisma.credential.update({
      where: {
        id: credential.id.getValue(),
      },
      data: CredentialPersistenceMapper.toPersistence(credential),
    });
  }

  async delete(credential: Credential): Promise<void> {
    await this.prisma.credential.delete({
      where: {
        id: credential.id.getValue(),
      },
    });
  }

  async findById(id: Identifier): Promise<Credential | null> {
    const entity = await this.prisma.credential.findUnique({
      where: {
        id: id.getValue(),
      },
    });

    return entity ? CredentialPersistenceMapper.toDomain(entity) : null;
  }

  async findByPrincipalId(principalId: Identifier): Promise<Credential | null> {
    const entity = await this.prisma.credential.findFirst({
      where: {
        principalId: principalId.getValue(),
      },
    });

    return entity ? CredentialPersistenceMapper.toDomain(entity) : null;
  }

  async exists(id: Identifier): Promise<boolean> {
    const count = await this.prisma.credential.count({
      where: {
        id: id.getValue(),
      },
    });

    return count > 0;
  }
}
