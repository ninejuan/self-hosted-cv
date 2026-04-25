import { QueryTypes } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';

interface ProfileCountRow {
    count: string;
}

const now = new Date();

async function seed(): Promise<void> {
    const sequelize = new Sequelize({
        dialect: 'postgres',
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        schema: process.env.DB_SCHEMA,
        logging: false,
        dialectOptions:
            process.env.DB_SSL === 'true'
                ? {
                      ssl: {
                          require: true,
                          rejectUnauthorized: false,
                      },
                  }
                : undefined,
    });

    try {
        await sequelize.authenticate();

        const [profileCount] = await sequelize.query<ProfileCountRow>('SELECT COUNT(*)::text AS count FROM profiles', {
            type: QueryTypes.SELECT,
        });

        if (Number(profileCount.count) > 0) {
            process.stdout.write('Initial seed skipped: profiles table is not empty.\n');
            return;
        }

        const queryInterface = sequelize.getQueryInterface();
        const profileId = uuidv4();
        const workSectionId = uuidv4();
        const writingSectionId = uuidv4();
        const speakingSectionId = uuidv4();
        const projectSectionId = uuidv4();
        const educationSectionId = uuidv4();
        const contactSectionId = uuidv4();

        await sequelize.transaction(async (transaction) => {
            await queryInterface.bulkInsert(
                'profiles',
                [
                    {
                        id: profileId,
                        name: 'Sara Lawrence',
                        profession: 'Product Designer and Creative Director',
                        location: 'New York, NY',
                        website: 'https://saralawrence.design',
                        bio: 'Sara Lawrence designs thoughtful tools, editorial systems, and brand moments for teams building better digital products.',
                        avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
                        slug: 'sara-lawrence',
                        meta_title: 'Sara Lawrence — Product Designer',
                        meta_description: 'Portfolio and CV for Sara Lawrence, product designer and creative director.',
                        og_image_url: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174',
                        status: 'available',
                        theme: 'system',
                        created_at: now,
                        updated_at: now,
                    },
                ],
                { transaction },
            );

            await queryInterface.bulkInsert(
                'sections',
                [
                    { id: workSectionId, profile_id: profileId, type: 'work_experience', title: 'Work Experience', sort_order: 0, visible: true, created_at: now, updated_at: now },
                    { id: writingSectionId, profile_id: profileId, type: 'writing', title: 'Writing', sort_order: 1, visible: true, created_at: now, updated_at: now },
                    { id: speakingSectionId, profile_id: profileId, type: 'speaking', title: 'Speaking', sort_order: 2, visible: true, created_at: now, updated_at: now },
                    { id: projectSectionId, profile_id: profileId, type: 'side_project', title: 'Side Projects', sort_order: 3, visible: true, created_at: now, updated_at: now },
                    { id: educationSectionId, profile_id: profileId, type: 'education', title: 'Education', sort_order: 4, visible: true, created_at: now, updated_at: now },
                    { id: contactSectionId, profile_id: profileId, type: 'contact', title: 'Contact', sort_order: 5, visible: true, created_at: now, updated_at: now },
                ],
                { transaction },
            );

            await queryInterface.bulkInsert(
                'work_experiences',
                [
                    { id: uuidv4(), section_id: workSectionId, profile_id: profileId, company: 'Figma', role: 'Design Lead', start_date: '2021-04-01', end_date: null, location: 'San Francisco, CA', description: 'Led product storytelling and systems design for collaborative creation workflows.', url: 'https://figma.com', sort_order: 0, visible: true, created_at: now, updated_at: now },
                    { id: uuidv4(), section_id: workSectionId, profile_id: profileId, company: 'Linear', role: 'Senior Product Designer', start_date: '2018-08-01', end_date: '2021-03-31', location: 'Remote', description: 'Designed planning, triage, and team collaboration experiences for high-performing product teams.', url: 'https://linear.app', sort_order: 1, visible: true, created_at: now, updated_at: now },
                    { id: uuidv4(), section_id: workSectionId, profile_id: profileId, company: 'Instrument', role: 'Interactive Designer', start_date: '2015-06-01', end_date: '2018-07-31', location: 'Portland, OR', description: 'Created brand systems and launch sites for culture, commerce, and technology clients.', url: 'https://instrument.com', sort_order: 2, visible: true, created_at: now, updated_at: now },
                ],
                { transaction },
            );

            await queryInterface.bulkInsert(
                'writings',
                [
                    { id: uuidv4(), section_id: writingSectionId, profile_id: profileId, title: 'Designing for calm collaboration', url: 'https://saralawrence.design/writing/calm-collaboration', collaborators: 'Maya Chen', thumbnail_url: null, read_time: '8 min', description: 'Notes on reducing friction in multiplayer product surfaces.', published_date: '2024-03-12', sort_order: 0, visible: true, created_at: now, updated_at: now },
                    { id: uuidv4(), section_id: writingSectionId, profile_id: profileId, title: 'The portfolio as an operating system', url: 'https://saralawrence.design/writing/portfolio-os', collaborators: null, thumbnail_url: null, read_time: '6 min', description: 'A practical framework for making personal sites easier to maintain.', published_date: '2023-10-02', sort_order: 1, visible: true, created_at: now, updated_at: now },
                ],
                { transaction },
            );

            await queryInterface.bulkInsert(
                'speakings',
                [
                    { id: uuidv4(), section_id: speakingSectionId, profile_id: profileId, title: 'Systems that make teams feel faster', location: 'Config, San Francisco', date: '2024-06-27', url: 'https://config.figma.com', sort_order: 0, visible: true, created_at: now, updated_at: now },
                ],
                { transaction },
            );

            await queryInterface.bulkInsert(
                'side_projects',
                [
                    { id: uuidv4(), section_id: projectSectionId, profile_id: profileId, name: 'Field Notes Index', url: 'https://fieldnotes.example.com', date: '2023-05-01', description: 'A searchable archive for design references, critiques, and product rituals.', sort_order: 0, visible: true, created_at: now, updated_at: now },
                ],
                { transaction },
            );

            await queryInterface.bulkInsert(
                'educations',
                [
                    { id: uuidv4(), section_id: educationSectionId, profile_id: profileId, degree: 'MFA, Interaction Design', institution: 'School of Visual Arts', start_date: '2013-09-01', end_date: '2015-05-31', location: 'New York, NY', url: 'https://sva.edu', sort_order: 0, visible: true, created_at: now, updated_at: now },
                    { id: uuidv4(), section_id: educationSectionId, profile_id: profileId, degree: 'BFA, Graphic Design', institution: 'Rhode Island School of Design', start_date: '2009-09-01', end_date: '2013-05-31', location: 'Providence, RI', url: 'https://risd.edu', sort_order: 1, visible: true, created_at: now, updated_at: now },
                ],
                { transaction },
            );

            await queryInterface.bulkInsert(
                'social_links',
                [
                    { id: uuidv4(), profile_id: profileId, platform: 'website', username: 'saralawrence.design', url: 'https://saralawrence.design', sort_order: 0, visible: true, created_at: now, updated_at: now },
                    { id: uuidv4(), profile_id: profileId, platform: 'github', username: 'saralawrence', url: 'https://github.com/saralawrence', sort_order: 1, visible: true, created_at: now, updated_at: now },
                    { id: uuidv4(), profile_id: profileId, platform: 'linkedin', username: 'sara-lawrence', url: 'https://linkedin.com/in/sara-lawrence', sort_order: 2, visible: true, created_at: now, updated_at: now },
                    { id: uuidv4(), profile_id: profileId, platform: 'figma', username: 'sara', url: 'https://figma.com/@sara', sort_order: 3, visible: true, created_at: now, updated_at: now },
                ],
                { transaction },
            );

            await queryInterface.bulkInsert(
                'app_settings',
                [{ id: uuidv4(), key: 'site.initialized', value: { seeded: true, profileSlug: 'sara-lawrence' }, updated_at: now }],
                { transaction },
            );
        });

        process.stdout.write('Initial seed completed.\n');
    } finally {
        await sequelize.close();
    }
}

seed().catch((error: unknown) => {
    const message = error instanceof Error ? error.message : 'Unknown seed error';

    process.stderr.write(`Initial seed failed: ${message}\n`);
    process.exit(1);
});
