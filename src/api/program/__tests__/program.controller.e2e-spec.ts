import type { INestApplication } from '@nestjs/common'
import { getRepositoryToken } from '@nestjs/typeorm'
import { addHours, addMinutes, subHours, subMinutes } from 'date-fns'
import request from 'supertest'
import type { App } from 'supertest/types'
import type { Repository } from 'typeorm'
import { createTestApp } from '@/__tests__/helpers/create-test-app'
import { buildProgram } from '@/__tests__/helpers/program-test.helper'
import { Channel } from '@/xml-tv/entities/channel.entity'
import { Program } from '@/xml-tv/entities/program.entity'

describe('ProgramController', () => {
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

        await channelRepository.save({ xmlId: 'program-channel', displayName: 'Test Channel', icon: null })
    })

    afterEach(async () => {
        await programRepository.createQueryBuilder().delete().execute()
        await channelRepository.createQueryBuilder().delete().execute()
        await app.close()
    })

    describe('GET /api/program/:id', () => {
        test('returns program by id', async () => {
            const program = await programRepository.save(
                buildProgram({
                    title: 'Current show',
                    start: new Date(Date.now() - 60 * 60 * 1000),
                    stop: new Date(Date.now() + 60 * 60 * 1000),
                }),
            )

            const response = await request(app.getHttpServer()).get(`/api/program/${program.id}`).expect(200)

            expect(response.body.id).toBe(program.id)
            expect(response.body.title).toBe('Current show')
        })

        test('returns 404 for unknown program', async () => {
            await request(app.getHttpServer()).get('/api/program/00000000-0000-0000-0000-000000000000').expect(404)
        })
    })

    describe('GET /api/programs/now', () => {
        test('returns only programs airing now', async () => {
            const now = Date.now()

            await channelRepository.save([
                { xmlId: 'channel-1', displayName: 'Channel One', icon: null },
                { xmlId: 'channel-2', displayName: 'Channel Two', icon: 'https://example.com/icon.png' },
            ])

            await programRepository.save([
                buildProgram({
                    title: 'Past show',
                    start: subHours(now, 3),
                    stop: subHours(now, 2),
                    channelXmlId: 'channel-1',
                }),
                buildProgram({
                    title: 'Current show A',
                    start: subMinutes(now, 30),
                    stop: addMinutes(now, 30),
                    channelXmlId: 'channel-2',
                }),
                buildProgram({
                    title: 'Current show B',
                    start: subMinutes(now, 10),
                    stop: addMinutes(now, 50),
                    channelXmlId: 'channel-2',
                }),
                buildProgram({
                    title: 'Future show',
                    start: addHours(now, 1),
                    stop: addHours(now, 2),
                    channelXmlId: 'channel-2',
                }),
            ])

            const response = await request(app.getHttpServer()).get('/api/programs/now').expect(200)
            const programs = response.body.programs as Program[]

            expect(response.body.total).toBe(2)
            expect(response.body.count).toBe(2)
            expect(response.body.programs).toHaveLength(2)
            expect(programs.map((p: Program) => p.title).sort()).toEqual(['Current show A', 'Current show B'])
            expect(programs.at(0)?.channel.displayName).toEqual('Channel Two')
            expect(programs.at(1)?.channel.displayName).toEqual('Channel Two')
        })

        test('supports pagination and order', async () => {
            const now = Date.now()

            await programRepository.save([
                buildProgram({
                    title: 'Show 1',
                    start: subMinutes(now, 30),
                    stop: addMinutes(now, 30),
                }),
                buildProgram({
                    title: 'Show 2',
                    start: subMinutes(now, 25),
                    stop: addMinutes(now, 35),
                }),
                buildProgram({
                    title: 'Show 3',
                    start: subMinutes(now, 20),
                    stop: addMinutes(now, 40),
                }),
            ])

            const response = await request(app.getHttpServer()).get('/api/programs/now?page=2&limit=1&order=desc').expect(200)

            expect(response.body.total).toBe(3)
            expect(response.body.totalPages).toBe(3)
            expect(response.body.count).toBe(1)
            expect(response.body.limit).toBe(1)
            expect(response.body.programs[0].title).toBe('Show 2')
        })
    })
})
