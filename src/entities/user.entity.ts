import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id: string;

  @Column({ type: 'datetime', precision: 6, name: 'created_at' })
  createdAt: Date;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'bit', width: 1, name: 'is_active' })
  isActive: boolean;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 255 })
  password: string;

  @Column({ type: 'datetime', precision: 6, name: 'updated_at' })
  updatedAt: Date;
} 