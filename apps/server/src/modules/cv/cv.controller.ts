import { Controller, Get } from '@nestjs/common';

import { CvService } from './cv.service';

@Controller('cv')
export class CvController {
    constructor(private readonly cvService: CvService) {}

    @Get()
    getCv(): ReturnType<CvService['getCv']> {
        return this.cvService.getCv();
    }
}
