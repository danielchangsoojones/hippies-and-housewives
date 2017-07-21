class Analytic {
    static types() {
        let types = {
            openOrders: "openOrders",
            newestOrders: "newestOrders",
            newestItems: "newestItems",
            newestItemsCost: "newestItemsCost",
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