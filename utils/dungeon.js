const DEFAULT_BOSS_NAME = 'Ancient Overlord';

function normalizeRewards(sourceRewards) {
    if (!Array.isArray(sourceRewards)) {
        return [];
    }
    return sourceRewards.map((reward) => ({ ...reward }));
}

function createBossEncounter(floor, existingEncounter = {}) {
    const bossConfig = floor?.boss ?? {};

    const rewardsSource = Array.isArray(bossConfig.rewards)
        ? bossConfig.rewards
        : existingEncounter.rewards;

    return {
        ...existingEncounter,
        type: 'boss',
        name: bossConfig.name ?? existingEncounter.name ?? DEFAULT_BOSS_NAME,
        level: bossConfig.level ?? existingEncounter.level ?? floor?.level ?? 0,
        rewards: normalizeRewards(rewardsSource ?? []),
    };
}

export function ensureBossInLastRoom(floor) {
    if (!floor || typeof floor !== 'object') {
        return floor;
    }

    const { level, rooms } = floor;

    if (level !== 4 || !Array.isArray(rooms) || rooms.length === 0) {
        return floor;
    }

    const lastRoom = rooms[rooms.length - 1];

    if (lastRoom?.type === 'boss' && lastRoom?.encounter?.type === 'boss') {
        return floor;
    }

    const updatedRooms = rooms.map((room) => ({ ...room }));
    const existingEncounter = updatedRooms[updatedRooms.length - 1]?.encounter ?? {};

    updatedRooms[updatedRooms.length - 1] = {
        ...updatedRooms[updatedRooms.length - 1],
        type: 'boss',
        encounter: createBossEncounter(floor, existingEncounter),
    };

    return {
        ...floor,
        rooms: updatedRooms,
    };
}

export function assignBossesToFloors(floors) {
    if (!Array.isArray(floors)) {
        return floors;
    }

    return floors.map((floor) => ensureBossInLastRoom(floor));
}
