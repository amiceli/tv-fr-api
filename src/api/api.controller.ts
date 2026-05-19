import { Controller, Get } from '@nestjs/common'
import { ApiService } from './api.service'
import { PaginatedChannels } from './types'

@Controller()
export class ApiController {
    public constructor(private readonly apiService: ApiService) {}

    @Get('status')
    public status(): Promise<{ status: string; database: string }> {
        return this.apiService.getStatus()
    }

    @Get('channels')
    public async channels(): Promise<PaginatedChannels> {
        const channels = await this.apiService.listChannels()

        return {
            channels,
            total: channels.length,
        }
    }
}
