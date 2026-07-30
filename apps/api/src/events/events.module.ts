import { Module } from '@nestjs/common';

import { DomainEventService } from './domain-event.service.js';

@Module({
  providers: [DomainEventService],
  exports: [DomainEventService],
})
export class EventsModule {}
