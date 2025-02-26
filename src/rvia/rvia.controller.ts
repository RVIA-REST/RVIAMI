import { Controller, Get } from '@nestjs/common';

import { RviaService } from './rvia.service';

@Controller('rvia')
export class RviaController {
  constructor(
    private readonly rviaService: RviaService,
  ) {}

  @Get()
  getVersion() {
    return this.rviaService.getVersion();
  }

}
