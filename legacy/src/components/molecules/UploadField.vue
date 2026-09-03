<script setup lang="ts">
const model = defineModel();

const { format, label } = defineProps<{
  label: string;
  format: string;
}>();
</script>

<template>
  <div class="w-full relative border-2 border-gray-300 border-dashed rounded-lg p-6">
    <!-- <input type="file" class="absolute inset-0 w-full h-full opacity-0 z-50" /> -->
    <div class="font-bold">{{ label }}</div>
    <div class="text-center">
      <img class="mx-auto h-12 w-12" src="https://www.svgrepo.com/show/357902/image-upload.svg" alt="" />

      <h3 class="mt-2 text-sm font-medium text-gray-900">
        <label for="file-upload" class="relative cursor-pointer">
          <span>Drag and drop</span>
          <span class="text-indigo-600">or browse</span>
          <span>to upload</span>
          <input
            id="file-upload"
            name="file-upload"
            type="file"
            class="sr-only"
            @input="(event: any) => event.target && (model = event.target.files?.[0] || null)"
          />
        </label>
      </h3>
      <p class="mt-1 text-xs text-ink-muted">{{ format }} max 10MB</p>
    </div>
    <div v-if="model">{{ (model as any)?.name ?? "No file selected" }}</div>
    <img src="" class="mt-4 mx-auto max-h-40 hidden" id="preview" />
  </div>
</template>
