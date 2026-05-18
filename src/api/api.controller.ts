import { Controller, Get } from '@nestjs/common'
import { ApiService } from './api.service'

@Controller()
export class ApiController {
    public constructor(private readonly apiService: ApiService) {}

    @Get('status')
    public status(): Promise<{ status: string; database: string }> {
        return this.apiService.getStatus()
    }
}
