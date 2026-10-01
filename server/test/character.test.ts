import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { characterShirt, SHIRT_COLORS } from '@adda/shared';
import { characterSchema } from '../src/validators/schemas.ts';
import { world } from '../src/realtime/world.ts';

describe('character appearance (no database)', () => {
  beforeEach(() => world.reset());

  it('retains every legacy assigned shirt without customization', () => {
    for (const color of ['#3ef2e0', '#ff3ea5', '#ffe04a', '#8b6cff', '#7cff6b', '#ff8a3d', '#5ab0ff', '#ff5e5e']) {
      assert.equal(characterShirt({ color }), color);
      assert.equal(characterShirt({ color, shirtColor: null, hairStyle: 'hair02' }), color);
    }
  });

  it('accepts exactly the two hairstyles and curated shirts, rejecting CSS and extra properties', () => {
    for (const shirtColor of Object.keys(SHIRT_COLORS)) {
      for (const hairStyle of ['hair01', 'hair02']) assert.ok(characterSchema.safeParse({ shirtColor, hairStyle }).success);
    }
    assert.ok(characterSchema.safeParse({ shirtColor: null, hairStyle: 'hair01' }).success);
    for (const input of [
      { shirtColor: '#ffffff', hairStyle: 'hair01' },
      { shirtColor: 'pink', hairStyle: 'hair03' },
      { shirtColor: 'pink' },
      { shirtColor: 'pink', hairStyle: 'hair01', characterSetupComplete: true },
      { shirtColor: 'pink', hairStyle: 'hair01', id: 'another-player' },
    ]) assert.equal(characterSchema.safeParse(input).success, false);
  });

  it('updates appearance in the existing world payload without changing movement or identity', () => {
    const user = { id: 'player', name: 'Player', color: '#5ab0ff' };
    const initial = world.join(user, 'tab1').you;
    assert.equal(initial.hairStyle, 'hair01');
    const next = world.updateCharacter({ id: user.id, shirtColor: 'pink', hairStyle: 'hair02' })!;
    assert.equal(characterShirt(next), SHIRT_COLORS.pink);
    assert.equal(next.hairStyle, 'hair02');
    assert.deepEqual([next.x, next.y, next.dir, next.name, next.color], [initial.x, initial.y, initial.dir, initial.name, initial.color]);
    assert.equal(world.join({ ...user, shirtColor: 'pink', hairStyle: 'hair02' }, 'tab2').you.hairStyle, 'hair02');
    assert.equal(world.leave(user.id, 'tab1'), false);
    assert.equal(world.get(user.id)?.shirtColor, 'pink');
    assert.equal(world.leave(user.id, 'tab2'), true);
  });
});
