# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is **Nuxt MDC** - a Nuxt module that allows mixing Markdown syntax with HTML tags or Vue components. MDC stands for "MarkDown Components".

## Essential Commands

### Development
- `pnpm dev` - Start development server with playground app
- `pnpm dev:build` - Build the playground app
- `pnpm dev:docs` - Start documentation development server

### Build & Test
- `pnpm build` - Build the module using nuxt-module-build
- `pnpm test` - Run tests with Vitest
- `pnpm test:watch` - Run tests in watch mode

### Code Quality
- `pnpm lint` - Run ESLint
- `pnpm typecheck` - Run TypeScript type checking
- `pnpm verify` - Run all checks (prepare, lint, test, typecheck)

### Release
- `pnpm release` - Create a release using release-it

## High-Level Architecture

### Module Structure
The module follows Nuxt module conventions with a clear separation between build-time and runtime code:

- `src/module.ts` - Main module entry point that configures Nuxt
- `src/runtime/` - Client/server runtime code that gets bundled with user's app
- `src/types/` - TypeScript type definitions shared across the module

### Core Components

1. **MDC Parser Pipeline** (`src/runtime/parser/`):
   - Takes Markdown with MDC syntax (`::[component]` blocks)
   - Parses through unified/remark/rehype pipeline
   - Produces AST that can include Vue components

2. **Rendering System** (`src/runtime/components/`):
   - `MDC.vue` - Main component that orchestrates parsing and rendering
   - `MDCRenderer.vue` - Recursively renders the parsed AST
   - `MDCSlot.vue` - Special slot component for proper content unwrapping

3. **Prose Components** (`src/runtime/components/prose/`):
   - Replace standard HTML elements (p, h1-h6, ul, etc.) with Vue components
   - Allow customization of how Markdown-generated HTML is rendered

4. **Syntax Highlighting** (`src/runtime/highlighter/`):
   - Integrated Shiki highlighter
   - Supports multiple themes and languages
   - Works in both Node.js and browser environments

### Key Architectural Decisions

1. **Universal Rendering**: The parser works in both server and client environments, with optimizations for each
2. **Component Resolution**: Uses a registry system to map MDC component names to actual Vue components
3. **Async Support**: Proper handling of async components with Vue Suspense
4. **AST-based**: Everything goes through an AST representation, allowing flexible transformations

### Testing Approach
- Uses Vitest for unit and integration tests
- Tests are in `/test/` directory
- Run individual tests with: `pnpm test -- [test-file-path]`

### Playground App
The `/playground/` directory contains a full Nuxt app for development and testing. It demonstrates various MDC features and serves as integration testing ground.