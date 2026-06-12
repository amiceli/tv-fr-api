import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity()
export class TmdbDetails {
    @PrimaryGeneratedColumn('uuid')
    public id: string

    @Column({ type: 'varchar', nullable: false, unique: true })
    public title: string

    @Column({ type: 'boolean', default: false })
    public isMovie: boolean

    @Column({ type: 'numeric', nullable: true, unique: true, default: null })
    public tmdbId: number | null

    @Column({ type: 'varchar', nullable: true, unique: true, default: null })
    public originalName: string | null

    @Column({ type: 'numeric', nullable: true, default: null })
    public popularity: number | null

    @Column({ type: 'numeric', nullable: true, default: null })
    public voteCount: number | null

    @Column({ type: 'varchar', nullable: true, default: null })
    public poster: string | null

    public get tmdbUrl(): string | null {
        const { tmdbId, originalName } = this
        const tmdbURI = this.isMovie ? 'movie' : 'tv'

        if (tmdbId && originalName) {
            return `https://www.themoviedb.org/${tmdbURI}/${tmdbId}-${originalName.toLowerCase()}`
        }

        return null
    }
}
