<script setup lang="ts">
import { ref, onMounted, watch, defineProps, toRefs, Ref } from 'vue';
import { MdEditor } from 'md-editor-v3';
import 'md-editor-v3/lib/style.css';
import { useDark } from '@vueuse/core';
import { decryptNote, getNote, Note, removeNote, updateNote } from '../db/db';
import { useRoute, useRouter } from 'vue-router';
// @ts-ignore
import RenameBoxIcon from 'vue-material-design-icons/RenameBox.vue';
// @ts-ignore
import RemoveIcon from 'vue-material-design-icons/Delete.vue';

const props = defineProps(['aesKey', 'address'])
const { aesKey } = toRefs(props)
const route = useRoute()
const router = useRouter()
const noteId = parseFloat(route.params.id.toString())
const isDark = useDark()
const note: Ref<Note | null> = ref(null)
const text = ref('# Note');
const title = ref('Note title');
watch((text), async () => {
  if (aesKey) {
    await updateNote(noteId, aesKey?.value, { date: Date.now().toString(), content: text.value, title: title.value })
  }
})
watch((title), async () => {
  if (title) {
    await updateNote(noteId, aesKey?.value, { date: Date.now().toString(), content: text.value, title: title.value })
  }
})

onMounted(async () => {
  let _note = await getNote(noteId)
  if (_note) {
    note.value = await decryptNote(aesKey?.value, _note)
    text.value = note.value.content
    title.value = note.value.title
  }
})

async function handleRemoveNote() {
  if (confirm("Do you really want to delete?")) {
    const success = await removeNote(noteId)
    if (success) {
      router.replace({ path: "/notes" })
    }
  }
}
</script>
<template>
  <div class="flex flex-col pr-5">
    <div class="flex justify-between items-center mb-4">
      <div class="w-1/6 self-center">
        <div class="relative">
          <div class="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
            <RenameBoxIcon />
          </div>
          <input type="text" id="input-group-1" v-model="title"
            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="Note title">
        </div>
      </div>
      <button type="button" @click="handleRemoveNote()"
        class="text-red-700 w-8 self-center h-8 flex items-center content-center justify-center border border-red-700 hover:bg-red-700 hover:text-white focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm p-2.5 text-center  me-2 dark:border-red-500 dark:text-red-500 dark:hover:text-white dark:focus:ring-red-800 dark:hover:bg-red-500">
        <RemoveIcon />
      </button>
    </div>

    <MdEditor v-model="text" language="en-US" :theme="isDark ? 'dark' : 'light'"
      class="self-stretch content-stretch !h-screen !w-[calc(100vw-1.5rem)] !pr-6 !border-t-0 !border-l-0" />
  </div>
</template>