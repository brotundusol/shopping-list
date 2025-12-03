// src/routes/api/list/+server.ts

import type { RequestHandler } from './$types';
import { store } from '$lib/server/store';
import { v4 as uuidv4 } from 'uuid';

export const POST: RequestHandler = async () => {
    const listId = uuidv4();
    const list = store.createList(listId);
    return new Response(JSON.stringify({ listId: list.id }), {
        status: 201,
        headers: { 'Content-Type': 'application/json' }
    });
};
