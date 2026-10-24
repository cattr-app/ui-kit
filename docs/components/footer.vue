<template>
  <footer class="footer">
    <div class="container">
      <div class="footer-desc">
        <div class="footer-copyright">© Cattr Team</div>
      </div>
      <div class="github-logo">
        <a href="https://github.com/cattr-app/ui-kit" target="_blank">Github</a>
      </div>
    </div>
  </footer>
</template>

<style lang="scss">
@import '~stylesheet/src/variables/index.scss';
@import '../assets/style/mixin';

/**
 * Footer
 */
.footer {
  padding: 30px 0 30px;
  color: #6190e8;
  text-align: center;
  background-color: #fff;

  .container {
    position: relative;
    width: 90%;
  }
  &-desc {
    text-align: left;
    font-size: 12px;
    color: #6190e8;
  }
  &-copyright {
    letter-spacing: 1px;
    font-weight: 300;

    a {
      color: #6190e8;
      text-decoration: none;
    }
  }
  .github-logo {
    position: absolute;
    right: 20px;
    top: 20px;
    width: 42px;
    height: 42px;
    @include image2x-background('github');
    transition: transform 0.3s;

    &:hover {
      transform: scale(1.1);
    }
    a {
      display: inline-block;
      width: 100%;
      height: 100%;
      text-indent: -9999px;
    }
  }
}

@media screen and (max-width: $screen-sm-max) {
  .footer {
    padding: 20px 0;

    &-desc {
      font-size: 10px;
    }
    .github-logo {
      top: 0;
      right: 0;
    }
  }
}
</style>
