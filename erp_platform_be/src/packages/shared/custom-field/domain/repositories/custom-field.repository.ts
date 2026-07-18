import { Identifier } from '@shared-kernel/domain/primitives/identifier';

export const CUSTOM_FIELD_REPOSITORY = 'CUSTOM_FIELD_REPOSITORY';

export interface CustomFieldDefinitionCreateInput {
  tenantId: string;
  targetModule: string;
  targetEntity: string;
  code: string;
  name: string;
  fieldType:
    | 'text'
    | 'textarea'
    | 'number'
    | 'decimal'
    | 'boolean'
    | 'date'
    | 'datetime'
    | 'email'
    | 'phone'
    | 'url'
    | 'select'
    | 'multiselect'
    | 'json';
  isRequired?: boolean;
  defaultValue?: string;
  validationRules?: any;
  displayOrder?: number;
  metadata?: any;
  createdByPrincipalId?: string;
  options?: Array<{ value: string; label: string; sortOrder?: number }>;
}

export interface CustomFieldValueSaveInput {
  customFieldDefinitionId: string;
  targetRecordId: string;
  value: any;
}

export interface CustomFieldRepository {
  createDefinition(input: CustomFieldDefinitionCreateInput): Promise<any>;
  deleteDefinition(id: Identifier): Promise<void>;
  findDefinitionsForEntity(
    tenantId: Identifier,
    targetModule: string,
    targetEntity: string,
  ): Promise<any[]>;
  saveValues(values: CustomFieldValueSaveInput[]): Promise<void>;
  findValuesForRecord(targetRecordId: Identifier): Promise<any[]>;
}
