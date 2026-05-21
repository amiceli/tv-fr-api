import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { LessThanOrEqual, MoreThan, Repository } from 'typeorm'
import { Program } from '../../xml-tv/entities/program.entity'
import { ProgramSortField, SortQuery } from '../types'

type ListProgramsQuery = {
    page: number
    limit: number
    sort: ProgramSortField
    order: SortQuery
}

type ListProgramsResult = {
    programs: Program[]
    total: number
    totalPages: number
    count: number
    limit: number
}

@Injectable()
export class ProgramService {
    public constructor(
        @InjectRepository(Program)
        private readonly programRepository: Repository<Program>,
    ) {}

    public async getProgramById(id: string): Promise<Program> {
        const program = await this.programRepository.findOne({ where: { id } })

        if (program) {
            return program
        }

        throw new NotFoundException(`Program not found: ${id}`)
    }

    public async listCurrentPrograms(query: ListProgramsQuery): Promise<ListProgramsResult> {
        const now = new Date()
        const [programs, total] = await this.programRepository.findAndCount({
            where: {
                startAt: LessThanOrEqual(now),
                stopAt: MoreThan(now),
            },
            order: { [query.sort]: query.order.toUpperCase() as 'ASC' | 'DESC' },
            skip: (query.page - 1) * query.limit,
            take: query.limit,
        })

        return {
            programs,
            total,
            totalPages: Math.ceil(total / query.limit),
            count: programs.length,
            limit: query.limit,
        }
    }
}
