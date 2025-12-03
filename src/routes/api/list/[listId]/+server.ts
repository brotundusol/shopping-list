import type { RequestHandler } from './$types';
import { store } from '$lib/server/store';

export const GET: RequestHandler = async ({ params }) => {
    const { listId } = params;
    const list = store.getList(listId);

    if (!list) {
        return new Response(JSON.stringify({ error: 'List not found' }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    return new Response(JSON.stringify(list), {
        headers: { 'Content-Type': 'application/json' }
    });
};
