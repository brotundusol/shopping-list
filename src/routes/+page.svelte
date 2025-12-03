<script lang="ts">
    import { goto } from "$app/navigation";

    async function createList() {
        const res = await fetch("/api/list", { method: "POST" });
        if (!res.ok) {
            alert("Failed to create list");
            return;
        }
        const { listId } = await res.json();
        // redirect to the newly created list page
        goto(`/list/${listId}`);
    }
</script>

<div
    class="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 bg-size-200 animate-breathing text-white p-4"
>
    <div
        class="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20 max-w-md w-full text-center transform transition-all hover:scale-[1.01]"
    >
        <div class="mb-6">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-16 w-16 mx-auto text-white/90"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
            </svg>
        </div>
        <h1 class="text-4xl font-extrabold mb-2 tracking-tight drop-shadow-md">
            ShopSync
        </h1>
        <p class="text-lg text-white/80 mb-8 font-light">
            Realtime shopping lists, simplified.
        </p>

        <button
            class="group relative w-full px-6 py-4 bg-white text-indigo-600 font-bold rounded-xl shadow-lg hover:shadow-xl hover:bg-indigo-50 transition-all duration-200 ease-out transform hover:-translate-y-1 active:translate-y-0 focus:outline-none focus:ring-4 focus:ring-white/30"
            on:click={createList}
        >
            <span class="flex items-center justify-center gap-2">
                <span>Create New List</span>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5 transition-transform group-hover:translate-x-1"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                >
                    <path
                        fill-rule="evenodd"
                        d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                        clip-rule="evenodd"
                    />
                </svg>
            </span>
        </button>
    </div>

    <footer class="mt-12 text-white/40 text-sm font-medium">
        &copy; {new Date().getFullYear()} Realtime Shopping
    </footer>
</div>
