import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Channel } from './entities/channel.entity'
import { XmlTvController } from './xml-tv.controller'
import { XmlTvService } from './xml-tv.service'

@Module({
    imports: [TypeOrmModule.forFeature([Channel])],
    controllers: [XmlTvController],
    providers: [XmlTvService],
})
export class XmlTvModule {}
