import { ValueObject } from "@shared-kernel/domain/value-object";
import { ValidationException } from "@shared-kernel/exceptions";

export class PermissionCode extends ValueObject<string> {
    private constructor(value: string) {
        super(value);
    }

    static create(value: string): PermissionCode {
        value = value.trim().toLowerCase();
        if (!value) {
            throw new ValidationException(
                'Permission code is required.',
            );
        }
        const regex = /^[a-z0-9]+:[a-z0-9]+$/;
        if (!regex.test(value)) {
            throw new ValidationException(
                'Permission code must follow module:action format.',
            );
        }
        return new PermissionCode(value);
    }
}