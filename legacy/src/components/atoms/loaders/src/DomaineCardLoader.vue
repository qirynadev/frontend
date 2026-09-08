<template>
  <div class="categorie p-3">
    <div class="header rounded-3 pulsate p-2"></div>
    <div class="mt-3 ps-4">
      <div class="block2 pulsate"></div>
      <div class="block3 pulsate"></div>
      <div class="block pulsate"></div>
      <div class="block2 pulsate"></div>
      <div class="block pulsate"></div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.categorie {
  border: 1px solid #c0c0c069;
  border-radius: 5px;
  width: 100%;
  min-height: 235px;

  .header {
    height: 35px;
  }
}

.pulsate {
  background: linear-gradient(-45deg, #dddddd, #f0f0f0, #dddddd, #f0f0f0);
  background-size: 400% 400%;
  -webkit-animation: Gradient 2.25s ease infinite;
  -moz-animation: Gradient 2.25s ease infinite;
  animation: Gradient 2.25s ease infinite;
}
.block {
  width: 25%;
  height: 8px;
  margin-bottom: 8px;
}

.block2 {
  width: 60%;
  height: 8px;
  margin-bottom: 8px;
}
.block3 {
  width: 40%;
  height: 8px;
  margin-bottom: 8px;
}
@-webkit-keyframes Gradient {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

@-moz-keyframes Gradient {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

@keyframes Gradient {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}
</style>
