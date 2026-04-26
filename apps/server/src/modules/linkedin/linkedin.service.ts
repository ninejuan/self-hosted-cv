import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import AdmZip from 'adm-zip';
import { parse } from 'csv-parse/sync';

import { Education } from '@/modules/education/entities/education.entity';
import { WorkExperience } from '@/modules/experience/entities/work-experience.entity';
import { Profile } from '@/modules/profile/entities/profile.entity';

import { LinkedinImportDto } from './dto/import-linkedin.dto';

type CsvRow = Record<string, string | undefined>;

interface LinkedinPreview {
  profile: Record<string, string | null>;
  positions: Array<Record<string, string | null>>;
  educations: Array<Record<string, string | null>>;
  skills: string[];
}

@Injectable()
export class LinkedinService {
  constructor(
    @InjectModel(Profile) private readonly profileModel: typeof Profile,
    @InjectModel(WorkExperience)
    private readonly experienceModel: typeof WorkExperience,
    @InjectModel(Education) private readonly educationModel: typeof Education,
  ) {}

  preview(file?: Express.Multer.File): LinkedinPreview {
    if (!file) {
      throw new BadRequestException('LinkedIn export ZIP is required');
    }

    const zip = new AdmZip(file.buffer);

    return {
      profile: this.parseProfile(this.readCsv(zip, 'Profile.csv')),
      positions: this.readCsv(zip, 'Positions.csv').map((row) => ({
        company: this.pick(row, ['Company Name', 'Company']),
        role: this.pick(row, ['Title', 'Position']),
        startDate: this.toDate(this.pick(row, ['Started On', 'Start Date'])),
        endDate: this.toDate(this.pick(row, ['Finished On', 'End Date'])),
        location: this.pick(row, ['Location']),
        description: this.pick(row, ['Description']),
      })),
      educations: this.readCsv(zip, 'Education.csv').map((row) => ({
        institution: this.pick(row, ['School Name', 'Institution']),
        degree:
          [
            this.pick(row, ['Degree Name', 'Degree']),
            this.pick(row, ['Field Of Study', 'Field']),
          ]
            .filter(Boolean)
            .join(', ') || null,
        startDate: this.toDate(this.pick(row, ['Started On', 'Start Date'])),
        endDate: this.toDate(this.pick(row, ['Finished On', 'End Date'])),
        description: this.pick(row, ['Notes', 'Activities']),
      })),
      skills: this.readCsv(zip, 'Skills.csv')
        .map((row) => this.pick(row, ['Name', 'Skill']))
        .filter((value): value is string => value !== null),
    };
  }

  async import(
    dto: LinkedinImportDto,
  ): Promise<{ experiencesImported: number; educationsImported: number }> {
    let experiencesImported = 0;
    let educationsImported = 0;

    if (dto.mergeProfile) {
      await this.profileModel.findOne({ order: [['createdAt', 'ASC']] });
    }

    for (const position of dto.positions ?? []) {
      const exists = await this.experienceModel.findOne({
        where: {
          company: position.company,
          role: position.role,
          startDate: position.startDate,
        },
      });

      if (!exists) {
        await this.experienceModel.create({
          ...position,
          sortOrder: position.sortOrder ?? 0,
          visible: position.visible ?? true,
        });
        experiencesImported += 1;
      }
    }

    for (const education of dto.educations ?? []) {
      const exists = await this.educationModel.findOne({
        where: {
          institution: education.institution,
          degree: education.degree,
          startDate: education.startDate,
        },
      });

      if (!exists) {
        await this.educationModel.create({
          ...education,
          sortOrder: education.sortOrder ?? 0,
          visible: education.visible ?? true,
        });
        educationsImported += 1;
      }
    }

    return { experiencesImported, educationsImported };
  }

  private readCsv(zip: AdmZip, fileName: string): CsvRow[] {
    const entry = zip
      .getEntries()
      .find((candidate) => candidate.entryName.endsWith(fileName));

    if (!entry) {
      return [];
    }

    return parse(entry.getData().toString('utf8'), {
      columns: true,
      skip_empty_lines: true,
      bom: true,
      trim: true,
    });
  }

  private parseProfile(rows: CsvRow[]): Record<string, string | null> {
    const [row] = rows;

    if (!row) {
      return {};
    }

    return {
      firstName: this.pick(row, ['First Name']),
      lastName: this.pick(row, ['Last Name']),
      headline: this.pick(row, ['Headline']),
      location: this.pick(row, ['Geo Location', 'Location']),
      summary: this.pick(row, ['Summary']),
      publicProfileUrl: this.pick(row, [
        'Public Profile Url',
        'Public Profile URL',
      ]),
    };
  }

  private pick(row: CsvRow, keys: string[]): string | null {
    for (const key of keys) {
      const value = row[key]?.trim();

      if (value) {
        return value;
      }
    }

    return null;
  }

  private toDate(value: string | null): string | null {
    if (!value) {
      return null;
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return null;
    }

    return date.toISOString().slice(0, 10);
  }
}
