import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity()
export class Channel {
    @PrimaryGeneratedColumn('uuid')
    public id: string

    @Column({ type: 'varchar', nullable: false })
    public name: string
}
