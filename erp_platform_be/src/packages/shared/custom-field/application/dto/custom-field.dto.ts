import { ApiProperty } from '@nestjs/swagger';

export class CustomFieldOptionDto {
  @ApiProperty()
  value: string;

  @ApiProperty()
  label: string;

  @ApiProperty({ required: false })
  sortOrder?: number;
}

export class CreateCustomFieldDefinitionDto {
  @ApiProperty()
  targetModule: string;

  @ApiProperty()
  targetEntity: string;

  @ApiProperty()
  code: string;

  @ApiProperty()
  name: string;

  @ApiProperty({
    enum: [
      'text',
      'textarea',
      'number',
      'decimal',
      'boolean',
      'date',
      'datetime',
      'email',
      'phone',
      'url',
      'select',
      'multiselect',
      'json',
    ],
  })
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

  @ApiProperty({ required: false })
  isRequired?: boolean;

  @ApiProperty({ required: false })
  defaultValue?: string;

  @ApiProperty({ required: false })
  validationRules?: any;

  @ApiProperty({ required: false })
  displayOrder?: number;

  @ApiProperty({ required: false })
  metadata?: any;

  @ApiProperty({ type: [CustomFieldOptionDto], default: [] })
  options: CustomFieldOptionDto[];
}

export class SaveCustomFieldValuesDto {
  @ApiProperty()
  customFieldDefinitionId: string;

  @ApiProperty()
  targetRecordId: string;

  @ApiProperty()
  value: any;
}

export class CustomFieldDefinitionDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  tenantId: string;

  @ApiProperty()
  targetModule: string;

  @ApiProperty()
  targetEntity: string;

  @ApiProperty()
  code: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  fieldType: string;

  @ApiProperty()
  isRequired: boolean;

  @ApiProperty({ required: false })
  defaultValue?: string;

  @ApiProperty({ type: [CustomFieldOptionDto], default: [] })
  options: CustomFieldOptionDto[];
}

export class CustomFieldValueDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  customFieldDefinitionId: string;

  @ApiProperty()
  targetRecordId: string;

  @ApiProperty()
  value: any;

  @ApiProperty({ type: CustomFieldDefinitionDto })
  definition?: CustomFieldDefinitionDto;
}
