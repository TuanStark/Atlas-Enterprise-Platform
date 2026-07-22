import { SetMetadata } from '@nestjs/common';

export const IS_PLATFORM_ONLY_KEY = 'isPlatformOnly';
export const RequireSystemAdmin = () => SetMetadata(IS_PLATFORM_ONLY_KEY, true);
