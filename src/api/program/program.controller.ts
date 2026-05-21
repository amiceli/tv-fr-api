import { Controller, Get, Param, Query, Req } from '@nestjs/common'
import { ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger'
import type { Request } from 'express'
import { type PaginatedProgramsResponse, type PaginationQuery, ProgramSortField, SortQuery } from '../types'
import { ProgramService } from './program.service'

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
    public async now(@Req() req: Request, @Query() query: PaginationQuery<ProgramSortField>): Promise<PaginatedProgramsResponse> {
        const { page, limit, sort, order } = this.parsePagination(query)
        const { programs, ...rest } = await this.programService.listCurrentPrograms({ page, limit, sort, order })
        const baseUrl = `${req.protocol}://${req.get('Host')}/api/programs`

        return {
            ...rest,
            programs: programs.map((program) => ({
                ...program,
                url: `${baseUrl}/${program.id}`,
            })),
        }
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
