import { Controller, Get } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Public } from "../auth/decorators/auth.decorators";
import { TradeService } from "./trade.service";

@ApiTags("trade")
@Public()
@Controller("trade")
export class TradeController {
  constructor(private readonly trade: TradeService) {}

  @Get("map")
  @ApiOperation({
    summary: "首页全球交易地图数据",
    description:
      "返回国家亮度分级（0–4）、经纬度与小人动画路线。全部为 Seed 占位数据。",
  })
  @ApiOkResponse({ description: "地图数据（统一 envelope 包裹在 data 字段）" })
  getMap() {
    return this.trade.getMap();
  }
}
