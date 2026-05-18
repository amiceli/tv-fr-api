import type { INestApplication } from '@nestjs/common'
import { Test, type TestingModule } from '@nestjs/testing'
import request from 'supertest'
import type { App } from 'supertest/types'
import { AppModule } from '../app.module'

describe('ApiController (e2e)', () => {
    let app: INestApplication<App>

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile()

        app = moduleFixture.createNestApplication()
        await app.init()
    })

    it('/api/status (GET)', () => {
        return request(app.getHttpServer()).get('/api/status').expect(200).expect({ status: 'ok', database: 'ok' })
    })

    afterEach(async () => {
        await app.close()
    })
})
