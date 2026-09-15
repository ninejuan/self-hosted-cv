import 'reflect-metadata';
import { IS_PUBLIC_KEY, Public } from './public.decorator';

describe('Public', () => {
  it('sets IS_PUBLIC_KEY metadata true on target', () => {
    class Target {}
    Public()(Target);
    expect(Reflect.getMetadata(IS_PUBLIC_KEY, Target)).toBe(true);
  });
});
