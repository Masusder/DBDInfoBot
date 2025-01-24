import { Collection } from 'discord.js';

export class CooldownManager {
    private cooldowns: Collection<string, number>;

    constructor() {
        this.cooldowns = new Collection();
    }

    isOnCooldown(userId: string, commandName: string): boolean {
        const key = `${userId}:${commandName}`;
        const expiresAt = this.cooldowns.get(key);

        if (!expiresAt) return false;

        if (Date.now() > expiresAt) {
            this.cooldowns.delete(key);
            return false;
        }

        return true;
    }

    setCooldown(userId: string, commandName: string, cooldownInSeconds: number): void {
        const key = `${userId}:${commandName}`;
        const expiresAt = Date.now() + cooldownInSeconds * 1000;
        this.cooldowns.set(key, expiresAt);
    }

    getRemainingCooldown(userId: string, commandName: string): number {
        const key = `${userId}:${commandName}`;
        const expiresAt = this.cooldowns.get(key);

        if (!expiresAt) return 0;

        const remainingTime = expiresAt - Date.now();
        return remainingTime > 0 ? remainingTime : 0;
    }
}