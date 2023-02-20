<script setup lang="ts">
import { useToggle } from '@vueuse/core'
import 'uno.css'
import Config from 'galadriel'
import GandalfIcon from '~/assets/icon.svg'

const [show, toggle] = useToggle(false)
</script>

<template>
  <div class="fixed right-0 bottom-0 m-5 z-100 flex items-end font-sans select-none leading-1em">
    <div
      class="bg-white text-gray-800 rounded-lg shadow w-max h-min"
      p="x-4 y-2"
      m="y-auto r-2"
      transition="opacity duration-300"
      :class="show ? 'opacity-100' : 'opacity-0'"
    >
      <h1 class="text-lg">{{ Config.alliance.name }}</h1>
      <SharedSubtitle />


    </div>
    <div
      class="flex w-10 h-10 rounded-full shadow cursor-pointer"
      bg="gray-400 hover:gray-200"
      @click="toggle()"
    >
      <GandalfIcon class="block m-auto text-white text-lg" />
    </div>
  </div>
</template>
