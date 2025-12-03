// src/routes/api/list/[listId]/items/+server.ts

import type { RequestHandler } from './$types';
import { store } from '$lib/server/store';
import { v4 as uuidv4 } from 'uuid';

export const POST: RequestHandler = async ({ params, request }) => {
    const { listId } = params;
    const { text } = await request.json();
    const item = {
        id: uuidv4(),
        text,
        completed: false
    };
    const added = store.addItem(listId, item);
    if (!added) {
        return new Response(JSON.stringify({ error: 'List not found' }), { status: 404 });
    }
    return new Response(JSON.stringify(added), {
        status: 201,
        headers: { 'Content-Type': 'application/json' }
    });
};

export const PATCH: RequestHandler = async ({ params, request }) => {
    const { listId } = params;
    const url = new URL(request.url);
    const itemId = url.searchParams.get('itemId');
    if (!itemId) {
        return new Response(JSON.stringify({ error: 'itemId query param required' }), { status: 400 });
    }
    const toggled = store.toggleItem(listId, itemId);
    if (!toggled) {
        return new Response(JSON.stringify({ error: 'List or item not found' }), { status: 404 });
    }
    return new Response(JSON.stringify(toggled), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
    });
};
