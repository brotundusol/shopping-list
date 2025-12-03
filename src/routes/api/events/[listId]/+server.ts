// src/routes/api/events/[listId]/+server.ts

import type { RequestHandler } from './$types';
import { store } from '$lib/server/store';

export const GET: RequestHandler = async ({ params }) => {
    const { listId } = params;
    const headers = new Headers({
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive'
    });

    let cleanup = () => { };

    const stream = new ReadableStream({
        start(controller) {
            // Send initial comment to keep connection alive
            controller.enqueue(new TextEncoder().encode('retry: 1000\n\n'));

            const listener = (event: any) => {
                try {
                    const data = JSON.stringify(event);
                    controller.enqueue(new TextEncoder().encode(`data: ${data}\n\n`));
                } catch (err) {
                    console.error('SSE Error:', err);
                    // If we can't enqueue, the controller might be closed or errored.
                    // We should probably stop listening.
                    cleanup();
                    try { controller.close(); } catch { }
                }
            };

            // Wrap emitted data with a type field
            const wrap = (type: string) => (payload: any) => {
                // Only send events for this list
                if (payload.listId === listId) {
                    listener({ type, ...payload });
                }
            };

            const onAdded = wrap('itemAdded');
            const onToggled = wrap('itemToggled');
            const onCreated = wrap('listCreated');

            store.on('itemAdded', onAdded);
            store.on('itemToggled', onToggled);
            store.on('listCreated', onCreated);

            // Assign cleanup function to be called on cancel
            cleanup = () => {
                store.off('itemAdded', onAdded);
                store.off('itemToggled', onToggled);
                store.off('listCreated', onCreated);
            };
        },
        cancel() {
            cleanup();
        }
    });

    return new Response(stream, { headers });
};
