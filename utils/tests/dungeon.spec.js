import { describe, expect, it } from 'vitest';
import { assignBossesToFloors, ensureBossInLastRoom } from '../dungeon.js';

describe('ensureBossInLastRoom', () => {
    it('adds a boss encounter to the last room of a level 4 floor', () => {
        const floor = {
            level: 4,
            boss: {
                name: 'Storm Hydra',
                level: 12,
                rewards: [{ id: 'relic-1', name: 'Relic of Storms' }],
            },
            rooms: [
                { id: 1, type: 'combat' },
                { id: 2, type: 'treasure' },
            ],
        };

        const result = ensureBossInLastRoom(floor);

        expect(result).not.toBe(floor);
        expect(result.rooms).toHaveLength(2);
        expect(result.rooms[1]).toMatchObject({
            id: 2,
            type: 'boss',
            encounter: {
                type: 'boss',
                name: 'Storm Hydra',
                level: 12,
                rewards: [{ id: 'relic-1', name: 'Relic of Storms' }],
            },
        });

        // ensure we did not mutate original structure
        expect(floor.rooms[1].type).toBe('treasure');
        expect(floor.rooms[1].encounter).toBeUndefined();
    });

    it('returns the original floor when the boss already exists', () => {
        const bossRoom = {
            id: 3,
            type: 'boss',
            encounter: {
                type: 'boss',
                name: 'Existing Guardian',
                level: 15,
                rewards: [{ id: 'gem', name: 'Radiant Gem' }],
                phases: 2,
            },
        };

        const floor = {
            level: 4,
            rooms: [{ id: 1, type: 'puzzle' }, bossRoom],
        };

        const result = ensureBossInLastRoom(floor);

        expect(result).toBe(floor);
        expect(result.rooms[1]).toBe(bossRoom);
    });

    it('ignores floors that are not level 4 or without rooms', () => {
        const emptyFloor = { level: 4, rooms: [] };
        const lowLevelFloor = { level: 3, rooms: [{ id: 1, type: 'combat' }] };

        expect(ensureBossInLastRoom(emptyFloor)).toBe(emptyFloor);
        expect(ensureBossInLastRoom(lowLevelFloor)).toBe(lowLevelFloor);
        expect(ensureBossInLastRoom(null)).toBeNull();
    });
});

describe('assignBossesToFloors', () => {
    it('ensures every level 4 floor has a boss in the last room', () => {
        const floors = [
            {
                level: 4,
                boss: { name: 'Frost Titan', level: 10 },
                rooms: [
                    { id: 'a', type: 'combat' },
                    { id: 'b', type: 'empty' },
                ],
            },
            {
                level: 2,
                rooms: [{ id: 'c', type: 'puzzle' }],
            },
        ];

        const result = assignBossesToFloors(floors);

        expect(result[0].rooms[1].type).toBe('boss');
        expect(result[0].rooms[1].encounter.type).toBe('boss');
        expect(result[1].rooms[0].type).toBe('puzzle');
    });
});
