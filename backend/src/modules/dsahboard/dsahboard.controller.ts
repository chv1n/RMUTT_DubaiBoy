import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { DsahboardService } from './dsahboard.service';
import { DashboardQuery } from 'src/common/dto/dashboard-query';

@Controller({
  path: 'dashboard',
  version: '1',
})
export class DsahboardController {
  constructor(private readonly dsahboardService: DsahboardService) { }

  @Get('overview')
  findAll(@Query() query: DashboardQuery) {
    return this.dsahboardService.getOverviewStats(query);
  }
}
