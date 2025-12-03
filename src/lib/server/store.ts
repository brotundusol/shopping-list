// src/lib/server/store.ts

import { EventEmitter } from 'events';

export interface ShoppingItem {
    id: string;
    text: string;
    completed: boolean;
}

export interface ShoppingList {
    id: string;
    items: ShoppingItem[];
}

class Store extends EventEmitter {
    private lists: Map<string, ShoppingList> = new Map();

    createList(listId: string): ShoppingList {
        const list: ShoppingList = { id: listId, items: [] };
        this.lists.set(listId, list);
        this.emit('listCreated', list);
        return list;
    }

    getList(listId: string): ShoppingList | undefined {
        return this.lists.get(listId);
    }

    addItem(listId: string, item: ShoppingItem): ShoppingItem | undefined {
        const list = this.lists.get(listId);
        if (!list) return undefined;
        list.items.push(item);
        this.emit('itemAdded', { listId, item });
        return item;
    }

    toggleItem(listId: string, itemId: string): ShoppingItem | undefined {
        const list = this.lists.get(listId);
        if (!list) return undefined;
        const item = list.items.find(i => i.id === itemId);
        if (!item) return undefined;
        item.completed = !item.completed;
        this.emit('itemToggled', { listId, item });
        return item;
    }
}

export const store = new Store();
