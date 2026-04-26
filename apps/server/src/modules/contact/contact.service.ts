import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';

import { CreateContactDto } from './dto/create-contact.dto';
import { ReorderDto } from './dto/reorder.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { SocialLink } from './entities/social-link.entity';

@Injectable()
export class ContactService {
  constructor(
    @InjectModel(SocialLink)
    private readonly socialLinkModel: typeof SocialLink,
    private readonly sequelize: Sequelize,
  ) {}

  findAll(): Promise<SocialLink[]> {
    return this.socialLinkModel.findAll({
      order: [
        ['sortOrder', 'ASC'],
        ['createdAt', 'ASC'],
      ],
    });
  }

  create(dto: CreateContactDto): Promise<SocialLink> {
    return this.socialLinkModel.create({
      ...dto,
      sortOrder: dto.sortOrder ?? 0,
      visible: dto.visible ?? true,
    });
  }

  async update(id: string, dto: UpdateContactDto): Promise<SocialLink> {
    const item = await this.findOne(id);

    await item.update(dto);

    return item;
  }

  async delete(id: string): Promise<{ id: string }> {
    const item = await this.findOne(id);

    await item.destroy();

    return { id };
  }

  async reorder(dto: ReorderDto): Promise<SocialLink[]> {
    await this.sequelize.transaction(async (transaction) => {
      await Promise.all(
        dto.items.map((item) =>
          this.socialLinkModel.update(
            { sortOrder: item.sortOrder },
            { where: { id: item.id }, transaction },
          ),
        ),
      );
    });

    return this.findAll();
  }

  private async findOne(id: string): Promise<SocialLink> {
    const item = await this.socialLinkModel.findByPk(id);

    if (!item) {
      throw new NotFoundException('Contact link not found');
    }

    return item;
  }
}
