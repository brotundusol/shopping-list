<script lang="ts">
  import { onMount } from "svelte";
  import { page } from "$app/stores";
  import { writable } from "svelte/store";

  type ShoppingItem = {
    id: string;
    text: string;
    completed: boolean;
  };

  const items = writable<ShoppingItem[]>([]);
  let newItemText = "";
  let listId: string;

  // Get listId from URL params
  const unsub = page.subscribe(($p) => {
    listId = $p.params.listId ?? "";
  });

  // SSE connection
  let es: EventSource;

  function connectSSE() {
    es = new EventSource(`/api/events/${listId}`);

    es.onmessage = (e) => {
      const data = JSON.parse(e.data);
      switch (data.type) {
        case "listCreated":
          items.set([]);
          break;
        case "itemAdded":
          items.update((a) => [...a, data.item]);
          break;
        case "itemToggled":
          items.update((a) =>
            a.map((it) => (it.id === data.item.id ? data.item : it)),
          );
          break;
      }
    };

    es.onerror = () => {
      console.error("SSE error – reconnecting...");
      es.close();
      setTimeout(connectSSE, 2000);
    };
  }

  async function addItem() {
    if (!newItemText.trim()) return;
    const res = await fetch(`/api/list/${listId}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: newItemText }),
    });
    if (!res.ok) {
      alert("Failed to add item");
      return;
    }
    newItemText = "";
    // SSE will push the new item
  }

  async function toggleItem(itemId: string) {
    const res = await fetch(`/api/list/${listId}/items?itemId=${itemId}`, {
      method: "PATCH",
    });
    if (!res.ok) {
      alert("Failed to toggle item");
    }
    // SSE will update UI
  }

  onMount(() => {
    connectSSE();

    // Fetch initial state
    (async () => {
      try {
        const res = await fetch(`/api/list/${listId}`);
        if (res.ok) {
          const data = await res.json();
          items.set(data.items);
        }
      } catch (err) {
        console.error("Failed to fetch list:", err);
      }
    })();

    return () => {
      es?.close();
      unsub();
    };
  });
  // Toast state
  let showToast = false;
  function triggerToast() {
    showToast = true;
    setTimeout(() => (showToast = false), 3000);
  }
</script>

<div
  class="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 bg-size-200 animate-breathing py-12 px-4 sm:px-6 lg:px-8"
>
  <div
    class="max-w-2xl mx-auto bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden border border-white/20"
  >
    <!-- Header -->
    <div class="bg-indigo-600 px-6 py-8 text-center relative overflow-hidden">
      <div
        class="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-90"
      ></div>
      <div class="relative z-10">
        <h2 class="text-3xl font-bold text-white tracking-tight">
          Shopping List
        </h2>
        <p class="text-indigo-100 mt-1 text-sm">Realtime collaboration</p>
      </div>
    </div>

    <div class="p-6 sm:p-8">
      <!-- Add Item -->
      <form class="flex gap-3 mb-8 group" on:submit|preventDefault={addItem}>
        <div class="relative flex-1">
          <input
            type="text"
            bind:value={newItemText}
            placeholder="Add a new item..."
            class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder-gray-400 text-gray-700"
          />
        </div>
        <button
          type="submit"
          class="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl shadow-md hover:bg-indigo-700 hover:shadow-lg transition-all duration-200 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center gap-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
              clip-rule="evenodd"
            />
          </svg>
          Add
        </button>
      </form>

      <!-- Items -->
      <div class="space-y-3">
        {#if $items.length === 0}
          <div
            class="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-12 w-12 mx-auto text-gray-300 mb-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <p class="text-gray-500 font-medium">Your list is empty</p>
            <p class="text-gray-400 text-sm mt-1">
              Add some items to get started!
            </p>
          </div>
        {:else}
          <ul class="space-y-2">
            {#each $items as item (item.id)}
              <li
                class="group flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100"
              >
                <div class="relative flex items-center">
                  <input
                    type="checkbox"
                    checked={item.completed}
                    on:change={() => toggleItem(item.id)}
                    class="peer h-6 w-6 cursor-pointer appearance-none rounded-lg border-2 border-gray-300 transition-all checked:border-indigo-500 checked:bg-indigo-500 hover:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20"
                    data-item-id={item.id}
                  />
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="pointer-events-none absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 transition-opacity peer-checked:opacity-100"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </div>
                <span
                  class="flex-1 text-lg transition-all duration-200 {item.completed
                    ? 'text-gray-400 line-through decoration-2 decoration-gray-300'
                    : 'text-gray-700 font-medium'}"
                >
                  {item.text}
                </span>
              </li>
            {/each}
          </ul>
        {/if}
      </div>

      <!-- Share -->
      <div class="mt-10 pt-6 border-t border-gray-100">
        <button
          class="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-50 text-indigo-700 font-semibold rounded-xl hover:bg-indigo-100 transition-colors border border-indigo-100"
          on:click={() => {
            navigator.clipboard.writeText(window.location.href);
            triggerToast();
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z"
            />
          </svg>
          Copy Shareable Link
        </button>
      </div>
    </div>
  </div>

  <!-- Toast Notification -->
  {#if showToast}
    <div
      class="fixed bottom-6 right-6 bg-gray-900 text-white px-6 py-3 rounded-lg shadow-xl flex items-center gap-3 animate-fade-in-up z-50"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-5 w-5 text-green-400"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fill-rule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
          clip-rule="evenodd"
        />
      </svg>
      <span class="font-medium">Link copied to clipboard!</span>
    </div>
  {/if}
</div>
