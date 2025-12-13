import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ForecastService } from './forecast.service';
import { Role } from 'src/common/enums';
import { Auth } from 'src/common/decorators/auth.decorator';


@Controller({
  path: "forecast",
  version: "1",
})
export class ForecastController {
  constructor(private readonly forecastService: ForecastService) { }

  @Auth(Role.ADMIN, Role.SUPER_ADMIN)
  @Post("update")
  async updateModel() {
    return this.forecastService.retrainMonthly();
  }

  @Auth(Role.ADMIN, Role.SUPER_ADMIN)
  @Post("predict")
  async predict(
    @Body("productId") productId: number,
    @Body("days") days: number
  ) {
    return this.forecastService.predict(productId, days);
  }

}
