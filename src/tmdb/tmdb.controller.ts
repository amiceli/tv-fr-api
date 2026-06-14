import { Controller, Get, Query, UseInterceptors } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { HeaderInterceptor } from '@/xml-tv/xml-tv.interceptor'
import { TmdbService } from './tmdb.service'

@Controller('tmdb')
export class TmdbController {
    public constructor(private readonly tmdbService: TmdbService) {}

    @Cron(CronExpression.EVERY_DAY_AT_2AM)
    @Get('/init')
    @UseInterceptors(HeaderInterceptor)
    public handleNewPrograms() {
        this.tmdbService.handleNewPrograms()
    }

    // @Cron(CronExpression.EVERY_MINUTE)
    @Get(`/sync`)
    public async syncProgramScores(@Query('title') title?: string): Promise<void> {
        if (title) {
            await this.tmdbService.syncOneProgram(title)
        } else {
            await this.tmdbService.syncPrograms()
        }
    }
}
