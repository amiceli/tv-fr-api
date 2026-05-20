import type { INestApplication } from '@nestjs/common'
import { getRepositoryToken } from '@nestjs/typeorm'
import request from 'supertest'
import type { App } from 'supertest/types'
import type { Repository } from 'typeorm'
import { Channel } from '../xml-tv/entities/channel.entity'
import { Program } from '../xml-tv/entities/program.entity'
import { createTestApp } from './helpers/create-test-app'

describe('GET /api/channels (e2e)', () => {
    let app: INestApplication<App>
    let channelRepository: Repository<Channel>
    let programRepository: Repository<Program>

    beforeEach(async () => {
        const { app: testApp, module } = await createTestApp()
        app = testApp
        channelRepository = module.get<Repository<Channel>>(getRepositoryToken(Channel))
        programRepository = module.get<Repository<Program>>(getRepositoryToken(Program))

        await programRepository.createQueryBuilder().delete().execute()
        await channelRepository.createQueryBuilder().delete().execute()
    })

    afterEach(async () => {
        await programRepository.createQueryBuilder().delete().execute()
        await channelRepository.createQueryBuilder().delete().execute()
        await app.close()
    })

    test('returns paginated channels', async () => {
        await channelRepository.save([
            { xmlId: 'channel-1', displayName: 'Channel One', icon: null },
            { xmlId: 'channel-2', displayName: 'Channel Two', icon: 'https://example.com/icon.png' },
        ])

        const response = await request(app.getHttpServer()).get('/api/channels').expect(200)

        expect(response.body.total).toBe(2)
        expect(response.body.totalPages).toBe(1)
        expect(response.body.count).toBe(2)
        expect(response.body.channels).toHaveLength(2)
        expect(response.body.channels).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ xmlId: 'channel-1', displayName: 'Channel One', icon: null }),
                expect.objectContaining({ xmlId: 'channel-2', displayName: 'Channel Two', icon: 'https://example.com/icon.png' }),
            ]),
        )
        for (const channel of response.body.channels) {
            expect(channel).not.toHaveProperty('programs')
        }
    })

    test('respects page and limit', async () => {
        await channelRepository.save([
            { xmlId: 'channel-1', displayName: 'Alpha', icon: null },
            { xmlId: 'channel-2', displayName: 'Beta', icon: null },
        ])

        const response = await request(app.getHttpServer()).get('/api/channels?page=1&limit=1').expect(200)

        expect(response.body.total).toBe(2)
        expect(response.body.totalPages).toBe(2)
        expect(response.body.count).toBe(1)
        expect(response.body.channels).toHaveLength(1)
        expect(response.body.channels[0].displayName).toBe('Alpha')
    })

    test('respects order=desc', async () => {
        await channelRepository.save([
            { xmlId: 'channel-1', displayName: 'Alpha', icon: null },
            { xmlId: 'channel-2', displayName: 'Beta', icon: null },
        ])

        const response = await request(app.getHttpServer()).get('/api/channels?order=desc').expect(200)

        expect(response.body.channels[0].displayName).toBe('Beta')
        expect(response.body.channels[1].displayName).toBe('Alpha')
    })
})
