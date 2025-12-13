import { Controller, Get, Post, Body, Patch, Param, Delete, Put, Query, ParseIntPipe } from '@nestjs/common';

import { CreateProductPlanDto } from '../dto/create-product-plan.dto';
import { UpdateProductPlanDto } from '../dto/update-product-plan.dto';
import { ProductPlanQueryDto } from '../dto/product-plan-query.dto';
import { PlanWorkflowService } from '../services/plan-workflow.service';
import { PlanReportService } from '../services/plan-report.service';
import { ConfirmPlanDto } from '../dto/confirm-plan.dto';
import { CompletePlanDto } from '../dto/complete-plan.dto';
import { CancelPlanDto } from '../dto/cancel-plan.dto';
import { ReportQueryDto } from '../dto/report-query.dto';
import { ProductPlanService } from '../product-plan.service';

@Controller({
  path: 'product-plans',
  version: '1'
})
export class ProductPlanController {
  constructor(
    private readonly productPlanService: ProductPlanService,
    private readonly planWorkflowService: PlanWorkflowService,
    private readonly planReportService: PlanReportService,
  ) { }

  // =============== CRUD Endpoints ===============

  @Post()
  async create(@Body() createProductPlanDto: CreateProductPlanDto) {
    const data = await this.productPlanService.create(createProductPlanDto);
    return {
      message: 'เพิ่มสำเร็จ',
      data
    };
  }

  @Get()
  findAll(@Query() query: ProductPlanQueryDto) {
    return this.productPlanService.findAll(query);
  }

  @Get('report/summary')
  async getReportSummary(@Query() query: ReportQueryDto) {
    const data = await this.planReportService.getSummary(query);
    return {
      message: 'ดึงข้อมูลสรุปสำเร็จ',
      data
    };
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productPlanService.findOne(id);
  }

  @Get(':id/material-requirements')
  getMaterialRequirements(@Param('id', ParseIntPipe) id: number) {
    return this.productPlanService.getMaterialRequirements(id);
  }

  @Put(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() updateProductPlanDto: UpdateProductPlanDto) {
    const data = await this.productPlanService.update(id, updateProductPlanDto);
    return {
      message: 'แก้ไขสำเร็จ',
      data: data
    };
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    const data = await this.productPlanService.remove(id);
    return {
      message: 'ลบสำเร็จ',
      data: data
    };
  }

  @Put(':id/restore')
  async restore(@Param('id', ParseIntPipe) id: number) {
    const data = await this.productPlanService.restore(id);
    return {
      message: 'กู้คืนสำเร็จ',
      data: data
    };
  }

  // =============== Workflow Endpoints ===============

  /**
   * Preview Plan - คำนวณวัสดุ + ต้นทุน + แสดง stock แต่ละ warehouse
   */
  @Get(':id/preview')
  async previewPlan(@Param('id', ParseIntPipe) id: number) {
    const data = await this.planWorkflowService.previewPlan(id);
    return {
      message: 'ดึงข้อมูล preview สำเร็จ',
      data
    };
  }

  /**
   * Confirm Plan - ยืนยัน + จอง stock ตาม allocations ที่ user เลือก
   */
  @Post(':id/confirm')
  async confirmPlan(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ConfirmPlanDto,
  ) {
    const data = await this.planWorkflowService.confirmPlan(id, dto);
    return {
      message: 'ยืนยันแผนผลิตและจอง stock สำเร็จ',
      data
    };
  }

  /**
   * Start Production - เริ่มผลิต + ตัด stock จริง
   */
  @Post(':id/start')
  async startProduction(@Param('id', ParseIntPipe) id: number) {
    const data = await this.planWorkflowService.startProduction(id);
    return {
      message: 'เริ่มการผลิตสำเร็จ',
      data
    };
  }

  /**
   * Complete Plan - เสร็จสิ้น + กรอก actual + คืนวัสดุเหลือ
   */
  @Post(':id/complete')
  async completePlan(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CompletePlanDto,
  ) {
    const data = await this.planWorkflowService.completePlan(id, dto);
    return {
      message: 'บันทึกการผลิตเสร็จสิ้นสำเร็จ',
      data
    };
  }

  /**
   * Cancel Plan - ยกเลิก + คืน stock
   */
  @Post(':id/cancel')
  async cancelPlan(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CancelPlanDto,
  ) {
    const data = await this.planWorkflowService.cancelPlan(id, dto);
    return {
      message: 'ยกเลิกแผนผลิตสำเร็จ',
      data
    };
  }
}


