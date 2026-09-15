type AsyncModelMethod<Result> = jest.MockedFunction<
  (...args: unknown[]) => Promise<Result>
>;

export type MockModel<T = unknown> = {
  readonly findOne: AsyncModelMethod<T | null>;
  readonly findAll: AsyncModelMethod<T[]>;
  readonly findByPk: AsyncModelMethod<T | null>;
  readonly findAndCountAll: AsyncModelMethod<{ count: number; rows: T[] }>;
  readonly create: AsyncModelMethod<T>;
  readonly upsert: AsyncModelMethod<[T, boolean | null]>;
  readonly destroy: AsyncModelMethod<number>;
  readonly update: AsyncModelMethod<[number]>;
};

export function createMockModel<T = unknown>(): MockModel<T> {
  return {
    findOne: jest.fn<Promise<T | null>, unknown[]>(),
    findAll: jest.fn<Promise<T[]>, unknown[]>(),
    findByPk: jest.fn<Promise<T | null>, unknown[]>(),
    findAndCountAll: jest.fn<
      Promise<{ count: number; rows: T[] }>,
      unknown[]
    >(),
    create: jest.fn<Promise<T>, unknown[]>(),
    upsert: jest.fn<Promise<[T, boolean | null]>, unknown[]>(),
    destroy: jest.fn<Promise<number>, unknown[]>(),
    update: jest.fn<Promise<[number]>, unknown[]>(),
  };
}
