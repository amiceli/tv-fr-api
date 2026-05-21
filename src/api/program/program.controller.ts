import { Controller, Get, Param, Query } from '@nestjs/common'
import { ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger'
import { type PaginationQuery, SortQuery } from '../types'
import { ProgramService } from './program.service'
import { PaginatedProgramsResponse, ProgramSortField } from './types'

type ParsedPagination = {
    page: number
    limit: number
    sort: ProgramSortField
    order: SortQuery
}

@ApiTags('Programs')
@Controller()
export class ProgramController {
    public constructor(private readonly programService: ProgramService) {}

    @Get('program/:id')
    @ApiOperation({ summary: 'Get a program by id', description: 'Lookup a program by its UUID.' })
    @ApiParam({ name: 'id', description: 'Program UUID' })
    @ApiOkResponse({ description: 'Program details' })
    public async program(@Param('id') programId: string) {
        return this.programService.getProgramById(programId)
    }

    @Get('programs/now')
    @ApiOperation({ summary: 'List currently airing programs', description: 'Returns a paginated list of programs airing now.' })
    @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (min 1)', example: 1 })
    @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (max 100, default 20)', example: 20 })
    @ApiQuery({ name: 'sort', required: false, enum: ProgramSortField, description: 'Field to sort by', example: ProgramSortField.StartAt })
    @ApiQuery({ name: 'order', required: false, enum: SortQuery, description: 'Sort direction', example: SortQuery.ASC })
    @ApiOkResponse({ description: 'Paginated list of current programs' })
    public async now(@Query() query: PaginationQuery<ProgramSortField>): Promise<PaginatedProgramsResponse> {
        const { page, limit, sort, order } = this.parsePagination(query)
        const result = await this.programService.listCurrentPrograms({ page, limit, sort, order })

        return result
    }

    private parsePagination(query: PaginationQuery<ProgramSortField>): ParsedPagination {
        const sort = Object.values(ProgramSortField).includes(query.sort as ProgramSortField)
            ? (query.sort as ProgramSortField)
            : ProgramSortField.StartAt

        return {
            page: Math.max(1, Number(query.page) || 1),
            limit: Math.min(100, Number(query.limit) || 20),
            sort,
            order: query.order === SortQuery.DESC ? SortQuery.DESC : SortQuery.ASC,
        }
    }
}
