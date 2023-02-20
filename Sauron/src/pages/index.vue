<script setup lang="ts" generic="T extends any, O extends any">
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
      <a rel="noreferrer" href="https://github.com/antfu/vitesse-lite" target="_blank">
        Gandalf
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

    <div>
      <button class="m-3 text-sm btn" :disabled="!name" @click="go">
        Go
      </button>
    </div>
  </div>
</template>
