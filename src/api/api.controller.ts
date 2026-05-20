import { Controller, Get, Query } from '@nestjs/common'
import { ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger'
import { ApiService } from './api.service'
import { ChannelSortField, type PaginatedChannelsResponse, type PaginationQuery, SortQuery } from './types'

type ParsedPagination = {
    page: number
    limit: number
    order: SortQuery
}

@ApiTags('Channels')
@Controller()
export class ApiController {
    public constructor(private readonly apiService: ApiService) {}

    @Get('status')
    @ApiOperation({ summary: 'Health check', tags: ['Status'] })
    @ApiOkResponse({
        description: 'Service status',
        example: { status: 'ok', database: 'ok' },
    })
    public status(): Promise<{ status: string; database: string }> {
        return this.apiService.getStatus()
    }

    @Get('channels')
    @ApiOperation({ summary: 'List channels', description: 'Returns a paginated list of channels sorted by a given field.' })
    @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (min 1)', example: 1 })
    @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (max 100, default 20)', example: 20 })
    @ApiQuery({
        name: 'sort',
        required: false,
        enum: ChannelSortField,
        description: 'Field to sort by',
        example: ChannelSortField.DisplayName,
    })
    @ApiQuery({ name: 'order', required: false, enum: SortQuery, description: 'Sort direction', example: SortQuery.ASC })
    @ApiOkResponse({ description: 'Paginated list of channels' })
    public async channels(@Query() query: PaginationQuery<ChannelSortField>): Promise<PaginatedChannelsResponse> {
        const { page, limit, order } = this.parsePagination(query)
        const sort = Object.values(ChannelSortField).includes(query.sort as ChannelSortField)
            ? (query.sort as ChannelSortField)
            : ChannelSortField.DisplayName

        return this.apiService.listChannels({ page, limit, sort, order })
    }

    private parsePagination(query: PaginationQuery): ParsedPagination {
        return {
            page: Math.max(1, Number(query.page) || 1),
            limit: Math.min(100, Number(query.limit) || 20),
            order: query.order === SortQuery.DESC ? SortQuery.DESC : SortQuery.ASC,
        }
    }
}
