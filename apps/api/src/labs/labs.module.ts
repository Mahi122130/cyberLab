
import { Module } from '@nestjs/common';

import { DatabaseModule } from '../database/database.module';

import { LabsController } from './labs.controller';
import { LabsService } from './labs.service';

@Module({
  imports: [
    DatabaseModule,
  ],

  controllers: [
    LabsController,
  ],

  providers: [
    LabsService,
  ],

  exports: [
    LabsService,
  ],
})
export class LabsModule {}
