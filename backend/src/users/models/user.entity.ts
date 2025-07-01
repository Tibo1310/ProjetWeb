import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';

@Entity()
@ObjectType()
export class User {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Column()
  @Field()
  username: string;

  @Column({ unique: true })
  @Field()
  email: string;

  @Column()
  password: string;

  @Column('text', { array: true, default: [] })
  @Field(() => [String])
  conversationIds: string[];

  @Column({ default: false })
  @Field()
  isOnline: boolean;

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @UpdateDateColumn()
  @Field()
  updatedAt: Date;
} 