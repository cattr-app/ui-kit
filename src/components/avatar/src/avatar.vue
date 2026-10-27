<template>
  <div
    class="at-avatar"
    :class="{ 'at-avatar--inline': inline, 'at-avatar--rounded': rounded }"
    :style="[avatarStyle, customStyle]"
    v-bind="a11yAttrs"
  >
    <!-- Not displayed: detects that the background image failed to load. -->
    <img v-if="isImage" style="display: none" :src="src" alt="" @error="onImgError" />
    <span v-show="!isImage" class="at-avatar__initials">{{ userInitial }}</span>
  </div>
</template>

<script>
// Initials: the first letter of each word (split on spaces and hyphens). With more than
// three letters and some capitals, only the capitals are kept. At most three, upper-cased.
export function getInitials(username) {
  let initials = username
    .split(/[ -]/)
    .map(part => part.charAt(0))
    .join('')

  if (initials.length > 3 && initials.search(/[A-Z]/) !== -1) {
    initials = initials.replace(/[a-z]+/g, '')
  }

  return initials.slice(0, 3).toUpperCase()
}

// A URL as a double-quoted CSS string: quotes, backslashes and line breaks would end or break it.
function cssUrl(url) {
  const escaped = url
    .replace(/["'\\]/g, char => `\\${char}`)
    .replace(/[\n\r\f]/g, char => `\\${char.charCodeAt(0).toString(16)} `)
  return `url("${escaped}")`
}

const BACKGROUND_COLORS = [
  '#F44336',
  '#FF4081',
  '#9C27B0',
  '#673AB7',
  '#3F51B5',
  '#2196F3',
  '#03A9F4',
  '#00BCD4',
  '#009688',
  '#4CAF50',
  '#8BC34A',
  '#CDDC39',
  '#FFC107',
  '#FF9800',
  '#FF5722',
  '#795548',
  '#9E9E9E',
  '#607D8B',
]

// Adds `amount` to every channel of a `#rrggbb` colour, clamped to 0..255.
function lightenColor(hex, amount) {
  const usePound = hex[0] === '#'
  const num = parseInt(usePound ? hex.slice(1) : hex, 16)
  const clamp = value => Math.min(255, Math.max(0, value + amount))
  const r = clamp(num >> 16)
  const g = clamp((num >> 8) & 0xff)
  const b = clamp(num & 0xff)

  return (usePound ? '#' : '') + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')
}

export default {
  name: 'AtAvatar',
  props: {
    username: {
      type: String,
    },
    initials: {
      type: String,
    },
    backgroundColor: {
      type: String,
    },
    color: {
      type: String,
    },
    customStyle: {
      type: Object,
    },
    inline: {
      type: Boolean,
      default: false,
    },
    size: {
      type: Number,
      default: 50,
    },
    src: {
      type: String,
    },
    rounded: {
      type: Boolean,
      default: true,
    },
    lighten: {
      type: Number,
      default: 80,
    },
    // (username, getInitials) => string
    parser: {
      type: Function,
      default: getInitials,
    },
    // Accessible name; defaults to `username`. An empty string marks the avatar as decorative
    // (e.g. when the name is shown next to it), like an empty `alt` of an image.
    alt: {
      type: String,
      default: undefined,
    },
  },
  emits: ['avatar-initials'],
  data() {
    return {
      imgError: false,
    }
  },
  computed: {
    isImage() {
      return !this.imgError && Boolean(this.src)
    },
    background() {
      // Deterministic: the same name always gets the same colour.
      const seed = (this.username || '').length
      return this.backgroundColor || BACKGROUND_COLORS[seed % BACKGROUND_COLORS.length]
    },
    fontColor() {
      return this.color || lightenColor(this.background, this.lighten)
    },
    avatarStyle() {
      const size = `${this.size}px`
      const style = { width: size, height: size }

      if (this.isImage) {
        style.backgroundImage = cssUrl(this.src)
        style.backgroundRepeat = 'no-repeat'
        style.backgroundSize = `${size} ${size}`
        style.backgroundOrigin = 'content-box'
      } else {
        style.backgroundColor = this.background
        style.color = this.fontColor
        style.fontSize = `${Math.floor(this.size / 2.5)}px`
        style.lineHeight = size
      }

      return style
    },
    a11yAttrs() {
      const label = this.alt === undefined ? this.username : this.alt
      return label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': 'true' }
    },
    userInitial() {
      if (this.isImage) return ''
      return this.initials || this.parser(this.username || '', getInitials)
    },
  },
  watch: {
    // A new image gets a fresh chance to load.
    src() {
      this.imgError = false
    },
  },
  mounted() {
    if (!this.isImage) {
      this.$emit('avatar-initials', this.username, this.userInitial)
    }
  },
  methods: {
    onImgError() {
      this.imgError = true
    },
  },
}
</script>
