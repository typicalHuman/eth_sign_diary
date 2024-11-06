<script setup lang="ts">
import { defineProps } from "vue"
import { RouterLink } from "vue-router";
import { formatTimestamp } from "../utils/utils";
defineProps(['name', 'id', 'date'])
</script>


<template>
    <RouterLink :to="`/notes/${id}`"
        class="block min-w-1/6 p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700">
        <h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{{ name }}</h5>
        <p class="font-normal text-gray-700 dark:text-gray-400">{{ formatTimestamp(date) }}
        </p>
    </RouterLink>
</template>