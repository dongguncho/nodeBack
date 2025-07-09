import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'datetime', precision: 6, name: 'created_at', default: () => 'CURRENT_TIMESTAMP(6)' })
  createdAt: Date;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'bit', width: 1, name: 'is_active', default: true })
  isActive: boolean;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 255 })
  password: string;

  @Column({ type: 'datetime', precision: 6, name: 'updated_at', default: () => 'CURRENT_TIMESTAMP(6)', onUpdate: 'CURRENT_TIMESTAMP(6)' })
  updatedAt: Date;
} 