import type { Channel } from 'src/xml-tv/entities/channel.entity'

export type PaginatedResponse = {
    total: number
}

export type PaginatedChannels = PaginatedResponse & {
    channels: Channel[]
}
