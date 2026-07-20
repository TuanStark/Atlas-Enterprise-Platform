import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PositionReadModel {
  @ApiProperty({
    description: 'Unique identifier of the position',
    example: '79c97e1e-972f-466f-a71a-f729d3a8feac',
  })
  id!: string;

  @ApiProperty({
    description: 'ID of the organization organizationId',
    example: '99531e55-d109-47e9-b23e-c54c556cb5e7',
  })
  organizationId!: string;

  @ApiProperty({ description: 'Position code', example: 'POS001' })
  code!: string;

  @ApiProperty({ description: 'Position name', example: 'Senior Software Engineer' })
  name!: string;

  @ApiPropertyOptional({
    description: 'Position description',
    example: 'Software development leadership role',
  })
  description?: string;

  @ApiPropertyOptional({ description: 'Position hierarchy level', example: 1 })
  level?: number;
}
