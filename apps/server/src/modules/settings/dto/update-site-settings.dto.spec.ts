import { validate } from 'class-validator';

import { UpdateSiteSettingsDto } from './update-site-settings.dto';

describe('UpdateSiteSettingsDto', () => {
  it('rejects a script payload as a Google Analytics measurement ID', async () => {
    const dto = Object.assign(new UpdateSiteSettingsDto(), {
      googleAnalyticsId: '<script>alert(1)</script>',
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(1);
    expect(errors[0]?.property).toBe('googleAnalyticsId');
  });

  it.each(['', 'G-ABCD', 'G-ABC12345678901234567'])(
    'accepts the allowlisted Google Analytics measurement ID value %p',
    async (googleAnalyticsId) => {
      const dto = Object.assign(new UpdateSiteSettingsDto(), {
        googleAnalyticsId,
      });

      await expect(validate(dto)).resolves.toHaveLength(0);
    },
  );
});
