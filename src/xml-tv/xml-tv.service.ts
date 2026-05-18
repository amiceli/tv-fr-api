import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Channel } from './entities/channel.entity'

@Injectable()
export class XmlTvService {
    public constructor(
        @InjectRepository(Channel)
        private readonly channelRepository: Repository<Channel>,
    ) {}

    public findAllChannels(): Promise<Channel[]> {
        return this.channelRepository.find()
    }
}
