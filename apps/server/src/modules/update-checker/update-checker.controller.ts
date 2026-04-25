import { Controller, Get } from '@nestjs/common';

import { UpdateCheckerService } from './update-checker.service';

@Controller('admin/update-check')
export class UpdateCheckerController {
    constructor(private readonly updateCheckerService: UpdateCheckerService) {}

    @Get()
    check(): ReturnType<UpdateCheckerService['check']> {
        return this.updateCheckerService.check();
    }
}
