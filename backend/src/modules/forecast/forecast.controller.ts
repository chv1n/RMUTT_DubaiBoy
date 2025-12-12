import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ForecastService } from './forecast.service';


@Controller({
  path: "forecast",
  version: "1",
})
export class ForecastController {
  constructor(private readonly forecastService: ForecastService) { }

  @Post("update")
  async updateModel() {
    return this.forecastService.retrainMonthly();
  }


  @Post("predict")
  async predict(
    @Body("productId") productId: number,
    @Body("days") days: number
  ) {
    return this.forecastService.predict(productId, days);
  }

}
