<script setup lang="ts">
import Card from '../components/Card.vue';
import { defineProps, onMounted, Ref, ref, toRefs } from "vue";
import { addNote, decryptNote, getWalletNotes, Note } from '../db/db';
// @ts-ignore
import AddIcon from 'vue-material-design-icons/Plus.vue';

const props = defineProps(['aesKey', 'address'])
const { aesKey, address } = toRefs(props)
const notes: Ref<Note[]> = ref([])

onMounted(async () => {
    const userNotes = await getWalletNotes(address?.value)
    const _notes = []
    for (const un of userNotes) {
        _notes.push(await decryptNote(aesKey?.value, un))
    }
    notes.value = _notes.sort((a, b) => parseFloat(b.date) - parseFloat(a.date))
})

async function handleAddNote() {
    let newNote = { wallet: address?.value, title: 'New note', date: Date.now().toString(), content: "# Note" }
    let id = await addNote(aesKey?.value, address?.value, newNote.title, newNote.date, newNote.content)
    if (id) {
        notes.value = [{ id, ...newNote }, ...notes.value]
    }
}
</script>

<template>
    <div class="flex flex-col items-stretch gap-y-5 px-4 ">
        <button type="button" @click="handleAddNote()"
            class="text-lime-700 w-32 self-center h-16 flex items-center content-center justify-center border border-lime-700 hover:bg-lime-700 hover:text-white focus:ring-4 focus:outline-none focus:ring-lime-300 font-medium rounded-lg text-sm p-2.5 text-center  me-2 dark:border-lime-500 dark:text-lime-500 dark:hover:text-white dark:focus:ring-lime-800 dark:hover:bg-lime-500">
            <AddIcon />
        </button>
        <div class="grid grid-cols-1 xl:grid-cols-5 gap-9 py-3 ">
            <Card v-for="note in notes" :date="note.date" :name="note.title" :id="note.id"></Card>
        </div>
    </div>
</template>