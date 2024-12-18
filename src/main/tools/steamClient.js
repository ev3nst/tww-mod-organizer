import steamworks from 'steamworks.js';

class SteamClient {
    currentSteamId = null;
    client = null;

    getClient(steamId) {
        delete this.currentSteamId;
        delete this.client;

        this.currentSteamId = steamId;
        this.client = steamworks.init(steamId);

        return this.client;
    }

    async getSubscribedItems(steamId) {
        const client = this.getClient(steamId);
        const subscribedItems = await client.workshop.getSubscribedItems();
        return subscribedItems;
    }

    async getItems(steamId, subscribedModIds) {
        const client = this.getClient(steamId);
        return await client.workshop.getItems(subscribedModIds);
    }

    async unsubscribe(steamId, workshopItemId) {
        const client = this.getClient(steamId);
        return await client.workshop.unsubscribe(BigInt(workshopItemId));
    }

    async state(steamId, workshopItemId) {
        const client = this.getClient(steamId);
        return await client.workshop.state(BigInt(workshopItemId));
    }

    async updateItem(steamId, workshopItemId, updateDetails = undefined) {
        const client = this.getClient(steamId);
        return await client.workshop.updateItem(
            BigInt(workshopItemId),
            updateDetails,
            steamId,
        );
    }
}

const steamClient = new SteamClient();
export default steamClient;
