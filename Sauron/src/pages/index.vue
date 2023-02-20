<script setup lang="ts" generic="T extends any, O extends any">
import Config from 'galadriel'

defineOptions({
  name: 'IndexPage',
})

const name = $ref('')

const router = useRouter()
const go = () => {
  if (name)
    router.push(`/hi/${encodeURIComponent(name)}`)
}
</script>

<template>
  <div>
    <img src="/logo.png" alt="Gandalf" class="mx-auto" />
    <h1 mt-5>
      <a rel="noreferrer" href="http://localhost:3333/" target="_blank">
        {{ Config.alliance.name }}
      </a>
    </h1>
    <p>
      <em text-sm op75>Planetarion Tools</em>
    </p>

    <div py-4 />

    <TheInput
      v-model="name"
      placeholder="What's your panick?"
      autocomplete="false"
      @keydown.enter="go"
    />

    <TheCounter my-5 />

    <div>
      <button class="m-3 text-sm btn" :disabled="!name" @click="go">
        Go
      </button>
    </div>
  </div>
</template>
