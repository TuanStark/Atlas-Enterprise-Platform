import { Identifier } from "@shared-kernel/domain/primitives/identifier";
import { Permission } from "../entities/permission";
import { PermissionCode } from "../value-objects/permission-code";


export interface PermissionRepository {
    save(permission: Permission): Promise<void>;
    update(permission: Permission): Promise<void>;
    delete(permission: Permission): Promise<void>;
    findById(id: Identifier): Promise<Permission | null>;
    findByCode(
        code: PermissionCode,
    ): Promise<Permission | null>;
    existsByCode(
        code: PermissionCode,
    ): Promise<boolean>;
    findAll(): Promise<Permission[]>;
}