
<template>
  <article id="about">
    <section>
      <h2>About</h2>
      <div class="content">
        <p>
          Copyright &copy; 2020 - {{current_year}}<br />
          Version: {{current_version}}<br />
          <br />
          <a target="_blank" href="https://github.com/moldypenguins/Gandalf">Gandalf on GitHub</a><br />
          <a target="_blank" href="https://t.me/joinchat/HPVnlgHnFUShtg_D">Support on Telegram</a><br />
          <a target="_blank" href="https://discord.gg/Ean6FvV">Support on Discord</a>
        </p>
      </div>
    </section>
  </article>
</template>

<script>
import dayjs from 'dayjs';

export default {
  data() {
    return {
      current_year: dayjs().year(),
      current_version: '1.0.0-alpha'
    }
  }
}
</script>
