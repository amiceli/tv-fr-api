import { Controller, Get } from '@nestjs/common'
import { Channel } from './entities/channel.entity'
import { XmlTvService } from './xml-tv.service'

@Controller('xml-tv')
export class XmlTvController {
    public constructor(private readonly xmlTvService: XmlTvService) {}

    @Get('channels')
    public getChannels(): Promise<Channel[]> {
        return this.xmlTvService.findAllChannels()
    }
}
