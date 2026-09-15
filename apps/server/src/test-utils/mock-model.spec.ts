import { createMockModel } from './mock-model';

describe('mockModel', () => {
  it('returns a jest.fn-backed findOne that resolves the queued value', async () => {
    const m = createMockModel();
    m.findOne.mockResolvedValueOnce({ value: { x: 1 } });

    await expect(m.findOne()).resolves.toEqual({ value: { x: 1 } });
    expect(jest.isMockFunction(m.upsert)).toBe(true);
  });
});
