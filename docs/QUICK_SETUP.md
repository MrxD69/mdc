# Quick Setup for Your Team

## Fastest Method: GitHub Fork

### 1. Package Maintainer (You) Does This Once:

```bash
# 1. Fork https://github.com/nuxt-modules/mdc on GitHub

# 2. Push your enhanced version
cd /home/khalil/WebstormProjects/mdc
git remote add myfork https://github.com/YOUR_GITHUB_USERNAME/mdc.git
git push myfork main --force

# 3. Create a release tag
git tag v0.17.3-enhanced
git push myfork v0.17.3-enhanced
```

### 2. In Your Team's Nuxt Project:

Update `package.json`:
```json
{
  "dependencies": {
    "@nuxtjs/mdc": "github:YOUR_GITHUB_USERNAME/mdc#v0.17.3-enhanced"
  }
}
```

Or without tag (uses latest main):
```json
{
  "dependencies": {
    "@nuxtjs/mdc": "github:YOUR_GITHUB_USERNAME/mdc"
  }
}
```

### 3. Team Members Install:

```bash
# Remove old version if exists
pnpm remove @nuxtjs/mdc

# Install enhanced version
pnpm install

# Or fresh install
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### 4. Update nuxt.config.ts:

```typescript
export default defineNuxtConfig({
  modules: ['@nuxtjs/mdc'],
  
  mdc: {
    highlight: {
      theme: 'github-dark',
      langs: ['js', 'ts', 'vue', 'python'] // Add languages you need
    }
  }
})
```

### 5. Start Using Enhanced Features:

```vue
<!-- pages/index.vue -->
<template>
  <div>
    <!-- Regular MDC (now handles large code automatically) -->
    <MDC :value="content" />
    
    <!-- Streaming MDC for AI responses -->
    <MDCStream 
      :value="streamingContent" 
      :is-streaming="isStreaming"
      stream-language="javascript"
    />
  </div>
</template>

<script setup>
import { useMDCStream } from '@nuxtjs/mdc'

const content = ref('# Hello\n\n```js\nconsole.log("Large code works!")\n```')

// For streaming
const stream = useMDCStream()
const streamingContent = computed(() => stream.content.value)
const isStreaming = computed(() => stream.isStreaming.value)
</script>
```

## Alternative: NPM Package

If you prefer npm over GitHub:

```bash
# 1. Update package name in MDC's package.json
# Change "@nuxtjs/mdc" to "@YOUR_NPM_USERNAME/mdc-enhanced"

# 2. Build and publish
cd /home/khalil/WebstormProjects/mdc
pnpm build
npm publish --access public

# 3. Team installs from npm
pnpm add @YOUR_NPM_USERNAME/mdc-enhanced
```

Then update imports:
```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@YOUR_NPM_USERNAME/mdc-enhanced'],
})
```

## Verification Checklist

✅ Run `pnpm list @nuxtjs/mdc` - should show your GitHub URL or npm package
✅ Check `node_modules/@nuxtjs/mdc/package.json` - version should be "0.17.3-enhanced"
✅ Test large code blocks - no 431 errors
✅ Test `<MDCStream>` component - should be available
✅ Test `useMDCStream()` composable - should be importable

## Share with Team

Send this to your team:

```
Hey team! I've enhanced the MDC package to fix the 431 error and add streaming support.

To use it:
1. Update package.json:
   "@nuxtjs/mdc": "github:YOUR_USERNAME/mdc#v0.17.3-enhanced"
   
2. Run: pnpm install

3. Use <MDCStream> for AI streaming responses
4. Regular <MDC> now handles large code blocks automatically

See docs/STREAMING_GUIDE.md for examples.
```