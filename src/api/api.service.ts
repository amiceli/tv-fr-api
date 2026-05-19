import { Injectable } from '@nestjs/common'
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm'
import { DataSource, Repository } from 'typeorm'
import { Channel } from '../xml-tv/entities/channel.entity'

@Injectable()
export class ApiService {
    public constructor(
        @InjectDataSource()
        private readonly dataSource: DataSource,
        @InjectRepository(Channel)
        private readonly channelRepository: Repository<Channel>,
    ) {}

    public async getStatus(): Promise<{ status: string; database: string }> {
        try {
            await this.dataSource.query('SELECT 1')
            return { status: 'ok', database: 'ok' }
        } catch {
            return { status: 'degraded', database: 'down' }
        }
    }

    public async listChannels(): Promise<Channel[]> {
        return this.channelRepository.find()
    }
}
