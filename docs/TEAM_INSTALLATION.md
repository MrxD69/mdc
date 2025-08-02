# Team Installation Guide for Enhanced MDC

## Method 1: GitHub/GitLab Repository (Recommended)

### For Package Maintainer:

1. **Fork the original MDC repository**
   - Go to https://github.com/nuxt-modules/mdc
   - Click "Fork" to create your own copy
   - Clone your fork locally

2. **Apply the enhancements**
   ```bash
   # Add your fork as remote
   git remote add myfork https://github.com/YOUR_USERNAME/mdc.git
   
   # Create a new branch for your changes
   git checkout -b enhanced-streaming
   
   # Commit all changes
   git add .
   git commit -m "feat: add streaming support and POST fallback for large code blocks"
   
   # Push to your fork
   git push myfork enhanced-streaming
   ```

3. **Create a release tag** (optional but recommended)
   ```bash
   git tag v0.17.3-enhanced
   git push myfork v0.17.3-enhanced
   ```

### For Team Members:

1. **Install from GitHub in package.json:**
   ```json
   {
     "dependencies": {
       "@nuxtjs/mdc": "github:YOUR_USERNAME/mdc#enhanced-streaming"
     }
   }
   ```
   
   Or with a specific tag:
   ```json
   {
     "dependencies": {
       "@nuxtjs/mdc": "github:YOUR_USERNAME/mdc#v0.17.3-enhanced"
     }
   }
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   # or
   npm install
   # or
   yarn install
   ```

## Method 2: NPM Private Registry (For Companies)

### Using Verdaccio (Self-hosted):

1. **Set up Verdaccio:**
   ```bash
   # Install globally
   npm install -g verdaccio
   
   # Start verdaccio
   verdaccio
   ```

2. **Configure npm to use your registry:**
   ```bash
   npm set registry http://localhost:4873/
   # or for scoped packages only
   npm config set @yourcompany:registry http://localhost:4873/
   ```

3. **Publish the package:**
   ```bash
   # In the MDC directory, update package.json name
   # Change to: "@yourcompany/mdc": "0.17.3-enhanced"
   
   # Build and publish
   pnpm build
   npm publish
   ```

### Using GitHub Packages:

1. **Update package.json in MDC:**
   ```json
   {
     "name": "@YOUR_ORG/mdc-enhanced",
     "version": "0.17.3",
     "publishConfig": {
       "registry": "https://npm.pkg.github.com"
     }
   }
   ```

2. **Authenticate with GitHub Packages:**
   ```bash
   npm login --scope=@YOUR_ORG --registry=https://npm.pkg.github.com
   # Use your GitHub username and a Personal Access Token as password
   ```

3. **Publish:**
   ```bash
   pnpm build
   npm publish
   ```

4. **Team members install:**
   ```bash
   # Add to .npmrc in project root
   @YOUR_ORG:registry=https://npm.pkg.github.com
   
   # Install
   pnpm add @YOUR_ORG/mdc-enhanced
   ```

## Method 3: NPM Public Registry

### Publish to NPM:

1. **Update package.json name to avoid conflicts:**
   ```json
   {
     "name": "@your-username/mdc-enhanced",
     "version": "0.17.3"
   }
   ```

2. **Login to npm:**
   ```bash
   npm login
   ```

3. **Build and publish:**
   ```bash
   pnpm build
   npm publish --access public
   ```

4. **Team installs:**
   ```bash
   pnpm add @your-username/mdc-enhanced
   ```

## Method 4: Git Submodule (For Monorepos)

1. **Add as submodule:**
   ```bash
   git submodule add https://github.com/YOUR_USERNAME/mdc.git packages/mdc-enhanced
   git submodule update --init --recursive
   ```

2. **Reference in package.json:**
   ```json
   {
     "dependencies": {
       "@nuxtjs/mdc": "file:./packages/mdc-enhanced"
     }
   }
   ```

## Best Practices for Teams

### 1. Lock the Version

Always use specific commits or tags:
```json
{
  "dependencies": {
    "@nuxtjs/mdc": "github:YOUR_USERNAME/mdc#7a8b9c1d"
  }
}
```

### 2. Document Changes

Create a `CHANGES.md` in your fork:
```markdown
# Changes from Original MDC

## v0.17.3-enhanced

### Bug Fixes
- Fixed 431 Request Header Too Large error for large code blocks
- Implemented automatic GET/POST switching based on content size

### Features
- Added MDCStream component for streaming content
- Added useMDCStream composable
- Integrated shiki-stream for real-time syntax highlighting
- Full support for Vercel AI SDK v4 streaming

### Technical Details
- POST threshold: 15KB encoded content
- Streaming supports all Shiki languages and themes
- Backward compatible with existing MDC usage
```

### 3. Keep Fork Updated

```bash
# Add upstream remote
git remote add upstream https://github.com/nuxt-modules/mdc.git

# Fetch upstream changes
git fetch upstream

# Merge or rebase
git checkout main
git merge upstream/main
# or
git rebase upstream/main

# Push to your fork
git push myfork main
```

### 4. CI/CD Integration

Add to your project's `.github/workflows/ci.yml`:
```yaml
name: CI
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      
      # For private repos, add auth
      - name: Authenticate to GitHub Packages
        run: |
          echo "@YOUR_ORG:registry=https://npm.pkg.github.com" >> ~/.npmrc
          echo "//npm.pkg.github.com/:_authToken=${{ secrets.GITHUB_TOKEN }}" >> ~/.npmrc
      
      - run: pnpm install
      - run: pnpm test
```

## Verifying Installation

After installation, verify the enhanced features:

1. **Check package version:**
   ```bash
   pnpm list @nuxtjs/mdc
   ```

2. **Test streaming component:**
   ```vue
   <template>
     <MDCStream :value="'test'" :is-streaming="false" />
   </template>
   ```

3. **Test large code blocks:**
   Create a large code block (>15KB) and verify no 431 errors

## Troubleshooting

### "Module not found" error
- Clear node_modules and lock file: `rm -rf node_modules pnpm-lock.yaml`
- Reinstall: `pnpm install`

### "Cannot find types" error
- Add to `tsconfig.json`:
  ```json
  {
    "compilerOptions": {
      "types": ["@nuxtjs/mdc"]
    }
  }
  ```

### GitHub install authentication issues
- Create a Personal Access Token with `read:packages` scope
- Add to `.npmrc`:
  ```
  //npm.pkg.github.com/:_authToken=YOUR_TOKEN
  ```

## Recommended Approach for Teams

1. **Use GitHub fork** with specific tags/commits
2. **Document all changes** from upstream
3. **Set up automated tests** to verify functionality
4. **Create a migration guide** if updating from standard MDC
5. **Establish update schedule** for upstream changes