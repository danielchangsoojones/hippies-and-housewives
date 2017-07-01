class Analytic {
    static types() {
        let types = {
            openOrders: "openOrders",
            itemsToCut: "itemsToCut",
            itemsToSew: "itemsToSew",
            allocatedInventoryCount: "allocatedInventoryCount",
            openPicks: "openPicks",
            openShipping: "openShipping",
            lastShippedOrders: "lastShippedOrders",
            lastShippedItems: "lastShippedItems"
        }
        return types;
    }
}

module.exports = Analytic;