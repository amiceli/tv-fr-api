import { Test, type TestingModule } from '@nestjs/testing'
import { getDataSourceToken } from '@nestjs/typeorm'
import { ApiController } from '../api.controller'
import { ApiService } from '../api.service'

describe('ApiController', () => {
    let apiController: ApiController

    beforeEach(async () => {
        const app: TestingModule = await Test.createTestingModule({
            controllers: [ApiController],
            providers: [
                ApiService,
                {
                    provide: getDataSourceToken(),
                    useValue: { query: vi.fn().mockResolvedValue([{ '?column?': 1 }]) },
                },
            ],
        }).compile()

        apiController = app.get<ApiController>(ApiController)
    })

    describe('status', () => {
        it('should return status ok with database ok', async () => {
            await expect(apiController.status()).resolves.toEqual({ status: 'ok', database: 'ok' })
        })
    })
})
