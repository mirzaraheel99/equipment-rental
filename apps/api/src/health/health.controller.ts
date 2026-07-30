import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';

import { HealthService } from './health.service.js';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: 'Overall liveness — process is running.' })
  getHealth() {
    return this.healthService.getLiveness();
  }

  @Get('live')
  @ApiOperation({ summary: 'Liveness probe — process is running.' })
  getLive() {
    return this.healthService.getLiveness();
  }

  @Get('ready')
  @ApiOperation({ summary: 'Readiness probe — dependencies (database, redis) are reachable.' })
  async getReady(@Res({ passthrough: true }) res: Response) {
    const result = await this.healthService.getReadiness();
    res.status(result.status === 'ok' ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE);
    return result;
  }
}
