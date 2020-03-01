<template>
  <div id="app">
    <router-view />
  </div>
</template>

<style lang="scss">
html {
  box-sizing: border-box;
}

*,
*:before,
*:after {
  box-sizing: inherit;
}

html,
body {
  margin: 0;
  padding: 0;
}

#app {
  position: relative;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}

canvas {
  display: block;
  border: 1px solid red;
}
</style>
