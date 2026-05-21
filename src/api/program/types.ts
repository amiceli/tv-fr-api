import { PaginatedResponse, SortQuery } from '@/api/types'
import { Program } from '@/xml-tv/entities/program.entity'

export type ListProgramsQuery = {
    page: number
    limit: number
    sort: ProgramSortField
    order: SortQuery
}

export enum ProgramSortField {
    StartAt = 'startAt',
    Title = 'title',
}

export type ProgramDetails = Omit<Program, 'xmlStart' | 'xmlStop'> & {
    channelDisplayName: string
}

export type PaginatedProgramsResponse = PaginatedResponse & {
    programs: ProgramDetails[]
}
